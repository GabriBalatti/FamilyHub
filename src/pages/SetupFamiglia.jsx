import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export default function SetupFamiglia() {
  const { session, ricaricaProfilo } = useAuth();
  const [nome, setNome] = useState('');
  const [modalita, setModalita] = useState('crea'); // crea | entra
  const [nomeFamiglia, setNomeFamiglia] = useState('');
  const [codiceInvito, setCodiceInvito] = useState('');
  const [errore, setErrore] = useState('');
  const [caricamento, setCaricamento] = useState(false);

  async function creaFamiglia(e) {
    e.preventDefault();
    setErrore('');
    setCaricamento(true);

    const { data: famiglia, error: erroreFamiglia } = await supabase
      .from('famiglie')
      .insert({ nome: nomeFamiglia })
      .select()
      .single();

    if (erroreFamiglia) {
      setErrore(erroreFamiglia.message);
      setCaricamento(false);
      return;
    }

    await creaProfilo(famiglia.id);
  }

  async function entraInFamiglia(e) {
    e.preventDefault();
    setErrore('');
    setCaricamento(true);

    const { data: famiglia, error: erroreRicerca } = await supabase
      .from('famiglie')
      .select('id')
      .eq('codice_invito', codiceInvito.trim())
      .single();

    if (erroreRicerca || !famiglia) {
      setErrore('Codice invito non valido');
      setCaricamento(false);
      return;
    }

    await creaProfilo(famiglia.id);
  }

  async function creaProfilo(famigliaId) {
    const { error } = await supabase.from('profili').insert({
      id: session.user.id,
      nome,
      famiglia_id: famigliaId
    });

    if (error) {
      setErrore(error.message);
      setCaricamento(false);
      return;
    }

    await ricaricaProfilo();
  }

  return (
    <div className="auth-container">
      <h1>Benvenuto! 👋</h1>
      <p>Prima di iniziare, configura il tuo profilo familiare.</p>

      <div className="tabs">
        <button
          className={modalita === 'crea' ? 'tab active' : 'tab'}
          onClick={() => setModalita('crea')}
        >
          Crea famiglia
        </button>
        <button
          className={modalita === 'entra' ? 'tab active' : 'tab'}
          onClick={() => setModalita('entra')}
        >
          Entra in famiglia
        </button>
      </div>

      <form onSubmit={modalita === 'crea' ? creaFamiglia : entraInFamiglia} className="auth-form">
        <input
          type="text"
          placeholder="Il tuo nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        {modalita === 'crea' ? (
          <input
            type="text"
            placeholder="Nome famiglia (es. Famiglia Rossi)"
            value={nomeFamiglia}
            onChange={(e) => setNomeFamiglia(e.target.value)}
            required
          />
        ) : (
          <input
            type="text"
            placeholder="Codice invito"
            value={codiceInvito}
            onChange={(e) => setCodiceInvito(e.target.value)}
            required
          />
        )}

        {errore && <p className="errore">{errore}</p>}
        <button type="submit" disabled={caricamento}>
          {caricamento ? 'Attendere...' : modalita === 'crea' ? 'Crea famiglia' : 'Entra'}
        </button>
      </form>
    </div>
  );
}
