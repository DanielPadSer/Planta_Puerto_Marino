import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronLeft, ChevronRight, ClipboardList, Layers, ScanLine, Siren } from "lucide-react";
import type { Zona, ZonaId } from "@/domain/types";
import { OPERARIO_DEMO } from "@/mocks/estaciones";
import { useSesion } from "@/features/auth/store";
import { Chip, Circulo, PillConexion } from "@/ui/marca";
import { cn } from "@/lib/utils";
import { ZONAS, RUTA_COCIDO, RUTA_MARINADO } from "./zonas";
import { DETALLE, ORDEN_ZONAS } from "./zonaDetalle";
import { PanelRecepcion } from "@/features/recepcion/PanelRecepcion";
import { PanelCF1 } from "@/features/cf1/PanelCF1";
import { PanelLimpieza } from "@/features/limpieza/PanelLimpieza";
import { PanelEmpaque } from "@/features/empaque/PanelEmpaque";
import { PanelGenerico } from "./PanelGenerico";


const DURACION = 500;
const EASE = "cubic-bezier(.22,.8,.3,1)";

const STEPPER: { ids: ZonaId[]; label: string }[] = [
  { ids: ["recepcion"], label: "1 Rec" },
  { ids: ["cf1"], label: "2 CF-1" },
  { ids: ["coccion", "marinado"], label: "3A Cocc / 3B Mar" },
  { ids: ["empaque"], label: "4 Emp" },
  { ids: ["cf2", "cf3"], label: "5A / 5B" },
  { ids: ["despacho"], label: "6 Desp" },
  { ids: ["sede"], label: "7 Sede" },
];

