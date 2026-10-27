import { create } from "zustand";
import type { RolPanel } from "@/domain/permisos";

export interface UsuarioPanel {
  usuario: string;
  nombre: string;
  rol: RolPanel;
}

const CLAVE_STORAGE = "pm-panel-sesion";

function leer(): UsuarioPanel | null {
  try {
    const crudo = sessionStorage.getItem(CLAVE_STORAGE);
    if (!crudo) return null;
    const datos = JSON.parse(crudo) as UsuarioPanel;
    if (!datos.usuario || !datos.rol) return null;
    return datos;
  } catch {
    return null;
  }
}

function guardar(u: UsuarioPanel | null) {
  try {
    if (u) sessionStorage.setItem(CLAVE_STORAGE, JSON.stringify(u));
    else sessionStorage.removeItem(CLAVE_STORAGE);
  } catch {
    // sessionStorage no disponible (SSR o modo privado): la sesión vive solo en memoria
  }
}

interface SesionPanelState {
  usuario: UsuarioPanel | null;
  entrar: (u: UsuarioPanel) => void;
  salir: () => void;
  cambiarRol: (rol: RolPanel) => void;
}

export const useSesionPanel = create<SesionPanelState>((set, get) => ({
  usuario: typeof window === "undefined" ? null : leer(),
  entrar: (u) => {
    guardar(u);
    set({ usuario: u });
  },
  salir: () => {
    guardar(null);
    set({ usuario: null });
  },
  cambiarRol: (rol) => {
    const actual = get().usuario;
    if (!actual) return;
    const siguiente = { ...actual, rol };
    guardar(siguiente);
    set({ usuario: siguiente });
  },
}));
