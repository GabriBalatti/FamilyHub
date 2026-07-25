-- Evento eliminato: avvisa chi partecipava
create or replace function notifica_evento_eliminato()
returns trigger
language plpgsql
security definer
as $$
begin
  if old.partecipanti is not null and array_length(old.partecipanti, 1) > 0 then
    perform net.http_post(
      url := 'https://yjoadyufncmncdsefaco.supabase.co/functions/v1/notify-eliminazione-completamento',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || get_service_role_key()
      ),
      body := jsonb_build_object('tipo', 'evento_eliminato', 'record', to_jsonb(old))
    );
  end if;
  return old;
end;
$$;

create trigger su_evento_eliminato
  after delete on appuntamenti
  for each row
  execute function notifica_evento_eliminato();

-- Faccenda eliminata: avvisa l'assegnatario
create or replace function notifica_faccenda_eliminata()
returns trigger
language plpgsql
security definer
as $$
begin
  if old.assegnato_a is not null then
    perform net.http_post(
      url := 'https://yjoadyufncmncdsefaco.supabase.co/functions/v1/notify-eliminazione-completamento',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || get_service_role_key()
      ),
      body := jsonb_build_object('tipo', 'faccenda_eliminata', 'record', to_jsonb(old))
    );
  end if;
  return old;
end;
$$;

create trigger su_faccenda_eliminata
  after delete on faccende
  for each row
  execute function notifica_faccenda_eliminata();

-- Faccenda completata: avvisa l'assegnatario, tranne quando è lui a completarla
create or replace function notifica_faccenda_completata()
returns trigger
language plpgsql
security definer
as $$
begin
  if old.fatto = false and new.fatto = true
     and new.assegnato_a is not null
     and new.assegnato_a is distinct from auth.uid() then
    perform net.http_post(
      url := 'https://yjoadyufncmncdsefaco.supabase.co/functions/v1/notify-eliminazione-completamento',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || get_service_role_key()
      ),
      body := jsonb_build_object('tipo', 'faccenda_completata', 'record', to_jsonb(new))
    );
  end if;
  return new;
end;
$$;

create trigger su_faccenda_completata
  after update on faccende
  for each row
  execute function notifica_faccenda_completata();