import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { LogOut, UserPlus } from 'lucide-react';
import { APP_VERSION } from '../lib/version';
import { useState, useEffect } from 'react';
import { attivaNotifiche, disattivaNotifiche, notificheAttive } from '../lib/pushNotifications';
import ConfermaModal from '../components/ConfermaModal';
import InvitaModal from '../components/InvitaModal';

export default function Profilo() {
  const { profilo, ricaricaProfilo } = useAuth();
  const [notificheOn, setNotificheOn] = useState(false);
  const [caricamentoNotifiche, setCaricamentoNotifiche] = useState(false);
  const [modaleAperto, setModaleAperto] = useState(null); // 'logout' | 'abbandona' | 'invita' | null

  useEffect(() => {
    notificheAttive().then(setNotificheOn);
  }, []);

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

  return (
    <div className="pagina">
      <h2>Il tuo profilo</h2>
      <div className="card-profilo">
        <p><strong>Nome:</strong> {profilo.nome}</p>
        <p><strong>Famiglia:</strong> {profilo.famiglie?.nome}</p>
        
        {/* Pulsante unico per aprire il Modal d'invito */}
        <button 
          className="bottone-secondario" 
          onClick={() => setModaleAperto('invita')}
          style={{ marginTop: '12px' }}
        >
          <UserPlus size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
          Invita un nuovo membro
        </button>
      </div>

      <div className="sezione-impostazioni">
        <div className="riga-impostazione">
          <span>Notifiche push</span>
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

      <button className="bottone-pericolo" onClick={() => setModaleAperto('abbandona')}>
        Abbandona famiglia
      </button>

      <button className="bottone-secondario" onClick={() => setModaleAperto('logout')}>
        <LogOut size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
        Esci
      </button>
      <p className="versione-app">v{APP_VERSION}</p>

      {/* Modal Invita */}
      {modaleAperto === 'invita' && (
        <InvitaModal
          codiceInvito={profilo.famiglie?.codice_invito}
          nomeFamiglia={profilo.famiglie?.nome}
          onChiudi={() => setModaleAperto(null)}
        />
      )}

      {/* Modal Logout */}
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

      {/* Modal Abbandona */}
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