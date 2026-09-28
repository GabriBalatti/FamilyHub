import { useLayoutEffect } from 'react';

// Impedisce lo scroll della pagina dietro a un modal, anche su Safari iOS.
export function useBloccaScroll(attivo = true) {
  useLayoutEffect(() => {
    if (!attivo) return undefined;

    const stilePrecedente = {
      overflowBody: document.body.style.overflow,
      overflowHtml: document.documentElement.style.overflow,
      overscrollBehavior: document.body.style.overscrollBehavior,
      paddingRight: document.body.style.paddingRight
    };
    const larghezzaBarra = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    if (larghezzaBarra > 0) {
      const paddingAttuale = Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
      document.body.style.paddingRight = `${paddingAttuale + larghezzaBarra}px`;
    }

    return () => {
      document.body.style.overflow = stilePrecedente.overflowBody;
      document.documentElement.style.overflow = stilePrecedente.overflowHtml;
      document.body.style.overscrollBehavior = stilePrecedente.overscrollBehavior;
      document.body.style.paddingRight = stilePrecedente.paddingRight;
    };
  }, [attivo]);
}
