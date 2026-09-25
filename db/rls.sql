alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.schedule_events enable row level security;
alter table public.calendar_links enable row level security;
alter table public.daily_briefings enable row level security;
alter table public.local_knowledge enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "prefs_select_own" on public.user_preferences for select using (auth.uid() = user_id);
create policy "prefs_upsert_own" on public.user_preferences for all using (auth.uid() = user_id);

create policy "conversations_owner" on public.conversations for all using (auth.uid() = user_id);
create policy "messages_owner" on public.messages for all using (auth.uid() = user_id);

create policy "schedule_owner" on public.schedule_events for all using (auth.uid() = user_id);

create policy "calendar_links_owner" on public.calendar_links for all using (auth.uid() = user_id);

create policy "briefings_select_own" on public.daily_briefings for select using (auth.uid() = user_id);

create policy "local_knowledge_read_all" on public.local_knowledge for select using (auth.role() = 'authenticated');
