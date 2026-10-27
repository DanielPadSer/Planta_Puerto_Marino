import { create } from "zustand";
import { MATRIZ_INICIAL, validarCelda, type VersionMatriz, type CeldaMatriz } from "@/domain/matriz";
import { PRODUCTOS, LOTES, EVENTOS, DISPOSITIVOS, CONTENEDORES } from "@/mocks/calidad";
import {
  siguienteVersion,
  validarDecision,
  type ProductoRegla,
  type LoteCalidad,
  type EventoCalidad,
  type Dispositivo,
  type ContenedorCalidad,
  type ConflictoSync,
  type PesajeManual,
} from "@/domain/calidad";
import { useSesionPanel } from "@/features/auth/sesionPanel";

const CONFLICTOS_INICIAL: ConflictoSync[] = [
  {
    id: "SYN-101",
    evento: "Pesaje LT-0250 duplicado",
    dispositivo: "Tablet Recepción 01",
    operario: "Carlos Mendoza",
    hora: "27/10/2026 06:41",
    motivo: "El dispositivo reintentó el envío sin conexión y el consecutivo ya existía",
    estado: "Pendiente",
  },
  {
    id: "SYN-102",
    evento: "Registro de temperatura CF-2 fuera de orden",
    dispositivo: "Tablet CF-2",
    operario: "Luisa Gómez",
    hora: "27/10/2026 12:10",
    motivo: "Reloj del dispositivo desfasado 14 minutos",
    estado: "Pendiente",
  },
];

const PESAJES_INICIAL: PesajeManual[] = [
  {
    id: "PES-4820",
    lote: "LT-0250",
    operario: "Carlos Mendoza",
    motivo: "Báscula sin comunicación serial",
    autorizo: "Luisa Gómez · PIN individual",
    peso: "22,10 kg",
    estado: "Pendiente",
  },
  {
    id: "PES-4824",
    lote: "LT-0253",
    operario: "Marta Pinzón",
    motivo: "Contenedor sin tara registrada",
    autorizo: "Luisa Gómez · PIN individual",
    peso: "18,40 kg",
    estado: "Pendiente",
  },
];
interface SesionPanel {
  activa: boolean;
  entrar: () => void;
  salir: () => void;
}
export const usePanelSesion = create<SesionPanel>((set) => ({
  activa: false,
  entrar: () => set({ activa: true }),
  salir: () => set({ activa: false }),
}));
interface CalidadState {
  matrices: VersionMatriz[];
  guardarMatriz: (celdas: CeldaMatriz[], motivo: string) => string | null;
  productos: ProductoRegla[];
  versiones: ProductoRegla[];
  lotes: LoteCalidad[];
  eventos: EventoCalidad[];
  dispositivos: Dispositivo[];
  contenedores: ContenedorCalidad[];
  decidir: (
    id: string,
    motivo: string,
    enLinea: boolean,
    rechazar: boolean,
    destino: string,
  ) => string | null;
  guardarProducto: (producto: ProductoRegla, motivo: string) => void;
  auditar: (
    entidad: string,
    campo: string,
    original: string,
    nuevo: string,
    motivo: string,
    version?: number,
  ) => void;
  editarDispositivo: (d: Dispositivo, motivo: string) => void;
  agregarDispositivo: (d: Dispositivo) => void;
  guardarTara: (c: ContenedorCalidad, motivo: string) => void;
  conflictos: ConflictoSync[];
  pesajesManuales: PesajeManual[];
  resolverConflicto: (id: string, accion: "ajuste" | "descartar", ajuste: string, motivo: string) => string | null;
  revisarPesaje: (id: string, motivo: string) => string | null;
}
export const useCalidad = create<CalidadState>((set, get) => ({
  matrices: [MATRIZ_INICIAL],
  guardarMatriz: (celdas, motivo) => {
    if (!motivo.trim()) return "El motivo del cambio es obligatorio";
    const previa = get().matrices.at(-1);
    if (!previa || celdas.length !== previa.celdas.length || celdas.some((c, i) => !validarCelda(c) || c.desde !== previa.celdas[i]?.desde || c.hacia !== previa.celdas[i]?.hacia)) return "Revisa las reglas de las celdas";
    const nueva = { version: previa.version + 1, celdas: celdas.map((c) => ({ ...c })) };
    set((s) => ({ matrices: [...s.matrices, nueva] }));
    get().auditar("Matriz de limpieza", "Celdas", JSON.stringify(previa), JSON.stringify(nueva), motivo, nueva.version);
    return null;
  },
  productos: PRODUCTOS,
  versiones: PRODUCTOS,
  lotes: LOTES,
  eventos: EVENTOS,
  dispositivos: DISPOSITIVOS,
  contenedores: CONTENEDORES,
  auditar: (entidad, campo, original, nuevo, motivo, version = 1) =>
    set((s) => ({
      eventos: [
        {
          id: `EVT-${Date.now()}`,
          fecha: new Date().toISOString().slice(0, 16).replace("T", " "),
          usuario: useSesionPanel.getState().usuario?.nombre ?? "Luisa Gómez",
          dispositivo: "Panel web · PC-CAL-01",
          entidad,
          campo,
          original,
          nuevo,
          motivo,
          version,
        },
        ...s.eventos,
      ],
    })),
  decidir: (id, motivo, enLinea, rechazar, destino) => {
    const error = validarDecision("ingeniera", enLinea, motivo, rechazar, destino);
    if (error) return error;
    const lote = get().lotes.find((l) => l.id === id);
    if (!lote || lote.estado !== "Cuarentena") return "El lote ya tiene una decisión.";
    const estado = rechazar ? "Rechazado" : "Liberado";
    set((s) => ({ lotes: s.lotes.map((l) => (l.id === id ? { ...l, estado } : l)) }));
    get().auditar(
      `Lote ${id}`,
      "Estado",
      lote.estado,
      estado,
      motivo + (rechazar ? ` · Destino: ${destino}` : ""),
      lote.version,
    );
    return null;
  },
  guardarProducto: (p, motivo) => {
    const previo = get().productos.find((x) => x.id === p.id);
    if (!previo) return;
    const nuevo = { ...p, version: siguienteVersion(previo.version, motivo) };
    set((s) => ({
      productos: s.productos.map((x) => (x.id === p.id ? nuevo : x)),
      versiones: [...s.versiones, nuevo],
    }));
    get().auditar(
      `Regla ${p.nombre}`,
      "Parámetros",
      JSON.stringify(previo),
      JSON.stringify(nuevo),
      motivo,
      nuevo.version,
    );
  },
  editarDispositivo: (d, motivo) => {
    siguienteVersion(0, motivo);
    const previo = get().dispositivos.find((x) => x.id === d.id);
    set((s) => ({ dispositivos: s.dispositivos.map((x) => (x.id === d.id ? d : x)) }));
    get().auditar(d.nombre, "Configuración", JSON.stringify(previo), JSON.stringify(d), motivo);
  },
  agregarDispositivo: (d) => {
    set((s) => ({ dispositivos: [...s.dispositivos, d] }));
    get().auditar(d.nombre, "Registro", "No registrado", "Activo", "Alta mediante asistente");
  },
  guardarTara: (c, motivo) => {
    const previo = get().contenedores.find((x) => x.id === c.id);
    if (!previo) return;
    const nuevo = { ...c, version: siguienteVersion(previo.version, motivo) };
    set((s) => ({ contenedores: s.contenedores.map((x) => (x.id === c.id ? nuevo : x)) }));
    get().auditar(c.nombre, "Tara", `${previo.tara} kg`, `${c.tara} kg`, motivo, nuevo.version);
  },
}));
