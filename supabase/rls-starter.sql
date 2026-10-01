-- VC-01 RLS STARTER. Review/test in a disposable Supabase project before production.
-- The public product should consume approved views/functions, not raw moderation records.

create or replace function public.is_moderator()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_moderator from public.profiles where user_id = auth.uid()), false);
$$;

create policy "profiles self read" on public.profiles for select using (user_id = auth.uid() or public.is_moderator());
create policy "profiles self update" on public.profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "cases filer read" on public.cases for select using (filer_user_id = auth.uid() or public.is_moderator());
create policy "cases adult filer insert" on public.cases for insert with check (
  filer_user_id = auth.uid()
  and exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.is_adult_verified)
);
create policy "cases draft owner update" on public.cases for update using (
  filer_user_id = auth.uid() and status in ('draft','changes_requested')
) with check (filer_user_id = auth.uid());
create policy "consent subject read" on public.consent_records for select using (user_id = auth.uid() or public.is_moderator());
create policy "consent subject insert" on public.consent_records for insert with check (user_id = auth.uid());
create policy "moderation moderator read" on public.moderation_actions for select using (public.is_moderator());
create policy "moderation moderator write" on public.moderation_actions for insert with check (public.is_moderator());
create policy "reports authenticated insert" on public.reports for insert with check (auth.uid() is not null and reporter_user_id = auth.uid());
create policy "reports moderator read" on public.reports for select using (public.is_moderator());

-- statements, exhibits, clerk_briefs, votes, comments and case_events still require
-- lifecycle-aware policies plus approved public views/RPCs before production.
