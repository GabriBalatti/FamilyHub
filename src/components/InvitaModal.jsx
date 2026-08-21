import { useState } from 'react';
import { X, Copy, Share2, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function InvitaModal({ codiceInvito, nomeFamiglia, onChiudi }) {
  const [copiato, setCopiato] = useState(false);

  // Link dinamico d'invito
  const linkInvito = `${window.location.origin}/join?code=${codiceInvito}`;

  // Verifica se la Web Share API è realmente supportata ed eseguibile
  const supportoShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  // Copia link con fallback robusto per Mobile, iOS e contesti HTTP
  async function copiaLink() {
    let riuscito = false;

    // Tentativo 1: Clipboard API moderna (funziona su HTTPS)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(linkInvito);
        riuscito = true;
      } catch (e) {
        // Se fallisce per permessi o WebView, passa al fallback sotto
      }
    }

    // Tentativo 2: Fallback con elemento input (compatibile con qualsiasi browser/iOS)
    if (!riuscito) {
      try {
        const input = document.createElement('input');
        input.value = linkInvito;
        input.style.position = 'fixed';
        input.style.top = '0';
        input.style.left = '0';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.focus();
        input.select();
        input.setSelectionRange(0, 99999); // EspecifiCo per dispositivi iOS
        riuscito = document.execCommand('copy');
        document.body.removeChild(input);
      } catch (e) {
        riuscito = false;
      }
    }

    if (riuscito) {
      setCopiato(true);
      setTimeout(() => setCopiato(false), 2000);
    } else {
      alert('Impossibile copiare il link negli appunti.');
    }
  }

  // Condivisione nativa mobile
  async function condividiLink() {
    if (supportoShare) {
      try {
        await navigator.share({
          title: `Entra nella famiglia ${nomeFamiglia || ''}`,
          text: `Unisciti alla nostra famiglia su FamilyHub usando questo link o il codice: ${codiceInvito}`,
          url: linkInvito,
        });
      } catch (err) {
        // L'utente ha annullato la condivisione
      }
    } else {
      copiaLink();
    }
  }

  return (
    <div className="modal-overlay" onClick={onChiudi}>
      <div className="modal-contenuto modal-invito" onClick={(e) => e.stopPropagation()}>
        
        {/* Intestazione con Titolo e tasto X */}
        <div className="modal-header">
          <h3>Invita in famiglia</h3>
          <button type="button" className="bottone-chiudi" onClick={onChiudi} aria-label="Chiudi">
            <X size={20} />
          </button>
        </div>

        {/* Codice d'invito manuale */}
        <div className="sezione-codice">
          <p className="hint">Codice di invito manuale:</p>
          <code className="codice-invito">{codiceInvito}</code>
        </div>

        {/* QR Code */}
        <div className="qr-container">
          <QRCodeSVG value={linkInvito} size={170} level="H" includeMargin={true} />
          <p className="hint">Fai inquadrare questo QR Code con la fotocamera</p>
        </div>

        {/* Pulsanti di azione */}
        <div className="modal-azioni-griglia">
          <button type="button" className="bottone-secondario" onClick={copiaLink}>
            {copiato ? <Check size={16} /> : <Copy size={16} />}
            <span>{copiato ? 'Copiato!' : 'Copia link'}</span>
          </button>

          {supportoShare && (
            <button type="button" className="bottone-secondario" onClick={condividiLink}>
              <Share2 size={16} />
              <span>Condividi</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}