-- APANAM Studio only. No payment collection or paid provider calls enabled.
create table public.studio_business_settings (
 id boolean primary key default true check(id),
 registration_paise integer not null default 1000 check(registration_paise=1000),
 monthly_paise integer not null default 10000 check(monthly_paise=10000),
 trial_days integer not null default 15 check(trial_days=15),
 payments_enabled boolean not null default false check(not payments_enabled),
 ai_enabled boolean not null default false check(not ai_enabled),
 email_enabled boolean not null default false,
 daily_email_limit integer not null default 30 check(daily_email_limit between 1 and 100),
 updated_at timestamptz not null default now()
);
insert into public.studio_business_settings(id) values(true);
alter table public.studio_business_settings enable row level security;
revoke all on public.studio_business_settings from public,anon,authenticated;
grant select on public.studio_business_settings to authenticated;
create policy "Signed in reads business settings" on public.studio_business_settings for select to authenticated using(true);

create table public.studio_trials(user_id uuid primary key references auth.users(id) on delete cascade,started_at timestamptz not null default now(),expires_at timestamptz not null default now()+interval '15 days',check(expires_at=started_at+interval '15 days'));
create table public.studio_notification_preferences(user_id uuid primary key references auth.users(id) on delete cascade,email_reminders boolean not null default false,sms_reminders boolean not null default false,updated_at timestamptz not null default now());
alter table public.studio_trials enable row level security;
revoke all on public.studio_trials from public,anon,authenticated;
alter table public.studio_notification_preferences enable row level security;
revoke all on public.studio_notification_preferences from public,anon,authenticated;
grant select on public.studio_trials to authenticated;
grant select,insert,update on public.studio_notification_preferences to authenticated;
create policy "Own trial" on public.studio_trials for select to authenticated using(user_id=(select auth.uid()));
create policy "Own reminder consent" on public.studio_notification_preferences for select to authenticated using(user_id=(select auth.uid()));
create policy "Own reminder consent insert" on public.studio_notification_preferences for insert to authenticated with check(user_id=(select auth.uid()));
create policy "Own reminder consent update" on public.studio_notification_preferences for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));

create table public.studio_ai_rates(kind text primary key check(kind in ('poster','audio','video')),unit_label text not null,provider_name text not null default '',provider_cost_paise integer check(provider_cost_paise between 1 and 500000),margin_percent integer not null default 30 check(margin_percent between 25 and 75),updated_at timestamptz not null default now());
insert into public.studio_ai_rates(kind,unit_label) values ('poster','एक poster'),('audio','एक मिनट audio'),('video','एक video unit');
alter table public.studio_ai_rates enable row level security;
revoke all on public.studio_ai_rates from public,anon,authenticated;
grant select on public.studio_ai_rates to authenticated;
create policy "Read AI estimates" on public.studio_ai_rates for select to authenticated using(true);

create table if not exists studio_private.reminder_queue(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,expires_at timestamptz not null,days_left integer not null check(days_left in(7,3,1,0)),channel text not null check(channel in('email','sms')),status text not null default 'pending' check(status in('pending','sending','sent','uncertain','skipped','failed')),created_at timestamptz not null default now(),claimed_at timestamptz,finished_at timestamptz,provider_id text,unique(user_id,expires_at,days_left,channel));
create index studio_reminder_pending on studio_private.reminder_queue(created_at) where status='pending';
create index studio_reminder_user on studio_private.reminder_queue(user_id);
create table studio_private.reminder_day(day date primary key,claimed integer not null default 0 check(claimed>=0));
alter table studio_private.reminder_queue enable row level security;
alter table studio_private.reminder_day enable row level security;
revoke all on studio_private.reminder_queue,studio_private.reminder_day from public,anon,authenticated;

