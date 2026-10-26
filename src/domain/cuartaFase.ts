import { z } from "zod";
export type TipoDocumentoPersonal = "certificado_medico" | "capacitacion_bpm";
export interface DocumentoPersonal {
  id: string;
  operarioId: string;
  tipo: TipoDocumentoPersonal;
  emitidoEn: string;
  venceEn: string;
  horas?: number;
  entidad?: string;
  archivoUrl?: string;
  archivoNombre?: string;
}
export type RolPersonal =
  "operario" | "supervisor" | "encargada_limpieza" | "ingeniera" | "administrador";
export interface OperarioPersonal {
  id: string;
  nombre: string;
  rol: RolPersonal;
  documentos: DocumentoPersonal[];
}
export type GrupoBPM = "Higiene personal" | "Dotación" | "Salud" | "Área de trabajo";
export interface ItemBPM {
  id: string;
  grupo: GrupoBPM;
  texto: string;
  pista?: string;
  observacionObligatoriaSiFalla: boolean;
}
export interface PlantillaBPM {
  id: string;
  version: number;
  items: ItemBPM[];
}
export interface RegistroBPM {
  id: string;
  operarioId: string;
  plantillaVersion: number;
  respuestas: { itemId: string; cumple: boolean; observacion?: string }[];
  firmadoEn: string;
  dispositivoId: string;
  turno: string;
}
export interface Alergeno {
  id: string;
  codigo: string;
  nombreRotulado: string;
  descripcion: string;
  activo: boolean;
  version: number;
  normaReferencia: string;
}
export interface Ingrediente {
  id: string;
  codigo: string;
  nombre: string;
  alergenoIds: string[];
  estadoFicha: "validado" | "sin_perfil" | "revision";
}
export interface Perfil extends Ingrediente {
  tipo: "Producto" | "Ingrediente" | "Kit";
  version: number;
  riesgoCruzado: boolean;
  notas: string;
}
export interface Receta {
  id: string;
  codigo: string;
  nombre: string;
  componentes: { ingredienteId: string; proporcion: number }[];
  version: number;
}
export type Vigencia = "vigente" | "por_vencer" | "vencido" | "sin_documento";
export const diasHasta = (fecha: string, hoy: string) =>
  Math.ceil(
    (Date.parse(fecha.slice(0, 10) + "T00:00:00Z") - Date.parse(hoy.slice(0, 10) + "T00:00:00Z")) /
      86400000,
  );
export function vigenciaDocumento(
  doc: DocumentoPersonal,
  hoy: string,
  diasAviso = 30,
): Exclude<Vigencia, "sin_documento"> {
  const dias = diasHasta(doc.venceEn, hoy);
  return dias < 0 ? "vencido" : dias <= diasAviso ? "por_vencer" : "vigente";
}
export function documentoActivo(operario: OperarioPersonal, tipo: TipoDocumentoPersonal) {
  return operario.documentos
    .filter((d) => d.tipo === tipo)
    .sort((a, b) => b.emitidoEn.localeCompare(a.emitidoEn))[0];
}
export function vigenciaOperario(
  operario: OperarioPersonal,
  hoy: string,
  diasAviso = 30,
): Vigencia {
  const docs = (["certificado_medico", "capacitacion_bpm"] as const).map((t) =>
    documentoActivo(operario, t),
  );
  if (docs.some((d) => d && vigenciaDocumento(d, hoy, diasAviso) === "vencido")) return "vencido";
  if (docs.some((d) => !d)) return "sin_documento";
  if (docs.some((d) => d && vigenciaDocumento(d, hoy, diasAviso) === "por_vencer"))
    return "por_vencer";
  return "vigente";
}
export function alergenosDeReceta(receta: Receta, ingredientes: readonly Ingrediente[]): string[] {
  return [
    ...new Set(
      receta.componentes.flatMap(
        (c) => ingredientes.find((i) => i.id === c.ingredienteId)?.alergenoIds ?? [],
      ),
    ),
  ].sort();
}
export function leyendaContiene(alergenos: readonly Pick<Alergeno, "nombreRotulado">[]) {
  return alergenos.length
    ? `CONTIENE: ${alergenos.map((a) => a.nombreRotulado.toLocaleUpperCase("es-CO")).join(", ")}`
    : "SIN ALÉRGENOS REPORTADOS";
}
export function cambiaPerfilAlergenos(a: readonly string[], b: readonly string[]) {
  return [...new Set(a)].sort().join("|") !== [...new Set(b)].sort().join("|");
}
export function limpiezaPorPerfil(a: readonly string[], b: readonly string[]) {
  return cambiaPerfilAlergenos(a, b)
    ? ({ nivel: "N2", excepcion: false } as const)
    : ({ nivel: "N1", excepcion: true } as const);
}
export function validarReceta(receta: Receta, ingredientes: readonly Ingrediente[]) {
  if (
    receta.componentes.some(
      (c) => ingredientes.find((i) => i.id === c.ingredienteId)?.estadoFicha !== "validado",
    )
  )
    return "Todos los ingredientes deben tener una ficha validada.";
  if (Math.abs(receta.componentes.reduce((n, c) => n + c.proporcion, 0) - 100) > 0.01)
    return "Las proporciones deben sumar 100 %.";
  return null;
}
export function validarTrazas(activo: boolean, motivo: string) {
  return activo && motivo.trim().length < 5
    ? "Justificación técnica obligatoria para declarar trazas."
    : null;
}
export const documentoSchema = z
  .object({
    tipo: z.enum(["certificado_medico", "capacitacion_bpm"]),
    emitidoEn: z.string().min(1, "Fecha de emisión obligatoria"),
    venceEn: z.string().min(1, "Fecha de vencimiento obligatoria"),
    entidad: z.string().trim().min(1, "Entidad obligatoria"),
    horas: z.coerce.number().min(0),
    archivoNombre: z.string().min(1, "Adjunta un archivo"),
  })
  .refine((d) => d.venceEn > d.emitidoEn, {
    path: ["venceEn"],
    message: "El vencimiento debe ser posterior a la emisión",
  })
  .refine((d) => d.tipo !== "capacitacion_bpm" || d.horas > 0, {
    path: ["horas"],
    message: "Registra las horas de capacitación",
  });
export const fechaCO = (fecha: string) => fecha.slice(0, 10).split("-").reverse().join("/");
export const ROLES_PERSONAL: Record<RolPersonal, string> = {
  operario: "Operario",
  supervisor: "Supervisor",
  encargada_limpieza: "Encargada de limpieza",
  ingeniera: "Ingeniera de alimentos",
  administrador: "Administrador",
};
export const GRUPOS_BPM: GrupoBPM[] = ["Higiene personal", "Dotación", "Salud", "Área de trabajo"];
