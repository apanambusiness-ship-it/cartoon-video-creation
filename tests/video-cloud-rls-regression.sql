begin;
select set_config('test.video_a',gen_random_uuid()::text,true),set_config('test.video_b',gen_random_uuid()::text,true);
insert into auth.users(id,email) values(current_setting('test.video_a')::uuid,'video-a@example.invalid'),(current_setting('test.video_b')::uuid,'video-b@example.invalid');
select set_config('request.jwt.claim.sub',current_setting('test.video_a'),true),set_config('request.jwt.claims',json_build_object('sub',current_setting('test.video_a'),'role','authenticated')::text,true);
set local role authenticated;
insert into public.studio_video_projects(user_id,slot,title,payload) values(current_setting('test.video_a')::uuid,1,'test','{"format":"apanam-cartoon-project-full","scenes":[{"title":"Test","caption":"Audio","duration":1}]}');
do $$ begin
 begin
 insert into public.studio_video_projects(user_id,slot,title,payload) values(current_setting('test.video_b')::uuid,1,'not allowed','{"format":"apanam-cartoon-project-full","scenes":[{"title":"Test","caption":"Audio","duration":1}]}');
 raise exception 'Cross-user insert incorrectly allowed';
 exception when insufficient_privilege then null;end;
 update public.studio_video_projects set title='version two' where user_id=current_setting('test.video_a')::uuid and slot=1 and version=1;
 if not found then raise exception 'Own update failed';end if;
 update public.studio_video_projects set title='stale overwrite' where user_id=current_setting('test.video_a')::uuid and slot=1 and version=1;
 if found then raise exception 'Stale version update allowed';end if;
 if (select version from public.studio_video_projects where user_id=current_setting('test.video_a')::uuid and slot=1)<>2 then raise exception 'Server version did not increment';end if;
 begin
 insert into public.studio_video_projects(user_id,slot,title,payload) values(current_setting('test.video_a')::uuid,3,'bad slot','{"format":"apanam-cartoon-project-full","scenes":[{"title":"Test","caption":"Audio","duration":1}]}');
 raise exception 'Third slot allowed';exception when check_violation then null;end;
end $$;
reset role;
do $$ begin
 if (select used_bytes from studio_private.video_budget)<>(select sum(octet_length(payload::text)) from public.studio_video_projects) then raise exception 'Budget tracking mismatch';end if;
end $$;
update studio_private.video_budget set max_bytes=greatest(1,used_bytes);
set local role authenticated;
do $$ begin
 begin
 insert into public.studio_video_projects(user_id,slot,title,payload) values(current_setting('test.video_a')::uuid,2,'quota test','{"format":"apanam-cartoon-project-full","scenes":[{"title":"Test","caption":"Audio","duration":1}]}');
 raise exception 'Quota overflow allowed';
 exception when raise_exception then if sqlerrm not like 'Free video cloud storage is full.%' then raise;end if;end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('test.video_b'),true),set_config('request.jwt.claims',json_build_object('sub',current_setting('test.video_b'),'role','authenticated')::text,true);
do $$ begin if exists(select 1 from public.studio_video_projects) then raise exception 'Other user backup is visible';end if;delete from public.studio_video_projects;if found then raise exception 'Other user backup deleted';end if;end $$;
reset role;
set local role anon;
do $$ begin begin perform 1 from public.studio_video_projects;raise exception 'Anon access allowed';exception when insufficient_privilege then null;end;end $$;
reset role;
select 'PASS owner-only read/write/delete, slot cap, stale update protection, atomic global quota and anon denial' as result;
rollback;