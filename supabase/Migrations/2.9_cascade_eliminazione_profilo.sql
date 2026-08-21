-- Permette l'eliminazione di un profilo senza bloccarsi sui contenuti creati in passato
-- (i riferimenti diventano NULL invece di impedire la delete)

alter table faccende drop constraint faccende_created_by_fkey;
alter table faccende add constraint faccende_created_by_fkey
  foreign key (created_by) references profili(id) on delete set null;

alter table elementi_spesa drop constraint elementi_spesa_aggiunto_da_fkey;
alter table elementi_spesa add constraint elementi_spesa_aggiunto_da_fkey
  foreign key (aggiunto_da) references profili(id) on delete set null;

alter table appuntamenti drop constraint appuntamenti_created_by_fkey;
alter table appuntamenti add constraint appuntamenti_created_by_fkey
  foreign key (created_by) references profili(id) on delete set null;