import { create } from "zustand";
import { useCalidad } from "./store";
import { siguienteVersion } from "@/domain/calidad";
import {
  validarReceta,
  type OperarioPersonal,
  type DocumentoPersonal,
  type Alergeno,
  type Perfil,
  type PlantillaBPM,
  type Receta,
  alergenosDeReceta,
} from "@/domain/cuartaFase";
import {
  PERSONAL_DEMO,
  PLANTILLAS_DEMO,
  ALERGENOS_DEMO,
  PERFILES_DEMO,
  RECETAS_DEMO,
  LOTES_ALERGENOS,
  type LoteAlergenos,
} from "@/mocks/cuartaFase";
export function auditarCuarta(
  entidad: string,
  original: unknown,
  nuevo: unknown,
  motivo: string,
  version = 1,
) {
  useCalidad.setState((s) => ({
    eventos: [
      {
        id: crypto.randomUUID(),
        fecha: new Date().toISOString().slice(0, 16).replace("T", " "),
        usuario: "Ingeniera demo",
        dispositivo: "Panel web · PC-CAL-01",
        entidad,
        campo: "Versión y parámetros",
        original: JSON.stringify(original),
        nuevo: JSON.stringify(nuevo),
        motivo,
        version,
      },
      ...s.eventos,
    ],
  }));
}
interface CuartaState {
  personal: OperarioPersonal[];
  plantillas: PlantillaBPM[];
  alergenos: Alergeno[];
  versionesAlergenos: Alergeno[];
  perfiles: Perfil[];
  versionesPerfiles: Perfil[];
  recetas: Receta[];
  lotes: LoteAlergenos[];
  diasAviso: number;
  bloquear: boolean;
  completados: number[];
  borradores: Record<string, unknown>;
  guardarBorrador: (clave: string, datos: unknown) => void;
  completar: (paso: number) => void;
  registrar: (o: OperarioPersonal) => void;
  renovar: (id: string, doc: DocumentoPersonal) => void;
  politica: (dias: number, bloquear: boolean, motivo: string) => void;
  publicarPlantilla: (p: PlantillaBPM, motivo: string) => void;
  guardarAlergeno: (a: Alergeno, motivo: string) => void;
  guardarPerfil: (p: Perfil, motivo: string) => void;
  aprobarReceta: (id: string, motivo: string) => string | null;
  retener: (motivo: string) => void;
  publicarNormativa: (motivo: string) => string | null;
}
export const useCuarta = create<CuartaState>((set, get) => ({
  personal: PERSONAL_DEMO,
  plantillas: PLANTILLAS_DEMO,
  alergenos: ALERGENOS_DEMO,
  versionesAlergenos: ALERGENOS_DEMO,
  perfiles: PERFILES_DEMO,
  versionesPerfiles: PERFILES_DEMO,
  recetas: RECETAS_DEMO,
  lotes: LOTES_ALERGENOS,
  diasAviso: 30,
  bloquear: false,
  completados: [],
  borradores: {},
  guardarBorrador: (clave, datos) =>
    set((s) => ({ borradores: { ...s.borradores, [clave]: datos } })),
  completar: (paso) => set((s) => ({ completados: [...new Set([...s.completados, paso])] })),
  registrar: (o) => {
    set((s) => ({ personal: [...s.personal, o] }));
    auditarCuarta(`Personal ${o.id}`, null, o, "Registro de operario demo");
  },
  renovar: (id, doc) => {
    const original = get().personal.find((o) => o.id === id);
    if (!original) return;
    set((s) => ({
      personal: s.personal.map((o) =>
        o.id === id ? { ...o, documentos: [...o.documentos, doc] } : o,
      ),
    }));
    auditarCuarta(`Documento ${id}`, original.documentos, doc, "Carga de renovación documental");
  },
  politica: (dias, bloquear, motivo) => {
    siguienteVersion(0, motivo);
    const previo = { dias: get().diasAviso, bloquear: get().bloquear };
    set({ diasAviso: dias, bloquear });
    auditarCuarta("Política documental", previo, { dias, bloquear }, motivo);
  },
  publicarPlantilla: (p, motivo) => {
    const version = siguienteVersion(get().plantillas.at(-1)?.version ?? 0, motivo);
    if (!p.items.length || p.items.some((i) => !i.texto.trim()))
      throw Error("Completa los puntos de la plantilla.");
    const nueva = { ...p, id: `BPM-v${version}`, version, items: p.items.map((i) => ({ ...i })) };
    set((s) => ({ plantillas: [...s.plantillas, nueva] }));
    auditarCuarta("Plantilla BPM", p, nueva, motivo, version);
  },
  guardarAlergeno: (a, motivo) => {
    const previo = get().alergenos.find((x) => x.id === a.id);
    const version = siguienteVersion(previo?.version ?? 0, motivo);
    if (!a.nombreRotulado.trim()) throw Error("Nombre oficial obligatorio.");
    const nuevo = {
      ...a,
      nombreRotulado: a.nombreRotulado.trim().toLocaleUpperCase("es-CO"),
      version,
    };
    set((s) => ({
      alergenos: previo
        ? s.alergenos.map((x) => (x.id === a.id ? nuevo : x))
        : [...s.alergenos, nuevo],
      versionesAlergenos: [...s.versionesAlergenos, nuevo],
    }));
    auditarCuarta(`Alérgeno ${nuevo.nombreRotulado}`, previo, nuevo, motivo, version);
  },
  guardarPerfil: (p, motivo) => {
    const previo = get().perfiles.find((x) => x.id === p.id);
    if (!previo) return;
    if (p.tipo === "Kit") {
      const receta = get().recetas.find(r => r.codigo === p.codigo);
      if (!receta || validarReceta(receta, get().perfiles)) throw Error("Valida los ingredientes del kit antes de publicar.");
      p = { ...p, alergenoIds: alergenosDeReceta(receta, get().perfiles) };
    }
    const nuevo = {
      ...p,
      alergenoIds: [...p.alergenoIds],
      version: siguienteVersion(previo.version, motivo),
    };
    set((s) => ({
      perfiles: s.perfiles.map((x) => (x.id === p.id ? nuevo : x)),
      versionesPerfiles: [...s.versionesPerfiles, nuevo],
    }));
    auditarCuarta(`Perfil ${p.nombre}`, previo, nuevo, motivo, nuevo.version);
  },
  aprobarReceta: (id, motivo) => {
    const r = get().recetas.find((x) => x.id === id);
    if (!r) return "Receta no encontrada";
    const error = validarReceta(r, get().perfiles);
    if (error) return error;
    const nueva = {
      ...r,
      version: siguienteVersion(r.version, motivo),
      componentes: r.componentes.map((c) => ({ ...c })),
    };
    set((s) => ({ recetas: s.recetas.map((x) => (x.id === id ? nueva : x)) }));
    auditarCuarta(`Receta ${r.nombre}`, r, nueva, motivo, nueva.version);
    return null;
  },
  retener: (motivo) => {
    siguienteVersion(0, motivo);
    const anterior = get().lotes;
    const nuevo = anterior.map((l) => ({ ...l, estado: "Retenido en cuarentena" }));
    set({ lotes: nuevo });
    auditarCuarta("Lotes afectados", anterior, nuevo, motivo);
  },
  publicarNormativa: (motivo) => {
    if (get().perfiles.some(p => p.estadoFicha !== "validado")) return "Todos los perfiles requieren validación técnica antes de publicar.";
    if (get().recetas.some(r => validarReceta(r, get().perfiles))) return "Revisa las fichas de las recetas antes de publicar.";
    const alergeno = get().alergenos.find(a => a.id === "ALG-004");
    if (!alergeno) return "No se encontró el alérgeno.";
    get().guardarAlergeno(alergeno, motivo);
    get().completar(5);
    return null;
  },
}));
