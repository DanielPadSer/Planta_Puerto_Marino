import { SEGURIDAD } from "./seguridad";
import { RECEPCION, INVENTARIO, PRODUCCION, EQUIPOS, DESPACHO, CANASTILLAS } from "./operacion";
import type { DefTabla, FilaDe, ModuloId, Clase } from "./tipos";

export * from "./tipos";

export const ESQUEMA = {
  ...SEGURIDAD,
  ...RECEPCION,
  ...INVENTARIO,
  ...PRODUCCION,
  ...EQUIPOS,
  ...DESPACHO,
  ...CANASTILLAS,
};
export type Esquema = typeof ESQUEMA;
export type NombreTabla = keyof Esquema;
export type Fila<K extends NombreTabla> = FilaDe<Esquema[K]>;
export type Datos = { [K in NombreTabla]: Fila<K>[] };

export const NOMBRES = Object.keys(ESQUEMA) as NombreTabla[];
export function definicion(n: NombreTabla): DefTabla {
  return ESQUEMA[n];
}
export function esTabla(n: string): n is NombreTabla {
  return n in ESQUEMA;
}

export const MODULOS: { id: ModuloId; nombre: string; app: string }[] = [
  { id: "seguridad", nombre: "Seguridad y catálogos", app: "core · catalogos" },
  { id: "recepcion", nombre: "Recepción y báscula", app: "recepcion" },
  { id: "inventario", nombre: "Inventario y trazabilidad", app: "inventario" },
  { id: "produccion", nombre: "Producción y calidad", app: "produccion · calidad" },
  { id: "equipos", nombre: "Equipos y limpieza", app: "equipos" },
  { id: "despacho", nombre: "Pedidos, despacho, etiquetas y sincronización", app: "despacho · etiquetas · sync" },
  { id: "canastillas", nombre: "Canastillas y temperatura", app: "canastillas · monitoreo" },
];
export const CLASES: Record<Clase, string> = {
  K: "Catálogo",
  C: "Captura",
  S: "Sistema",
  R: "Registro documental",
  V: "Vista",
};

export interface Relacion {
  desde: NombreTabla;
  campo: string;
  hacia: NombreTabla;
  nulo: boolean;
  comun: boolean;
}
export const RELACIONES: Relacion[] = NOMBRES.flatMap((desde) =>
  Object.entries(definicion(desde).campos).flatMap(([campo, c]) =>
    c.ref && esTabla(c.ref)
      ? [{ desde, campo, hacia: c.ref, nulo: c.nulo, comun: Boolean(c.comun) }]
      : [],
  ),
);
export const tablasDe = (m: ModuloId) => NOMBRES.filter((n) => definicion(n).modulo === m);
