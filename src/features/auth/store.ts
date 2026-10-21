import { create } from "zustand";
import type { EstacionId, Operario } from "@/domain/types";

interface SesionState {
  operario: Operario | null;
  estacion: EstacionId | null;
  dispositivo: string | null;
  inicio: string | null;
  entrar: (o: Operario, e: EstacionId, dispositivo: string) => void;
  salir: () => void;
}

export const useSesion = create<SesionState>((set) => ({
  operario: null,
  estacion: null,
  dispositivo: null,
  inicio: null,
  entrar: (operario, estacion, dispositivo) =>
    set({ operario, estacion, dispositivo, inicio: new Date().toISOString() }),
  salir: () => set({ operario: null, estacion: null, dispositivo: null, inicio: null }),
}));
