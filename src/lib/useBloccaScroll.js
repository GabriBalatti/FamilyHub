import { useEffect } from 'react';

// Impedisce lo scroll della pagina dietro a un modal, anche su Safari iOS.
export function useBloccaScroll(attivo = true) {
  useEffect(() => {
    if (!attivo) return undefined;

    const posizioneScroll = window.scrollY;
    const stilePrecedente = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width
    };

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${posizioneScroll}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = stilePrecedente.overflow;
      document.body.style.position = stilePrecedente.position;
      document.body.style.top = stilePrecedente.top;
      document.body.style.width = stilePrecedente.width;
      window.scrollTo(0, posizioneScroll);
    };
  }, [attivo]);
}
