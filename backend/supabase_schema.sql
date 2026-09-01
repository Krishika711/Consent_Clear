-- Run this in the Supabase dashboard: SQL Editor > New query > Run

create table policies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  url text,
  jurisdiction text not null default 'DPDP',
  is_monitored boolean not null default false,
  last_hash text,
  created_at timestamptz not null default now()
);

create table scans (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid references policies(id) on delete cascade,
  risk_score text,
  result_json jsonb not null,
  policy_text text not null,
  text_hash text not null,
  created_at timestamptz not null default now()
);

create table alerts (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid references policies(id) on delete cascade,
  type text not null check (type in ('drift', 'amendment')),
  message text not null,
  sent_at timestamptz not null default now()
);

create index scans_policy_id_idx on scans(policy_id);
create index policies_monitored_idx on policies(is_monitored) where is_monitored = true;

-- Row Level Security: enable + restrict to the owning user.
-- Skip/adjust this block if you're not using Supabase Auth yet in the hackathon build.
alter table policies enable row level security;
alter table scans enable row level security;

create policy "Users see their own policies"
  on policies for select using (auth.uid() = user_id);
create policy "Users insert their own policies"
  on policies for insert with check (auth.uid() = user_id);

create policy "Users see scans of their own policies"
  on scans for select using (
    exists (select 1 from policies where policies.id = scans.policy_id and policies.user_id = auth.uid())
  );
