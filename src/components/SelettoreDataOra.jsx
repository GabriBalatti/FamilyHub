import { useState } from 'react';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock } from 'lucide-react';
import { useBloccaScroll } from '../lib/useBloccaScroll';
import ModalPortal from './ModalPortal';

const GIORNI_SETTIMANA = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

function dataDaValore(valore, includeOra) {
  if (valore) {
    const [data, ora = '09:00'] = valore.split('T');
    const [anno, mese, giorno] = data.split('-').map(Number);
    const [ore, minuti] = ora.split(':').map(Number);
    return new Date(anno, mese - 1, giorno, includeOra ? ore : 0, includeOra ? minuti : 0);
  }
  const adesso = new Date();
  adesso.setSeconds(0, 0);
  adesso.setMinutes(Math.ceil(adesso.getMinutes() / 15) * 15);
  return adesso;
}

function valoreData(data, includeOra) {
  const parteData = [data.getFullYear(), String(data.getMonth() + 1).padStart(2, '0'), String(data.getDate()).padStart(2, '0')].join('-');
  if (!includeOra) return parteData;
  return `${parteData}T${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;
}

function testoData(valore, includeOra) {
  if (!valore) return includeOra ? 'Scegli data e ora' : 'Scegli una data';
  const data = dataDaValore(valore, includeOra);
  const giorno = data.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
  return includeOra ? `${giorno}, ${data.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}` : giorno;
}

export default function SelettoreDataOra({ value, onChange, includeOra = false, obbligatorio = false }) {
  const [aperto, setAperto] = useState(false);
  const [selezione, setSelezione] = useState(() => dataDaValore(value, includeOra));
  const [meseVisibile, setMeseVisibile] = useState(() => new Date(selezione.getFullYear(), selezione.getMonth(), 1));
  useBloccaScroll(aperto);

  function apri() {
    const data = dataDaValore(value, includeOra);
    setSelezione(data);
    setMeseVisibile(new Date(data.getFullYear(), data.getMonth(), 1));
    setAperto(true);
  }

  function cambiaMese(direzione) {
    setMeseVisibile((mese) => new Date(mese.getFullYear(), mese.getMonth() + direzione, 1));
  }

  function selezionaGiorno(giorno) {
    setSelezione((precedente) => new Date(meseVisibile.getFullYear(), meseVisibile.getMonth(), giorno, precedente.getHours(), precedente.getMinutes()));
  }

  function variaOra(campo, variazione) {
    setSelezione((precedente) => {
      const aggiornata = new Date(precedente);
      if (campo === 'ore') aggiornata.setHours((precedente.getHours() + variazione + 24) % 24);
      else aggiornata.setMinutes((precedente.getMinutes() + variazione + 60) % 60);
      return aggiornata;
    });
  }

  const anno = meseVisibile.getFullYear();
  const mese = meseVisibile.getMonth();
  const primoGiorno = (new Date(anno, mese, 1).getDay() + 6) % 7;
  const giorniNelMese = new Date(anno, mese + 1, 0).getDate();
  const celle = [...Array(primoGiorno).fill(null), ...Array.from({ length: giorniNelMese }, (_, indice) => indice + 1)];
  const oggi = new Date();

  return (
    <>
      <button type="button" className={`campo-data ${value ? 'compilato' : ''}`} onClick={apri}>
        <CalendarDays size={18} />
        <span>{testoData(value, includeOra)}</span>
        {includeOra && <Clock size={16} />}
      </button>

      {aperto && (
        <ModalPortal>
          <div className="modal-overlay modal-data-overlay" onClick={() => setAperto(false)}>
            <div className="modal-contenuto modal-data" onClick={(evento) => evento.stopPropagation()}>
              <div className="modal-data-intestazione">
                <span>{includeOra ? 'Data e ora' : 'Seleziona la data'}</span>
                <strong>{selezione.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}</strong>
              </div>

              <div className="calendario-navigazione">
                <button type="button" onClick={() => cambiaMese(-1)} aria-label="Mese precedente"><ChevronLeft size={20} /></button>
                <strong>{meseVisibile.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}</strong>
                <button type="button" onClick={() => cambiaMese(1)} aria-label="Mese successivo"><ChevronRight size={20} /></button>
              </div>

              <div className="calendario-griglia" aria-label="Calendario">
                {GIORNI_SETTIMANA.map((giorno, indice) => <span key={`${giorno}-${indice}`}>{giorno}</span>)}
                {celle.map((giorno, indice) => {
                  if (!giorno) return <span key={`vuoto-${indice}`} />;
                  const selezionato = giorno === selezione.getDate() && mese === selezione.getMonth() && anno === selezione.getFullYear();
                  const eOggi = giorno === oggi.getDate() && mese === oggi.getMonth() && anno === oggi.getFullYear();
                  return <button key={giorno} type="button" className={`${selezionato ? 'selezionato' : ''} ${eOggi ? 'oggi' : ''}`} onClick={() => selezionaGiorno(giorno)}>{giorno}</button>;
                })}
              </div>

              {includeOra && (
                <div className="selettore-orario">
                  <Clock size={18} />
                  <div className="orologio-controllo">
                    <button type="button" onClick={() => variaOra('ore', 1)} aria-label="Aumenta le ore"><ChevronUp size={16} /></button>
                    <strong>{String(selezione.getHours()).padStart(2, '0')}</strong>
                    <button type="button" onClick={() => variaOra('ore', -1)} aria-label="Diminuisci le ore"><ChevronDown size={16} /></button>
                  </div>
                  <span>:</span>
                  <div className="orologio-controllo">
                    <button type="button" onClick={() => variaOra('minuti', 1)} aria-label="Aumenta i minuti"><ChevronUp size={16} /></button>
                    <strong>{String(selezione.getMinutes()).padStart(2, '0')}</strong>
                    <button type="button" onClick={() => variaOra('minuti', -1)} aria-label="Diminuisci i minuti"><ChevronDown size={16} /></button>
                  </div>
                </div>
              )}

              <div className="modal-azioni modal-data-azioni">
                {!obbligatorio && <button type="button" className="bottone-secondario" onClick={() => { onChange(''); setAperto(false); }}>Rimuovi</button>}
                <button type="button" onClick={() => { onChange(valoreData(selezione, includeOra)); setAperto(false); }}>Conferma</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
