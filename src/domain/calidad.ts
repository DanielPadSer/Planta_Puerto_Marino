import { z } from "zod";
import type { Rol } from "./types";
import type { RolPanel } from "./permisos";
export const motivoSchema = z.object({
  motivo: z.string().trim().min(5, "Escribe un motivo de al menos 5 caracteres"),
  destino: z.string().optional(),
});
export type MotivoDatos = z.infer<typeof motivoSchema>;
export const DEMO_USUARIO = "ing.calidad@puertomarino.com";
export const DEMO_CLAVE = "haccp_calidad2025!";
export function validarAcceso(usuario: string, clave: string): boolean {
  return usuario.trim().toLowerCase() === DEMO_USUARIO && clave === DEMO_CLAVE;
}
export interface UsuarioDemoPanel {
  usuario: string;
  nombre: string;
  rol: RolPanel;
  etiqueta: string;
}
export const DEMO_CLAVE_PANEL = "demo1234";
export const USUARIOS_DEMO_PANEL: UsuarioDemoPanel[] = [
  {
    usuario: "ing.calidad@puertomarino.com",
    nombre: "Luisa Gómez",
    rol: "ingeniera",
    etiqueta: "Ingeniera de alimentos",
  },
  {
    usuario: "supervisor@puertomarino.com",
    nombre: "Carlos Mendoza",
    rol: "supervisor",
    etiqueta: "Supervisor",
  },
  {
    usuario: "admin@puertomarino.com",
    nombre: "Dirección Puerto Marino",
    rol: "administrador",
    etiqueta: "Administrador",
  },
];
export function buscarUsuarioDemo(usuario: string): UsuarioDemoPanel | undefined {
  const normalizado = usuario.trim().toLowerCase();
  return USUARIOS_DEMO_PANEL.find((u) => u.usuario === normalizado);
}
export function validarAccesoPanel(usuario: string, clave: string): UsuarioDemoPanel | null {
  const encontrado = buscarUsuarioDemo(usuario);
  if (!encontrado || clave !== DEMO_CLAVE_PANEL) return null;
  return encontrado;
}
export function validarDecision(
  rol: Rol,
  enLinea: boolean,
  motivo: string,
  rechazar = false,
  destino = "",
): string | null {
  if (rol !== "ingeniera") return "Solo la ingeniera de alimentos puede decidir sobre un lote.";
  if (!enLinea) return "Liberar un lote exige conexión.";
  if (!motivoSchema.safeParse({ motivo }).success)
    return "El motivo de la decisión es obligatorio.";
  if (rechazar && !destino.trim()) return "Registra el destino del lote rechazado.";
  return null;
}
export function siguienteVersion(version: number, motivo: string): number {
  if (!motivoSchema.safeParse({ motivo }).success) throw new Error("Motivo obligatorio");
  return version + 1;
}
export interface ProductoRegla {
  id: string;
  nombre: string;
  categoria: string;
  ruta: "Cocido" | "Marinado";
  alergeno: string[];
  version: number;
  temperatura: number;
  tiempo: number;
  vida: number;
  estado: string;
  recepcionMax?: number;
  hielo?: string;
  criterios?: string;
  enfriamiento?: string;
  congelacion?: number;
}
export interface LoteCalidad {
  id: string;
  producto: string;
  motivo: string;
  medicion: string;
  hora: string;
  proveedor: string;
  kg: number;
  estado: string;
  version: number;
}
export interface EventoCalidad {
  id: string;
  fecha: string;
  usuario: string;
  dispositivo: string;
  entidad: string;
  campo: string;
  original: string;
  nuevo: string;
  motivo: string;
  version: number;
}
export interface Dispositivo {
  id: string;
  nombre: string;
  tipo: string;
  estacion: string;
  modelo: string;
  estado: string;
  contacto: string;
  pendientes: number;
  revocado: boolean;
}
export interface ContenedorCalidad {
  id: string;
  nombre: string;
  tara: number;
  retornable: boolean;
  version: number;
}
