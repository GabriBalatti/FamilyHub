import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function ScannerQR({ onCodiceTrovato, onChiudi }) {
  const [errore, setErrore] = useState('');

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
    <div className="modal-overlay" onClick={onChiudi}>
      <div className="modal-contenuto" onClick={(e) => e.stopPropagation()}>
        <h3>Scansiona il QR</h3>
        <Scanner
          onScan={gestisciScansione}
          onError={() => setErrore('Impossibile accedere alla fotocamera. Controlla i permessi del browser.')}
          constraints={{ facingMode: 'environment' }}
          formats={['qr_code']}
        />
        {errore && <p className="errore">{errore}</p>}
        <div className="modal-azioni">
          <button onClick={onChiudi}>Chiudi</button>
        </div>
      </div>
    </div>
  );
}