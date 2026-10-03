-- No objects are uploaded or messages sent. All synthetic rows and counters roll back.
begin;
create temporary table qa_download_users(label text primary key,id uuid default gen_random_uuid());
insert into qa_download_users(label) values('count'),('bytes'),('pool');
insert into auth.users(id,email,email_confirmed_at) select id,id::text||'@example.invalid',now() from qa_download_users;
create temporary table qa_download_files(label text primary key,id uuid);
grant select on qa_download_users to service_role;
grant select,insert on qa_download_files to service_role;
create function pg_temp.expect_download_limit(owner_id uuid,file_id uuid) returns void language plpgsql as $$
begin
 begin
 perform public.studio_media_download(owner_id,file_id);
 raise exception 'Download quota incorrectly allowed';
 exception when raise_exception then
 if sqlerrm not like 'Daily cloud download allowance reached%' then raise; end if;
 end;
end $$;
set local role service_role;
insert into qa_download_files select 'count',(public.studio_media_reserve((select id from qa_download_users where label='count'),'Count QA',1,'audio/webm')).id;
insert into qa_download_files select 'bytes',(public.studio_media_reserve((select id from qa_download_users where label='bytes'),'Bytes QA',10485760,'audio/mp4')).id;
insert into qa_download_files select 'pool',(public.studio_media_reserve((select id from qa_download_users where label='pool'),'Pool QA',1,'audio/webm')).id;
select public.studio_media_state(u.id,f.id,'ready') from qa_download_users u join qa_download_files f using(label);
do $$ declare n integer; u uuid; f uuid; begin
 select id into u from qa_download_users where label='count';select id into f from qa_download_files where label='count';
 for n in 1..20 loop perform public.studio_media_download(u,f);end loop;
 perform pg_temp.expect_download_limit(u,f);
 select id into u from qa_download_users where label='bytes';select id into f from qa_download_files where label='bytes';
 for n in 1..10 loop perform public.studio_media_download(u,f);end loop;
 perform pg_temp.expect_download_limit(u,f);
end $$;
reset role;
do $$ begin
 if (select links from studio_private.media_transfer where day=current_date and user_id=(select id from qa_download_users where label='count'))<>20 then raise exception 'Rejected request changed count quota';end if;
 if (select bytes from studio_private.media_transfer where day=current_date and user_id=(select id from qa_download_users where label='bytes'))<>104857600 then raise exception 'Rejected request changed byte quota';end if;
end $$;
-- Fill only the synthetic account's transfer counter up to the shared daily cap.
insert into studio_private.media_transfer(day,user_id,bytes,links)
select current_date,id,greatest(0,524288000-(select coalesce(sum(bytes),0) from studio_private.media_transfer where day=current_date)),0 from qa_download_users where label='pool';
set local role service_role;
select pg_temp.expect_download_limit((select id from qa_download_users where label='pool'),(select id from qa_download_files where label='pool'));
reset role;
select 'PASS: 20-request account cap, 100 MiB account cap, 500 MiB pool cap and atomic rejection' as result;
rollback;
