/** Capa B: base local propia del modelo; separada de la base "puerto-marino" existente. */
import Dexie, { type Table } from "dexie";
import { NOMBRES, definicion, type Datos, type NombreTabla } from "./esquema";
import { filas } from "./consultas";

/** Índices Dexie derivados del esquema: id, únicos (&) y llaves foráneas. */
export function indicesDexie(): Record<string, string> {
  return Object.fromEntries(
    NOMBRES.filter((n) => definicion(n).clase !== "V").map((n) => {
      const campos = Object.entries(definicion(n).campos);
      const unicos = campos.filter(([, c]) => c.unico && !c.nulo).map(([k]) => `&${k}`);
      const indices = campos
        .filter(([k, c]) => (c.ref && !c.comun) || (c.unico && c.nulo) || (!c.unico && ["estado", "tipo", "fecha"].includes(k)))
        .map(([k]) => k);
      return [n, ["id", ...unicos, ...indices.filter((k) => !unicos.includes(`&${k}`))].join(", ")];
    }),
  );
}

class ModeloDB extends Dexie {
  constructor() {
    super("puerto-marino-modelo");
    this.version(1).stores(indicesDexie());
  }
}
let instancia: ModeloDB | null = null;
export function getModeloDb(): ModeloDB | null {
  if (typeof indexedDB === "undefined") return null;
  instancia ??= new ModeloDB();
  return instancia;
}

export async function cargarEnNavegador(d: Datos): Promise<number> {
  const db = getModeloDb();
  if (!db) return 0;
  let total = 0;
  const tablas: Table[] = db.tables;
  const tarea = async (): Promise<void> => {
    for (const t of tablas) {
      await t.clear();
      const datos: object[] = filas(d, t.name as NombreTabla);
      await t.bulkPut(datos);
      total += datos.length;
    }
  };
  await (db as Dexie).transaction("rw", tablas, tarea);
  return total;
}
export async function contarEnNavegador(): Promise<Record<string, number>> {
  const db = getModeloDb();
  if (!db) return {};
  const pares = await Promise.all(db.tables.map(async (t) => [t.name, await t.count()] as const));
  return Object.fromEntries(pares);
}
export async function vaciarNavegador(): Promise<void> {
  const db = getModeloDb();
  if (!db) return;
  const tablas: Table[] = db.tables;
  await (db as Dexie).transaction("rw", tablas, async () => {
    for (const t of tablas) await t.clear();
  });
}
