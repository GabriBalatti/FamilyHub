const FUSO = 'Europe/Rome';

export function dataLocale(giorniOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + giorniOffset);
  return d.toLocaleDateString('sv-SE', { timeZone: FUSO });
}