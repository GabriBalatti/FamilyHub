import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import AvvisoModal from '../components/AvvisoModal';

export default function GestisciInvito({ famiglia }) {
  const { profilo } = useAuth();
  const navigate = useNavigate();

  function chiudi() {
    navigate('/faccende', { replace: true });
  }

  if (!famiglia) {
    return (
      <AvvisoModal
        titolo="Codice invito non valido"
        messaggio="Il link che hai usato non è (più) valido."
        onChiudi={chiudi}
      />
    );
  }

  if (famiglia.id === profilo.famiglia_id) {
    return (
      <AvvisoModal
        titolo="Sei già in questa famiglia"
        messaggio={`Sei già nella famiglia ${famiglia.nome}!`}
        onChiudi={chiudi}
      />
    );
  }

  return (
    <AvvisoModal
      titolo="Fai già parte di una famiglia"
      messaggio="Per entrare in un'altra famiglia, esci prima da quella attuale dalla schermata Profilo."
      onChiudi={chiudi}
    />
  );
}