-- =========================================
-- SCHEMA DATABASE - App Famiglia
-- Da eseguire nel SQL Editor di Supabase
-- =========================================

-- Estensione per UUID
create extension if not exists "uuid-ossp";

-- ---------------------------------------
-- Tabella: famiglie (gruppo familiare)
-- ---------------------------------------
create table famiglie (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  codice_invito text unique not null default substr(md5(random()::text), 1, 8),
  created_at timestamptz default now()
);

-- ---------------------------------------
-- Tabella: profili (estende auth.users)
-- ---------------------------------------
create table profili (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  famiglia_id uuid references famiglie(id) on delete set null,
  colore text default '#6366f1', -- colore identificativo persona
  created_at timestamptz default now()
);

-- ---------------------------------------
-- Tabella: faccende domestiche
-- ---------------------------------------
create table faccende (
  id uuid primary key default uuid_generate_v4(),
  famiglia_id uuid references famiglie(id) on delete cascade not null,
  titolo text not null,
  descrizione text,
  assegnato_a uuid references profili(id) on delete set null,
  fatto boolean default false,
  ricorrenza text default 'nessuna', -- nessuna | giornaliera | settimanale | mensile
  scadenza date,
  created_by uuid references profili(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------
-- Tabella: liste della spesa (più liste possibili)
-- ---------------------------------------
create table liste_spesa (
  id uuid primary key default uuid_generate_v4(),
  famiglia_id uuid references famiglie(id) on delete cascade not null,
  nome text not null default 'Spesa',
  created_at timestamptz default now()
);

-- ---------------------------------------
-- Tabella: elementi lista spesa
-- ---------------------------------------
create table elementi_spesa (
  id uuid primary key default uuid_generate_v4(),
  lista_id uuid references liste_spesa(id) on delete cascade not null,
  nome text not null,
  quantita text,
  comprato boolean default false,
  aggiunto_da uuid references profili(id),
  created_at timestamptz default now()
);

-- ---------------------------------------
-- Tabella: appuntamenti / eventi calendario
-- ---------------------------------------
create table appuntamenti (
  id uuid primary key default uuid_generate_v4(),
  famiglia_id uuid references famiglie(id) on delete cascade not null,
  titolo text not null,
  descrizione text,
  luogo text,
  data_inizio timestamptz not null,
  data_fine timestamptz,
  tutto_il_giorno boolean default false,
  partecipanti uuid[] default '{}', -- array di profilo id
  created_by uuid references profili(id),
  created_at timestamptz default now()
);

-- =========================================
-- ROW LEVEL SECURITY
-- =========================================

alter table famiglie enable row level security;
alter table profili enable row level security;
alter table faccende enable row level security;
alter table liste_spesa enable row level security;
alter table elementi_spesa enable row level security;
alter table appuntamenti enable row level security;

-- Helper: famiglia_id dell'utente corrente
create or replace function get_my_famiglia_id()
returns uuid
language sql
security definer
stable
as $$
  select famiglia_id from profili where id = auth.uid();
$$;

-- Profili: vedo e modifico solo membri della mia famiglia / me stesso
create policy "Vedi profili della tua famiglia"
  on profili for select
  using (famiglia_id = get_my_famiglia_id() or id = auth.uid());

create policy "Modifica il tuo profilo"
  on profili for update
  using (id = auth.uid());

create policy "Crea il tuo profilo"
  on profili for insert
  with check (id = auth.uid());

-- Famiglie: posso leggere la mia famiglia
create policy "Vedi la tua famiglia"
  on famiglie for select
  using (id = get_my_famiglia_id());

create policy "Crea famiglia"
  on famiglie for insert
  with check (true);

-- Policy generica per le tabelle famiglia-scoped
create policy "CRUD faccende famiglia"
  on faccende for all
  using (famiglia_id = get_my_famiglia_id())
  with check (famiglia_id = get_my_famiglia_id());

create policy "CRUD liste spesa famiglia"
  on liste_spesa for all
  using (famiglia_id = get_my_famiglia_id())
  with check (famiglia_id = get_my_famiglia_id());

create policy "CRUD elementi spesa famiglia"
  on elementi_spesa for all
  using (
    lista_id in (select id from liste_spesa where famiglia_id = get_my_famiglia_id())
  )
  with check (
    lista_id in (select id from liste_spesa where famiglia_id = get_my_famiglia_id())
  );

create policy "CRUD appuntamenti famiglia"
  on appuntamenti for all
  using (famiglia_id = get_my_famiglia_id())
  with check (famiglia_id = get_my_famiglia_id());

-- =========================================
-- REALTIME (per sync live tra dispositivi)
-- =========================================
alter publication supabase_realtime add table faccende;
alter publication supabase_realtime add table elementi_spesa;
alter publication supabase_realtime add table appuntamenti;
alter publication supabase_realtime add table liste_spesa;
