import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { LogOut } from 'lucide-react';
import { APP_VERSION } from '../lib/version';
import { useState, useEffect } from 'react';
import { attivaNotifiche, disattivaNotifiche, notificheAttive } from '../lib/pushNotifications';

export default function Profilo() {
  const { profilo } = useAuth();
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
    await supabase.auth.signOut();
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
      <button className="bottone-secondario" onClick={toggleNotifiche} disabled={caricamentoNotifiche}>
        {notificheOn ? 'Disattiva notifiche' : 'Attiva notifiche'}
      </button>
      <button className="bottone-secondario" onClick={logout}>
        <LogOut size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
        Esci
      </button>
      <p className="versione-app">v{APP_VERSION}</p>
    </div>
  );
}