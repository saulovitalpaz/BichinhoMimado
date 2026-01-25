// Exemplo de lógica para o Antigravity seguir
import { useEffect } from 'react';

export function useIdleTimer(timeoutInMinutes: number, onIdle: () => void) {
  useEffect(() => {
    const timeout = timeoutInMinutes * 60 * 1000;
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(onIdle, timeout);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);

    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      clearTimeout(timer);
    };
  }, [timeoutInMinutes, onIdle]);
}