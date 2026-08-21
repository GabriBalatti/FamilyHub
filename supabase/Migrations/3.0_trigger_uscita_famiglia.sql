drop trigger if exists su_nuovo_profilo on profili;
drop function if exists notifica_nuovo_utente();

create function notifica_utente_famiglia()
returns trigger
language plpgsql
security definer
as $$
begin
  if tg_op = 'INSERT' and new.famiglia_id is not null then
    perform net.http_post(
      url := 'https://yjoadyufncmncdsefaco.supabase.co/functions/v1/notify-nuovo-utente',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || get_service_role_key()
      ),
      body := jsonb_build_object(
        'tipo', 'entrata',
        'record', jsonb_build_object('id', new.id, 'nome', new.nome, 'famiglia_id', new.famiglia_id)
      )
    );
    return new;
  end if;

  if tg_op = 'DELETE' and old.famiglia_id is not null then
    perform net.http_post(
      url := 'https://yjoadyufncmncdsefaco.supabase.co/functions/v1/notify-nuovo-utente',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || get_service_role_key()
      ),
      body := jsonb_build_object(
        'tipo', 'uscita',
        'record', jsonb_build_object('id', old.id, 'nome', old.nome, 'famiglia_id', old.famiglia_id)
      )
    );
    return old;
  end if;

  return coalesce(new, old);
end;
$$;

create trigger su_profilo_famiglia
  after insert or delete on profili
  for each row
  execute function notifica_utente_famiglia();