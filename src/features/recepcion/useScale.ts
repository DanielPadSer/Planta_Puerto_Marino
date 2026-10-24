import { useEffect, useState } from "react";

export interface LecturaBascula { kg: number; estable: boolean; status?: "connected" | "disconnected" | "unstable" }

/** Simulador de báscula: alterna fases inestables (carga) y estables alrededor de un peso objetivo. */
export function useScale(objetivoKg: number, intervaloMs = 600): LecturaBascula {
  const [lectura, setLectura] = useState<LecturaBascula>({ kg: objetivoKg, estable: true });
  useEffect(() => {
    let tick = 0;
    // CF-1 reutiliza este simulador a 4 Hz. Reemplazar por adaptador Web Serial:
    // ST,GS,+0020.80kg (estable) / US,GS,+0020.80kg (inestable).
    if (intervaloMs === 250) setLectura({ kg: 0, estable: false, status: "unstable" });
    const id = setInterval(() => {
      if (intervaloMs === 250) {
        tick++;
        const estable = tick >= 10; // carga inicial y 1,2 s sin variación antes de estabilizar
        const kg = tick < 5 ? objetivoKg * tick / 5 + (Math.random() - .5) * .2 : objetivoKg;
        setLectura({ kg: Math.round(kg * 10) / 10, estable, status: estable ? "connected" : "unstable" });
        if (estable) clearInterval(id);
        return;
      }
      tick = (tick + 1) % 16;
      const estable = tick >= 4; // 4 ticks inestables, 12 estables
      const ruido = estable ? 0 : (Math.random() - 0.5) * 3;
      setLectura({ kg: Math.round((objetivoKg + ruido) * 10) / 10, estable });
    }, intervaloMs);
    return () => clearInterval(id);
  }, [objetivoKg, intervaloMs]);
  return lectura;
}
