import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Bell, Camera, ChevronLeft, ChevronRight, Layers, List, Map as MapIcon, ScanLine, Search, Siren, TrendingUp } from "lucide-react";
import { ALERTAS, OPERARIO_DEMO } from "@/mocks/estaciones";
import { LOTES } from "@/mocks/calidad";
import { useSesion } from "@/features/auth/store";
import { PillConexion } from "@/ui/marca";
import { Logo } from "@/ui/logo";
import { create } from "zustand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RUTA_COCIDO, RUTA_MARINADO, ZONAS } from "./zonas";

const ROLES: Record<string, string> = { operario: "Operario", supervisor: "Supervisor", limpieza: "Encargada de limpieza", ingeniera: "Ingeniera de alimentos", sede: "Sede", administrador: "Administrador" };
const usePanelPlanta = create<{ abierto: boolean; cambiar: (abierto: boolean) => void }>((set) => ({ abierto: false, cambiar: (abierto) => set({ abierto }) }));
type Tab = "resumen" | "lotes" | "alertas";

export function Planta() {
  const op = useSesion((s) => s.operario) ?? OPERARIO_DEMO;
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("resumen");
  const [rutas, setRutas] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const buscador = useRef<HTMLInputElement>(null);

  const { abierto, cambiar } = usePanelPlanta();
  const panel = useRef<HTMLElement>(null);
  const manija = useRef<HTMLButtonElement>(null);
  const inicio = useRef<{ x: number; y: number } | null>(null);
  const abrirTab = (t: Tab) => { cambiar(true); setTab(t); };
  useEffect(() => {
    const cerrar = (e: KeyboardEvent) => { if (e.key === "Escape" && abierto) { cambiar(false); manija.current?.focus(); } };
    window.addEventListener("keydown", cerrar);
    return () => window.removeEventListener("keydown", cerrar);
  }, [abierto, cambiar]);
  const escanear = () => { cambiar(true); setTab("resumen"); setTimeout(() => buscador.current?.focus(), 0); };
  const lotesFiltrados = LOTES.filter((l) => `${l.id} ${l.producto}`.toLowerCase().includes(busqueda.toLowerCase()));

  const rail = [
    { Icon: Layers, l: "Rutas", on: rutas, dot: false, fn: () => setRutas(!rutas) },
    { Icon: ScanLine, l: "Escanear", on: false, dot: false, fn: escanear },
    { Icon: List, l: "Lotes", on: tab === "lotes", dot: false, fn: () => abrirTab("lotes") },
    { Icon: Siren, l: "Alertas", on: tab === "alertas", dot: true, fn: () => abrirTab("alertas") },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 [&>*]:pointer-events-auto">
      <header className={cn("absolute z-40 left-4 top-4 flex items-center gap-3", abierto ? "right-[372px]" : "right-20")}>
        <Link to="/" aria-label="Volver" className="glass tap grid place-items-center rounded-full"><ChevronLeft size={20} /></Link>
        <div className="glass flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4">
          <Logo className="size-9 rounded-full object-contain" />
          <div><p className="text-sm font-semibold leading-tight">Puerto Marino · Planta</p><p className="text-[11px] text-muted-foreground">Planta completa</p></div>
        </div>
        <div className="flex-1" />
        <PillConexion className="glass hidden py-3 lg:inline-flex" />
        <button aria-label="Notificaciones" onClick={() => abrirTab("alertas")} className="glass tap relative grid place-items-center rounded-full"><Bell size={20} /><span className="absolute right-3 top-3 size-2 rounded-full bg-danger" /></button>
        <div className="glass flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4">
          <span className="grid size-9 place-items-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground">{op.iniciales}</span>
          <div className="hidden xl:block"><p className="text-sm font-semibold leading-tight">{ROLES[op.rol]}</p><p className="text-[11px] text-muted-foreground">{op.turno}</p></div>
        </div>
      </header>

      <nav className="absolute left-4 top-1/2 flex -translate-y-1/2 flex-col gap-3">
        {rail.map(({ Icon, l, on, dot, fn }) => (
          <button key={l} onClick={fn} aria-pressed={on} className="flex flex-col items-center gap-1 text-[11px] font-medium">
            <span className={cn("glass relative grid size-14 place-items-center rounded-full", on && "bg-primary-soft text-primary")}><Icon size={20} />{dot && <span className="absolute right-2 top-2 size-2.5 rounded-full bg-danger" />}</span>{l}
          </button>
        ))}
      </nav>

      <div className="plant-edge-gesture" onTouchStart={(e) => { const t = e.touches[0]; if (t) inicio.current = { x: t.clientX, y: t.clientY }; }} onTouchEnd={(e) => { const t = e.changedTouches[0]; if (t && inicio.current && inicio.current.x - t.clientX > 48 && Math.abs(t.clientY - inicio.current.y) < 80) cambiar(true); inicio.current = null; }} />
      <Button ref={manija} variant="outline" aria-label={abierto ? "Cerrar panel de planta" : "Abrir panel de planta"} aria-expanded={abierto} aria-controls="panel-planta" onClick={() => cambiar(!abierto)} className={cn("plant-handle", abierto && "plant-handle-open")}>
        <ChevronLeft size={20} className={cn("transition-transform", abierto && "rotate-180")} />
        {ALERTAS.length > 0 && <span className={cn("plant-alert-count", ALERTAS.some((a) => a.tono === "danger") && "animate-pulse")}>{ALERTAS.length}</span>}
      </Button>
      <aside ref={panel} id="panel-planta" role="complementary" aria-label="Resumen de Planta Puerto Marino" aria-hidden={!abierto} inert={!abierto} data-open={abierto} className="glass plant-summary absolute z-40 bottom-4 right-4 top-4 flex w-[340px] flex-col rounded-[var(--radius-panel)] p-4"
        onTouchStart={(e) => { const t = e.touches[0]; if (t) inicio.current = { x: t.clientX, y: t.clientY }; }} onTouchEnd={(e) => { const t = e.changedTouches[0]; if (t && inicio.current && t.clientX - inicio.current.x > 64 && Math.abs(t.clientY - inicio.current.y) < 80) { cambiar(false); manija.current?.focus(); } inicio.current = null; }}>

        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><MapIcon size={20} /></span>
          <div className="flex-1"><p className="font-semibold">Planta Puerto Marino</p><p className="text-[11px] text-muted-foreground">Toca una zona del mapa para entrar</p></div>
          <span className="rounded-full bg-muted px-2 py-1 font-mono text-[10px]">11 zonas</span><Button variant="ghost" size="icon" className="min-h-12 min-w-12" aria-label="Cerrar resumen" onClick={() => { cambiar(false); manija.current?.focus(); }}><ChevronRight size={20} /></Button>
        </div>
        <div className="mt-3 flex gap-4 border-b text-sm">
          {(["resumen", "lotes", "alertas"] as const).map((t) => (
            <Button variant="ghost" key={t} onClick={() => setTab(t)} className={cn("-mb-px border-b-2 pb-2 min-h-12 capitalize", tab === t ? "border-primary font-semibold text-primary" : "border-transparent text-muted-foreground")}>{t}</Button>
          ))}
        </div>
        <div className="mt-3 flex-1 space-y-3 overflow-y-auto pr-1">
          <label className="flex h-12 items-center gap-2 rounded-2xl border bg-surface px-3 text-sm text-muted-foreground">
            <Search size={20} />
            <input ref={buscador} value={busqueda} onChange={(e) => { setBusqueda(e.target.value); if (e.target.value) setTab("lotes"); }} className="flex-1 bg-transparent outline-none" placeholder="Buscar o escanear un lote" />
            <Camera size={20} />
          </label>
          {tab === "resumen" && <>
            <div className="rounded-2xl border border-danger/30 bg-danger/5 p-3">
              <p className="flex items-center gap-2 text-sm font-semibold"><AlertTriangle size={16} className="text-danger" /> 5A CF-2 Terminado <span className="rounded-full bg-danger/12 px-1.5 font-mono text-[9px] text-danger">ALERTA TEMP</span></p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">Temp: 5,4 °C (límite 4,0 °C) · Lote PM-8921</p>
            </div>
            <div>
              <p className="font-mono text-[10px] font-semibold text-muted-foreground">HOY EN PLANTA</p>
              <div className="mt-1 grid grid-cols-3 gap-2 text-center">
                {([["12", "lotes en proceso", "text-foreground"], ["3", "alertas abiertas", "text-warn"], ["58", "paquetes despachados", "text-ok"]] as const).map(([n, l, c]) => (
                  <div key={l} className="rounded-xl bg-muted p-2"><p className={cn("text-2xl font-bold", c)}>{n}</p><p className="text-[10px] text-muted-foreground">{l}</p></div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] font-semibold text-muted-foreground">ENTRAR A UNA ZONA</p>
              <div className="plant-zone-grid mt-3 grid grid-cols-2 gap-3">
                {ZONAS.map((z) => (
                  <Link key={z.id} to="/planta/$zona" params={{ zona: z.id }} className="plant-zone" style={{ "--zone": z.color, "--order": ZONAS.indexOf(z) } as CSSProperties}><b>{z.codigo}</b><span>{z.nombre.split(" ")[0]}</span></Link>
                ))}
              </div>
            </div>
          </>}
          {tab === "lotes" && (
            <div>
              <p className="font-mono text-[10px] font-semibold text-muted-foreground">LOTES ({lotesFiltrados.length})</p>
              {lotesFiltrados.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">Sin lotes que coincidan.</p>}
              {lotesFiltrados.map((l) => (
                <div key={l.id} className="border-b py-2 text-xs last:border-0">
                  <p className="flex justify-between"><span className="font-mono font-semibold">{l.id}</span><span className={cn("rounded-full px-2 font-medium", l.estado === "Cuarentena" ? "bg-warn/15 text-warn" : "bg-ok/15 text-ok")}>{l.estado}</span></p>
                  <p className="mt-0.5">{l.producto} · <span className="font-mono">{l.kg} kg</span></p>
                  <p className="text-muted-foreground">{l.hora}</p>
                </div>
              ))}
            </div>
          )}
          {tab === "alertas" && (
            <div>
              <p className="flex justify-between font-mono text-[10px] font-semibold text-muted-foreground">ALERTAS ABIERTAS <span className="text-danger">PRIORIDAD ALTA</span></p>
              {ALERTAS.map((a) => (
                <div key={a.id} className="flex items-center gap-2 border-b py-2 text-xs last:border-0">
                  <span className={cn("size-2 rounded-full", a.tono === "danger" ? "bg-danger" : "bg-warn")} /><span className="flex-1">{a.texto}</span><span className="font-mono text-muted-foreground">{a.hora}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <Button onClick={() => navigate({ to: "/panel/trazabilidad" })} className="tap mt-3 flex items-center justify-center gap-2 rounded-2xl bg-primary font-semibold text-primary-foreground shadow-[var(--shadow-primary)]"><TrendingUp size={20} /> Seguir un lote</Button>
      </aside>

      {rutas && <div className="glass absolute bottom-4 left-24 z-30 w-[340px] rounded-[var(--radius-card)] p-4"><Rutas /></div>}
    </div>
  );
}

function Rutas() {
  return (
    <div>
      <p className="font-mono text-[10px] font-semibold text-muted-foreground">RUTAS DE PROCESO</p>
      {([["Ruta cocido", RUTA_COCIDO, "#F97316"], ["Ruta marinado", RUTA_MARINADO, "#6366F1"]] as const).map(([n, r, c]) => (
        <p key={n} className="mt-2 flex items-center gap-2 text-xs">
          <span className="size-2.5 rounded-full" style={{ background: c }} /><span className="font-semibold" style={{ color: c }}>{n}:</span>
          <span className="font-mono">{r.join(" → ")}</span>
        </p>
      ))}
      <p className="mt-2 text-[10px] text-muted-foreground">* 3A/3B y 5A/5B son alternativas: cada producto pasa por una sola.</p>
    </div>
  );
}
