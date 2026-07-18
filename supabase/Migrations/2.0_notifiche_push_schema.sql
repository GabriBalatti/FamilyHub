-- =========================================
-- NOTIFICHE PUSH - Schema
-- Da eseguire nel SQL Editor di Supabase
-- =========================================

create table push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  profilo_id uuid references profili(id) on delete cascade not null,
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz default now()
);

alter table push_subscriptions enable row level security;

create policy "Gestisci le tue sottoscrizioni"
  on push_subscriptions for all
  using (profilo_id = auth.uid())
  with check (profilo_id = auth.uid());

-- Traccia cosa è già stato inviato, per non duplicare i promemoria
create table notifiche_log (
  id uuid primary key default uuid_generate_v4(),
  profilo_id uuid references profili(id) on delete cascade not null,
  tipo text not null, -- es: 'faccenda_assegnata', 'evento_promemoria_24h', ...
  riferimento_id uuid, -- id della faccenda/appuntamento collegato
  created_at timestamptz default now()
);

alter table notifiche_log enable row level security;

create policy "Vedi le tue notifiche"
  on notifiche_log for select
  using (profilo_id = auth.uid());

create index idx_notifiche_log_lookup on notifiche_log (tipo, riferimento_id, profilo_id);