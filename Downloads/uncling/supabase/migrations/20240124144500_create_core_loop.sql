-- Create enum for internal states
create type internal_state as enum ('Secure', 'Anxious', 'Avoidant');

-- Create daily check-ins table
create table daily_check_ins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  state internal_state not null,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table daily_check_ins enable row level security;

create policy "Users can view their own check-ins"
  on daily_check_ins for select
  using (auth.uid() = user_id);

create policy "Users can insert their own check-ins"
  on daily_check_ins for insert
  with check (auth.uid() = user_id);
