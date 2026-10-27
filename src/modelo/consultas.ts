/** Reglas puras sobre el modelo: integridad, saldos, trazabilidad, pesajes, estados y sincronización. */
import { NOMBRES, definicion, esTabla, type Datos, type Fila, type FilaGenerica, type NombreTabla } from "./esquema";

export const filas = (d: Datos, n: NombreTabla) => d[n] as unknown as FilaGenerica[];
const r2 = (n: number) => Math.round(n * 1000) / 1000;

/* ---------- Vista SaldoLote: destino suma, origen resta ---------- */
export function saldos(movs: Fila<"Movimiento">[]): Fila<"SaldoLote">[] {
  const mapa = new Map<string, Fila<"SaldoLote">>();
  const sumar = (lote: string, ub: string | null, delta: number) => {
    if (!ub) return;
    const id = `${lote}:${ub}`;
    const actual = mapa.get(id) ?? { id, lote_id: lote, ubicacion_id: ub, saldo_kg: 0 };
    mapa.set(id, { ...actual, saldo_kg: r2(actual.saldo_kg + delta) });
  };
  for (const m of movs) {
    if (m.anulado) continue;
    sumar(m.lote_id, m.ubicacion_destino_id, m.cantidad_kg);
    sumar(m.lote_id, m.ubicacion_origen_id, -m.cantidad_kg);
  }
  return [...mapa.values()];
}

/* ---------- Integridad referencial ---------- */
export interface Problema {
  tabla: NombreTabla;
  id: string;
  campo: string;
  tipo: "fk" | "nulo" | "unico" | "tipo";
  detalle: string;
}
export function integridad(d: Datos): Problema[] {
  const ids = new Map<string, Set<string>>(NOMBRES.map((n) => [n, new Set(filas(d, n).map((f) => String(f["id"])))]));
  const problemas: Problema[] = [];
  for (const tabla of NOMBRES) {
    const def = definicion(tabla);
    const vistos = new Map<string, Set<string>>();
    for (const fila of filas(d, tabla)) {
      const id = String(fila["id"]);
      for (const [campo, c] of Object.entries(def.campos)) {
        const v = fila[campo];
        if (v === undefined || v === null) {
          if (!c.nulo) problemas.push({ tabla, id, campo, tipo: "nulo", detalle: "Campo obligatorio vacío" });
          continue;
        }
        const esperado = c.tipo === "entero" || c.tipo === "decimal" ? "number" : c.tipo === "bool" ? "boolean" : c.tipo === "json" ? "object" : "string";
        if (typeof v !== esperado) problemas.push({ tabla, id, campo, tipo: "tipo", detalle: `Se esperaba ${c.tipo}` });
        if (c.ref && esTabla(c.ref) && !ids.get(c.ref)?.has(String(v)))
          problemas.push({ tabla, id, campo, tipo: "fk", detalle: `${String(v)} no existe en ${c.ref}` });
        if (c.unico || c.pk) {
          const set = vistos.get(campo) ?? new Set<string>();
          if (set.has(String(v))) problemas.push({ tabla, id, campo, tipo: "unico", detalle: `Valor repetido ${String(v)}` });
          set.add(String(v));
          vistos.set(campo, set);
        }
      }
    }
  }
  return problemas;
}

/* ---------- Pesajes ---------- */
export const netoPesaje = (bruto: number, tara: number, hielo = 0) => Math.max(0, r2(bruto - tara - hielo));
export function validarPesaje(p: { origen: string; estable: boolean; autorizado_por_id: string | null; motivo_manual: string }): string | null {
  if (p.origen === "bascula" && !p.estable) return "El peso de báscula debe estar estable.";
  if (p.origen === "manual") {
    if (!p.autorizado_por_id) return "El peso manual exige autorización del supervisor.";
    if (p.motivo_manual.trim().length < 5) return "El peso manual exige motivo.";
  }
  return null;
}

/* ---------- Limpieza: última versión activa de la matriz ---------- */
export function nivelCambio(matriz: Fila<"MatrizCambio">[], desde: string, hacia: string): string | null {
  const candidatas = matriz
    .filter((m) => m.activo && m.categoria_desde_id === desde && m.categoria_hacia_id === hacia)
    .sort((a, b) => b.version_matriz - a.version_matriz);
  return candidatas[0]?.nivel ?? null;
}

/* ---------- Estados de calidad del lote ---------- */
export const TRANSICIONES: Record<string, string[]> = {
  cuarentena: ["liberado", "retenido", "rechazado"],
  retenido: ["liberado", "rechazado"],
  liberado: ["retenido"],
  rechazado: [],
};
export function validarTransicion(anterior: string, nuevo: string, rol: string, motivo: string, enLinea: boolean): string | null {
  if (!TRANSICIONES[anterior]?.includes(nuevo)) return `No se puede pasar de ${anterior} a ${nuevo}.`;
  if (rol !== "ingeniera") return "Solo la ingeniera de alimentos cambia el estado de calidad.";
  if (motivo.trim().length < 5) return "El motivo es obligatorio.";
  if (nuevo === "liberado" && !enLinea) return "Liberar un lote exige conexión.";
  return null;
}

