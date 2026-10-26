import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ShieldCheck,
  CircleAlert,
  Store,
  Check,
  LockKeyhole,
  ChevronLeft,
  ChevronRight,
  Plus,
  Fish,
  Wheat,
  Egg,
  Milk,
  Nut,
  Bean,
  Shell,
  Printer,
  Download,
  FileText,
  Save,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PanelLayout } from "@/app/PanelLayout";
import { Logo } from "@/ui/logo";
import { KPIs, Tabla, Buscador, EstadoChip, MotivoForm, EjemploPanel } from "./ui";
import { DrawerCuarta, ToggleCuarta, Notice } from "./cuartaUi";
import { useCuarta, auditarCuarta } from "./cuartaStore";
import { useCalidad } from "./store";
import {
  leyendaContiene,
  alergenosDeReceta,
  validarReceta,
  validarTrazas,
  fechaCO,
  type Alergeno,
  type Perfil,
} from "@/domain/cuartaFase";
const STEPS = [
  "Catálogo",
  "Perfiles",
  "Recetas y kits",
  "Etiqueta y trazas",
  "Trazabilidad e impacto",
];
const ICONS = [Wheat, Shell, Egg, Fish, Nut, Bean, Milk, Nut];
function CodigoBarras({ codigo }: { codigo: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    let cancelled = false;
    void import("jsbarcode").then(({ default: JsBarcode }) => {
      if (ref.current && !cancelled)
        JsBarcode(ref.current, codigo, {
          format: "CODE128",
          height: 38,
          width: 1,
          displayValue: false,
          margin: 0,
        });
    });
    return () => {
      cancelled = true;
    };
  }, [codigo]);
  return <svg ref={ref} aria-label={`Código de barras ${codigo}`} className="label-barcode" />;
}
export function Alergenos({ paso = 1 }: { paso?: number }) {
  const s = useCuarta();
  const navigate = useNavigate();
  const eventos = useCalidad((v) => v.eventos);
  const [draft, setDraft] = useState<Alergeno | null>(null);
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState("Todos");
  const [perfilId, setPerfilId] = useState("PR-01");
  const [perfilDraft, setPerfilDraft] = useState<Perfil | null>(null);
  const [recetaId, setRecetaId] = useState("REC-01");
  const [motivoReceta, setMotivoReceta] = useState("");
  const [trazas, setTrazas] = useState(false);
  const [justificacion, setJustificacion] = useState("");
  const [norma, setNorma] = useState("Res. 5109 de 2005 · por confirmar");
  const [loteId, setLoteId] = useState("LT-AL-001");
  const [confirm, setConfirm] = useState(false);
  const [motivoFinal, setMotivoFinal] = useState("");
  const perfil = s.perfiles.find((p) => p.id === perfilId);
  const editPerfil = perfilDraft ?? perfil;
  const receta = s.recetas.find((r) => r.id === recetaId);
  const calculados = receta ? alergenosDeReceta(receta, s.perfiles) : [];
  const faltante = receta?.componentes
    .map((c) => s.perfiles.find((p) => p.id === c.ingredienteId))
    .find((p) => p?.estadoFicha !== "validado");
  const lote = s.lotes.find((l) => l.id === loteId);
  const leyenda = lote
    ? leyendaContiene(
        s.versionesAlergenos.filter(
          (a, i, arr) =>
            lote.declarados.includes(a.id) && arr.findIndex((x) => x.id === a.id) === i,
        ),
      )
    : "";
  const ir = (n: number) =>
    navigate({ to: "/panel/catalogos/alergenos/paso/$paso", params: { paso: String(n) } });
  useEffect(() => {
    const b = s.borradores[`alergenos-${paso}`];
    if (!b || typeof b !== "object") return;
    if ("trazas" in b && typeof b.trazas === "boolean") setTrazas(b.trazas);
    if ("justificacion" in b && typeof b.justificacion === "string")
      setJustificacion(b.justificacion);
  }, [paso]);
  function guardarBorrador() {
    s.guardarBorrador(`alergenos-${paso}`, {
      draft,
      perfilDraft,
      recetaId,
      motivoReceta,
      trazas,
      justificacion,
      norma,
      loteId,
    });
    toast.success("Borrador guardado durante esta visita");
  }
  function continuar() {
    if (paso === 2 && s.perfiles.some((p) => p.estadoFicha === "sin_perfil")) {
      toast.error("Define los perfiles pendientes antes de validar y continuar.");
      return;
    }
    if (paso === 3 && receta) {
      const error = validarReceta(receta, s.perfiles);
      if (error) {
        toast.error(error);
        return;
      }
    }
    if (paso === 4) {
      const error = validarTrazas(trazas, justificacion);
      if (error) {
        toast.error(error);
        return;
      }
    }
    s.completar(paso);
    if (paso < 5) void ir(paso + 1);
  }
  const mostrarPerfil = (id: string) => {
    setPerfilId(id);
    setPerfilDraft(null);
  };
  async function exportar(tipo: "pdf" | "excel") {
    const rows = s.lotes.map((l) => ({
      Lote: l.id,
      Producto: l.producto,
      Fecha: fechaCO(l.fecha),
      Declarados: leyendaContiene(s.alergenos.filter((a) => l.declarados.includes(a.id))),
      Version: l.version,
      Estado: l.estado,
      Destino: l.destino,
    }));
    if (tipo === "excel") {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Lotes");
      XLSX.writeFile(wb, "reporte-alergenos-demo.xlsx");
    } else {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Puerto Marino - Alergenos", 15, 20);
      doc.setFontSize(10);
      doc.text("Reporte simulado - valores de ejemplo", 15, 30);
      rows.forEach((r, i) => {
        const y = 45 + i * 43;
        doc.text(`${r.Lote} | v${r.Version} | ${r.Estado}`, 15, y);
        doc.text(
          doc.splitTextToSize(`${r.Producto} - ${r.Declarados} - ${r.Destino}`, 175),
          15,
          y + 8,
        );
      });
      doc.save("reporte-alergenos-demo.pdf");
    }
  }
  return (
    <PanelLayout
      title="Alérgenos"
      subtitle="Qué contiene cada producto, cómo se declara en la etiqueta y cómo afecta la limpieza y el despacho"
      active="/panel/catalogos/alergenos"
    >
      <div className="cuarta-scope allergen-flow">
        <KPIs
          items={[
            {
              label: "Alérgenos activos",
              value: s.alergenos.filter((a) => a.activo).length,
              icon: <ShieldCheck />,
            },
            {
              label: "Sin perfil definido",
              value: s.perfiles.filter((p) => p.estadoFicha === "sin_perfil").length,
              icon: <CircleAlert />,
              danger: true,
            },
            { label: "Sedes exigen declaración", value: 2, icon: <Store /> },
          ]}
        />
        <nav className="allergen-steps" aria-label="Pasos de Alérgenos">
          {STEPS.map((nombre, i) => (
            <Button
              key={nombre}
              variant="ghost"
              className={`allergen-step ${paso === i + 1 ? "bg-primary-soft text-primary" : "text-muted-foreground"}`}
              onClick={() => void ir(i + 1)}
              aria-current={paso === i + 1 ? "step" : undefined}
            >
              <span className="step-number">
                {s.completados.includes(i + 1) ? <Check /> : i + 1}
              </span>
              <span>{nombre}</span>
              {i === 2 && s.perfiles.some((p) => p.estadoFicha === "sin_perfil") && (
                <LockKeyhole aria-label="Validación bloqueada" />
              )}
            </Button>
          ))}
        </nav>
        {paso === 1 ? (
          <>
            <Notice>
              <ShieldCheck />
              Catálogo normativo auditado: lo edita exclusivamente la ingeniería de alimentos; cada
              modificación genera una versión numerada con motivo obligatorio y no altera los lotes
              ya producidos.
            </Notice>
            <div className="allergen-cards">
              {s.alergenos.map((a, i) => {
                const Icon = ICONS[i] ?? ShieldCheck;
                return (
                  <article key={a.id} className="panel-surface p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="kpi-icon bg-primary-soft text-primary">
                        <Icon />
                      </span>
                      <ToggleCuarta
                        label={`Activo ${a.nombreRotulado}`}
                        checked={a.activo}
                        onChange={(v) => setDraft({ ...a, activo: v })}
                      />
                    </div>
                    <Button
                      variant="link"
                      className="h-auto min-h-12 p-0 text-foreground text-left justify-start whitespace-normal"
                      onClick={() => setDraft({ ...a })}
                    >
                      <span>
                        <small className="block font-mono text-muted-foreground">#{a.codigo}</small>
                        <strong className="block text-base">
                          {a.nombreRotulado === "Pescado"
                            ? "Pescado y productos derivados"
                            : a.nombreRotulado}
                        </strong>
                      </span>
                    </Button>
                    <p className="text-xs text-muted-foreground">{a.descripcion}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        {
                          s.perfiles.filter(
                            (p) => p.tipo === "Producto" && p.alergenoIds.includes(a.id),
                          ).length
                        }{" "}
                        prod ·{" "}
                        {
                          s.perfiles.filter(
                            (p) => p.tipo === "Ingrediente" && p.alergenoIds.includes(a.id),
                          ).length
                        }{" "}
                        ing
                      </span>
                      <EstadoChip tono={a.version > 1 ? "ok" : "warn"}>
                        {a.version > 1 ? `Validado v${a.version}` : "Por validar"}
                      </EstadoChip>
                    </div>
                  </article>
                );
              })}
              <Button
                variant="outline"
                className="min-h-36 border-dashed whitespace-normal"
                onClick={() =>
                  setDraft({
                    id: crypto.randomUUID(),
                    codigo: `ALG-${String(s.alergenos.length + 1).padStart(3, "0")}`,
                    nombreRotulado: "",
                    descripcion: "Alérgeno personalizado · por confirmar",
                    activo: true,
                    version: 0,
                    normaReferencia: norma,
                  })
                }
              >
                <Plus />
                Agregar alérgeno personalizado
              </Button>
            </div>
          </>
        ) : paso === 2 ? (
          <div className="allergen-split">
            <section className="panel-surface p-5">
              <div className="flex flex-wrap justify-between gap-3 mb-4">
                <h2>Cola de homologación · {s.perfiles.length} registros</h2>
                <EstadoChip tono="warn">
                  {s.perfiles.filter((p) => p.estadoFicha === "sin_perfil").length} pendientes
                </EstadoChip>
              </div>
              <Buscador
                value={search}
                onChange={setSearch}
                placeholder="Buscar producto o ingrediente…"
              />
              <div className="flex flex-wrap gap-1 my-4">
                {["Todos", "Productos", "Ingredientes", "Sin perfil", "Con riesgo cruzado"].map(
                  (f) => (
                    <Button
                      variant="ghost"
                      key={f}
                      className={f === filtro ? "bg-primary-soft text-primary" : ""}
                      onClick={() => setFiltro(f)}
                    >
                      {f}
                    </Button>
                  ),
                )}
              </div>
              <Tabla
                data={s.perfiles.filter(
                  (p) =>
                    `${p.nombre} ${p.codigo}`.toLowerCase().includes(search.toLowerCase()) &&
                    (filtro === "Todos" ||
                      (filtro === "Productos" && p.tipo === "Producto") ||
                      (filtro === "Ingredientes" && p.tipo === "Ingrediente") ||
                      (filtro === "Sin perfil" && p.estadoFicha === "sin_perfil") ||
                      (filtro === "Con riesgo cruzado" && p.riesgoCruzado)),
                )}
                selected={perfilId}
                onSelect={(p) => mostrarPerfil(p.id)}
                rowClassName={(p) => (p.estadoFicha === "sin_perfil" ? "bg-danger/8" : "")}
                cols={[
                  { key: "codigo", label: "Código" },
                  {
                    key: "nombre",
                    label: "Producto / ingrediente",
                    render: (p) => (
                      <span>
                        {p.nombre}
                        <small className="block text-muted-foreground">
                          {p.tipo}
                          {p.id === "ING-01" ? " · Bloquea 2 kits" : ""}
                        </small>
                      </span>
                    ),
                  },
                  {
                    key: "estadoFicha",
                    label: "Perfil",
                    render: (p) => (
                      <div className="space-y-2">
                        <EstadoChip
                          tono={
                            p.estadoFicha === "validado"
                              ? "ok"
                              : p.estadoFicha === "sin_perfil"
                                ? "danger"
                                : "warn"
                          }
                        >
                          {p.estadoFicha === "validado"
                            ? `Validado v${p.version}`
                            : p.estadoFicha === "sin_perfil"
                              ? "SIN PERFIL"
                              : "Revisar con ingeniería"}
                        </EstadoChip>
                        <p className="text-xs">
                          {s.alergenos
                            .filter((a) => p.alergenoIds.includes(a.id))
                            .map((a) => a.nombreRotulado)
                            .join(", ")}
                        </p>
                      </div>
                    ),
                  },
                ]}
              />
            </section>
            {editPerfil && (
              <aside className="panel-surface p-5 space-y-4">
                <p className="font-mono text-primary">
                  {editPerfil.codigo} · v{editPerfil.version}
                </p>
                <h2>{editPerfil.nombre}</h2>
                <h3 className="section-eyebrow">
                  MATRIZ DE ALÉRGENOS · {editPerfil.alergenoIds.length} declarado
                </h3>
                {editPerfil.tipo === "Kit" ? (
                  <Notice>
                    El perfil del kit se calcula desde sus ingredientes en Recetas y kits.
                  </Notice>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {s.alergenos
                      .filter((a) => a.activo)
                      .map((a) => (
                        <Button
                          key={a.id}
                          variant="outline"
                          aria-pressed={editPerfil.alergenoIds.includes(a.id)}
                          className={`whitespace-normal ${editPerfil.alergenoIds.includes(a.id) ? "bg-primary-soft text-primary border-primary" : ""}`}
                          onClick={() =>
                            setPerfilDraft({
                              ...editPerfil,
                              alergenoIds: editPerfil.alergenoIds.includes(a.id)
                                ? editPerfil.alergenoIds.filter((id) => id !== a.id)
                                : [...editPerfil.alergenoIds, a.id],
                            })
                          }
                        >
                          {editPerfil.alergenoIds.includes(a.id) && <Check />}
                          {a.nombreRotulado}
                        </Button>
                      ))}
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => toast.info("Ficha técnica de ejemplo · sin archivo real")}
                >
                  <FileText />
                  Previsualizar ficha técnica
                </Button>
                <ToggleCuarta
                  label="Validación técnica de inocuidad"
                  checked={editPerfil.estadoFicha === "validado"}
                  onChange={(v) =>
                    setPerfilDraft({ ...editPerfil, estadoFicha: v ? "validado" : "revision" })
                  }
                />
                <label className="field-label">
                  Notas técnicas de formulación y riesgos cruzados
                  <textarea
                    className="panel-input min-h-24"
                    value={editPerfil.notas}
                    onChange={(e) => setPerfilDraft({ ...editPerfil, notas: e.target.value })}
                  />
                </label>
                <div className="detail-box">
                  <h3 className="section-eyebrow">VISTA PREVIA DE ROTULADO</h3>
                  <b className="block mt-2">
                    {leyendaContiene(
                      s.alergenos.filter((a) => editPerfil.alergenoIds.includes(a.id)),
                    )}
                  </b>
                </div>
                <Notice>
                  Impacto en secuencia de planta: si el perfil de alérgenos es distinto al del
                  producto anterior en un equipo, la limpieza exigida será N2 profunda sin
                  excepción.
                </Notice>
                <MotivoForm
                  key={editPerfil.id}
                  label="Guardar perfil como nueva versión"
                  onSubmit={(d) => {
                    if (editPerfil.tipo === "Kit") {
                      toast.error("Aprueba el kit desde Recetas y kits");
                      return;
                    }
                    s.guardarPerfil(editPerfil, d.motivo);
                    setPerfilDraft(null);
                    toast.success("Perfil versionado y registrado en el historial");
                  }}
                />
              </aside>
            )}
          </div>
        ) : paso === 3 ? (
          <>
            <Notice danger={!!faltante}>
              {faltante ? (
                <>
                  <CircleAlert />
                  Bloqueo de validación automática: falta definir el alérgeno de {faltante.nombre}
                  <Button
                    variant="outline"
                    onClick={() => {
                      mostrarPerfil(faltante.id);
                      void ir(2);
                    }}
                  >
                    Ir al perfil en paso 2
                  </Button>
                </>
              ) : (
                "Fichas técnicas validadas · receta lista para aprobación"
              )}
            </Notice>
            <div className="allergen-split">
              <aside className="panel-surface p-5 space-y-3">
                <h2>Fórmulas y kits</h2>
                {s.recetas.map((r) => (
                  <Button
                    key={r.id}
                    variant="ghost"
                    className={`w-full min-h-24 text-left justify-start whitespace-normal ${r.id === recetaId ? "bg-primary-soft text-primary" : ""}`}
                    onClick={() => setRecetaId(r.id)}
                  >
                    <span>
                      <b className="block">{r.nombre}</b>
                      <small className="block font-mono my-2">
                        {r.codigo} · v{r.version}
                      </small>
                      <EstadoChip tono={validarReceta(r, s.perfiles) ? "warn" : "ok"}>
                        {validarReceta(r, s.perfiles) ? "Receta por revisar" : "Validada"}
                      </EstadoChip>
                    </span>
                  </Button>
                ))}
              </aside>
              <section className="panel-surface p-5 space-y-4">
                <h2>{receta?.nombre}</h2>
                <Notice>
                  Los alérgenos de los kits no se digitan: el sistema calcula la unión de los de
                  todos sus ingredientes según la ficha técnica activa.
                </Notice>
                {receta && (
                  <Tabla
                    data={receta.componentes.map((c) => ({
                      id: c.ingredienteId,
                      nombre:
                        s.perfiles.find((p) => p.id === c.ingredienteId)?.nombre ?? c.ingredienteId,
                      proporcion: c.proporcion,
                      estado:
                        s.perfiles.find((p) => p.id === c.ingredienteId)?.estadoFicha ??
                        "sin_perfil",
                      alergenos: s.alergenos
                        .filter((a) =>
                          s.perfiles
                            .find((p) => p.id === c.ingredienteId)
                            ?.alergenoIds.includes(a.id),
                        )
                        .map((a) => a.nombreRotulado)
                        .join(", "),
                    }))}
                    cols={[
                      {
                        key: "nombre",
                        label: "Componente",
                        render: (c) => (
                          <span>
                            {c.nombre}
                            <small className="block font-mono">{c.id}</small>
                          </span>
                        ),
                      },
                      {
                        key: "proporcion",
                        label: "Proporción %",
                        render: (c) => `${c.proporcion.toLocaleString("es-CO")} %`,
                      },
                      { key: "alergenos", label: "Alérgenos detectados" },
                      {
                        key: "estado",
                        label: "Ficha",
                        render: (c) => (
                          <EstadoChip tono={c.estado === "validado" ? "ok" : "danger"}>
                            {c.estado === "validado" ? "Validado" : "Sin perfil definido"}
                          </EstadoChip>
                        ),
                      },
                    ]}
                  />
                )}
                <h3 className="section-eyebrow">ALÉRGENOS DEL KIT · CALCULADOS AUTOMÁTICAMENTE</h3>
                {calculados.map((id) => (
                  <div key={id} className="border-b py-3">
                    <b>{s.alergenos.find((a) => a.id === id)?.nombreRotulado}</b>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Procedencia:{" "}
                      {receta?.componentes
                        .map((c) => s.perfiles.find((p) => p.id === c.ingredienteId))
                        .filter((p) => p?.alergenoIds.includes(id))
                        .map((p) => `${p?.nombre} (${p?.codigo}) · ficha v${p?.version}`)
                        .join(" · ")}
                    </p>
                  </div>
                ))}
                <label className="field-label">
                  Motivo del cambio
                  <textarea
                    className="panel-input"
                    value={motivoReceta}
                    onChange={(e) => setMotivoReceta(e.target.value)}
                  />
                </label>
                <Button
                  disabled={!!faltante || motivoReceta.trim().length < 5}
                  onClick={() => {
                    try {
                      const error = s.aprobarReceta(recetaId, motivoReceta);
                      if (error) toast.error(error);
                      else {
                        const kit = s.perfiles.find((p) => p.codigo === receta?.codigo);
                        if (kit)
                          s.guardarPerfil(
                            { ...kit, alergenoIds: calculados, estadoFicha: "validado" },
                            motivoReceta,
                          );
                        s.completar(3);
                        void ir(4);
                        toast.success("Receta y perfil del kit aprobados");
                      }
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Revisa el motivo");
                    }
                  }}
                >
                  Aprobar receta y continuar
                  <ChevronRight />
                </Button>
              </section>
            </div>
          </>
        ) : paso === 4 ? (
          <div className="allergen-label-grid">
            <section className="panel-surface p-5 space-y-4">
              <h2>Producto o kit en lote</h2>
              <label className="field-label">
                Lote
                <select
                  className="panel-input"
                  value={loteId}
                  onChange={(e) => setLoteId(e.target.value)}
                >
                  {s.lotes.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.id} · {l.producto}
                    </option>
                  ))}
                </select>
              </label>
              <h3 className="section-eyebrow">SEDE DE DESTINO Y REQUISITOS</h3>
              <b>{lote?.destino}</b>
              <EstadoChip tono="primary">Exige declaración de alérgenos activa</EstadoChip>
              <p className="text-xs">
                Vencimiento {lote && fechaCO(lote.vencimiento)} · Cadena fría: 2,4 °C · v
                {lote?.version}
              </p>
              <label className="field-label">
                Norma de referencia
                <input
                  className="panel-input"
                  value={norma}
                  onChange={(e) => setNorma(e.target.value)}
                />
              </label>
              <Notice>
                La etiqueta no se puede emitir sin la leyenda CONTIENE visible, indeleble y en
                mayúscula.
              </Notice>
              <p className="text-xs text-muted-foreground">
                Impresora de etiquetas demo · 100 × 70 mm · 300 DPI
              </p>
            </section>
            <section className="panel-surface p-5">
              <h2 className="mb-4">Vista previa de etiqueta</h2>
              <div className="print-label">
                <div className="flex items-center gap-2">
                  <Logo />
                  <b>Puerto Marino</b>
                </div>
                <h3 className="text-lg font-bold mt-4">{lote?.producto}</h3>
                <p className="font-mono text-xs my-3">
                  Lote {lote?.id} · v{lote?.version}
                  <br />
                  Vence {lote && fechaCO(lote.vencimiento)}
                </p>
                <div className="label-declaration">
                  <LockKeyhole />
                  {leyenda}
                </div>
                {trazas && (
                  <div className="mt-3 border border-warn bg-warn/15 p-3 text-sm font-bold">
                    PUEDE CONTENER TRAZAS DE: CRUSTÁCEOS
                  </div>
                )}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  {lote && (
                    <>
                      <CodigoBarras codigo={lote.id} />
                      <QRCodeSVG
                        value={`Puerto Marino | ${lote.id} | v${lote.version} | ${leyenda}`}
                        size={64}
                      />
                    </>
                  )}
                </div>
              </div>
              <EjemploPanel />
            </section>
            <aside className="panel-surface p-5 space-y-4">
              <h2>Evaluación de contaminación cruzada por línea</h2>
              <Notice danger>
                Equipo compartido: Marinador 1 procesó camarón antes del lote actual.
              </Notice>
              <p className="text-sm">Sugerencia: evaluar trazas de crustáceos con ingeniería.</p>
              <Button
                variant="outline"
                className="whitespace-normal w-full"
                onClick={() => {
                  setTrazas(true);
                  setJustificacion(
                    "Equipo compartido con crustáceos; evaluación técnica precautoria demo.",
                  );
                }}
              >
                Aplicar sugerencia de trazas
              </Button>
              <ToggleCuarta
                label="Declarar trazas de forma precautoria"
                checked={trazas}
                onChange={setTrazas}
              />
              <label className="field-label">
                Justificación técnica obligatoria
                <textarea
                  className="panel-input min-h-24"
                  value={justificacion}
                  onChange={(e) => setJustificacion(e.target.value)}
                />
              </label>
              <p className="text-xs text-muted-foreground">
                Responsable y firma: Ingeniera demo · PC-CAL-01
              </p>
              <Button
                className="w-full whitespace-normal"
                onClick={() => {
                  const error = validarTrazas(trazas, justificacion);
                  if (error) {
                    toast.error(error);
                    return;
                  }
                  if (!lote?.declarados.length) {
                    toast.error(
                      "El lote no tiene leyenda CONTIENE; requiere revisión de ingeniería.",
                    );
                    return;
                  }
                  auditarCuarta(
                    `Etiqueta ${lote.id}`,
                    null,
                    { leyenda, trazas, justificacion },
                    justificacion || "Impresión de prueba sin trazas",
                    lote.version,
                  );
                  toast.success("Etiqueta de prueba enviada · impresión simulada");
                }}
              >
                <Printer />
                Imprimir etiqueta de prueba
              </Button>
              {trazas && (
                <Notice>
                  CIP post-envasado: requerirá enjuague alcalino profundo por traza declarada.
                </Notice>
              )}
            </aside>
          </div>
        ) : (
          <>
            <Notice danger>
              <CircleAlert />
              Cambio de versión en Pescado v3 → v4 · revisión de productos y {s.lotes.length} lotes
              activos
              <Button
                variant="outline"
                onClick={() => {
                  auditarCuarta(
                    "Limpieza N2 Marinador 1",
                    null,
                    "Programada",
                    "Cambio de perfil de alérgenos",
                  );
                  toast.success("Limpieza N2 programada · simulación");
                }}
              >
                Programar limpieza N2 en Marinador 1
              </Button>
            </Notice>
            <section className="panel-surface p-5 space-y-4">
              <h2>Lotes activos y despachos directos</h2>
              <Tabla
                data={s.lotes}
                cols={[
                  { key: "id", label: "Lote" },
                  { key: "producto", label: "Producto" },
                  { key: "fecha", label: "Fecha", render: (l) => fechaCO(l.fecha) },
                  {
                    key: "declarados",
                    label: "Alérgeno declarado",
                    render: (l) =>
                      leyendaContiene(s.alergenos.filter((a) => l.declarados.includes(a.id))),
                  },
                  {
                    key: "estado",
                    label: "Estado de calidad",
                    render: (l) => (
                      <EstadoChip tono={l.estado === "Liberado" ? "ok" : "danger"}>
                        {l.estado}
                      </EstadoChip>
                    ),
                  },
                  { key: "destino", label: "Destino" },
                ]}
              />
              <Notice>
                Los lotes ya producidos conservan la versión y los alérgenos con que se fabricaron;
                no se reetiquetan sin orden de calidad.
              </Notice>
            </section>
            <div className="allergen-split">
              <section className="panel-surface p-5 space-y-4">
                <h2>Línea de tiempo de auditoría</h2>
                {eventos
                  .filter((e) =>
                    /Alérgeno|Perfil|Receta|Etiqueta|Limpieza N2|Lotes afectados/.test(e.entidad),
                  )
                  .slice(0, 8)
                  .map((e) => (
                    <div key={e.id} className="border-l-2 border-primary pl-4">
                      <b>
                        {e.entidad} · v{e.version}
                      </b>
                      <p className="text-xs text-muted-foreground">
                        {fechaCO(e.fecha)} {e.fecha.slice(11, 16)} · {e.motivo}
                      </p>
                    </div>
                  ))}
                {!eventos.some((e) => /Alérgeno|Perfil|Receta|Etiqueta/.test(e.entidad)) && (
                  <p className="text-muted-foreground">Sin cambios de esta sesión.</p>
                )}
              </section>
              <aside className="panel-surface p-5 space-y-4">
                <h2>Protocolo sanitario N2</h2>
                {["Lavado profundo", "Verificación por ATP si aplica", "Cámara y sellado"].map(
                  (fase, i) => (
                    <p key={fase} className="border-b pb-3">
                      <b className="text-primary mr-3">0{i + 1}</b>
                      {fase}
                    </p>
                  ),
                )}
                <Button
                  variant="outline"
                  className="w-full whitespace-normal text-danger border-danger/30"
                  onClick={() => setConfirm(true)}
                >
                  Retener lotes afectados en cuarentena
                </Button>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => void exportar("pdf")}>
                    <Download />
                    PDF
                  </Button>
                  <Button variant="outline" onClick={() => void exportar("excel")}>
                    <Download />
                    Excel
                  </Button>
                </div>
                <label className="field-label">
                  Motivo del cambio
                  <textarea
                    className="panel-input min-h-24"
                    value={motivoFinal}
                    onChange={(e) => setMotivoFinal(e.target.value)}
                  />
                </label>
                <Button
                  disabled={
                    motivoFinal.trim().length < 5 ||
                    s.perfiles.some((p) => p.estadoFicha === "sin_perfil")
                  }
                  className="w-full h-auto min-h-12 whitespace-normal"
                  onClick={() => {
                    const a = s.alergenos.find((x) => x.id === "ALG-004");
                    if (!a) return;
                    s.guardarAlergeno(a, motivoFinal);
                    s.completar(5);
                    toast.success(`Versión normativa v${a.version + 1} publicada · simulación`);
                  }}
                >
                  Finalizar y publicar versión normativa en planta
                </Button>
                {s.perfiles.some((p) => p.estadoFicha === "sin_perfil") && (
                  <p className="text-xs text-danger">
                    Resuelve los perfiles pendientes antes de publicar.
                  </p>
                )}
              </aside>
            </div>
          </>
        )}
        <EjemploPanel />
        <div className="allergen-footer">
          <Button variant="ghost" disabled={paso === 1} onClick={() => void ir(paso - 1)}>
            <ChevronLeft />
            Volver al paso anterior
          </Button>
          <Button variant="outline" onClick={guardarBorrador}>
            <Save />
            Guardar borrador
          </Button>
          {paso < 5 && (
            <Button onClick={continuar}>
              Validar y continuar al paso {paso + 1}
              <ChevronRight />
            </Button>
          )}
        </div>
      </div>
      <DrawerCuarta
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.nombreRotulado || "Agregar alérgeno personalizado"}
      >
        {draft && (
          <>
            <ToggleCuarta
              label="Alérgeno activo en matriz de planta"
              checked={draft.activo}
              onChange={(v) => setDraft({ ...draft, activo: v })}
            />
            <label className="field-label">
              Nombre oficial en rotulado *
              <input
                className="panel-input uppercase"
                value={draft.nombreRotulado}
                onChange={(e) =>
                  setDraft({ ...draft, nombreRotulado: e.target.value.toLocaleUpperCase("es-CO") })
                }
              />
            </label>
            <label className="field-label">
              Descripción
              <textarea
                className="panel-input"
                value={draft.descripcion}
                onChange={(e) => setDraft({ ...draft, descripcion: e.target.value })}
              />
            </label>
            <label className="field-label">
              Norma de referencia
              <input
                className="panel-input"
                value={draft.normaReferencia}
                onChange={(e) => setDraft({ ...draft, normaReferencia: e.target.value })}
              />
            </label>
            <h3 className="section-eyebrow">PRODUCTOS ASOCIADOS</h3>
            {s.perfiles
              .filter((p) => p.alergenoIds.includes(draft.id))
              .map((p) => (
                <p
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b pb-2"
                >
                  {p.nombre}
                  <EstadoChip tono={p.estadoFicha === "validado" ? "ok" : "warn"}>
                    {p.estadoFicha === "validado" ? "Validado" : "Revisión"}
                  </EstadoChip>
                </p>
              ))}
            <h3 className="section-eyebrow">HISTORIAL DE VERSIONES</h3>
            {s.versionesAlergenos
              .filter((a) => a.id === draft.id)
              .slice()
              .reverse()
              .map((a) => (
                <p key={`${a.id}-${a.version}`} className="border-l-2 border-primary pl-3">
                  v{a.version} · {a.nombreRotulado}{" "}
                  {a.version === s.alergenos.find((x) => x.id === a.id)?.version ? "· ACTUAL" : ""}
                </p>
              ))}
            <Button
              variant="outline"
              className="text-danger border-danger/30 w-full"
              onClick={() => setDraft({ ...draft, activo: false })}
            >
              Desactivar alérgeno
            </Button>
            <MotivoForm
              key={draft.id}
              label="Guardar como nueva versión"
              onSubmit={(d) => {
                try {
                  s.guardarAlergeno(draft, d.motivo);
                  setDraft(null);
                  toast.success("Alérgeno versionado y auditado");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Revisa los campos");
                }
              }}
            />
            <EjemploPanel />
          </>
        )}
      </DrawerCuarta>
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent className="cuarta-dialog bg-surface">
          <DialogTitle>Retener lotes afectados</DialogTitle>
          <DialogDescription>
            Se retendrán los {s.lotes.length} lotes de esta simulación. Sus versiones originales no
            cambian.
          </DialogDescription>
          <MotivoForm
            danger
            label="Confirmar retención"
            onSubmit={(d) => {
              s.retener(d.motivo);
              setConfirm(false);
              toast.success("Lotes retenidos y decisión auditada");
            }}
          />
        </DialogContent>
      </Dialog>
    </PanelLayout>
  );
}