create function studio_private.start_trial() returns jsonb language plpgsql security definer set search_path='' as $
declare u uuid:=auth.uid(); r public.studio_trials;
begin
 if u is null then raise exception 'Login required'; end if;
 select * into r from public.studio_trials where user_id=u;
 if not found then raise exception '₹10 Registration payment confirmation required for 15-day trial'; end if;
 return to_jsonb(r);
end $;
revoke all on function studio_private.start_trial() from public,anon; grant execute on function studio_private.start_trial() to authenticated;
grant usage on schema studio_private to authenticated;
create function public.studio_start_trial() returns jsonb language sql security invoker set search_path='' as 'select studio_private.start_trial()';
revoke all on function public.studio_start_trial() from public,anon; grant execute on function public.studio_start_trial() to authenticated;

create function public.studio_business_overview() returns jsonb language plpgsql security invoker set search_path='' as $$
declare u uuid:=auth.uid();
begin
 if u is null then raise exception 'Login required'; end if;
 return jsonb_build_object('settings',(select to_jsonb(s) from public.studio_business_settings s where id),'trial',(select to_jsonb(t) from public.studio_trials t where user_id=u),'preferences',(select to_jsonb(p) from public.studio_notification_preferences p where user_id=u),'membership',(select to_jsonb(m) from public.studio_memberships m where user_id=u),'rates',(select jsonb_agg(to_jsonb(r)||jsonb_build_object('sale_paise',ceil(provider_cost_paise::numeric*100/(100-margin_percent)))) from public.studio_ai_rates r),'manual_open',coalesce((public.studio_member_access()->>'active')::boolean,false));
end $$;
revoke all on function public.studio_business_overview() from public,anon; grant execute on function public.studio_business_overview() to authenticated;

create function public.studio_ai_quote(request_kind text,units integer default 1) returns jsonb language plpgsql security invoker set search_path='' as $$
declare r public.studio_ai_rates; s public.studio_business_settings; cost bigint; sale bigint;
begin
 if auth.uid() is null then raise exception 'Login required'; end if;
 if units is null or units not between 1 and 60 then raise exception 'Units must be 1-60'; end if;
 select * into r from public.studio_ai_rates where kind=request_kind; if not found then raise exception 'Unknown AI type'; end if;
 select * into s from public.studio_business_settings where id;
 cost:=r.provider_cost_paise::bigint*units; sale:=ceil(cost::numeric*100/(100-r.margin_percent));
 return jsonb_build_object('kind',r.kind,'units',units,'provider_cost_paise',cost,'sale_paise',sale,'margin_paise',sale-cost,'configured',r.provider_cost_paise is not null,'generation_enabled',s.ai_enabled,'payment_enabled',s.payments_enabled,'message','यह estimate है; payment और provider activation तक Generate बंद है।');
end $$;
revoke all on function public.studio_ai_quote(text,integer) from public,anon; grant execute on function public.studio_ai_quote(text,integer) to authenticated;

create function studio_private.admin_business(action text,value jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from public.studio_admins where user_id=auth.uid()) then raise exception 'Admin required'; end if;
 if action='rates' then
  if not (value->>'kind' in('poster','audio','video')) or value->>'cost' is null then raise exception 'AI type and provider cost required'; end if;
  update public.studio_ai_rates set provider_name=left(coalesce(value->>'provider',''),80),provider_cost_paise=(value->>'cost')::integer,margin_percent=(value->>'margin')::integer,updated_at=now() where kind=value->>'kind';
 elsif action='reminders' then update public.studio_business_settings set email_enabled=coalesce((value->>'email_enabled')::boolean,false),daily_email_limit=coalesce((value->>'limit')::integer,30),updated_at=now() where id;
 elsif action<>'overview' then raise exception 'Unknown action'; end if;
 return jsonb_build_object('settings',(select to_jsonb(s) from public.studio_business_settings s where id),'rates',(select jsonb_agg(to_jsonb(r)||jsonb_build_object('sale_paise',ceil(provider_cost_paise::numeric*100/(100-margin_percent)))) from public.studio_ai_rates r),'reminders',(select coalesce(jsonb_agg(x),'[]'::jsonb) from(select id,user_id,expires_at,days_left,channel,status,created_at,finished_at from studio_private.reminder_queue order by created_at desc limit 100)x));
