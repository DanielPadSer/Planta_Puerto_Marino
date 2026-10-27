/** Capa D: genera el esquema PostgreSQL y los datos de ejemplo desde la misma definición. */
import { NOMBRES, RELACIONES, definicion, esTabla, type Datos } from "./esquema";
import { filas } from "./consultas";

/** UUID determinístico a partir de una clave legible (misma clave → mismo UUID). */
export function idDe(clave: string): string {
  let hex = "";
  for (let semilla = 0; hex.length < 32; semilla++) {
    let h = 0x811c9dc5 ^ semilla;
    for (let i = 0; i < clave.length; i++) h = Math.imul(h ^ clave.charCodeAt(i), 0x01000193);
    hex += (h >>> 0).toString(16).padStart(8, "0");
  }
  const v = `${hex.slice(0, 12)}5${hex.slice(13, 16)}a${hex.slice(17, 32)}`;
  return `${v.slice(0, 8)}-${v.slice(8, 12)}-${v.slice(12, 16)}-${v.slice(16, 20)}-${v.slice(20, 32)}`;
}

const VISTA_SALDO = `CREATE VIEW inventario_saldolote AS
SELECT m.lote_id::text || ':' || u.ubicacion_id::text AS id, m.lote_id, u.ubicacion_id, SUM(u.delta)::decimal(10,3) AS saldo_kg
FROM inventario_movimiento m
CROSS JOIN LATERAL (VALUES (m.ubicacion_destino_id, m.cantidad_kg), (m.ubicacion_origen_id, -m.cantidad_kg)) AS u(ubicacion_id, delta)
WHERE u.ubicacion_id IS NOT NULL AND NOT m.anulado
GROUP BY m.lote_id, u.ubicacion_id;`;

export function generarDDL(): string {
  const tablas = NOMBRES.filter((n) => definicion(n).clase !== "V").map((n) => {
    const d = definicion(n);
    const cols = Object.entries(d.campos).map(
      ([campo, c]) => `  ${campo} ${c.sql}${c.pk ? " PRIMARY KEY" : ""}${c.nulo || c.pk ? "" : " NOT NULL"}${c.unico ? " UNIQUE" : ""}`,
    );
    return `-- ${n} · ${d.descripcion}\nCREATE TABLE ${d.base} (\n${cols.join(",\n")}\n);`;
  });
  return tablas.join("\n\n");
}
export function generarFK(): string {
  return RELACIONES.filter((r) => definicion(r.desde).clase !== "V")
    .map((r) => {
      const desde = definicion(r.desde).base;
      return `ALTER TABLE ${desde} ADD CONSTRAINT fk_${desde}_${r.campo} FOREIGN KEY (${r.campo}) REFERENCES ${definicion(r.hacia).base}(id);`;
    })
    .join("\n");
}
const literal = (v: unknown, uuid: boolean): string => {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "object") return `'${JSON.stringify(v).replaceAll("'", "''")}'::jsonb`;
  const s = String(v);
  return `'${(uuid ? idDe(s) : s).replaceAll("'", "''")}'`;
};
export function generarInserts(d: Datos): string {
  return NOMBRES.filter((n) => definicion(n).clase !== "V")
    .flatMap((n) => {
      const def = definicion(n);
      const campos = Object.keys(def.campos);
      return filas(d, n).map(
        (f) =>
          `INSERT INTO ${def.base} (${campos.join(", ")}) VALUES (${campos
            .map((c) => {
              const campo = def.campos[c];
              return literal(f[c], campo?.tipo === "uuid" && (campo.pk === true || Boolean(campo.ref) || c === "ref_id"));
            })
            .join(", ")});`,
      );
    })
    .join("\n");
}
export function generarSQL(d: Datos): string {
  const conteo = NOMBRES.filter((n) => definicion(n).clase !== "V").length;
  return [
    "-- Modelo de datos · Planta Puerto Marino",
    `-- ${conteo} tablas y 1 vista. Valores de ejemplo: los reales los define la ingeniería de alimentos.`,
    "BEGIN;",
    generarDDL(),
    "-- Datos de ejemplo",
    generarInserts(d),
    "-- Llaves foráneas (después de los datos para no depender del orden)",
    generarFK(),
    VISTA_SALDO,
    "COMMIT;",
  ].join("\n\n");
}
export const tieneRef = (campo: string) => esTabla(campo);
