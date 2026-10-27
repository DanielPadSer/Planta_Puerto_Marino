// Quinta fase · control de acceso por rol en el panel web.
// Matriz declarativa: ausente = sin acceso. Las banderas de CONFIG_PERMISOS
// son decisiones pendientes del cliente y se aplican al construir la matriz efectiva.

export type RolPanel = "ingeniera" | "supervisor" | "administrador";
export type Accion = "ver" | "editar" | "firmar"; // firmar = decisión con responsabilidad
export type Recurso =
  | "bandeja.cuarentenas"
  | "bandeja.limpiezas"
  | "bandeja.noConformidades"
  | "bandeja.conflictosSync"
  | "bandeja.pesajesManuales"
  | "reglas"
  | "limpieza.matriz"
  | "equipos.estado"
  | "cuartosFrios"
  | "dispositivos.calibraciones"
  | "dispositivos.registro"
  | "personal.operarios"
  | "personal.controles"
  | "personal.plantillas"
  | "catalogos.tecnicos"
  | "catalogos.alergenos"
  | "catalogos.proveedoresSedes"
  | "trazabilidad"
  | "trazabilidad.bloqueo"
  | "reportes"
  | "historial"
  | "parametrosPesaje"
  | "usuarios.pin"
  | "usuarios.gestion"
  | "auditoria";

export const CONFIG_PERMISOS = {
  adminPuedeFirmarCalidad: false,
  ingenieraEditaPlantillasBPM: false,
} as const;

type MatrizRol = Partial<Record<Recurso, Accion[]>>;

const INGENIERA: MatrizRol = {
  "bandeja.cuarentenas": ["ver", "firmar"],
  "bandeja.limpiezas": ["ver", "firmar"],
  "bandeja.noConformidades": ["ver", "editar", "firmar"],
  "bandeja.conflictosSync": ["ver"],
  "bandeja.pesajesManuales": ["ver"],
  reglas: ["ver", "editar"],
  "limpieza.matriz": ["ver", "editar"],
  "equipos.estado": ["ver", "editar"],
  cuartosFrios: ["ver", "editar"],
  "dispositivos.calibraciones": ["ver", "editar"],
  "dispositivos.registro": ["ver"],
  "personal.operarios": ["ver"],
  "personal.controles": ["ver"],
  "personal.plantillas": ["ver"],
  "catalogos.tecnicos": ["ver", "editar"],
  "catalogos.alergenos": ["ver", "editar"],
  "catalogos.proveedoresSedes": ["ver"],
  trazabilidad: ["ver"],
  "trazabilidad.bloqueo": ["firmar"],
  reportes: ["ver"],
  historial: ["ver"],
  parametrosPesaje: ["ver", "editar"],
};

const SUPERVISOR: MatrizRol = {
  "bandeja.cuarentenas": ["ver"],
  "bandeja.limpiezas": ["ver"],
  "bandeja.noConformidades": ["ver", "editar"],
  "bandeja.conflictosSync": ["ver", "firmar"],
  "bandeja.pesajesManuales": ["ver", "firmar"],
  reglas: ["ver"],
  "limpieza.matriz": ["ver"],
  "equipos.estado": ["ver", "editar"],
  cuartosFrios: ["ver"],
  "dispositivos.calibraciones": ["ver"],
  "dispositivos.registro": ["ver"],
  "personal.operarios": ["ver", "editar"],
  "personal.controles": ["ver", "editar"],
  "personal.plantillas": ["ver", "editar"],
  "catalogos.tecnicos": ["ver"],
  "catalogos.alergenos": ["ver"],
  "catalogos.proveedoresSedes": ["ver"],
  trazabilidad: ["ver"],
  reportes: ["ver"],
  historial: ["ver"],
  parametrosPesaje: ["ver"],
  "usuarios.pin": ["ver", "editar"],
};