function usaMovimientoReducido(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ZonaVista({ zona }: { zona: Zona }) {
  const d = DETALLE[zona.id];
  const navigate = useNavigate();
  const op = useSesion((s) => s.operario) ?? OPERARIO_DEMO;
  const [, setZoom] = useState(false);
  const [listo, setListo] = useState(false);
  const [tab, setTab] = useState<"registrar" | "flujo" | "lote">("registrar");
  const [info, setInfo] = useState<"pasa" | "registra" | "software">("registra");
  const [dur, setDur] = useState(DURACION);

  useEffect(() => {
    const reducido = usaMovimientoReducido();
    setDur(reducido ? 0 : DURACION);
    const r = requestAnimationFrame(() => setZoom(true));
    const t = setTimeout(() => setListo(true), reducido ? 0 : DURACION * 0.5);
    return () => { cancelAnimationFrame(r); clearTimeout(t); };
  }, [zona.id]);

  const salir = useCallback(() => {
    setListo(false);
    setZoom(false);
    setTimeout(() => navigate({ to: "/planta" }), dur);
  }, [navigate, dur]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") salir(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [salir]);

  const idx = ORDEN_ZONAS.indexOf(zona.id);
  const prev = ZONAS.find((z) => z.id === ORDEN_ZONAS[(idx - 1 + ORDEN_ZONAS.length) % ORDEN_ZONAS.length])!;
  const next = ZONAS.find((z) => z.id === ORDEN_ZONAS[(idx + 1) % ORDEN_ZONAS.length])!;

  const enRuta = RUTA_COCIDO.includes(zona.codigo) ? "cocido" : RUTA_MARINADO.includes(zona.codigo) ? "marinado" : null;

  return (
    <div className="pointer-events-none absolute inset-0 [&>*]:pointer-events-auto">

      {/* Barra superior */}
      <header className="absolute z-40 inset-x-4 top-4 flex items-center gap-2">
        <button onClick={salir} aria-label="Volver a la planta" className="glass tap grid place-items-center rounded-full"><ChevronLeft size={20} /></button>
        <span className="glass flex h-12 items-center gap-2 rounded-full px-4 text-xs">
          <span className="text-muted-foreground">PLANTA ›</span><span className="size-2 rounded-full" style={{ background: zona.color }} /><b className="whitespace-nowrap">{zona.codigo} {zona.nombre}</b>
        </span>
        <nav className="glass hidden h-12 items-center gap-1 rounded-full px-1.5 lg:flex">
          {STEPPER.map((s) => {
            const activo = s.ids.includes(zona.id);
            return (
              <Link key={s.label} to="/planta/$zona" params={{ zona: s.ids[0]! }}
                className={cn("whitespace-nowrap rounded-full px-2.5 py-1.5 font-mono text-[10px]", activo ? "font-bold text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
                style={activo ? { background: zona.color } : undefined}>{s.label}</Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <PillConexion className="glass hidden py-3 xl:inline-flex" />
          <button aria-label="Notificaciones" className="glass tap relative grid place-items-center rounded-full"><Bell size={20} /><span className="absolute right-3 top-3 size-2 rounded-full bg-danger" /></button>
          <span className="glass grid size-12 place-items-center rounded-full font-mono text-xs font-bold">{op.iniciales}</span>
        </div>
      </header>

      {/* Rail izquierdo */}
      <nav className="absolute left-4 top-1/2 flex -translate-y-1/2 flex-col gap-3">
        {([[Layers, "Capas", false], [ScanLine, "Escanear", true], [ClipboardList, "Lotes", false], [Siren, "Alertas", false]] as const).map(([Icon, l, act]) => (
          <button key={l} className="flex flex-col items-center gap-1 text-[11px] font-medium">
            <span className={cn("relative grid size-14 place-items-center rounded-full", act ? "text-primary-foreground shadow-[var(--shadow-soft)]" : "glass")} style={act ? { background: zona.color } : undefined}><Icon size={20} /></span>{l}
          </button>
        ))}
      </nav>

      {/* Tarjeta qué se registra */}
      <div className="glass absolute bottom-4 left-4 hidden w-[320px] rounded-[var(--radius-card)] p-4 xl:block">
        <p className="flex items-center gap-2 font-mono text-[11px] font-semibold"><span className="size-2 rounded-full" style={{ background: zona.color }} />QUÉ SE REGISTRA EN {zona.nombre.toUpperCase()}</p>
        <p className="mt-2 min-h-12 text-xs leading-relaxed text-muted-foreground">{d.que[info]}</p>
        <div className="mt-2 flex gap-1">
          {([["pasa", "① Qué pasa"], ["registra", "② Qué se registra"], ["software", "③ Qué hace el software"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setInfo(k)} className={cn("min-h-9 whitespace-nowrap rounded-full px-2 text-[10px]", info === k ? "font-semibold text-primary-foreground" : "bg-muted text-muted-foreground")} style={info === k ? { background: zona.color } : undefined}>{l}</button>
          ))}
        </div>
      </div>

      {/* Inferior centro */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-[calc(50%+200px)] flex-col items-center gap-2 xl:left-[calc(50%+40px)]">
        <div className="flex gap-2">
          <Link to="/planta/$zona" params={{ zona: prev.id }} className="glass flex h-12 items-center gap-1 whitespace-nowrap rounded-full pl-2 pr-4 text-sm"><ChevronLeft size={20} /> {prev.codigo} {prev.nombre}</Link>
          <Link to="/planta/$zona" params={{ zona: next.id }} className="glass flex h-12 items-center gap-1 whitespace-nowrap rounded-full pl-4 pr-2 text-sm">{next.codigo} {next.nombre} <ChevronRight size={20} /></Link>
        </div>
      </div>

      {/* Panel derecho */}
      <aside className={cn("absolute z-40 bottom-4 right-4 top-20 flex w-[400px] flex-col overflow-hidden rounded-[var(--radius-panel)] bg-surface shadow-[var(--shadow-soft)] transition-all duration-500", listo ? "translate-x-0 opacity-100" : "translate-x-[110%] opacity-0")} style={{ transitionTimingFunction: EASE }}>
        <div className="p-4 pb-0">
          <div className="flex items-start gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl" style={{ background: zona.color }}><Circulo codigo={zona.codigo} color={zona.color} size={36} /></span>
            <div className="min-w-0 flex-1"><p className="text-lg font-bold leading-tight">{zona.nombre}</p><p className="text-xs text-muted-foreground">{d.subtitulo}</p></div>
            <Chip tono={d.chip.tono === "pending" ? "warn" : d.chip.tono === "readonly" ? "readonly" : d.chip.tono}>{d.chip.texto}</Chip>
          </div>
          <div className="mt-3 grid grid-cols-3 border-b text-sm">
            {(["registrar", "flujo", "lote"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={cn("-mb-px min-h-11 border-b-2 capitalize", tab === t ? "font-semibold" : "border-transparent text-muted-foreground")} style={tab === t ? { borderColor: zona.color } : undefined}>{t}</button>
            ))}
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col pt-3">
          {tab === "registrar" && <PanelZona key={zona.id} id={zona.id} color={zona.color} />}
          {tab === "flujo" && (
            <div className="space-y-3 px-4 text-sm">
              <p className="text-muted-foreground">Posición de esta zona en las rutas de proceso.</p>
              {([["Ruta cocido", RUTA_COCIDO, "#F97316"], ["Ruta marinado", RUTA_MARINADO, "#6366F1"]] as const).map(([n, r, c]) => (
                <div key={n}><p className="mb-1 text-xs font-semibold" style={{ color: c }}>{n}</p>
                  <div className="flex flex-wrap gap-1">{r.map((p) => <span key={p} className={cn("rounded-full px-2 py-1 font-mono text-[11px]", p === zona.codigo ? "font-bold text-primary-foreground" : "bg-muted")} style={p === zona.codigo ? { background: zona.color } : undefined}>{p}</span>)}</div>
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground">{enRuta ? `Esta zona pertenece a la ruta ${enRuta}.` : "Zona compartida o de apoyo."} 3A/3B y 5A/5B son alternativas: cada producto pasa por una sola.</p>
            </div>
          )}
          {tab === "lote" && (
            <div className="space-y-2 px-4 text-sm">
              <div className="rounded-2xl bg-muted p-3 font-mono text-xs"><p className="font-bold">LT-0245</p><p className="text-muted-foreground">Filete de mojarra · Proveedor A · 48,6 kg</p><p className="text-muted-foreground">Regla aprobada: v.12</p></div>
              <p className="text-[11px] text-muted-foreground">Escanea un lote para ver su historia completa en esta zona.</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function PanelZona({ id, color }: { id: ZonaId; color: string }) {
  switch (id) {
    case "recepcion": return <PanelRecepcion color={color} />;
    case "cf1": return <PanelCF1 color={color} />;
    case "limpieza": return <PanelLimpieza color={color} />;
    case "empaque": return <PanelEmpaque color={color} />;
    default: return <PanelGenerico zona={id} color={color} />;
  }
}
