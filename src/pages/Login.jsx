import { useState } from 'react';
import { supabase } from '../lib/supabase';
import IconLogo from '../assets/icons/famiglia.svg?react';

function traduciErrore(message) {
  const errori = {
    'Invalid login credentials': 'Email o password errati',
    'Email not confirmed': 'Email non ancora confermata. Controlla la tua casella di posta',
    'User already registered': 'Esiste già un account con questa email',
    'Password should be at least 6 characters': 'La password deve essere di almeno 6 caratteri',
    'Unable to validate email address: invalid format': 'Formato email non valido',
    'Email rate limit exceeded': 'Troppi tentativi. Riprova tra qualche minuto',
    'User not found': 'Nessun account trovato con questa email',
  };
  return errori[message] || `Errore: ${message}`;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confermaPassword, setConfermaPassword] = useState('');
  const [modalita, setModalita] = useState('login'); // login | registrazione
  const [errore, setErrore] = useState('');
  const [caricamento, setCaricamento] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrore('');

    if (modalita === 'registrazione' && password !== confermaPassword) {
      setErrore('Le password non coincidono');
      return;
    }

    setCaricamento(true);

    if (modalita === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setErrore(traduciErrore(error.message));
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setErrore(traduciErrore(error.message));
      else setErrore('Registrazione completata! Controlla la mail per confermare, poi accedi.');
    }
    setCaricamento(false);
  }

return (
    <div className={`auth-container ${modalita === 'registrazione' ? 'auth-registrazione' : 'auth-login'}`}>
      <IconLogo width={64} height={64} />
      <h1>FamilyHub</h1>
      <p className="auth-sottotitolo">
        {modalita === 'login' ? 'Bentornato! Accedi al tuo profilo' : 'Crea il tuo account e unisciti alla famiglia'}
      </p>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
           <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        {modalita === 'registrazione' && (
          <input
            type="password"
            placeholder="Conferma password"
            value={confermaPassword}
            onChange={(e) => setConfermaPassword(e.target.value)}
            required
            minLength={8}
          />
        )}
        {errore && <p className="errore">{errore}</p>}
        <button type="submit" disabled={caricamento}>
          {caricamento ? 'Attendere...' : modalita === 'login' ? 'Accedi' : 'Registrati'}
        </button>
      </form>
      <button
        className="link-button"
        onClick={() => {
          setModalita(modalita === 'login' ? 'registrazione' : 'login');
          setConfermaPassword('');
          setErrore('');
        }}
      >
        {modalita === 'login' ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
      </button>
    </div>
  );
}