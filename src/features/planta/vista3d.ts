import { create } from "zustand";
import type { ZonaId } from "@/domain/types";

/** Estado compartido de la maqueta 3D persistente (un solo lienzo para todas las vistas de planta). */
export const useVista3D = create<{ atenuadas: ZonaId[]; setAtenuadas: (a: ZonaId[]) => void }>((set) => ({
  atenuadas: [],
  setAtenuadas: (atenuadas) => set({ atenuadas }),
}));
