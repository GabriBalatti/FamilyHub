export default function ConfermaModal({
  titolo,
  messaggio,
  testoConferma = 'Conferma',
  testoAnnulla = 'Annulla',
  pericoloso = false,
  onConferma,
  onAnnulla
}) {
  return (
    <div className="modal-overlay" onClick={onAnnulla}>
      <div className="modal-contenuto modal-conferma" onClick={(e) => e.stopPropagation()}>
        <h3>{titolo}</h3>
        <p>{messaggio}</p>
        <div className="modal-azioni">
          <button className="bottone-secondario" onClick={onAnnulla}>
            {testoAnnulla}
          </button>
          <button
            className={pericoloso ? 'bottone-pericolo-pieno' : ''}
            onClick={onConferma}
          >
            {testoConferma}
          </button>
        </div>
      </div>
    </div>
  );
}
