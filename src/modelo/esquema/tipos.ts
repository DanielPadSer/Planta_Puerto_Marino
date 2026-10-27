/**
 * Lenguaje declarativo del modelo de datos de Puerto Marino.
 * Cada tabla se describe una sola vez; de esa descripción salen los tipos
 * TypeScript, los índices de Dexie, el SQL de PostgreSQL y las validaciones.
 */
export type Tipo = "uuid" | "texto" | "entero" | "decimal" | "bool" | "fecha" | "fechahora" | "json";
/** K catálogo · C captura · S sistema · R registro documental · V vista */
export type Clase = "K" | "C" | "S" | "R" | "V";
export type ModuloId =
  | "seguridad"
  | "recepcion"
  | "inventario"
  | "produccion"
  | "equipos"
  | "despacho"
  | "canastillas";

export interface Campo {
  tipo: Tipo;
  nulo: boolean;
  sql: string;
  ref?: string;
  unico?: boolean;
  pk?: boolean;
  comun?: "captura" | "catalogo";
}

export interface DefTabla {
  base: string;
  clase: Clase;
  modulo: ModuloId;
  descripcion: string;
  campos: Record<string, Campo>;
}

type C<T extends Tipo, N extends boolean> = { tipo: T; nulo: N; sql: string; ref?: string; unico?: boolean; pk?: boolean; comun?: "captura" | "catalogo" };

export const pk = (sql = "uuid"): C<"uuid", false> => ({ tipo: "uuid", nulo: false, sql, pk: true });
export const txt = <N extends boolean = false>(largo: number, nulo?: N): C<"texto", N> => ({ tipo: "texto", nulo: (nulo ?? false) as N, sql: `varchar(${largo})` });
export const largo = <N extends boolean = false>(nulo?: N): C<"texto", N> => ({ tipo: "texto", nulo: (nulo ?? false) as N, sql: "text" });
export const ent = <N extends boolean = false>(nulo?: N, sql = "int"): C<"entero", N> => ({ tipo: "entero", nulo: (nulo ?? false) as N, sql });
export const dec = <N extends boolean = false>(precision: string, nulo?: N): C<"decimal", N> => ({ tipo: "decimal", nulo: (nulo ?? false) as N, sql: `decimal(${precision})` });
export const bool = (): C<"bool", false> => ({ tipo: "bool", nulo: false, sql: "boolean" });
export const fecha = <N extends boolean = false>(nulo?: N): C<"fecha", N> => ({ tipo: "fecha", nulo: (nulo ?? false) as N, sql: "date" });
export const ts = <N extends boolean = false>(nulo?: N): C<"fechahora", N> => ({ tipo: "fechahora", nulo: (nulo ?? false) as N, sql: "timestamptz" });
export const json = <N extends boolean = false>(nulo?: N): C<"json", N> => ({ tipo: "json", nulo: (nulo ?? false) as N, sql: "jsonb" });
export const fk = <N extends boolean = false>(ref: string, nulo?: N): C<"uuid", N> => ({ tipo: "uuid", nulo: (nulo ?? false) as N, sql: "uuid", ref });
export const uq = <X extends Campo>(c: X): X => ({ ...c, unico: true });

/** «7 campos comunes de captura»: quién, dónde, cuándo y estado de sincronización. */
export const CAPTURA = {
  creado_en: { ...ts(), comun: "captura" as const },
  creado_por_id: { ...fk("Usuario"), comun: "captura" as const },
  dispositivo_id: { ...fk("Dispositivo"), comun: "captura" as const },
  hora_dispositivo: { ...ts(), comun: "captura" as const },
  evento_sync_id: { ...fk("EventoSync", true), comun: "captura" as const },
  estado_sync: { ...txt(12), comun: "captura" as const },
  anulado: { ...bool(), comun: "captura" as const },
};
/** «3 campos de versión de catálogo»: los registros históricos conservan su versión. */
export const VERSION = {
  version: { ...ent(), comun: "catalogo" as const },
  activo: { ...bool(), comun: "catalogo" as const },
  actualizado_en: { ...ts(), comun: "catalogo" as const },
};

export const tabla = <F extends Record<string, Campo>>(
  base: string,
  clase: Clase,
  modulo: ModuloId,
  descripcion: string,
  campos: F,
) => ({ base, clase, modulo, descripcion, campos });

type Base<T> = T extends "entero" | "decimal"
  ? number
  : T extends "bool"
    ? boolean
    : T extends "json"
      ? Record<string, unknown>
      : string;
type Valor<X> = X extends { tipo: infer T; nulo: infer N } ? (N extends true ? Base<T> | null : Base<T>) : never;
export type FilaDe<D extends { campos: Record<string, Campo> }> = { [F in keyof D["campos"]]: Valor<D["campos"][F]> };
export type FilaGenerica = Record<string, string | number | boolean | Record<string, unknown> | null>;
