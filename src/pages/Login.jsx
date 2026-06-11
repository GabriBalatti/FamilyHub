import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalita, setModalita] = useState('login'); // login | registrazione
  const [errore, setErrore] = useState('');
  const [caricamento, setCaricamento] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrore('');
    setCaricamento(true);

    if (modalita === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setErrore(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setErrore(error.message);
      else setErrore('Registrazione ok! Controlla la mail per confermare, poi accedi.');
    }
    setCaricamento(false);
  }

  return (
    <div className="auth-container">
      <h1>👨‍👩‍👧‍👦 Famiglia App</h1>
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
          minLength={6}
        />
        {errore && <p className="errore">{errore}</p>}
        <button type="submit" disabled={caricamento}>
          {caricamento ? 'Attendere...' : modalita === 'login' ? 'Accedi' : 'Registrati'}
        </button>
      </form>
      <button
        className="link-button"
        onClick={() => setModalita(modalita === 'login' ? 'registrazione' : 'login')}
      >
        {modalita === 'login' ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
      </button>
    </div>
  );
}
