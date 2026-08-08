import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { LogOut, UserPlus, Bell, ShieldAlert, Users } from 'lucide-react';
import { APP_VERSION } from '../lib/version';
import { useState, useEffect } from 'react';
import { attivaNotifiche, disattivaNotifiche, notificheAttive } from '../lib/pushNotifications';
import ConfermaModal from '../components/ConfermaModal';
import InvitaModal from '../components/InvitaModal';

export default function Profilo() {
  const { profilo, ricaricaProfilo } = useAuth();
  const [notificheOn, setNotificheOn] = useState(false);
  const [caricamentoNotifiche, setCaricamentoNotifiche] = useState(false);
  const [modaleAperto, setModaleAperto] = useState(null);
  const [membri, setMembri] = useState([]);

  useEffect(() => {
    notificheAttive().then(setNotificheOn);
  }, []);

  useEffect(() => {
    if (!profilo?.famiglia_id) return;

    caricaMembri();

    const canale = supabase
      .channel('membri-profilo-canale')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profili' },
        () => caricaMembri()
      )
      .subscribe();

    return () => supabase.removeChannel(canale);
  }, [profilo?.famiglia_id]);

  async function caricaMembri() {
    const { data } = await supabase
      .from('profili')
      .select('id, nome, colore')
      .eq('famiglia_id', profilo.famiglia_id)
      .order('nome');
    setMembri(data || []);
  }

  async function toggleNotifiche() {
    setCaricamentoNotifiche(true);
    try {
      if (notificheOn) {
        await disattivaNotifiche();
        setNotificheOn(false);
      } else {
        await attivaNotifiche(profilo.id);
        setNotificheOn(true);
      }
    } catch (err) {
      alert(err.message);
    }
    setCaricamentoNotifiche(false);
  }

  async function confermaLogout() {
    setModaleAperto(null);
    await supabase.auth.signOut();
  }

  async function confermaAbbandonaFamiglia() {
    setModaleAperto(null);

    try {
      const { error: erroreFaccende } = await supabase
        .from('faccende')
        .update({ assegnato_a: null })
        .eq('assegnato_a', profilo.id);
      if (erroreFaccende) throw erroreFaccende;

      const { data: eventi, error: erroreLettura } = await supabase
        .from('appuntamenti')
        .select('id, partecipanti')
        .contains('partecipanti', [profilo.id]);
      if (erroreLettura) throw erroreLettura;

      for (const evento of eventi || []) {
        const nuoviPartecipanti = evento.partecipanti.filter((id) => id !== profilo.id);
        const { error: erroreUpdate } = await supabase
          .from('appuntamenti')
          .update({ partecipanti: nuoviPartecipanti })
          .eq('id', evento.id);
        if (erroreUpdate) throw erroreUpdate;
      }

      const { error: erroreEliminazione } = await supabase
        .from('profili')
        .delete()
        .eq('id', profilo.id);
      if (erroreEliminazione) throw erroreEliminazione;

      await ricaricaProfilo();
    } catch (err) {
      alert("Errore durante l'abbandono della famiglia: " + err.message);
    }
  }

  const inizialeNome = profilo?.nome ? profilo.nome.charAt(0).toUpperCase() : '?';

  return (
    <div className="pagina pagina-profilo">
      <h2>Profilo</h2>

      {/* Header Utente con Avatar */}
      <div className="card-profilo-header">
        <div className="avatar">{inizialeNome}</div>
        <div className="info-profilo">
          <h3>{profilo?.nome}</h3>
          <span className="badge-famiglia">
            <Users size={14} />
            {profilo?.famiglie?.nome || 'Nessuna famiglia'}
          </span>
        </div>
      </div>

      {/* Sezione Gestione Famiglia */}
      <div className="gruppo-sezione">
        <span className="titolo-sezione">Famiglia</span>

        {membri.length > 0 && (
          <ul className="lista-membri-famiglia">
            {membri.map((m) => (
              <li key={m.id} className="membro-riga">
                <div className="avatar avatar-piccolo" style={{ background: m.colore }}>
                  {m.nome.charAt(0).toUpperCase()}
                </div>
                <span>{m.nome}</span>
                {m.id === profilo.id && <span className="badge-tu">Tu</span>}
              </li>
            ))}
          </ul>
        )}

        <button 
          className="bottone-secondario bottone-icona" 
          onClick={() => setModaleAperto('invita')}
        >
          <UserPlus size={18} />
          <span>Invita un nuovo membro</span>
        </button>
      </div>

      {/* Sezione Preferenze */}
      <div className="gruppo-sezione">
        <span className="titolo-sezione">Preferenze</span>
        <div className="sezione-impostazioni">
          <div className="riga-impostazione">
            <div className="etichetta-impostazione">
              <Bell size={18} />
              <span>Notifiche push</span>
            </div>
            <div className="switch-wrapper">
              {caricamentoNotifiche && <span className="spinner" aria-label="Caricamento" />}
              <label className={`switch ${caricamentoNotifiche ? 'switch-caricamento' : ''}`}>
                <input
                  type="checkbox"
                  checked={notificheOn}
                  onChange={toggleNotifiche}
                  disabled={caricamentoNotifiche}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Sezione Account e Azioni */}
      <div className="gruppo-sezione">
        <span className="titolo-sezione">Account</span>
        <div className="azioni-account">
          <button className="bottone-secondario bottone-icona" onClick={() => setModaleAperto('logout')}>
            <LogOut size={18} />
            <span>Esci dall'account</span>
          </button>

          <button className="bottone-link-pericolo" onClick={() => setModaleAperto('abbandona')}>
            <ShieldAlert size={16} />
            <span>Abbandona famiglia</span>
          </button>
        </div>
      </div>

      <p className="versione-app">v{APP_VERSION}</p>

      {/* Modali */}
      {modaleAperto === 'invita' && (
        <InvitaModal
          codiceInvito={profilo?.famiglie?.codice_invito}
          nomeFamiglia={profilo?.famiglie?.nome}
          onChiudi={() => setModaleAperto(null)}
        />
      )}

      {modaleAperto === 'logout' && (
        <ConfermaModal
          titolo="Uscire dall'account?"
          messaggio="Dovrai effettuare di nuovo l'accesso per tornare a usare FamilyHub."
          testoConferma="Esci"
          pericoloso
          onConferma={confermaLogout}
          onAnnulla={() => setModaleAperto(null)}
        />
      )}

      {modaleAperto === 'abbandona' && (
        <ConfermaModal
          titolo="Abbandonare la famiglia?"
          messaggio="Non vedrai più le faccende, la spesa e gli appuntamenti condivisi. Potrai rientrare in un secondo momento con un codice invito."
          testoConferma="Abbandona"
          pericoloso
          onConferma={confermaAbbandonaFamiglia}
          onAnnulla={() => setModaleAperto(null)}
        />
      )}
    </div>
  );
}