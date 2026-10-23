// Reglas puras. Valores de ejemplo: los reales los define la ingeniería de alimentos.

export type EstadoEquipo = "Liberado" | "En uso" | "Usado" | "En limpieza" | "Por verificar" | "Fuera de servicio";

/* ---------- Recepción ---------- */
export interface Contenedor { nombre: string; pesoKg: number; cantidad: number }

export function pesoContenedores(c: Contenedor[]): number {
  return redondear(c.reduce((s, x) => s + x.pesoKg * x.cantidad, 0));
}
export function pesoNeto(brutoKg: number, contenedores: Contenedor[], hieloKg: number): number {
  return Math.max(0, redondear(brutoKg - pesoContenedores(contenedores) - hieloKg));
}
export function diferenciaPct(facturaKg: number, recibidoKg: number): number {
  if (facturaKg <= 0) return 0;
  return redondear(((recibidoKg - facturaKg) / facturaKg) * 100);
}
export const TOLERANCIA_PCT = 3;
export function dentroTolerancia(pct: number, tol = TOLERANCIA_PCT): boolean {
  return Math.abs(pct) <= tol;
}

/* ---------- FEFO ---------- */
export interface LoteStock { codigo: string; estante: string; saldoKg: number; vence: string; cuarentena?: boolean }

/** Ordena por vencimiento; excluye vencidos y en cuarentena de los sugeridos. */
export function sugerirFEFO(lotes: LoteStock[], hoy: string): LoteStock[] {
  return lotes
    .filter((l) => !l.cuarentena && l.vence >= hoy && l.saldoKg > 0)
    .sort((a, b) => a.vence.localeCompare(b.vence));
}
export function estaVencido(l: LoteStock, hoy: string): boolean {
  return l.vence < hoy;
}

/* ---------- Limpieza ---------- */
export type Categoria = "ave" | "pescado" | "crustaceos" | "moluscos" | "res" | "vegetal";
export type Nivel = "N0" | "N1" | "N2";
export const NIVELES: Nivel[] = ["N0", "N1", "N2"];
export const ALERGENOS: Categoria[] = ["crustaceos", "moluscos"];
export const CATEGORIA_TEXTO: Record<Categoria, string> = {
  ave: "Ave", pescado: "Pescado", crustaceos: "Crustáceos", moluscos: "Moluscos", res: "Res", vegetal: "Vegetal",
};

export function esCambioAlergeno(anterior: Categoria, siguiente: Categoria): boolean {
  if (anterior === siguiente) return false;
  return ALERGENOS.includes(anterior) || ALERGENOS.includes(siguiente);
}

/** Mismo producto: automático. Cambio de especie o perfil de alérgenos: profunda. */
export function nivelExigido(anterior: Categoria, siguiente: Categoria, mismoProducto = anterior === siguiente, cambiaEspecie = anterior !== siguiente, cambiaPerfil = esCambioAlergeno(anterior, siguiente)): Nivel {
  if (cambiaPerfil || cambiaEspecie) return "N2";
  if (mismoProducto) return "N0";
  return "N1";
}

export const PASOS_POE: Record<Nivel, string[]> = {
  N0: [],
  N1: ["Retiro de residuos visibles"],
  N2: ["Desarme y retiro de residuos", "Lavado con detergente alcalino", "Enjuague con agua potable", "Desinfección y tiempo de contacto", "Prueba ATP o de alérgeno · Si aplica · por confirmar", "Enjuague final y armado"],
};

/* ---------- Vencimiento ---------- */
export const VIDA_UTIL_DIAS = { cocido: 5, marinado: 3 } as const;

export function calcularVencimiento(desdeISO: string, dias: number): string {
  const d = new Date(`${desdeISO}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function fechaCorta(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function redondear(n: number, dec = 1): number {
  const f = 10 ** dec;
  return Math.round(n * f) / f;
}

export function kg(n: number): string {
  return n.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
