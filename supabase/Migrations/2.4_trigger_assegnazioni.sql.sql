-- Faccenda assegnata alla creazione, o quando l'assegnatario cambia
create or replace function notifica_faccenda_assegnata()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.assegnato_a is not null
     and (tg_op = 'INSERT' or old.assegnato_a is distinct from new.assegnato_a) then
    perform net.http_post(
      url := 'https://yjoadyufncmncdsefaco.supabase.co/functions/v1/notify-assegnazione',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || get_service_role_key()
      ),
      body := jsonb_build_object('tipo', 'faccenda', 'record', to_jsonb(new))
    );
  end if;
  return new;
end;
$$;

create trigger su_faccenda_assegnata
  after insert or update on faccende
  for each row
  execute function notifica_faccenda_assegnata();

-- Nuovi partecipanti aggiunti a un evento (mai chi lo crea, mai chi c'era già)
create or replace function notifica_evento_partecipanti()
returns trigger
language plpgsql
security definer
as $$
declare
  vecchi uuid[];
  nuovi_partecipanti uuid[];
begin
  vecchi := case when tg_op = 'INSERT' then '{}'::uuid[] else coalesce(old.partecipanti, '{}'::uuid[]) end;

  select array_agg(p) into nuovi_partecipanti
  from unnest(new.partecipanti) as p
  where (new.created_by is null or p <> new.created_by)
    and p <> all(vecchi);

  if nuovi_partecipanti is not null and array_length(nuovi_partecipanti, 1) > 0 then
    perform net.http_post(
      url := 'https://yjoadyufncmncdsefaco.supabase.co/functions/v1/notify-assegnazione',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || get_service_role_key()
      ),
      body := jsonb_build_object(
        'tipo', 'evento',
        'record', to_jsonb(new),
        'nuovi_partecipanti', to_jsonb(nuovi_partecipanti)
      )
    );
  end if;
  return new;
end;
$$;

create trigger su_evento_partecipanti
  after insert or update on appuntamenti
  for each row
  execute function notifica_evento_partecipanti();