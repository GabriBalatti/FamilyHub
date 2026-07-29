-- Faccenda assegnata: niente notifica se te la assegni (o riassegni) da solo
create or replace function notifica_faccenda_assegnata()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.assegnato_a is not null
     and new.assegnato_a is distinct from auth.uid()
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

-- Faccenda eliminata: niente notifica se elimini una faccenda assegnata a te stesso
create or replace function notifica_faccenda_eliminata()
returns trigger
language plpgsql
security definer
as $$
begin
  if old.assegnato_a is not null and old.assegnato_a is distinct from auth.uid() then
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

-- Evento eliminato: tolgo chi ha eseguito l'eliminazione dalla lista dei destinatari,
-- gli altri partecipanti continuano a ricevere la notifica normalmente
create or replace function notifica_evento_eliminato()
returns trigger
language plpgsql
security definer
as $$
declare
  destinatari uuid[];
  payload jsonb;
begin
  select array_agg(p) into destinatari
  from unnest(old.partecipanti) as p
  where p is distinct from auth.uid();

  if destinatari is not null and array_length(destinatari, 1) > 0 then
    payload := to_jsonb(old) || jsonb_build_object('partecipanti', to_jsonb(destinatari));
    perform net.http_post(
      url := 'https://yjoadyufncmncdsefaco.supabase.co/functions/v1/notify-eliminazione-completamento',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || get_service_role_key()
      ),
      body := jsonb_build_object('tipo', 'evento_eliminato', 'record', payload)
    );
  end if;
  return old;
end;
$$;