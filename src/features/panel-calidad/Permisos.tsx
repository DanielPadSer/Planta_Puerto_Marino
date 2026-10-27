import { Fragment } from "react";
import { Check, Pencil, PenLine } from "lucide-react";
import { PanelLayout } from "@/app/PanelLayout";
import { EstadoChip, ReadonlyNote } from "./ui";
import { RutaProtegida } from "@/ui/permisos";
import {
  PERMISOS,
  CONFIG_PERMISOS,
  ETIQUETA_ROL,
  type Accion,
  type Recurso,
  type RolPanel,
} from "@/domain/permisos";

const GRUPOS: { nombre: string; recursos: { recurso: Recurso; etiqueta: string }[] }[] = [
  {
    nombre: "Bandeja de decisiones",
    recursos: [
      { recurso: "bandeja.cuarentenas", etiqueta: "Cuarentenas" },
      { recurso: "bandeja.limpiezas", etiqueta: "Limpiezas por verificar" },
      { recurso: "bandeja.noConformidades", etiqueta: "No conformidades" },
      { recurso: "bandeja.conflictosSync", etiqueta: "Conflictos de sincronización" },
      { recurso: "bandeja.pesajesManuales", etiqueta: "Pesajes manuales" },
    ],
  },
  {
    nombre: "Calidad e inocuidad",
    recursos: [
      { recurso: "reglas", etiqueta: "Reglas por producto" },
      { recurso: "limpieza.matriz", etiqueta: "Matriz de limpieza" },
      { recurso: "equipos.estado", etiqueta: "Estado de equipos" },
      { recurso: "cuartosFrios", etiqueta: "Cuartos fríos" },
      { recurso: "parametrosPesaje", etiqueta: "Parámetros de pesaje" },
    ],
  },
  {
    nombre: "Dispositivos",
    recursos: [
      { recurso: "dispositivos.calibraciones", etiqueta: "Calibraciones" },
      { recurso: "dispositivos.registro", etiqueta: "Registro y tokens" },
    ],
  },
  {
    nombre: "Personal y BPM",
    recursos: [
      { recurso: "personal.operarios", etiqueta: "Operarios y documentos" },
      { recurso: "personal.controles", etiqueta: "Controles de turno" },
      { recurso: "personal.plantillas", etiqueta: "Plantillas de checklist" },
    ],
  },
  {
    nombre: "Catálogos",
    recursos: [
      { recurso: "catalogos.tecnicos", etiqueta: "Catálogos técnicos" },
      { recurso: "catalogos.alergenos", etiqueta: "Alérgenos" },
      { recurso: "catalogos.proveedoresSedes", etiqueta: "Proveedores y sedes" },
    ],
  },
  {
    nombre: "Trazabilidad y reportes",
    recursos: [
      { recurso: "trazabilidad", etiqueta: "Trazabilidad" },
      { recurso: "trazabilidad.bloqueo", etiqueta: "Bloqueo y retención de lotes" },
      { recurso: "reportes", etiqueta: "Reportes" },
      { recurso: "historial", etiqueta: "Historial de cambios" },
      { recurso: "auditoria", etiqueta: "Auditoría (edición)" },
    ],
  },
  {
    nombre: "Usuarios",
    recursos: [
      { recurso: "usuarios.pin", etiqueta: "Restablecer PIN de operarios" },
      { recurso: "usuarios.gestion", etiqueta: "Gestión de usuarios y roles" },
    ],
  },
];

const ROLES: RolPanel[] = ["ingeniera", "supervisor", "administrador"];

function Celda({ acciones }: { acciones: Accion[] | undefined }) {
  if (!acciones?.length) return <td aria-label="Sin acceso" />;
  return (
    <td>
      <span className="inline-flex gap-2">
        {acciones.includes("ver") && (
          <span title="Ver" aria-label="Ver" className="text-ok">
            <Check size={20} />
          </span>
        )}
        {acciones.includes("editar") && (
          <span title="Editar" aria-label="Editar" className="text-primary">
            <Pencil size={20} />
          </span>
        )}
        {acciones.includes("firmar") && (
          <span title="Firmar" aria-label="Firmar" className="text-warn">
            <PenLine size={20} />
          </span>
        )}
      </span>
    </td>
  );
}

export function Permisos() {
  return (
    <RutaProtegida recurso="usuarios.gestion">
      <PanelLayout
        title="Permisos por rol"
        subtitle="Matriz de acceso del panel web · solo lectura"
        active="/panel/permisos"
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <ReadonlyNote />
          <EstadoChip tono="warn">
            Decisión pendiente · adminPuedeFirmarCalidad:{" "}
            {CONFIG_PERMISOS.adminPuedeFirmarCalidad ? "sí" : "no"}
          </EstadoChip>
          <EstadoChip tono="warn">
            Decisión pendiente · ingenieraEditaPlantillasBPM:{" "}
            {CONFIG_PERMISOS.ingenieraEditaPlantillasBPM ? "sí" : "no"}
          </EstadoChip>
        </div>
        <section className="panel-surface p-5">
          <div className="panel-table-wrap">
            <table className="panel-table perm-matrix">
              <thead>
                <tr>
                  <th>Recurso</th>
                  {ROLES.map((r) => (
                    <th key={r}>{ETIQUETA_ROL[r]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GRUPOS.map((g) => (
                  <>
                    <tr key={g.nombre}>
                      <td colSpan={4} className="bg-muted/60 font-bold text-xs uppercase tracking-wide">
                        {g.nombre}
                      </td>
                    </tr>
                    {g.recursos.map((r) => (
                      <tr key={r.recurso}>
                        <td>{r.etiqueta}</td>
                        {ROLES.map((rol) => (
                          <Celda key={rol} acciones={PERMISOS[rol][r.recurso]} />
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Check size={20} className="text-ok" /> ver
            </span>
            <span className="inline-flex items-center gap-1">
              <Pencil size={20} className="text-primary" /> editar
            </span>
            <span className="inline-flex items-center gap-1">
              <PenLine size={20} className="text-warn" /> firmar (decisión con responsabilidad)
            </span>
            <span>Celda vacía = sin acceso</span>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Nadie, con ningún rol, puede editar ni borrar el historial de auditoría. El rol "sede"
            queda previsto sin implementar.
          </p>
        </section>
      </PanelLayout>
    </RutaProtegida>
  );
}
