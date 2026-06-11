import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profilo, setProfilo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) caricaProfilo(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) caricaProfilo(session.user.id);
      else {
        setProfilo(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function caricaProfilo(userId) {
    const { data } = await supabase
      .from('profili')
      .select('*, famiglie(*)')
      .eq('id', userId)
      .single();
    setProfilo(data);
    setLoading(false);
  }

  async function ricaricaProfilo() {
    if (session) await caricaProfilo(session.user.id);
  }

  const value = { session, profilo, loading, ricaricaProfilo };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
