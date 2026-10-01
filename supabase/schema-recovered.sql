-- VERDICT COURT MVP SCHEMA
-- PostgreSQL / Supabase-oriented reference schema.
-- Review with your engineer before production.

create extension if not exists pgcrypto;

create type case_mode as enum ('public_two_sided','hypothetical');
create type case_status as enum (
  'draft','bench_review','changes_requested','respondent_pending',
  'record_lock','deliberating','verdict_ready','closed','rejected','disabled'
);
create type party_role as enum ('petitioner','respondent');
create type moderation_state as enum ('pending','approved','redacted','rejected');

create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  handle text unique,
  avatar_url text,
  is_adult_verified boolean not null default false,
  is_moderator boolean not null default false,
  created_at timestamptz not null default now()
);

create table cases (
  id uuid primary key default gen_random_uuid(),
  filer_user_id uuid not null references auth.users(id),
  mode case_mode not null,
  status case_status not null default 'draft',
  title text not null,
  jury_question text not null,
  category text not null,
  requested_outcome text,
  public_slug text unique,
  respondent_consent_required boolean not null default true,
  voting_opens_at timestamptz,
  voting_closes_at timestamptz,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  closed_at timestamptz
);

create table case_parties (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  user_id uuid references auth.users(id),
  role party_role not null,
  display_label text not null,
  consented_to_publication boolean not null default false,
  consented_at timestamptz,
  unique(case_id, role)
);

create table statements (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  party_id uuid not null references case_parties(id) on delete cascade,
  version integer not null default 1,
  body text not null,
  is_locked boolean not null default false,
  moderation_state moderation_state not null default 'pending',
  created_at timestamptz not null default now(),
  unique(party_id, version)
);

create table exhibits (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  party_id uuid references case_parties(id),
  exhibit_label text not null,
  caption text not null,
  storage_path text,
  mime_type text,
  moderation_state moderation_state not null default 'pending',
  sha256 text,
  created_at timestamptz not null default now()
);

create table clerk_briefs (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade unique,
  agreed_facts jsonb not null default '[]'::jsonb,
  disputed_facts jsonb not null default '[]'::jsonb,
  petitioner_summary text,
  respondent_summary text,
  jury_questions jsonb not null default '[]'::jsonb,
  ai_generated boolean not null default true,
  human_approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table votes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  juror_user_id uuid not null references auth.users(id) on delete cascade,
  selected_party party_role not null,
  reason_code text,
  both_sides_viewed boolean not null default false,
  required_exhibits_viewed boolean not null default false,
  comprehension_passed boolean not null default false,
  qualified boolean generated always as
    (both_sides_viewed and required_exhibits_viewed and comprehension_passed) stored,
  created_at timestamptz not null default now(),
  unique(case_id, juror_user_id)
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  moderation_state moderation_state not null default 'pending',
  created_at timestamptz not null default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid references auth.users(id),
  case_id uuid references cases(id) on delete cascade,
  comment_id uuid references comments(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table consent_records (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  consent_type text not null,
  consent_version text not null,
  accepted_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table moderation_actions (
  id uuid primary key default gen_random_uuid(),
  moderator_user_id uuid not null references auth.users(id),
  case_id uuid references cases(id) on delete cascade,
  target_type text not null,
  target_id uuid,
  action text not null,
  reason text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table case_events (
  id bigserial primary key,
  case_id uuid not null references cases(id) on delete cascade,
  actor_user_id uuid references auth.users(id),
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index cases_status_idx on cases(status);
create index cases_category_idx on cases(category);
create index votes_case_idx on votes(case_id);
create index exhibits_case_idx on exhibits(case_id);
create index reports_status_idx on reports(status);

alter table profiles enable row level security;
alter table cases enable row level security;
alter table case_parties enable row level security;
alter table statements enable row level security;
alter table exhibits enable row level security;
alter table clerk_briefs enable row level security;
alter table votes enable row level security;
alter table comments enable row level security;
alter table reports enable row level security;
alter table consent_records enable row level security;
alter table moderation_actions enable row level security;
alter table case_events enable row level security;

-- IMPORTANT: Do not use blanket authenticated-user SELECT policies.
-- Build approved public-case views so private/raw moderation fields are never exposed.
