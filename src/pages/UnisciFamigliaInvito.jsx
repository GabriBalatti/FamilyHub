import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { PartyPopper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UnisciFamigliaInvito({ famiglia, onAnnulla }) {
  const { session, ricaricaProfilo } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [errore, setErrore] = useState('');
  const [caricamento, setCaricamento] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrore('');
    setCaricamento(true);

    const { error } = await supabase.from('profili').insert({
      id: session.user.id,
      nome,
      famiglia_id: famiglia.id
    });

    if (error) {
      setErrore(error.message);
      setCaricamento(false);
      return;
    }

    navigate('/faccende', { replace: true });
    await ricaricaProfilo();
  }

  return (
    <div className="auth-container">
      <h1>Sei stato invitato! <PartyPopper size={40} /></h1>
      <p>Sei stato invitato a unirti alla famiglia <strong>{famiglia.nome}</strong>. Inserisci il tuo nome per entrare!</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          placeholder="Il tuo nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        {errore && <p className="errore">{errore}</p>}
        <button type="submit" disabled={caricamento}>
          {caricamento ? 'Attendere...' : 'Entra nella famiglia'}
        </button>
      </form>
      <button className="link-button" onClick={onAnnulla}>
        Preferisci creare una famiglia o usare un altro codice? Torna al setup
      </button>
    </div>
  );
}