const ADMINISTRADOR: MatrizRol = {
  "bandeja.cuarentenas": ["ver"],
  "bandeja.limpiezas": ["ver"],
  "bandeja.noConformidades": ["ver"],
  "bandeja.conflictosSync": ["ver", "firmar"],
  "bandeja.pesajesManuales": ["ver"],
  reglas: ["ver", "editar"],
  "limpieza.matriz": ["ver", "editar"],
  "equipos.estado": ["ver", "editar"],
  cuartosFrios: ["ver", "editar"],
  "dispositivos.calibraciones": ["ver", "editar"],
  "dispositivos.registro": ["ver", "editar"],
  "personal.operarios": ["ver", "editar"],
  "personal.controles": ["ver", "editar"],
  "personal.plantillas": ["ver", "editar"],
  "catalogos.tecnicos": ["ver", "editar"],
  "catalogos.alergenos": ["ver", "editar"],
  "catalogos.proveedoresSedes": ["ver", "editar"],
  trazabilidad: ["ver"],
  reportes: ["ver"],
  historial: ["ver"],
  parametrosPesaje: ["ver", "editar"],
  "usuarios.pin": ["ver", "editar"],
  "usuarios.gestion": ["ver", "editar"],
  // Sin acceso: trazabilidad.bloqueo, auditoria. Nadie edita ni borra el historial.
};

export const PERMISOS: Record<RolPanel, MatrizRol> = {
  ingeniera: INGENIERA,
  supervisor: SUPERVISOR,
  administrador: ADMINISTRADOR,
};

export function matrizEfectiva(rol: RolPanel): MatrizRol {
  const base = PERMISOS[rol];
  if (rol === "administrador" && CONFIG_PERMISOS.adminPuedeFirmarCalidad) {
    return {
      ...base,
      "bandeja.cuarentenas": [...(base["bandeja.cuarentenas"] ?? []), "firmar"],
      "bandeja.limpiezas": [...(base["bandeja.limpiezas"] ?? []), "firmar"],
      "trazabilidad.bloqueo": ["firmar"],
    };
  }
  if (rol === "ingeniera" && CONFIG_PERMISOS.ingenieraEditaPlantillasBPM) {
    return { ...base, "personal.plantillas": ["ver", "editar"] };
  }
  return base;
}

export function puede(rol: RolPanel, accion: Accion, recurso: Recurso): boolean {
  return (matrizEfectiva(rol)[recurso] ?? []).includes(accion);
}

export function recursosVisibles(rol: RolPanel): Recurso[] {
  return (Object.keys(matrizEfectiva(rol)) as Recurso[]).filter(
    (r) => (matrizEfectiva(rol)[r]?.length ?? 0) > 0,
  );
}

export const ETIQUETA_ROL: Record<RolPanel, string> = {
  ingeniera: "Ingeniera de alimentos",
  supervisor: "Supervisor",
  administrador: "Administrador",
};

export function motivoRestriccion(rol: RolPanel, accion: Accion, recurso: Recurso): string {
  if (puede(rol, accion, recurso)) return "";
  if (recurso === "auditoria" || recurso === "historial")
    return "El historial de auditoría no se puede editar ni borrar.";
  if (
    accion === "firmar" &&
    (recurso === "bandeja.cuarentenas" ||
      recurso === "bandeja.limpiezas" ||
      recurso === "trazabilidad.bloqueo")
  )
    return recurso === "bandeja.cuarentenas"
      ? "Solo la ingeniera de alimentos puede liberar lotes."
      : "Las decisiones de calidad las firma la ingeniera de alimentos.";
  if (accion === "firmar" && (recurso === "bandeja.conflictosSync" || recurso === "bandeja.pesajesManuales"))
    return "Esta acción es de supervisión de personal.";
  if (recurso.startsWith("personal.") || recurso === "usuarios.pin")
    return "Esta acción es de supervisión de personal.";
  if (recurso === "usuarios.gestion" || recurso === "dispositivos.registro")
    return "Solo el administrador puede gestionar usuarios y dispositivos.";
  if (
    recurso === "reglas" ||
    recurso === "limpieza.matriz" ||
    recurso === "catalogos.tecnicos" ||
    recurso === "catalogos.alergenos" ||
    recurso === "parametrosPesaje" ||
    recurso === "cuartosFrios"
  )
    return "Solo la ingeniera de alimentos o el administrador pueden modificar esta sección.";
  if (recurso === "catalogos.proveedoresSedes")
    return "Solo el administrador edita proveedores y sedes.";
  return "Tu rol no tiene permiso para esta acción.";
}

export class ErrorPermiso extends Error {
  readonly status = 403;
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "ErrorPermiso";
  }
}

export function assertPuede(rol: RolPanel, accion: Accion, recurso: Recurso): void {
  if (!puede(rol, accion, recurso)) {
    throw new ErrorPermiso(motivoRestriccion(rol, accion, recurso) || "Acceso denegado.");
  }
}
