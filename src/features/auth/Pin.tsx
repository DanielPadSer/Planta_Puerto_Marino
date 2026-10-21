import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronLeft, CloudOff, Delete, RefreshCw, Tablet, Wifi, Wrench } from "lucide-react";
import { ESTACIONES, OPERARIO_DEMO, SYNC } from "@/mocks/estaciones";
import { BLOQUEO_MS, intentosRestantes, MAX_INTENTOS, PIN_MAX, pinValidoFormato } from "@/domain/pin";
import type { Estacion } from "@/domain/types";
import { useSesion } from "./store";
import { Chip, Circulo } from "@/ui/marca";
import { cn } from "@/lib/utils";

const PIN_DEMO = "1234";

export function Pin({ estacion }: { estacion: Estacion }) {
  const [pin, setPin] = useState("");
  const [fallos, setFallos] = useState(0);
  const [bloqueoHasta, setBloqueoHasta] = useState<number | null>(null);
  const [ahora, setAhora] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);
  const entrar = useSesion((s) => s.entrar);
  const navigate = useNavigate();

  const bloqueado = bloqueoHasta !== null && ahora < bloqueoHasta;
  const segundos = bloqueoHasta ? Math.ceil((bloqueoHasta - ahora) / 1000) : 0;

  useEffect(() => {
    if (!bloqueoHasta) return;
    const t = setInterval(() => {
      const n = Date.now();
      setAhora(n);
      if (n >= bloqueoHasta) { setBloqueoHasta(null); setFallos(0); setError(null); }
    }, 250);
    return () => clearInterval(t);
  }, [bloqueoHasta]);

  const tecla = (d: string) => { if (!bloqueado && pin.length < PIN_MAX) { setPin(pin + d); setError(null); } };
  const borrar = () => setPin(pin.slice(0, -1));
  const enviar = () => {
    if (bloqueado || !pinValidoFormato(pin)) return;
    if (pin === PIN_DEMO) {
      entrar(OPERARIO_DEMO, estacion.id, estacion.tablet);
      navigate({ to: "/planta" });
      return;
    }
    const f = fallos + 1;
    setFallos(f);
    setPin("");
    if (f >= MAX_INTENTOS) { setBloqueoHasta(Date.now() + BLOQUEO_MS); setAhora(Date.now()); setError(null); }
    else setError(`PIN incorrecto. Intenta de nuevo (${intentosRestantes(f)} intentos restantes)`);
  };

  const teclaCls = "grid h-[72px] w-[88px] place-items-center rounded-2xl bg-surface font-mono text-3xl font-semibold shadow-sm transition active:scale-95 disabled:opacity-40";

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <main className="glass w-full max-w-[880px] rounded-[var(--radius-panel)] p-6">
        <div className="flex items-center gap-3">
          <Link to="/" aria-label="Volver" className="tap grid place-items-center rounded-full bg-muted"><ChevronLeft size={20} /></Link>
          <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 font-mono text-[11px]">
            <span className="size-2 rounded-full" style={{ background: estacion.color }} /> PLANTA › {estacion.codigo} {estacion.nombre.toUpperCase()}
          </span>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_1.15fr]">
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="grid size-14 place-items-center rounded-2xl" style={{ background: estacion.color }}><Circulo codigo={estacion.codigo} color={estacion.color} size={40} /></div>
              <div><h1 className="text-2xl font-bold">{estacion.codigo} {estacion.nombre}</h1><p className="text-sm text-muted-foreground">Ingresa con tu PIN para registrar</p></div>
            </div>
            <div className="rounded-2xl bg-muted p-3">
              <div className="flex items-center justify-between font-mono text-xs font-semibold"><span className="flex items-center gap-2"><Tablet size={16} /> Tablet · {estacion.tablet}</span><Chip tono="primary">Token activo <Check size={10} /></Chip></div>
              <p className="mt-1 flex gap-1 font-mono text-[10px] text-muted-foreground"><RefreshCw size={12} /> Última sincronización {SYNC.ultima} · Catálogo {SYNC.catalogo} descargado</p>
            </div>
            <div className="rounded-2xl bg-muted p-3">
              <p className="flex items-center gap-2 text-xs font-semibold"><Wrench size={16} /> Equipos de la estación</p>
              {estacion.equipos.map((q) => (
                <div key={q.nombre} className="mt-2 flex items-center justify-between font-mono text-[11px]">
                  <span>{q.nombre} · {q.detalle}</span>
                  <Chip tono={q.estado === "Alerta" ? "danger" : "primary"}>{q.estado}</Chip>
                </div>
              ))}
            </div>
            <div className="flex gap-2 rounded-2xl bg-muted p-3 text-xs text-muted-foreground">
              <CloudOff size={20} className="shrink-0" /> Si no hay internet, entras igual: tu PIN se valida con los datos de la última sincronización.
            </div>
          </section>

          <section className="flex flex-col items-center rounded-[var(--radius-card)] bg-muted p-5">
            <p className="font-semibold">Escribe tu PIN de operario</p>
            <div className="my-4 flex gap-3" aria-label={`${pin.length} dígitos`}>
              {Array.from({ length: PIN_MAX }).map((_, i) => (
                <span key={i} className={cn("size-3.5 rounded-full", i >= pin.length && "bg-border")} style={i < pin.length ? { background: estacion.color } : undefined} />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => <button key={d} disabled={bloqueado} onClick={() => tecla(d)} className={teclaCls}>{d}</button>)}
              <button onClick={borrar} disabled={bloqueado} aria-label="Borrar" className={cn(teclaCls, "bg-border/60")}><Delete size={20} /></button>
              <button onClick={() => tecla("0")} disabled={bloqueado} className={teclaCls}>0</button>
              <button onClick={enviar} disabled={bloqueado || !pinValidoFormato(pin)}
                className="grid h-[72px] w-[88px] place-items-center rounded-2xl font-semibold text-primary-foreground shadow-[var(--shadow-soft)] disabled:opacity-50"
                style={{ background: estacion.color }}>
                <span className="flex items-center gap-1"><Check size={20} /> Entrar</span>
              </button>
            </div>
            <div className="mt-3 min-h-10 text-center text-sm">
              {bloqueado ? <p className="font-medium text-danger">Demasiados intentos. Espera {segundos} s para volver a intentar.</p>
                : error ? <p className="font-medium text-danger">{error}</p>
                : <p className="text-xs text-muted-foreground">¿Olvidaste tu PIN? Pídele al supervisor que lo restablezca. <span className="font-mono">(Demo: 1234)</span></p>}
            </div>
          </section>
        </div>

        <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-muted p-3">
          <span className="flex items-center gap-3 text-sm"><Chip tono="readonly"><span className="size-1.5 rounded-full" style={{ background: estacion.color }} /> Modo local habilitado</Chip> Puedes registrar lotes; liberación requiere conexión.</span>
          <span className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">RED: {SYNC.red} <Wifi size={16} className="text-primary" /></span>
        </footer>
      </main>
    </div>
  );
}

export function buscarEstacion(id: string): Estacion | undefined {
  return ESTACIONES.find((e) => e.id === id);
}
