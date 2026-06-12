create policy "Vedi famiglia appena creata"
  on famiglie for select
  to authenticated
  using (true);