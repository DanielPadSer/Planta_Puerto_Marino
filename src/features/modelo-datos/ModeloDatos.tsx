import { useEffect, useMemo, useState } from "react";
import { Database, Table2, Link2, ShieldCheck, Download, HardDrive, Trash2, Search, ArrowRight } from "lucide-react";
import { PanelLayout } from "@/app/PanelLayout";
import { Button } from "@/components/ui/button";
import { EstadoChip, KPIs, TabsPanel } from "@/features/panel-calidad/ui";
import { CLASES, MODULOS, NOMBRES, RELACIONES, definicion, tablasDe, type NombreTabla } from "@/modelo/esquema";
import { SEMILLA } from "@/modelo/semilla";
import { filas, impacto, integridad, saldos, trazarPaquete, type NodoLote } from "@/modelo/consultas";
import { generarSQL } from "@/modelo/sql";
import { cargarEnNavegador, contarEnNavegador, vaciarNavegador } from "@/modelo/db";
import { cn } from "@/lib/utils";

const TABS = ["Módulos y tablas", "Trazabilidad", "Integridad", "Almacenamiento y exportación"] as const;
const TONO = { K: "primary", C: "ok", S: "muted", R: "warn", V: "muted" } as const;

function descargar(nombre: string, contenido: string, tipo: string) {
  const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

export function ModeloDatos() {
  const [tab, setTab] = useState<string>(TABS[0]);
  const problemas = useMemo(() => integridad(SEMILLA), []);
  const totalFilas = NOMBRES.reduce((s, n) => s + filas(SEMILLA, n).length, 0);
  return (
    <PanelLayout title="Modelo de datos" subtitle="65 tablas y 1 vista en 7 módulos · datos de ejemplo" active="/panel/modelo-datos">
      <KPIs
        items={[
          { label: "Tablas", value: NOMBRES.filter((n) => definicion(n).clase !== "V").length, icon: <Table2 size={20} /> },
          { label: "Relaciones", value: RELACIONES.filter((r) => !r.comun).length, icon: <Link2 size={20} /> },
          { label: "Registros de ejemplo", value: totalFilas, icon: <Database size={20} /> },
          { label: "Problemas de integridad", value: problemas.length, icon: <ShieldCheck size={20} />, danger: problemas.length > 0 },
        ]}
      />
      <p className="text-xs text-muted-foreground my-3">Valores de ejemplo: los reales los define la ingeniería de alimentos.</p>
      <TabsPanel tabs={TABS} value={tab} onChange={setTab} />
      <div className="mt-4">
        {tab === TABS[0] && <Explorador />}
        {tab === TABS[1] && <Trazabilidad />}
        {tab === TABS[2] && <Integridad problemas={problemas} />}
        {tab === TABS[3] && <Almacenamiento />}
      </div>
    </PanelLayout>
  );
}

function Explorador() {
  const [sel, setSel] = useState<NombreTabla>("Lote");
  const [q, setQ] = useState("");
  const def = definicion(sel);
  const entrantes = RELACIONES.filter((r) => r.hacia === sel && !r.comun);
  const muestras = filas(sel === "SaldoLote" ? { ...SEMILLA, SaldoLote: saldos(SEMILLA.Movimiento) } : SEMILLA, sel).slice(0, 5);
  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="panel-surface p-4 max-h-[720px] overflow-auto">
        <label className="panel-search mb-3">
          <Search size={20} />
          <input aria-label="Buscar tabla" placeholder="Buscar tabla…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        {MODULOS.map((m) => {
          const lista = tablasDe(m.id).filter((n) => n.toLowerCase().includes(q.toLowerCase()));
          if (!lista.length) return null;
          return (
            <div key={m.id} className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                {m.nombre} · {lista.length}
              </p>
              {lista.map((n) => (
                <Button key={n} variant="ghost" onClick={() => setSel(n)} className={cn("w-full justify-between min-h-12", sel === n && "bg-primary-soft text-primary")}>
                  <span className="font-mono text-sm">{n}</span>
                  <EstadoChip tono={TONO[definicion(n).clase]}>{definicion(n).clase}</EstadoChip>
                </Button>
              ))}
            </div>
          );
        })}
      </aside>
      <section className="panel-surface p-5 space-y-5 min-w-0">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold font-mono">{sel}</h2>
            <p className="text-sm text-muted-foreground">{def.descripcion}</p>
            <p className="text-xs text-muted-foreground font-mono mt-1">{def.base}</p>
          </div>
          <EstadoChip tono={TONO[def.clase]}>{CLASES[def.clase]}</EstadoChip>
        </header>
        <div className="panel-table-wrap">
          <table className="panel-table">
            <thead>
              <tr><th>Campo</th><th>Tipo</th><th>Restricciones</th><th>Relación</th></tr>
            </thead>
            <tbody>
              {Object.entries(def.campos).map(([campo, c]) => (
                <tr key={campo} className={c.comun ? "opacity-60" : ""}>
                  <td className="font-mono">{campo}{c.nulo ? "?" : ""}</td>
                  <td className="font-mono text-xs">{c.sql}</td>
                  <td className="space-x-1">
                    {c.pk && <EstadoChip tono="primary">PK</EstadoChip>}
                    {c.unico && <EstadoChip tono="primary">UQ</EstadoChip>}
                    {!c.nulo && !c.pk && <EstadoChip tono="muted">Obligatorio</EstadoChip>}
                    {c.comun && <EstadoChip tono="muted">{c.comun === "captura" ? "Común de captura" : "Versión de catálogo"}</EstadoChip>}
                  </td>
                  <td>
                    {c.ref ? (
                      <Button variant="link" className="p-0 h-auto font-mono" onClick={() => setSel(c.ref as NombreTabla)}>
                        → {c.ref}
                      </Button>
                    ) : c.tipo === "uuid" && !c.pk ? <span className="text-xs text-muted-foreground">Referencia variable</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {entrantes.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">La usan ({entrantes.length})</h3>
            <div className="flex flex-wrap gap-2">
              {entrantes.map((r) => (
                <Button key={`${r.desde}.${r.campo}`} variant="outline" className="min-h-12 font-mono text-xs" onClick={() => setSel(r.desde)}>
                  {r.desde}.{r.campo}
                </Button>
              ))}
            </div>
          </div>
        )}
        <div>
          <h3 className="font-semibold mb-2">Registros de ejemplo ({muestras.length})</h3>
          {muestras.length ? (
            <pre className="text-xs font-mono bg-muted rounded-xl p-3 overflow-auto max-h-72">{JSON.stringify(muestras, null, 2)}</pre>
          ) : (
            <p className="empty-state">Sin registros de ejemplo.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function Nodo({ n, nivel = 0 }: { n: NodoLote; nivel?: number }) {
  return (
    <div className={cn("border-l-2 border-primary/40 pl-4 space-y-2", nivel > 0 && "mt-3")}>
      <div className="flex flex-wrap items-center gap-2">
        <strong className="font-mono">{n.lote.codigo}</strong>
        <span>{n.producto}</span>
        <EstadoChip tono={n.lote.estado_calidad === "liberado" ? "ok" : n.lote.estado_calidad === "rechazado" ? "danger" : "warn"}>{n.lote.estado_calidad}</EstadoChip>
        {n.kg !== null && <EstadoChip tono="muted">{n.kg.toLocaleString("es-CO")} kg usados</EstadoChip>}
      </div>
      {n.recepcion && (
        <p className="text-sm text-muted-foreground">
          Recepción <b className="font-mono">{n.recepcion.codigo}</b> · {n.proveedor?.nombre} · lote proveedor {n.linea?.lote_proveedor} · {n.linea?.temperatura_c} °C ·{" "}
          {n.pesajes.map((p) => `${p.neto_kg} kg ${p.origen === "manual" ? "(manual autorizado)" : "(báscula estable)"}`).join(" + ")}
        </p>
      )}
      {n.controles.map((c) => (
        <p key={c.id} className="text-sm">
          Control de {c.tipo_control} · regla v{c.version_regla} · final {c.temp_final_c} °C{c.temp_centro_c !== null ? ` · centro ${c.temp_centro_c} °C` : ""} ·{" "}
          <EstadoChip tono={c.resultado === "conforme" ? "ok" : "danger"}>{c.resultado.replace("_", " ")}</EstadoChip>
        </p>
      ))}
      {n.equipos.map((e) => (
        <p key={e.uso.id} className="text-sm text-muted-foreground">
          Equipo {e.equipo.nombre}{e.limpieza ? ` · limpieza ${e.limpieza.nivel} liberada` : ""}
        </p>
      ))}
      {n.noConformidades.map((nc) => (
        <p key={nc.id} className="text-sm text-danger">{nc.codigo} · {nc.descripcion}</p>
      ))}
      {n.historial.map((h) => (
        <p key={h.id} className="text-xs text-muted-foreground">{h.estado_anterior} → {h.estado_nuevo} · {h.motivo}</p>
      ))}
      {n.origenes.map((o) => <Nodo key={o.lote.id} n={o} nivel={nivel + 1} />)}
    </div>
  );
}

function Trazabilidad() {
  const [codigo, setCodigo] = useState("PQ-0301-0001");
  const [lote, setLote] = useState("LT-0238");
  const traza = trazarPaquete(SEMILLA, codigo);
  const afectados = impacto(SEMILLA, lote);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="panel-surface p-5 space-y-4">
        <h2 className="font-semibold text-lg">Hacia atrás: desde un paquete</h2>
        <div className="flex flex-wrap gap-2">
          {SEMILLA.Paquete.map((p) => (
            <Button key={p.id} variant={p.codigo === codigo ? "default" : "outline"} className="min-h-12 font-mono" onClick={() => setCodigo(p.codigo)}>{p.codigo}</Button>
          ))}
        </div>
        <input aria-label="Código de paquete" className="panel-input font-mono" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
        {traza ? (
          <div className="space-y-4">
            <Nodo n={traza.arbol} />
            <div className="text-sm space-y-1">
              {traza.remisiones.map((r) => (
                <p key={r.remision.id} className="flex items-center gap-2"><ArrowRight size={20} /> {r.remision.codigo} a {r.sede} · {r.remision.temperatura_c} °C{r.recibido ? ` · recibido a ${r.recibido.temperatura_c} °C` : ""}</p>
              ))}
              {traza.lecturas.map((l) => (
                <p key={l.id} className={l.fuera_de_rango ? "text-danger" : "text-muted-foreground"}>Lectura {l.medido_en.slice(11, 16)} · {l.temperatura_c} °C{l.fuera_de_rango ? " · fuera de rango" : ""}</p>
              ))}
              {traza.etiquetas.map((e) => (
                <p key={e.id} className="text-muted-foreground font-mono text-xs">{e.codigo}{e.es_reimpresion ? ` · reimpresión: ${e.motivo_reimpresion}` : ""}</p>
              ))}
            </div>
          </div>
        ) : (
          <p className="empty-state">No se encontró el paquete.</p>
        )}
      </section>
      <section className="panel-surface p-5 space-y-4">
        <h2 className="font-semibold text-lg">Hacia adelante: impacto de un lote</h2>
        <div className="flex flex-wrap gap-2">
          {SEMILLA.Lote.map((l) => (
            <Button key={l.id} variant={l.codigo === lote ? "default" : "outline"} className="min-h-12 font-mono" onClick={() => setLote(l.codigo)}>{l.codigo}</Button>
          ))}
        </div>
        {afectados ? (
          <div className="space-y-2 text-sm">
            <p><b>Lotes:</b> <span className="font-mono">{afectados.lotes.map((l) => l.codigo).join(", ")}</span></p>
            <p><b>Paquetes:</b> <span className="font-mono">{afectados.paquetes.map((p) => `${p.codigo} (${p.estado})`).join(", ") || "—"}</span></p>
            <p><b>Remisiones:</b> <span className="font-mono">{afectados.remisiones.map((r) => r.codigo).join(", ") || "—"}</span></p>
            <p><b>Sedes:</b> {afectados.sedes.join(", ") || "—"}</p>
          </div>
        ) : (
          <p className="empty-state">No se encontró el lote.</p>
        )}
        <h3 className="font-semibold pt-2">Saldos por ubicación (vista SaldoLote)</h3>
        <div className="panel-table-wrap">
          <table className="panel-table">
            <thead><tr><th>Lote</th><th>Ubicación</th><th>Saldo</th></tr></thead>
            <tbody>
              {saldos(SEMILLA.Movimiento).map((s) => (
                <tr key={s.id}>
                  <td className="font-mono">{SEMILLA.Lote.find((l) => l.id === s.lote_id)?.codigo}</td>
                  <td>{SEMILLA.Ubicacion.find((u) => u.id === s.ubicacion_id)?.codigo}</td>
                  <td>{s.saldo_kg.toLocaleString("es-CO", { minimumFractionDigits: 1 })} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Integridad({ problemas }: { problemas: ReturnType<typeof integridad> }) {
  return (
    <section className="panel-surface p-5 space-y-3">
      <h2 className="font-semibold text-lg">Revisión de llaves, campos obligatorios y valores únicos</h2>
      {problemas.length === 0 ? (
        <p className="flex items-center gap-2 text-ok"><ShieldCheck size={20} /> Todos los registros de ejemplo cumplen el modelo.</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {problemas.map((p) => (
            <li key={`${p.tabla}.${p.id}.${p.campo}`} className="text-danger font-mono">{p.tabla}.{p.campo} ({p.id}): {p.detalle}</li>
          ))}
        </ul>
      )}
      <div className="grid gap-2 md:grid-cols-2 text-sm text-muted-foreground">
        <p>Cada registro de captura guarda quién, en qué dispositivo y a qué hora.</p>
        <p>Los pesos manuales exigen supervisor y motivo; los de báscula, lectura estable.</p>
        <p>Los saldos se calculan desde los movimientos; nunca se editan a mano.</p>
        <p>Reglas, recetas y matriz conservan su versión en cada lote producido.</p>
      </div>
    </section>
  );
}

function Almacenamiento() {
  const [conteo, setConteo] = useState<Record<string, number>>({});
  const [mensaje, setMensaje] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const refrescar = () => contarEnNavegador().then(setConteo).catch(() => setConteo({}));
  useEffect(() => {
    void refrescar();
  }, []);
  const total = Object.values(conteo).reduce((s, n) => s + n, 0);
  const ejecutar = async (accion: () => Promise<string>) => {
    setOcupado(true);
    try {
      setMensaje(await accion());
      await refrescar();
    } catch {
      setMensaje("No se pudo completar la operación en este navegador.");
    } finally {
      setOcupado(false);
    }
  };
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="panel-surface p-5 space-y-4">
        <h2 className="font-semibold text-lg flex items-center gap-2"><HardDrive size={20} /> Base local del navegador</h2>
        <p className="text-sm text-muted-foreground">Base separada de la que usan las estaciones; cargarla o vaciarla no cambia ninguna otra pantalla.</p>
        <p className="text-2xl font-semibold">{total} registros guardados</p>
        <div className="flex flex-wrap gap-2">
          <Button className="min-h-12" disabled={ocupado} onClick={() => ejecutar(async () => `Se guardaron ${await cargarEnNavegador(SEMILLA)} registros.`)}>
            <Database size={20} /> Cargar datos de ejemplo
          </Button>
          <Button variant="outline" className="min-h-12" disabled={ocupado} onClick={() => ejecutar(async () => { await vaciarNavegador(); return "Base local vaciada."; })}>
            <Trash2 size={20} /> Vaciar
          </Button>
        </div>
        {mensaje && <p role="status" className="text-sm text-primary">{mensaje}</p>}
      </section>
      <section className="panel-surface p-5 space-y-4">
        <h2 className="font-semibold text-lg flex items-center gap-2"><Download size={20} /> Exportar</h2>
        <p className="text-sm text-muted-foreground">Esquema PostgreSQL con llaves, restricciones, vista de saldos y datos de ejemplo, listo para una base central futura.</p>
        <div className="flex flex-wrap gap-2">
          <Button className="min-h-12" onClick={() => descargar("puerto-marino-modelo.sql", generarSQL(SEMILLA), "text/sql")}>
            <Download size={20} /> Descargar SQL
          </Button>
          <Button variant="outline" className="min-h-12" onClick={() => descargar("puerto-marino-datos.json", JSON.stringify(SEMILLA, null, 2), "application/json")}>
            <Download size={20} /> Descargar datos JSON
          </Button>
        </div>
      </section>
    </div>
  );
}
