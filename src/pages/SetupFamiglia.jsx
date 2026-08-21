import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import IconSaluto from '../assets/icons/saluto.svg?react';
import { trovaFamigliaDaCodice } from '../lib/famiglie';
import { QrCode, Home, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ScannerQR from '../components/ScannerQR';

export default function SetupFamiglia() {
  const { session, ricaricaProfilo } = useAuth();
  const [nome, setNome] = useState('');
  const [modalita, setModalita] = useState('crea'); // crea | entra
  const [nomeFamiglia, setNomeFamiglia] = useState('');
  const [codiceInvito, setCodiceInvito] = useState('');
  const [errore, setErrore] = useState('');
  const [caricamento, setCaricamento] = useState(false);
  const [scannerAperto, setScannerAperto] = useState(false);
  const navigate = useNavigate();

  function codiceScansionato(codice) {
    setScannerAperto(false);
    navigate(`/join?code=${codice}`);
  }

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

    const famiglia = await trovaFamigliaDaCodice(codiceInvito);

    if (!famiglia) {
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
      <div className="setup-hero">
        <IconSaluto width={56} height={56} />
        <h1>Benvenuto!</h1>
      </div>
      <p>Prima di iniziare, configura il tuo profilo entrando in una famiglia o creandone una nuova.</p>
      <div className="tabs">
        <button
          className={modalita === 'crea' ? 'tab active' : 'tab'}
          onClick={() => setModalita('crea')}
        >
          <Home size={16} />
          <span>Crea famiglia</span>
        </button>
        <button
          className={modalita === 'entra' ? 'tab active' : 'tab'}
          onClick={() => setModalita('entra')}
        >
          <LogIn size={16} />
          <span>Entra in famiglia</span>
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
          /* SEZIONE CREA FAMIGLIA */
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
          /* SEZIONE ENTRA IN FAMIGLIA */
          <div className="sezione-entra" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
            <div className="divisore-oppure">
              <span>oppure</span>
            </div>

            <button type="button" className="bottone-secondario bottone-icona" onClick={() => setScannerAperto(true)}>
              <QrCode size={18} />
              <span>Scansiona QR</span>
            </button>
          </div>
        )}

        {errore && <p className="errore">{errore}</p>}
        <button type="submit" className="bottone-icona" disabled={caricamento}>
          {modalita === 'crea' ? <Home size={18} /> : <LogIn size={18} />}
          <span>{caricamento ? 'Attendere...' : modalita === 'crea' ? 'Crea famiglia' : 'Entra'}</span>
        </button>
      </form>

      {scannerAperto && (
        <ScannerQR onCodiceTrovato={codiceScansionato} onChiudi={() => setScannerAperto(false)} />
      )}
    </div>
  );
}