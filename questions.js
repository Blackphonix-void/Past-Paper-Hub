
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  sender_name text not null,
  sender_email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.questions enable row level security;

revoke all on public.questions from anon, authenticated;

grant insert on public.questions to anon;

create policy "Visitors can send questions"
on public.questions
for insert
to anon
with check (
  length(sender_name) between 1 and 100
  and length(sender_email) between 3 and 254
  and length(message) between 1 and 3000
);