end $$;
revoke all on function studio_private.admin_business(text,jsonb) from public,anon; grant execute on function studio_private.admin_business(text,jsonb) to authenticated;
create function public.studio_admin_business(action text,value jsonb default '{}'::jsonb) returns jsonb language sql security invoker set search_path='' as 'select studio_private.admin_business(action,value)';
revoke all on function public.studio_admin_business(text,jsonb) from public,anon; grant execute on function public.studio_admin_business(text,jsonb) to authenticated;

create function studio_private.prepare_reminders() returns integer language plpgsql security definer set search_path='' as $$
declare n integer;
begin
 with entitled as (select user_id,max(expires_at) expires_at from (select user_id,expires_at from public.studio_memberships where not revoked union all select user_id,expires_at from public.studio_trials)t group by user_id)
 insert into studio_private.reminder_queue(user_id,expires_at,days_left,channel)
 select m.user_id,m.expires_at,(m.expires_at at time zone 'Asia/Kolkata')::date-(now() at time zone 'Asia/Kolkata')::date,'email'
 from entitled m join public.studio_notification_preferences p using(user_id) join auth.users u on u.id=m.user_id
 where p.email_reminders and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false)
 and (m.expires_at at time zone 'Asia/Kolkata')::date-(now() at time zone 'Asia/Kolkata')::date in(7,3,1,0)
 and not exists(select 1 from studio_private.reminder_queue q where q.user_id=m.user_id and q.expires_at=m.expires_at and q.days_left=(m.expires_at at time zone 'Asia/Kolkata')::date-(now() at time zone 'Asia/Kolkata')::date and q.channel='email')
 order by m.expires_at limit 200 on conflict(user_id,expires_at,days_left,channel) do nothing;
 get diagnostics n=row_count;
 -- Expired pending notices are not sent late; renewed/revoked/opted-out rows are skipped.
 update studio_private.reminder_queue q set status='skipped',finished_at=now() where status='pending' and (created_at<now()-interval '2 days' or not exists(select 1 from public.studio_notification_preferences p where p.user_id=q.user_id and p.email_reminders and q.expires_at=(select max(expires_at) from (select expires_at from public.studio_memberships where user_id=q.user_id and not revoked union all select expires_at from public.studio_trials where user_id=q.user_id)t)));
 update studio_private.reminder_queue set status='uncertain',finished_at=now() where status='sending' and claimed_at<now()-interval '10 minutes';
 delete from studio_private.reminder_queue where status not in('pending','sending') and created_at<now()-interval '90 days';
 delete from studio_private.reminder_day where day<current_date-90;
 return n;
end $$;
revoke all on function studio_private.prepare_reminders() from public,anon,authenticated;

create function public.studio_claim_reminders() returns jsonb language plpgsql security definer set search_path='' as $$
declare lim integer; used integer; amount integer; result jsonb;
begin
 select daily_email_limit into lim from public.studio_business_settings where id and email_enabled; if not found then return '[]'::jsonb; end if;
 perform studio_private.prepare_reminders();
 insert into studio_private.reminder_day(day) values(current_date) on conflict do nothing;
 select claimed into used from studio_private.reminder_day where day=current_date for update;
 amount:=least(5,greatest(0,lim-used));
 with picked as (select q.id from studio_private.reminder_queue q where status='pending' and channel='email' order by created_at for update skip locked limit amount), changed as (update studio_private.reminder_queue q set status='sending',claimed_at=now() from picked where q.id=picked.id returning q.*)
 select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'email',u.email,'expires_at',c.expires_at,'days_left',c.days_left)),'[]'::jsonb) into result from changed c join auth.users u on u.id=c.user_id;
 update studio_private.reminder_day set claimed=claimed+jsonb_array_length(result) where day=current_date;
 return result;
