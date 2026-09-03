import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';

const SOGLIA_RICARICA = 72;

export default function PullToRefresh() {
  const [distanza, setDistanza] = useState(0);
  const [ricaricamento, setRicaricamento] = useState(false);
  const inizioY = useRef(null);
  const distanzaCorrente = useRef(0);

  useEffect(() => {
    function inizia(evento) {
      if (window.scrollY > 0 || document.querySelector('.modal-overlay')) return;
      inizioY.current = evento.touches[0].clientY;
    }

    function muovi(evento) {
      if (inizioY.current === null || ricaricamento) return;
      const trascinamento = evento.touches[0].clientY - inizioY.current;
      if (trascinamento <= 0 || window.scrollY > 0) return;

      evento.preventDefault();
      distanzaCorrente.current = Math.min(trascinamento * 0.45, 96);
      setDistanza(distanzaCorrente.current);
    }

    function termina() {
      if (inizioY.current === null) return;
      inizioY.current = null;

      if (distanzaCorrente.current >= SOGLIA_RICARICA) {
        setRicaricamento(true);
        setDistanza(56);
        window.setTimeout(() => window.location.reload(), 320);
      } else {
        setDistanza(0);
      }
      distanzaCorrente.current = 0;
    }

    window.addEventListener('touchstart', inizia, { passive: true });
    window.addEventListener('touchmove', muovi, { passive: false });
    window.addEventListener('touchend', termina, { passive: true });
    window.addEventListener('touchcancel', termina, { passive: true });

    return () => {
      window.removeEventListener('touchstart', inizia);
      window.removeEventListener('touchmove', muovi);
      window.removeEventListener('touchend', termina);
      window.removeEventListener('touchcancel', termina);
    };
  }, [ricaricamento]);

  const pronto = distanza >= SOGLIA_RICARICA;

  return (
    <div
      className={`pull-refresh ${pronto || ricaricamento ? 'pronto' : ''}`}
      style={{ transform: `translate(-50%, ${distanza - 72}px)` }}
      aria-live="polite"
    >
      <RefreshCw size={20} className={ricaricamento ? 'in-rotazione' : ''} />
      <span>{ricaricamento ? 'Aggiornamento...' : pronto ? 'Rilascia per aggiornare' : 'Trascina per aggiornare'}</span>
    </div>
  );
}
