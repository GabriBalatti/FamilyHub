import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Login from './pages/Login';
import SetupFamiglia from './pages/SetupFamiglia';
import Faccende from './pages/Faccende';
import Spesa from './pages/Spesa';
import Calendario from './pages/Calendario';
import Profilo from './pages/Profilo';
import NavBar from './components/NavBar';
import { APP_VERSION } from './lib/version';

function AppContenuto() {
  const { session, profilo, loading } = useAuth();

  if (loading) {
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
    return <SetupFamiglia />;
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