end $$;
create function public.studio_finish_reminder(reminder_id uuid,outcome text,message_id text default '') returns void language plpgsql security definer set search_path='' as $$
begin
 if outcome not in('sent','uncertain','failed','skipped') then raise exception 'Invalid outcome'; end if;
 update studio_private.reminder_queue set status=outcome,provider_id=left(message_id,200),finished_at=now() where id=reminder_id and status='sending';
end $$;
revoke all on function public.studio_claim_reminders(),public.studio_finish_reminder(uuid,text,text) from public,anon,authenticated;
grant execute on function public.studio_claim_reminders(),public.studio_finish_reminder(uuid,text,text) to service_role;

-- Media writes go through an authenticated Edge Function; users cannot forge sizes.
create table public.studio_media_files(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,title text not null check(length(title) between 1 and 120),bytes bigint not null check(bytes between 1 and 10485760),mime text not null,status text not null default 'uploading' check(status in('uploading','ready','deleting','deleted','uncertain')),created_at timestamptz not null default now());
create index studio_media_owner on public.studio_media_files(user_id,created_at desc) where status<>'deleted';
alter table public.studio_media_files enable row level security;
revoke all on public.studio_media_files from public,anon,authenticated;
grant select on public.studio_media_files to authenticated;
create policy "Read own media metadata" on public.studio_media_files for select to authenticated using(user_id=(select auth.uid()));
create table studio_private.media_budget(id boolean primary key check(id),used_bytes bigint not null default 0 check(used_bytes between 0 and 157286400));
insert into studio_private.media_budget(id) values(true);
create table studio_private.media_transfer(day date not null,user_id uuid not null references auth.users(id) on delete cascade,bytes bigint not null default 0,links integer not null default 0,primary key(day,user_id));
alter table studio_private.media_budget enable row level security;
alter table studio_private.media_transfer enable row level security;
revoke all on studio_private.media_budget,studio_private.media_transfer from public,anon,authenticated;

create function public.studio_media_reserve(owner_id uuid,file_title text,file_bytes bigint,file_mime text) returns public.studio_media_files language plpgsql security definer set search_path='' as $$
declare used bigint; r public.studio_media_files;
begin
 if file_bytes is null or file_bytes not between 1 and 10485760 or file_mime is null or file_mime not in('image/png','image/jpeg','image/webp','audio/mpeg','audio/wav','audio/ogg','audio/webm','audio/mp4','video/mp4','video/webm','application/json') then raise exception 'Unsupported file or size'; end if;
 perform 1 from studio_private.media_budget where id for update;
 select coalesce(sum(bytes),0) into used from public.studio_media_files where user_id=owner_id and status<>'deleted';
 if used+file_bytes>31457280 or (select count(*) from public.studio_media_files where user_id=owner_id and status<>'deleted')>=30 then raise exception 'Your 30 MB / 30 file cloud limit reached'; end if;
 update studio_private.media_budget set used_bytes=used_bytes+file_bytes where id and used_bytes+file_bytes<=157286400;
 if not found then raise exception 'Studio cloud storage limit reached; keep local backup'; end if;
 insert into public.studio_media_files(user_id,title,bytes,mime) values(owner_id,left(file_title,120),file_bytes,file_mime) returning * into r;
 return r;
