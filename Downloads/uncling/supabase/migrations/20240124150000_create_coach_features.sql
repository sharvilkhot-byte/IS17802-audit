-- Create evidence_logs table
create table evidence_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  negative_belief text not null,
  counter_evidence text not null,
  coherence_score integer check (coherence_score >= 1 and coherence_score <= 10),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table evidence_logs enable row level security;

create policy "Users can view their own evidence logs"
  on evidence_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own evidence logs"
  on evidence_logs for insert
  with check (auth.uid() = user_id);
