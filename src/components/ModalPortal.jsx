import { createPortal } from 'react-dom';

// Rende i modal figli diretti di body, evitando che transform/animazioni delle
// schermate li limitino al contenitore della pagina su mobile.
export default function ModalPortal({ children }) {
  if (typeof document === 'undefined') return children;
  return createPortal(children, document.body);
}