end $$;
create function public.studio_media_state(owner_id uuid,file_id uuid,next_status text) returns void language plpgsql security definer set search_path='' as $$
declare r public.studio_media_files;
begin
 perform 1 from studio_private.media_budget where id for update;
 select * into r from public.studio_media_files where id=file_id and user_id=owner_id for update;
 if not found then raise exception 'File not found'; end if;
 if next_status='ready' and r.status='uploading' then update public.studio_media_files set status='ready' where id=file_id;
 elsif next_status='deleting' and r.status in('uploading','uncertain') and r.created_at>now()-interval '10 minutes' then raise exception 'Upload outcome uncertain. Wait ten minutes before cleanup';
 elsif next_status='deleting' and r.status in('ready','uncertain','uploading','deleting') then update public.studio_media_files set status='deleting' where id=file_id;
 elsif next_status='uncertain' and r.status<>'deleted' then update public.studio_media_files set status='uncertain' where id=file_id;
 elsif next_status='deleted' and r.status<>'deleted' then update public.studio_media_files set status='deleted' where id=file_id; update studio_private.media_budget set used_bytes=used_bytes-r.bytes where id;
 elsif next_status<>'deleted' or r.status<>'deleted' then raise exception 'Invalid media transition'; end if;
end $$;
create function public.studio_media_download(owner_id uuid,file_id uuid) returns public.studio_media_files language plpgsql security definer set search_path='' as $$
declare r public.studio_media_files; used bigint; count_links integer;
begin
 perform 1 from studio_private.media_budget where id for update;
 select * into r from public.studio_media_files where id=file_id and user_id=owner_id and status='ready'; if not found then raise exception 'File not ready or not yours'; end if;
 delete from studio_private.media_transfer where day<current_date-7;
 insert into studio_private.media_transfer(day,user_id) values(current_date,owner_id) on conflict do nothing;
 select bytes,links into used,count_links from studio_private.media_transfer where day=current_date and user_id=owner_id for update;
 if used+r.bytes>104857600 or count_links>=20 or (select coalesce(sum(bytes),0) from studio_private.media_transfer where day=current_date)+r.bytes>524288000 then raise exception 'Daily cloud download allowance reached'; end if;
 update studio_private.media_transfer set bytes=bytes+r.bytes,links=links+1 where day=current_date and user_id=owner_id;
 return r;
end $$;
revoke all on function public.studio_media_reserve(uuid,text,bigint,text),public.studio_media_state(uuid,uuid,text),public.studio_media_download(uuid,uuid) from public,anon,authenticated;
grant execute on function public.studio_media_reserve(uuid,text,bigint,text),public.studio_media_state(uuid,uuid,text),public.studio_media_download(uuid,uuid) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('studio-private-media','studio-private-media',false,10485760,array['image/png','image/jpeg','image/webp','audio/mpeg','audio/wav','audio/ogg','audio/webm','audio/mp4','video/mp4','video/webm','application/json']);

create extension if not exists pg_cron;
select cron.schedule('studio-prepare-membership-reminders','30 * * * *','select studio_private.prepare_reminders();');
create extension if not exists pg_net with schema extensions;
create function studio_private.invoke_reminder_sender() returns bigint language plpgsql security definer set search_path='' as $$
declare secret text; result bigint;
begin
 if not exists(select 1 from public.studio_business_settings where id and email_enabled) then return 0; end if;
 select decrypted_secret into secret from vault.decrypted_secrets where name='studio_reminder_cron_secret' limit 1;
 if secret is null or length(secret)<32 then return 0; end if;
 select net.http_post(url:='https://jruxafztuvenabqlzefz.supabase.co/functions/v1/studio-business?action=send-reminders',headers:=jsonb_build_object('Content-Type','application/json','x-studio-cron-secret',secret),body:='{}'::jsonb,timeout_milliseconds:=60000) into result;
 return result;
end $$;
revoke all on function studio_private.invoke_reminder_sender() from public,anon,authenticated;
select cron.schedule('studio-deliver-membership-reminders','45 * * * *','select studio_private.invoke_reminder_sender();');
notify pgrst,'reload schema';

create policy "No direct client access" on studio_private.media_budget for all to authenticated using(false) with check(false);
create policy "No direct client access" on studio_private.media_transfer for all to authenticated using(false) with check(false);
create policy "No direct client access" on studio_private.reminder_queue for all to authenticated using(false) with check(false);
create policy "No direct client access" on studio_private.reminder_day for all to authenticated using(false) with check(false);


