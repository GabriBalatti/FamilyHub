import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { LogOut } from 'lucide-react';

export default function Profilo() {
  const { profilo } = useAuth();

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
      <button className="bottone-secondario" onClick={logout}>
        <LogOut size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
        Esci
      </button>
    </div>
  );
}