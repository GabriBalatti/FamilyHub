import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useBloccaScroll } from '../lib/useBloccaScroll';
import ModalPortal from './ModalPortal';

export default function ScannerQR({ onCodiceTrovato, onChiudi }) {
  const [errore, setErrore] = useState('');
  useBloccaScroll();

  function gestisciScansione(codiciRilevati) {
    const testo = codiciRilevati?.[0]?.rawValue;
    if (!testo) return;

    try {
      const url = new URL(testo);
      const codice = url.searchParams.get('code');
      if (codice) {
        onCodiceTrovato(codice);
      } else {
        setErrore('Questo QR non è un invito FamilyHub.');
      }
    } catch {
      setErrore('Questo QR non è un invito FamilyHub.');
    }
  }

  return (
    <ModalPortal>
    <div className="modal-overlay" onClick={onChiudi}>
      <div className="modal-contenuto modal-scanner" onClick={(e) => e.stopPropagation()}>
        <h3>Scansiona il QR</h3>
        <div className="scanner-contenitore">
          <Scanner
            onScan={gestisciScansione}
            onError={() => setErrore('Impossibile accedere alla fotocamera. Controlla i permessi del browser.')}
            constraints={{ facingMode: 'environment' }}
            formats={['qr_code']}
          />
        </div>
        {errore && <p className="errore">{errore}</p>}
        <div className="modal-azioni">
          <button onClick={onChiudi}>Chiudi</button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
