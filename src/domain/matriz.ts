import { nivelExigido, type Categoria } from "./reglas";
export const CATEGORIAS_SANITARIAS: { id: Categoria; nombre: string; alergeno: boolean }[] = [
  { id: "vegetal", nombre: "Vegetal", alergeno: false },
  { id: "ave", nombre: "Pollo y aves", alergeno: false },
  { id: "res", nombre: "Res y cerdo", alergeno: false },
  { id: "pescado", nombre: "Pescado", alergeno: false },
  { id: "crustaceos", nombre: "Crustáceos y moluscos", alergeno: true },
];
export type NivelMatriz = "N0" | "N1" | "N2" | "N3";
export interface CeldaMatriz { desde: Categoria; hacia: Categoria; nivel: NivelMatriz; excepcion: boolean }
export interface VersionMatriz { version: number; celdas: CeldaMatriz[] }
export const MATRIZ_INICIAL: VersionMatriz = { version: 2, celdas: CATEGORIAS_SANITARIAS.flatMap((a) => CATEGORIAS_SANITARIAS.map((b) => ({ desde: a.id, hacia: b.id, nivel: nivelExigido(a.id, b.id), excepcion: false }))) };
export function permiteExcepcion(c: CeldaMatriz): boolean {
  return (c.nivel === "N1" || c.nivel === "N2") && !CATEGORIAS_SANITARIAS.some((x) => x.alergeno && (x.id === c.desde || x.id === c.hacia));
}
export function validarCelda(c: CeldaMatriz): boolean {
  if (c.desde === c.hacia) return c.nivel === "N0" && !c.excepcion;
  return c.nivel !== "N0" && (!c.excepcion || permiteExcepcion(c));
}