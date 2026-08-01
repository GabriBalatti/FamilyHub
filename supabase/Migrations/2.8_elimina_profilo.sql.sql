create policy "Elimina il tuo profilo"
  on profili for delete
  using (id = auth.uid());