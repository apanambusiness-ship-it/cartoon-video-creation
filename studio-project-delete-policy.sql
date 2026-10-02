grant delete on public.studio_projects to authenticated;
create policy "User deletes own poster projects" on public.studio_projects for delete to authenticated using (user_id=(select auth.uid()));