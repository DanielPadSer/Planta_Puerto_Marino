import { useState } from "react";
import {
  LockKeyhole,
  ClipboardCheck,
  CircleAlert,
  CalendarClock,
  Check,
  X,
  FileText,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PanelLayout } from "@/app/PanelLayout";
import { useCalidad } from "./store";
import { AVISOS } from "@/mocks/calidad";
import { BotonRestringido, usePuede, useRol } from "@/ui/permisos";
import { ejecutarEscritura } from "@/mocks/servicios";
import { ErrorPermiso } from "@/domain/permisos";
import {
  KPIs,
  Tabla,
  TabsPanel,
  EstadoChip,
  MotivoForm,
  Buscador,
  useConexion,
  EjemploPanel,
} from "./ui";
import { useCuarta } from "./cuartaStore";
import { documentoActivo, vigenciaDocumento, fechaCO } from "@/domain/cuartaFase";
import { HOY_DEMO } from "@/mocks/cuartaFase";
export function Bandeja() {
  const personal = useCuarta(s => s.personal);
  const diasAviso = useCuarta(s => s.diasAviso);
  const avisosDocumentales = personal.flatMap(o => (["certificado_medico", "capacitacion_bpm"] as const).flatMap(tipo => {
    const doc = documentoActivo(o, tipo);
    const estado = doc ? vigenciaDocumento(doc, HOY_DEMO, diasAviso) : "sin_documento";
    return estado === "vigente" ? [] : [{ id: `${o.id}-${tipo}`, nombre: o.nombre, tipo: tipo === "certificado_medico" ? "Certificado médico" : "Capacitación BPM", detalle: doc ? `${estado === "vencido" ? "Vencido" : "Por vencer"} · ${fechaCO(doc.venceEn)}` : "Sin documento" }];
  }));
  const { lotes, decidir, conflictos, pesajesManuales, resolverConflicto, revisarPesaje } = useCalidad();
  const rol = useRol();
  const puedeFirmarCuarentenas = usePuede("firmar", "bandeja.cuarentenas");
  const puedeFirmarConflictos = usePuede("firmar", "bandeja.conflictosSync");
  const puedeFirmarPesajes = usePuede("firmar", "bandeja.pesajesManuales");
  const [tab, setTab] = useState("Cuarentenas");
  const [selected, setSelected] = useState("LT-0245");
  const [search, setSearch] = useState("");
  const [rechazar, setRechazar] = useState(false);
  const [conflictoSel, setConflictoSel] = useState<string | null>(null);
  const [accionConflicto, setAccionConflicto] = useState<"ajuste" | "descartar">("ajuste");
  const [ajuste, setAjuste] = useState("");
  const [pesajeSel, setPesajeSel] = useState<string | null>(null);
  const online = useConexion();
  const lote = lotes.find((l) => l.id === selected);
  const cuarentenas = lotes.filter((l) => l.estado === "Cuarentena");
  const filtered = cuarentenas.filter((l) =>
    `${l.id} ${l.producto} ${l.motivo}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <PanelLayout
      title="Bandeja de decisiones"
      subtitle="Lo que necesita tu decisión hoy"
      active="/panel/bandeja"
    >
      <KPIs
        items={[
          {
            label: "Lotes en cuarentena",
            value: cuarentenas.length,
            icon: <LockKeyhole size={20} />,
          },
          { label: "Limpiezas por verificar", value: 2, icon: <ClipboardCheck size={20} /> },
          {
            label: "No conformidades abiertas",
            value: 4,
            icon: <CircleAlert size={20} />,
            danger: true,
          },
          { label: "Avisos de calibración", value: 2, icon: <CalendarClock size={20} /> },
        ]}
      />
      <div className="decision-grid">
        <section className="panel-surface decision-list">
          <TabsPanel
            tabs={[
              "Cuarentenas",
              "Limpiezas por verificar",
              "No conformidades",
              "Bloqueados",
              "Conflictos de sincronización",
              "Pesajes manuales",
              "Avisos",
            ]}
            value={tab}
            onChange={setTab}
          />
          <div className="p-4">
            <Buscador
              value={search}
              onChange={setSearch}
              placeholder="Buscar lote, producto o motivo…"
            />
          </div>
          {tab === "Cuarentenas" ? (
            <>
              <p className="table-note">
                {cuarentenas.length} lotes retenidos para validación técnica
              </p>
              <Tabla
                data={filtered}
                selected={selected}
                onSelect={(l) => {
                  setSelected(l.id);
                  setRechazar(false);
                }}
                cols={[
                  {
                    key: "id",
                    label: "Lote",
                    render: (l) => (
                      <span className="space-y-1">
                        <span className="block font-mono text-primary">{l.id}</span>
                        <EstadoChip tono="warn">Cuarentena</EstadoChip>
                      </span>
                    ),
                  },
                  {
                    key: "producto",
                    label: "Producto",
                    render: (l) => (
                      <span>
                        <b>{l.producto}</b>
                        <small className="block text-muted-foreground mt-1">
                          {l.kg} kg · Regla v{l.version}
                        </small>
                      </span>
                    ),
                  },
                  { key: "motivo", label: "Motivo" },
                  {
                    key: "medicion",
                    label: "Medición vs. límite",
                    render: (l) => <span className="measurement-bad">{l.medicion}</span>,
                  },
                  { key: "hora", label: "Ingreso" },
                ]}
              />
            </>
          ) : tab === "Conflictos de sincronización" ? (
            <>
              <p className="table-note">
                Eventos que llegaron en conflicto desde los dispositivos · los resuelve el
                supervisor
              </p>
              <Tabla
                data={conflictos.filter((c) =>
                  `${c.evento} ${c.dispositivo} ${c.operario}`.toLowerCase().includes(search.toLowerCase()),
                )}
                cols={[
                  { key: "id", label: "Registro" },
                  { key: "evento", label: "Evento" },
                  { key: "dispositivo", label: "Dispositivo" },
                  { key: "operario", label: "Operario" },
                  { key: "hora", label: "Hora" },
                  { key: "motivo", label: "Motivo del conflicto" },
                  {
                    key: "estado",
                    label: "Estado",
                    render: (c) => (
                      <EstadoChip tono={c.estado === "Pendiente" ? "warn" : "ok"}>{c.estado}</EstadoChip>
                    ),
                  },
                  {
                    key: "acciones",
                    label: "Acciones",
                    render: (c) =>
                      c.estado === "Pendiente" ? (
                        <span className="flex flex-wrap gap-2">
                          <BotonRestringido
                            accion="firmar"
                            recurso="bandeja.conflictosSync"
                            className="min-h-12"
                            onClick={() => {
                              setConflictoSel(c.id);
                              setAccionConflicto("ajuste");
                              setAjuste("");
                            }}
                          >
                            Aplicar con ajuste y motivo
                          </BotonRestringido>
                          <BotonRestringido
                            accion="firmar"
                            recurso="bandeja.conflictosSync"
                            variant="outline"
                            className="min-h-12 text-danger border-danger/30"
                            onClick={() => {
                              setConflictoSel(c.id);
                              setAccionConflicto("descartar");
                            }}
                          >
                            Descartar
                          </BotonRestringido>
                        </span>
                      ) : (
                        <small className="text-muted-foreground">Resuelto · en historial</small>
                      ),
                  },
                ]}
              />
            </>
          ) : tab === "Pesajes manuales" ? (
            <>
              <p className="table-note">
                Pesajes digitados a mano con autorización por PIN · el supervisor los marca como
                revisados
              </p>
              <Tabla
                data={pesajesManuales.filter((p) =>
                  `${p.lote} ${p.operario} ${p.motivo}`.toLowerCase().includes(search.toLowerCase()),
                )}
                cols={[
                  { key: "id", label: "ID pesaje" },
                  { key: "lote", label: "Lote", render: (p) => <code>{p.lote}</code> },
                  { key: "peso", label: "Peso" },
                  { key: "operario", label: "Operario" },
                  { key: "motivo", label: "Motivo" },
                  { key: "autorizo", label: "Autorizó" },
                  {
                    key: "estado",
                    label: "Estado",
                    render: (p) => (
                      <EstadoChip tono={p.estado === "Pendiente" ? "warn" : "ok"}>{p.estado}</EstadoChip>
                    ),
                  },
                  {
                    key: "acciones",
                    label: "Acción",
                    render: (p) =>
                      p.estado === "Pendiente" ? (
                        <BotonRestringido
                          accion="firmar"
                          recurso="bandeja.pesajesManuales"
                          variant="outline"
                          className="min-h-12"
                          onClick={() => setPesajeSel(p.id)}
                        >
                          Marcar como revisado
                        </BotonRestringido>
                      ) : (
                        <small className="text-muted-foreground">Revisado · en historial</small>
                      ),
                  },
                ]}
              />
            </>
          ) : tab === "Avisos" ? (
            <Tabla
              data={[...AVISOS, ...avisosDocumentales].filter((a) =>
                `${a.nombre} ${a.detalle}`.toLowerCase().includes(search.toLowerCase()),
              )}
              cols={[
                { key: "nombre", label: "Equipo / persona" },
                { key: "tipo", label: "Tipo" },
                {
                  key: "detalle",
                  label: "Vencimiento",
                  render: (a) => <EstadoChip tono="warn">{a.detalle}</EstadoChip>,
                },
              ]}
            />
          ) : (
            <Tabla
              data={(tab === "Limpiezas por verificar"
                ? [
                    {
                      id: "LIM-014",
                      nombre: "Marmita 2",
                      motivo: "Verificación de limpieza N2",
                      estado: "Por verificar",
                    },
                    {
                      id: "LIM-015",
                      nombre: "Marinador 1",
                      motivo: "Cambio de perfil de alérgenos",
                      estado: "Por verificar",
                    },
                  ]
                : tab === "Bloqueados"
                  ? [
                      {
                        id: "EQ-06",
                        nombre: "Tina de enfriamiento",
                        motivo: "Mantenimiento pendiente",
                        estado: "Bloqueado",
                      },
                    ]
                  : [
                      {
                        id: "NC-014",
                        nombre: "LT-0250",
                        motivo: "Olor atípico",
                        estado: "Abierta",
                      },
                      {
                        id: "NC-015",
                        nombre: "CF-2",
                        motivo: "Temperatura fuera de rango",
                        estado: "Abierta",
                      },
                      {
                        id: "NC-016",
                        nombre: "Báscula Cocina",
                        motivo: "Modelo por confirmar",
                        estado: "Abierta",
                      },
                      {
                        id: "NC-017",
                        nombre: "LT-0253",
                        motivo: "Diferencia con factura",
                        estado: "Abierta",
                      },
                    ]
              ).filter((a) =>
                `${a.nombre} ${a.motivo}`.toLowerCase().includes(search.toLowerCase()),
              )}
              cols={[
                { key: "id", label: "Registro" },
                { key: "nombre", label: "Lote / equipo" },
                { key: "motivo", label: "Motivo" },
                {
                  key: "estado",
                  label: "Estado",
                  render: (a) => <EstadoChip tono="warn">{a.estado}</EstadoChip>,
                },
              ]}
            />
          )}
          <div className="list-footer">
            <ShieldCheck size={20} />
            Cada decisión queda registrada con firma, dispositivo y hora.
          </div>
        </section>
        <aside className="panel-surface decision-detail">
          {lote ? (
            <>
              <div className="flex justify-between gap-3">
                <h2>Detalle del lote {lote.id}</h2>
                <EstadoChip
                  tono={
                    lote.estado === "Cuarentena"
                      ? "warn"
                      : lote.estado === "Liberado"
                        ? "ok"
                        : "danger"
                  }
                >
                  {lote.estado === "Cuarentena" ? "En revisión" : lote.estado}
                </EstadoChip>
              </div>
              <div className="detail-two">
                <div>
                  <small>PROVEEDOR</small>
                  <b>{lote.proveedor}</b>
                </div>
                <div>
                  <small>TEMP. / MEDICIÓN</small>
                  <b className="text-danger">{lote.medicion}</b>
                </div>
              </div>
              <h3>INSPECCIÓN TÉCNICA</h3>
              <p className="detail-box">
                {lote.motivo}. Revisar evidencia de recepción y contramuestra antes de decidir.
                Termómetro calibrado · revisión organoléptica registrada.
              </p>
              <h3>DOCUMENTOS Y FOTOS DEL PROVEEDOR</h3>
              <Button
                variant="outline"
                className="document-button"
                onClick={() => toast.info("Documento simulado · Guía sanitaria AQS-8841")}
              >
                <FileText size={20} />
                Guía sanitaria AQS-8841.pdf
              </Button>
              <h3>TRAZABILIDAD</h3>
              <p className="detail-box">
                Recepción R-01 · {lote.kg} kg · Regla aprobada v{lote.version}
                <br />
                Operario: Carlos Mendoza · Tablet Recepción 01
              </p>
              {lote.estado === "Cuarentena" ? (
                puedeFirmarCuarentenas ? (
                  <>
                    <MotivoForm
                      key={`${lote.id}-${rechazar}`}
                      rechazo={rechazar}
                      danger={rechazar}
                      label={rechazar ? "Rechazar y registrar destino" : "Liberar lote"}
                      onSubmit={(d) => {
                        try {
                          const error = ejecutarEscritura(rol, "firmar", "bandeja.cuarentenas", () =>
                            decidir(lote.id, d.motivo, online, rechazar, d.destino ?? ""),
                          );
                          if (error) toast.error(error);
                          else
                            toast.success(
                              `Lote ${lote.id} ${rechazar ? "rechazado" : "liberado"} · decisión registrada`,
                            );
                        } catch (e) {
                          toast.error(e instanceof ErrorPermiso ? e.message : "No fue posible decidir.");
                        }
                      }}
                    >
                      <p className="connection-warning">
                        <CircleAlert size={20} />
                        Liberar un lote exige conexión
                      </p>
                    </MotivoForm>
                    <Button
                      variant="outline"
                      className="mt-2 w-full min-h-12 text-danger border-danger/30"
                      onClick={() => setRechazar(!rechazar)}
                    >
                      {rechazar ? <Check size={20} /> : <X size={20} />}{" "}
                      {rechazar ? "Volver a liberación" : "Rechazar y registrar destino"}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="detail-box">
                      Pendiente de decisión de la ingeniera de alimentos. Tu rol puede consultar el
                      estado, pero no liberar ni rechazar lotes.
                    </p>
                    <div className="mt-3 space-y-2">
                      <BotonRestringido
                        accion="firmar"
                        recurso="bandeja.cuarentenas"
                        className="w-full min-h-12"
                      >
                        Liberar lote
                      </BotonRestringido>
                      <BotonRestringido
                        accion="firmar"
                        recurso="bandeja.cuarentenas"
                        variant="outline"
                        className="w-full min-h-12 text-danger border-danger/30"
                      >
                        Rechazar y registrar destino
                      </BotonRestringido>
                    </div>
                  </>
                )
              ) : (
                <p className="detail-box text-ok">
                  Decisión registrada en el historial. Se conserva la regla v{lote.version}.
                </p>
              )}
              <EjemploPanel />
            </>
          ) : (
            <p>Selecciona un lote</p>
          )}
        </aside>
      </div>
      <div className="calibration-strip">
        <CalendarClock size={20} />
        <strong>Próximos vencimientos</strong>
        {AVISOS.map((a) => (
          <span key={a.id}>
            {a.nombre}
            <EstadoChip tono={a.tipo === "Calibración" ? "warn" : "primary"}>
              {a.detalle.split("·")[1]}
            </EstadoChip>
          </span>
        ))}
        <Button variant="link" onClick={() => setTab("Avisos")}>
          Ver avisos <ChevronRight size={20} />
        </Button>
      </div>
      <Dialog
        open={!!conflictoSel}
        onOpenChange={(o) => {
          if (!o) setConflictoSel(null);
        }}
      >
        <DialogContent className="cuarta-dialog bg-surface">
          <DialogTitle>
            {accionConflicto === "ajuste" ? "Aplicar con ajuste" : "Descartar evento"} ·{" "}
            {conflictoSel}
          </DialogTitle>
          <DialogDescription>
            La resolución queda en el historial con tu usuario y rol.
          </DialogDescription>
          <MotivoForm
            danger={accionConflicto === "descartar"}
            label={accionConflicto === "ajuste" ? "Aplicar ajuste" : "Confirmar descarte"}
            onSubmit={(d) => {
              if (!conflictoSel) return;
              try {
                const error = ejecutarEscritura(rol, "firmar", "bandeja.conflictosSync", () =>
                  resolverConflicto(conflictoSel, accionConflicto, ajuste, d.motivo),
                );
                if (error) {
                  toast.error(error);
                  return;
                }
                toast.success("Conflicto resuelto y registrado");
                setConflictoSel(null);
              } catch (e) {
                toast.error(e instanceof ErrorPermiso ? e.message : "No fue posible resolver.");
              }
            }}
          >
            {accionConflicto === "ajuste" && (
              <label className="field-label">
                Ajuste aplicado <span className="text-danger">* obligatorio</span>
                <input
                  className="panel-input"
                  value={ajuste}
                  onChange={(e) => setAjuste(e.target.value)}
                  placeholder="Ej. se conserva el primer pesaje y se anula el duplicado"
                />
              </label>
            )}
          </MotivoForm>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!pesajeSel}
        onOpenChange={(o) => {
          if (!o) setPesajeSel(null);
        }}
      >
        <DialogContent className="cuarta-dialog bg-surface">
          <DialogTitle>Marcar pesaje como revisado · {pesajeSel}</DialogTitle>
          <DialogDescription>Revisión del supervisor con motivo obligatorio.</DialogDescription>
          <MotivoForm
            label="Confirmar revisión"
            onSubmit={(d) => {
              if (!pesajeSel) return;
              try {
                const error = ejecutarEscritura(rol, "firmar", "bandeja.pesajesManuales", () =>
                  revisarPesaje(pesajeSel, d.motivo),
                );
                if (error) {
                  toast.error(error);
                  return;
                }
                toast.success("Pesaje marcado como revisado");
                setPesajeSel(null);
              } catch (e) {
                toast.error(e instanceof ErrorPermiso ? e.message : "No fue posible revisar.");
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </PanelLayout>
  );
}
