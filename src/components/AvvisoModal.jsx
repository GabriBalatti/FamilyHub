import { useBloccaScroll } from '../lib/useBloccaScroll';
import ModalPortal from './ModalPortal';

export default function AvvisoModal({ titolo, messaggio, onChiudi }) {
  useBloccaScroll();

  return (
    <ModalPortal>
    <div className="modal-overlay" onClick={onChiudi}>
      <div className="modal-contenuto modal-avviso" onClick={(e) => e.stopPropagation()}>
        <h3>{titolo}</h3>
        <p>{messaggio}</p>
        <div className="modal-azioni">
          <button onClick={onChiudi}>Ho capito</button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
