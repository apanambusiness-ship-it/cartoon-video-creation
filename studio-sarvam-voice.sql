-- Admin pilot only. No user wallet, membership or pricing changes.
begin;
create table if not exists studio_private.voice_pilots (
 id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users(id),
 request_id uuid not null, input_hash text not null, state text not null default 'processing' check(state in('processing','ready','failed','uncertain')),
 result_path text,created_at timestamptz not null default now(),unique(owner_id,request_id)
);
alter table studio_private.voice_pilots enable row level security;
revoke all on studio_private.voice_pilots from public,anon,authenticated;
grant select,insert,update on studio_private.voice_pilots to service_role;
create or replace function public.studio_voice_pilot_claim(owner uuid,request_uuid uuid,digest text) returns jsonb language plpgsql security invoker set search_path='' as $$
declare r studio_private.voice_pilots;
begin
 if not exists(select 1 from public.studio_admins where user_id=owner) then raise exception 'Admin pilot only';end if;
 if request_uuid is null or digest !~ '^[a-f0-9]{64}$' then raise exception 'Invalid request';end if;
 perform pg_advisory_xact_lock(hashtextextended(owner::text,921));
 select * into r from studio_private.voice_pilots where owner_id=owner and request_id=request_uuid;
 if found then
  if r.input_hash is distinct from digest then raise exception 'Request key mismatch';end if;
  return to_jsonb(r)||jsonb_build_object('claimed',false);
 end if;
 if (select count(*) from studio_private.voice_pilots where owner_id=owner and created_at>now()-interval '1 day')>=20 then raise exception 'Daily pilot limit reached';end if;
 insert into studio_private.voice_pilots(owner_id,request_id,input_hash) values(owner,request_uuid,digest) returning * into r;
 return to_jsonb(r)||jsonb_build_object('claimed',true);
end $$;
create or replace function public.studio_voice_pilot_finish(pilot_id uuid,outcome text,path text default null) returns void language plpgsql security invoker set search_path='' as $$
begin
 if outcome not in('ready','failed','uncertain') then raise exception 'Invalid outcome';end if;
 if outcome='ready' and not exists(select 1 from studio_private.voice_pilots where id=pilot_id and path=owner_id::text||'/'||id::text||'.wav') then raise exception 'Invalid output path';end if;
 update studio_private.voice_pilots set state=outcome,result_path=path where id=pilot_id and state='processing';
end $$;
revoke all on function public.studio_voice_pilot_claim(uuid,uuid,text),public.studio_voice_pilot_finish(uuid,text,text) from public,anon,authenticated;
grant execute on function public.studio_voice_pilot_claim(uuid,uuid,text),public.studio_voice_pilot_finish(uuid,text,text) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('studio-voice-pilots','studio-voice-pilots',false,2000000,array['audio/wav']) on conflict(id) do nothing;
notify pgrst,'reload schema';
commit;
