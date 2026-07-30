import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import IconSaluto from '../assets/icons/saluto.svg?react';

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
      .eq('codice_invito', codiceInvito.trim().toLowerCase())
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
      <h1>Benvenuto! <IconSaluto width={40} height={40} /></h1>
      <p>Prima di iniziare, configura il tuo profilo entrando in una famiglia o creandone una nuova.</p>

      <div className="tabs">
        <button
          className={modalita === 'crea' ? 'tab active' : 'tab'}
          onClick={() => setModalita('crea')}
        >
          Crea una famiglia
        </button>
        <button
          className={modalita === 'entra' ? 'tab active' : 'tab'}
          onClick={() => setModalita('entra')}
        >
          Entra in famiglia
        </button>
      </div>

      <form onSubmit={modalita === 'crea' ? creaFamiglia : entraInFamiglia} className="auth-form">
        <label className="campo-label">
          Nome
          <input
            type="text"
            placeholder="Jack..."
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </label>

        {modalita === 'crea' ? (
          <label className="campo-label">
          Nome famiglia
          <input
            type="text"
            placeholder="Famiglia Rossi..."
            value={nomeFamiglia}
            onChange={(e) => setNomeFamiglia(e.target.value)}
            required
          />
          </label>
        ) : (
          <label className="campo-label">
          Codice invito
          <input
            type="text"
            placeholder="xx000xx0..."
            value={codiceInvito}
            onChange={(e) => setCodiceInvito(e.target.value.toLowerCase())}
            style={{ textTransform: 'lowercase' }}
            required
          />
          </label>
        )}

        {errore && <p className="errore">{errore}</p>}
        <button type="submit" disabled={caricamento}>
          {caricamento ? 'Attendere...' : modalita === 'crea' ? 'Crea famiglia' : 'Entra'}
        </button>
      </form>
    </div>
  );
}