/* ---------- Sincronización: contador estrictamente creciente por dispositivo ---------- */
export function procesarEvento(evento: Fila<"EventoSync">, ultimoContador: number): { estado: "aplicado" } | { estado: "conflicto"; motivo: string } {
  if (evento.contador <= ultimoContador)
    return { estado: "conflicto", motivo: `Contador ${evento.contador} repetido o atrasado (último ${ultimoContador}).` };
  return { estado: "aplicado" };
}

/* ---------- Trazabilidad ---------- */
export interface NodoLote {
  lote: Fila<"Lote">;
  producto: string;
  kg: number | null;
  linea: Fila<"LineaRecepcion"> | null;
  recepcion: Fila<"Recepcion"> | null;
  proveedor: Fila<"Proveedor"> | null;
  pesajes: Fila<"Pesaje">[];
  controles: Fila<"RegistroControl">[];
  historial: Fila<"HistorialEstadoLote">[];
  equipos: { equipo: Fila<"Equipo">; uso: Fila<"UsoEquipo">; limpieza: Fila<"RegistroLimpieza"> | null }[];
  noConformidades: Fila<"NoConformidad">[];
  origenes: NodoLote[];
}
export interface Traza {
  paquete: Fila<"Paquete">;
  arbol: NodoLote;
  remisiones: { remision: Fila<"Remision">; sede: string; recibido: Fila<"RecepcionSede"> | null }[];
  lecturas: Fila<"LecturaTemperatura">[];
  etiquetas: Fila<"Etiqueta">[];
}
export function nodoLote(d: Datos, loteId: string, kg: number | null = null, profundidad = 0): NodoLote | null {
  const lote = d.Lote.find((l) => l.id === loteId);
  if (!lote || profundidad > 10) return null;
  const linea = d.LineaRecepcion.find((l) => l.id === lote.linea_recepcion_id) ?? null;
  const recepcion = d.Recepcion.find((r) => r.id === linea?.recepcion_id) ?? null;
  const usos = d.UsoEquipo.filter((u) => u.lote_id === lote.id);
  return {
    lote,
    producto: d.Producto.find((p) => p.id === lote.producto_id)?.nombre ?? "—",
    kg,
    linea,
    recepcion,
    proveedor: d.Proveedor.find((p) => p.id === recepcion?.proveedor_id) ?? null,
    pesajes: linea ? d.Pesaje.filter((p) => p.linea_id === linea.id) : [],
    controles: d.RegistroControl.filter((c) => c.lote_id === lote.id),
    historial: d.HistorialEstadoLote.filter((h) => h.lote_id === lote.id),
    equipos: usos.flatMap((uso) => {
      const equipo = d.Equipo.find((e) => e.id === uso.equipo_id);
      return equipo ? [{ equipo, uso, limpieza: d.RegistroLimpieza.find((r) => r.id === uso.limpieza_id) ?? null }] : [];
    }),
    noConformidades: d.NoConformidad.filter((n) => n.lote_id === lote.id),
    origenes: d.LoteOrigen.filter((o) => o.lote_destino_id === lote.id).flatMap((o) => {
      const n = nodoLote(d, o.lote_origen_id, o.cantidad_kg, profundidad + 1);
      return n ? [n] : [];
    }),
  };
}
export function trazarPaquete(d: Datos, codigo: string): Traza | null {
  const paquete = d.Paquete.find((p) => p.codigo === codigo.trim().toUpperCase());
  if (!paquete) return null;
  const arbol = nodoLote(d, paquete.lote_id);
  if (!arbol) return null;
  const sensores = d.SensorTemperatura.filter((s) =>
    d.Movimiento.some((m) => m.lote_id === paquete.lote_id && m.ubicacion_destino_id === s.ubicacion_id),
  ).map((s) => s.id);
  return {
    paquete,
    arbol,
    remisiones: d.RemisionPaquete.filter((rp) => rp.paquete_id === paquete.id).flatMap((rp) => {
      const remision = d.Remision.find((r) => r.id === rp.remision_id);
      return remision
        ? [{ remision, sede: d.Sede.find((s) => s.id === remision.sede_id)?.nombre ?? "—", recibido: d.RecepcionSede.find((r) => r.remision_id === remision.id) ?? null }]
        : [];
    }),
    lecturas: d.LecturaTemperatura.filter((l) => sensores.includes(l.sensor_id)),
    etiquetas: d.Etiqueta.filter((e) => e.paquete_id === paquete.id),
  };
}
/** Hacia adelante: a qué lotes, paquetes y sedes llegó un lote de materia prima. */
export function impacto(d: Datos, loteCodigo: string) {
  const inicio = d.Lote.find((l) => l.codigo === loteCodigo.trim().toUpperCase());
  if (!inicio) return null;
  const lotes = new Set<string>([inicio.id]);
  let cambio = true;
  while (cambio) {
    cambio = false;
    for (const o of d.LoteOrigen)
      if (lotes.has(o.lote_origen_id) && !lotes.has(o.lote_destino_id)) {
        lotes.add(o.lote_destino_id);
        cambio = true;
      }
  }
  const paquetes = d.Paquete.filter((p) => lotes.has(p.lote_id));
  const remisiones = d.Remision.filter((r) => d.RemisionPaquete.some((rp) => rp.remision_id === r.id && paquetes.some((p) => p.id === rp.paquete_id)));
  return { lotes: d.Lote.filter((l) => lotes.has(l.id)), paquetes, remisiones, sedes: [...new Set(remisiones.map((r) => d.Sede.find((s) => s.id === r.sede_id)?.nombre ?? "—"))] };
}
