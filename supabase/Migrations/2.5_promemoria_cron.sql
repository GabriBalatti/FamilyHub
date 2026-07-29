create extension if not exists pg_cron;

-- Calcola una data nel fuso orario italiano, non in UTC: serve per confrontare
-- correttamente le scadenze (tipo "date", senza ora) con il giorno reale in Italia.
create or replace function data_locale(giorni_offset int default 0)
returns date
language sql
stable
as $$
  select ((now() at time zone 'Europe/Rome') + (giorni_offset || ' days')::interval)::date;
$$;

select cron.schedule(
  'controlla-promemoria',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://yjoadyufncmncdsefaco.supabase.co/functions/v1/notify-promemoria',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || get_service_role_key()
    )
  );
  $$
);