-- Private operator gate; no prompts, answers or API keys stored here.
create table if not exists studio_private.chat_settings (
 id boolean primary key default true check(id), enabled boolean not null default false,
 probe_state text not null default 'idle' check(probe_state in ('idle','pending','running','finished')),
 probe_code text, checked_at timestamptz
);
alter table studio_private.chat_settings enable row level security;
revoke all on studio_private.chat_settings from public, anon, authenticated;
grant select,insert,update on studio_private.chat_settings to service_role;
insert into studio_private.chat_settings(id) values(true) on conflict do nothing;
create or replace function public.studio_chat_status(owner_id uuid) returns jsonb language sql security invoker set search_path='' as $$
 select jsonb_build_object('enabled',s.enabled,'user_daily_limit',10,'app_daily_limit',50,
 'remaining',greatest(0,10-(select count(*) from studio_private.support_ai_requests where user_id=owner_id and created_at>=date_trunc('day',now()))),
 'probe_code',s.probe_code,'checked_at',s.checked_at) from studio_private.chat_settings s where id=true;
$$;
create or replace function public.studio_chat_probe_claim() returns boolean language plpgsql security invoker set search_path='' as $$
begin
 update studio_private.chat_settings set probe_state='running',enabled=false where id=true and probe_state='pending';
 return found;
end;$$;
create or replace function public.studio_chat_probe_finish(result_code text) returns void language plpgsql security invoker set search_path='' as $$
begin
 if result_code not in ('ok','http401','http403','http429','http500','unknown','invalid_response') then raise exception 'Invalid probe code'; end if;
 update studio_private.chat_settings set probe_state='finished',probe_code=result_code,checked_at=now(),enabled=(result_code='ok') where id=true and probe_state='running';
end;$$;
revoke all on function public.studio_chat_status(uuid),public.studio_chat_probe_claim(),public.studio_chat_probe_finish(text) from public,anon,authenticated;
grant execute on function public.studio_chat_status(uuid),public.studio_chat_probe_claim(),public.studio_chat_probe_finish(text) to service_role;
