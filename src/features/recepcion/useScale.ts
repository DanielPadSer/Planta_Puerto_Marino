import { useEffect, useState } from "react";

export interface LecturaBascula { kg: number; estable: boolean }

/** Simulador de báscula: alterna fases inestables (carga) y estables alrededor de un peso objetivo. */
export function useScale(objetivoKg: number, intervaloMs = 600): LecturaBascula {
  const [lectura, setLectura] = useState<LecturaBascula>({ kg: objetivoKg, estable: true });
  useEffect(() => {
    let tick = 0;
    const id = setInterval(() => {
      tick = (tick + 1) % 16;
      const estable = tick >= 4; // 4 ticks inestables, 12 estables
      const ruido = estable ? 0 : (Math.random() - 0.5) * 3;
      setLectura({ kg: Math.round((objetivoKg + ruido) * 10) / 10, estable });
    }, intervaloMs);
    return () => clearInterval(id);
  }, [objetivoKg, intervaloMs]);
  return lectura;
}
