import type { Zona } from "@/domain/types";

// Coordenadas en % sobre la maqueta (1920×1080)
export const ZONAS: Zona[] = [
  { id: "pedidos", codigo: "0", nombre: "Pedidos y plan", color: "#8B5CF6", x: 53.4, y: 80.5 },
  { id: "recepcion", codigo: "1", nombre: "Recepción", color: "#3B82F6", x: 38.4, y: 40.6 },
  { id: "cf1", codigo: "2", nombre: "CF-1 materia prima", color: "#22D3EE", x: 49.2, y: 29.7 },
  { id: "coccion", codigo: "3A", nombre: "Cocción y enfriamiento", color: "#F97316", x: 26.1, y: 44.5, estado: { texto: "En revisión", tono: "warn" } },
  { id: "marinado", codigo: "3B", nombre: "Marinado", color: "#F43F5E", x: 18.3, y: 26.3 },
  { id: "limpieza", codigo: "L", nombre: "Limpieza y verificación", color: "#84CC16", x: 40.1, y: 60.6, estado: { texto: "Pendiente", tono: "warn" } },
  { id: "empaque", codigo: "4", nombre: "Porcionado y empaque", color: "#F5B301", x: 33.4, y: 15.6 },
  { id: "cf2", codigo: "5A", nombre: "CF-2 terminado", color: "#14B8A6", x: 49.2, y: 9.1, alerta: true, estado: { texto: "5,4 °C", tono: "danger" } },
  { id: "cf3", codigo: "5B", nombre: "CF-3 ultracongelador", color: "#6366F1", x: 42.6, y: 2.3 },
  { id: "despacho", codigo: "6", nombre: "Despacho", color: "#10B981", x: 59.6, y: 25.0 },
  { id: "sede", codigo: "7", nombre: "Recepción en sede", color: "#EC4899", x: 82.7, y: 35.2 },
];

export const RUTA_COCIDO = ["1", "2", "3A", "4", "5A", "6", "7"];
export const RUTA_MARINADO = ["1", "2", "3B", "4", "5B", "6", "7"];
