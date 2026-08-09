import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { trovaFamigliaDaCodice } from './lib/famiglie';
import Login from './pages/Login';
import SetupFamiglia from './pages/SetupFamiglia';
import UnisciFamigliaInvito from './pages/UnisciFamigliaInvito';
import GestisciInvito from './pages/GestisciInvito';
import Faccende from './pages/Faccende';
import Spesa from './pages/Spesa';
import Calendario from './pages/Calendario';
import Profilo from './pages/Profilo';
import NavBar from './components/NavBar';
import AvvisoModal from './components/AvvisoModal';
import { APP_VERSION } from './lib/version';

function AppContenuto() {
  const { session, profilo, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const codiceInvito = searchParams.get('code');
  const [famigliaInvito, setFamigliaInvito] = useState(null);
  const [caricamentoInvito, setCaricamentoInvito] = useState(!!codiceInvito);
  const [avvisoCodiceChiuso, setAvvisoCodiceChiuso] = useState(false);
  const [ignoraInvito, setIgnoraInvito] = useState(false);

  useEffect(() => {
    if (!codiceInvito) {
      setFamigliaInvito(null);
      setCaricamentoInvito(false);
      return;
    }
    setCaricamentoInvito(true);
    trovaFamigliaDaCodice(codiceInvito).then((famiglia) => {
      setFamigliaInvito(famiglia);
      setCaricamentoInvito(false);
    });
  }, [codiceInvito]);

  if (loading || caricamentoInvito) {
    return (
      <div className="caricamento-pagina">
        <p>Caricamento...
          <span className="versione-app">v{APP_VERSION}</span>
        </p>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  if (!profilo || !profilo.famiglia_id) {
    if (famigliaInvito && !ignoraInvito) {
      return <UnisciFamigliaInvito famiglia={famigliaInvito} onAnnulla={() => setIgnoraInvito(true)} />;
    }
    return (
      <>
        <SetupFamiglia />
        {codiceInvito && !famigliaInvito && !avvisoCodiceChiuso && (
          <AvvisoModal
            titolo="Codice invito non valido"
            messaggio="Il link che hai usato non è (più) valido. Puoi comunque creare una famiglia o inserire un codice manualmente qui sotto."
            onChiudi={() => setAvvisoCodiceChiuso(true)}
          />
        )}
      </>
    );
  }

  return (
    <div className="app-layout">
      <main className="contenuto-principale">
        <Routes>
          <Route path="/" element={<Navigate to="/faccende" replace />} />
          <Route path="/faccende" element={<Faccende />} />
          <Route path="/spesa" element={<Spesa />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/profilo" element={<Profilo />} />
          <Route path="/join" element={<GestisciInvito famiglia={famigliaInvito} />} />
          <Route path="*" element={<Navigate to="/faccende" replace />} />
        </Routes>
      </main>
      <NavBar />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContenuto />
    </AuthProvider>
  );
}