create extension if not exists pg_net;

-- Recupera la service role key da Vault. La riuseremo anche nei prossimi trigger.
create or replace function get_service_role_key()
returns text
language plpgsql
security definer
as $$
declare
  chiave text;
begin
  select decrypted_secret into chiave
  from vault.decrypted_secrets
  where name = 'service_role_key';
  return chiave;
end;
$$;

create or replace function notifica_nuovo_utente()
returns trigger
language plpgsql
security definer
as $$
begin
  perform net.http_post(
    url := 'https://yjoadyufncmncdsefaco.supabase.co/functions/v1/notify-nuovo-utente',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || get_service_role_key()
    ),
    body := jsonb_build_object('record', to_jsonb(new))
  );
  return new;
end;
$$;

create trigger su_nuovo_profilo
  after insert on profili
  for each row
  execute function notifica_nuovo_utente();