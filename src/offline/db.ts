import Dexie, { type EntityTable } from "dexie";

export interface EventoOutbox {
  id?: number;
  tipo: string;
  payload: string;
  operarioId: string;
  dispositivo: string;
  creadoEn: string;
  sincronizado: 0 | 1;
}

export class PuertoMarinoDB extends Dexie {
  outbox!: EntityTable<EventoOutbox, "id">;
  constructor() {
    super("puerto-marino");
    this.version(1).stores({ outbox: "++id, tipo, sincronizado, creadoEn" });
  }
}

let instancia: PuertoMarinoDB | null = null;
export function getDb(): PuertoMarinoDB | null {
  if (typeof indexedDB === "undefined") return null;
  instancia ??= new PuertoMarinoDB();
  return instancia;
}
