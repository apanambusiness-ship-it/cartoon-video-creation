-- Accept browser-recorded audio; ownership and all quotas stay unchanged.
create or replace function public.studio_media_reserve(owner_id uuid,file_title text,file_bytes bigint,file_mime text) returns public.studio_media_files language plpgsql security definer set search_path='' as $$
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

update storage.buckets set allowed_mime_types=array['image/png','image/jpeg','image/webp','audio/mpeg','audio/wav','audio/ogg','audio/webm','audio/mp4','video/mp4','video/webm','application/json'] where id='studio-private-media';
