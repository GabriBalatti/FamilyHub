import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, ListTodo, ShoppingCart, Sparkles, Trophy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export default function Home() {
  const { profilo } = useAuth();
  const [membri, setMembri] = useState([]);
  const [faccendeUrgenti, setFaccendeUrgenti] = useState([]);
  const [prossimiAppuntamenti, setProssimiAppuntamenti] = useState([]);
  const [articoliDaComprare, setArticoliDaComprare] = useState(0);
  const [completateSettimana, setCompletateSettimana] = useState(0);

  useEffect(() => {
    caricaMembri();
    caricaFaccendeUrgenti();
    caricaProssimiAppuntamenti();
    caricaArticoliSpesa();
    caricaCompletateSettimana();

    const canale = supabase
      .channel('home-canale')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faccende' }, () => {
        caricaFaccendeUrgenti();
        caricaCompletateSettimana();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appuntamenti' }, caricaProssimiAppuntamenti)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'elementi_spesa' }, caricaArticoliSpesa)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profili' }, caricaMembri)
      .subscribe();

    return () => supabase.removeChannel(canale);
  }, []);

  async function caricaMembri() {
    const { data } = await supabase
      .from('profili')
      .select('id, nome, colore')
      .eq('famiglia_id', profilo.famiglia_id);
    setMembri(data || []);
  }

  async function caricaFaccendeUrgenti() {
    const oggi = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from('faccende')
      .select('*')
      .eq('assegnato_a', profilo.id)
      .eq('fatto', false)
      .lte('scadenza', oggi)
      .order('scadenza', { ascending: true });
    setFaccendeUrgenti(data || []);
  }

  async function caricaProssimiAppuntamenti() {
    const { data } = await supabase
      .from('appuntamenti')
      .select('*')
      .gte('data_inizio', new Date().toISOString())
      .order('data_inizio', { ascending: true })
      .limit(1);
    setProssimiAppuntamenti(data || []);
  }

  async function caricaArticoliSpesa() {
    const { count } = await supabase
      .from('elementi_spesa')
      .select('id', { count: 'exact', head: true })
      .eq('comprato', false);
    setArticoliDaComprare(count || 0);
  }

  function inizioSettimana() {
    const oggi = new Date();
    const giorno = oggi.getDay();
    const diff = giorno === 0 ? 6 : giorno - 1;
    const lunedi = new Date(oggi);
    lunedi.setDate(oggi.getDate() - diff);
    lunedi.setHours(0, 0, 0, 0);
    return lunedi.toISOString();
  }

  async function caricaCompletateSettimana() {
    const { count } = await supabase
      .from('faccende')
      .select('id', { count: 'exact', head: true })
      .eq('fatto', true)
      .gte('completata_il', inizioSettimana());
    setCompletateSettimana(count || 0);
  }

  function formattaProssimoAppuntamento(iso) {
    const data = new Date(iso);
    const domani = new Date();
    domani.setDate(domani.getDate() + 1);
    const eDomani = data.toDateString() === domani.toDateString();
    const dataFormattata = data.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
    const ora = data.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    return `${eDomani ? 'Domani' : dataFormattata}, ${ora}`;
  }

  const primaFaccenda = faccendeUrgenti[0];
  const prossimoAppuntamento = prossimiAppuntamenti[0];
  const oggi = new Date().toISOString().slice(0, 10);
  const riepilogoOggi = primaFaccenda
    ? {
        link: '/faccende',
        testo: `Hai ${faccendeUrgenti.length} ${faccendeUrgenti.length === 1 ? 'faccenda urgente' : 'faccende urgenti'} da sistemare.`
      }
    : prossimoAppuntamento
      ? { link: '/calendario', testo: `${prossimoAppuntamento.titolo} è il prossimo momento da non dimenticare.` }
      : articoliDaComprare > 0
        ? { link: '/spesa', testo: `Ci sono ${articoliDaComprare} ${articoliDaComprare === 1 ? 'articolo' : 'articoli'} nella lista della spesa.` }
        : { link: '/profilo', testo: 'Tutto in ordine: goditi un po’ di tempo insieme.' };

  return (
    <div className="home">
      <header className="home-intestazione">
        <p className="home-saluto">Ciao, {profilo.nome}</p>
        {membri.length > 1 && (
          <div className="home-membri" aria-label="Membri della famiglia">
            {membri.map((membro) => (
              <span
                key={membro.id}
                className="home-avatar"
                style={{ backgroundColor: membro.colore || 'var(--primario)' }}
                title={membro.nome}
              >
                {membro.nome.charAt(0).toUpperCase()}
              </span>
            ))}
          </div>
        )}
      </header>

      <section className="home-griglia" aria-label="Riepilogo famiglia">
        <Link to="/faccende" className="home-card">
          <span className="home-card-etichetta"><ListTodo size={18} /> Faccende</span>
          <strong className="home-card-valore">{faccendeUrgenti.length}</strong>
          <span className={`home-card-dettaglio ${primaFaccenda ? 'is-urgente' : ''}`}>
            {primaFaccenda
              ? `${primaFaccenda.titolo}, ${primaFaccenda.scadenza === oggi ? 'scade oggi' : 'scaduta'}`
              : 'Nessuna urgenza'}
          </span>
        </Link>

        <Link to="/calendario" className="home-card">
          <span className="home-card-etichetta"><CalendarDays size={18} /> Prossimo</span>
          <strong className={`home-card-testo ${!prossimoAppuntamento ? 'is-vuoto' : ''}`}>
            {prossimoAppuntamento ? prossimoAppuntamento.titolo : 'Nessuno'}
          </strong>
          <span className="home-card-dettaglio">
            {prossimoAppuntamento ? formattaProssimoAppuntamento(prossimoAppuntamento.data_inizio) : 'Nessun appuntamento'}
          </span>
        </Link>

        <Link to="/spesa" className="home-card">
          <span className="home-card-etichetta"><ShoppingCart size={18} /> Spesa</span>
          <strong className="home-card-valore">{articoliDaComprare}</strong>
          <span className="home-card-dettaglio">{articoliDaComprare === 1 ? 'articolo da comprare' : 'articoli da comprare'}</span>
        </Link>

        <Link to="/faccende" className="home-card">
          <span className="home-card-etichetta"><Trophy size={18} /> Settimana</span>
          <strong className="home-card-valore">{completateSettimana}</strong>
          <span className="home-card-dettaglio">{completateSettimana === 1 ? 'completata' : 'completate'}</span>
        </Link>
      </section>

      <Link to={riepilogoOggi.link} className="home-momento">
        <span className="home-momento-icona"><Sparkles size={20} /></span>
        <span className="home-momento-testo">
          <span>Oggi in famiglia</span>
          <strong>{riepilogoOggi.testo}</strong>
        </span>
        <ArrowUpRight className="home-momento-freccia" size={20} aria-hidden="true" />
      </Link>
    </div>
  );
}
