-- ---------------------------------------
-- Migration 3.2: traccia quando una faccenda viene completata
-- ---------------------------------------

alter table faccende
  add column completata_il timestamptz;

create or replace function aggiorna_completata_il()
returns trigger
language plpgsql
as $$
begin
  if new.fatto = true and old.fatto = false then
    new.completata_il = now();
  elsif new.fatto = false and old.fatto = true then
    new.completata_il = null;
  end if;
  return new;
end;
$$;

create trigger trg_aggiorna_completata_il
  before update on faccende
  for each row
  execute function aggiorna_completata_il();