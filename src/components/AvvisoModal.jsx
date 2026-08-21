export default function AvvisoModal({ titolo, messaggio, onChiudi }) {
  return (
    <div className="modal-overlay" onClick={onChiudi}>
      <div className="modal-contenuto" onClick={(e) => e.stopPropagation()}>
        <h3>{titolo}</h3>
        <p>{messaggio}</p>
        <div className="modal-azioni">
          <button onClick={onChiudi}>Ho capito</button>
        </div>
      </div>
    </div>
  );
}