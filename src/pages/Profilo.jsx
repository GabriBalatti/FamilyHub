import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { LogOut } from 'lucide-react';
import { APP_VERSION } from '../lib/version';
import { useState, useEffect } from 'react';
import { attivaNotifiche, disattivaNotifiche, notificheAttive } from '../lib/pushNotifications';

export default function Profilo() {
  const { profilo, ricaricaProfilo } = useAuth();
  const [notificheOn, setNotificheOn] = useState(false);
  const [caricamentoNotifiche, setCaricamentoNotifiche] = useState(false);

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

  async function logout() {
    if (!window.confirm('Sei sicuro di voler uscire?')) return;
    await supabase.auth.signOut();
  }

  async function abbandonaFamiglia() {
    const conferma = window.confirm(
      'Sei sicuro di voler abbandonare la famiglia? Non vedrai più le faccende, la spesa e gli appuntamenti condivisi.'
    );
    if (!conferma) return;

    const { error } = await supabase
      .from('profili')
      .update({ famiglia_id: null })
      .eq('id', profilo.id);

    if (error) {
      alert('Errore: ' + error.message);
      return;
    }

    await ricaricaProfilo();
  }

  return (
    <div className="pagina">
      <h2>Il tuo profilo</h2>
      <div className="card-profilo">
        <p><strong>Nome:</strong> {profilo.nome}</p>
        <p><strong>Famiglia:</strong> {profilo.famiglie?.nome}</p>
        <p>
          <strong>Codice invito:</strong>{' '}
          <code className="codice-invito">{profilo.famiglie?.codice_invito}</code>
        </p>
        <p className="hint">Condividi questo codice con i familiari per farli entrare nel gruppo.</p>
      </div>
      <div className="sezione-impostazioni">
        <div className="riga-impostazione">
          <span>Notifiche push</span>
          <label className="switch">
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

      <button className="bottone-pericolo" onClick={abbandonaFamiglia}>
        Abbandona famiglia
      </button>

      <button className="bottone-secondario" onClick={logout}>
        <LogOut size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
        Esci
      </button>
      <p className="versione-app">v{APP_VERSION}</p>
    </div>
  );
}