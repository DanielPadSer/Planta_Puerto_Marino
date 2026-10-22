import type { ReactNode } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Seccion({ n, titulo, extra, children, activa, className }: { n: number; titulo: string; extra?: ReactNode; children: ReactNode; activa?: boolean; className?: string }) {
  return (
    <section className={cn("rounded-[var(--radius-card)] border bg-surface p-3", activa && "border-primary/50 ring-2 ring-primary/10", className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-wide"><span className="text-muted-foreground">{String(n).padStart(2, "0")}</span> {titulo}</p>
        {extra}
      </div>
      {children}
    </section>
  );
}

export function Stepper({ valor, onChange, min = 0, max = 999, paso = 1, formato }: { valor: number; onChange: (v: number) => void; min?: number; max?: number; paso?: number; formato?: (v: number) => string }) {
  const btn = "tap grid place-items-center rounded-xl border bg-surface disabled:opacity-40";
  return (
    <div className="flex items-center gap-2">
      <button className={btn} aria-label="Menos" disabled={valor <= min} onClick={() => onChange(Math.max(min, +(valor - paso).toFixed(2)))}><Minus size={20} /></button>
      <span className="min-w-14 text-center font-mono text-lg font-bold">{formato ? formato(valor) : valor}</span>
      <button className={btn} aria-label="Más" disabled={valor >= max} onClick={() => onChange(Math.min(max, +(valor + paso).toFixed(2)))}><Plus size={20} /></button>
    </div>
  );
}

export function Segmentado<T extends string>({ opciones, valor, onChange }: { opciones: readonly (readonly [T, string])[]; valor: T; onChange: (v: T) => void }) {
  return (
    <div className="grid gap-1 rounded-2xl bg-muted p-1" style={{ gridTemplateColumns: `repeat(${opciones.length}, minmax(0,1fr))` }}>
      {opciones.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)} className={cn("min-h-10 rounded-xl px-2 text-xs font-medium", valor === v ? "bg-surface text-primary shadow-sm" : "text-muted-foreground")}>{l}</button>
      ))}
    </div>
  );
}

export function Ejemplo() {
  return <p className="rounded-xl bg-warn/10 px-3 py-2 text-[11px] text-foreground/80">Valores de ejemplo: los reales los define la ingeniería de alimentos.</p>;
}

export function Fila({ k, v, mono = true }: { k: string; v: ReactNode; mono?: boolean }) {
  return <div className="flex items-center justify-between gap-2 py-1 text-xs"><span className="text-muted-foreground">{k}</span><span className={cn("text-right font-semibold", mono && "font-mono")}>{v}</span></div>;
}

export function Aviso({ tono, children }: { tono: "warn" | "danger" | "ok"; children: ReactNode }) {
  const c = { warn: "border-warn/40 bg-warn/10", danger: "border-danger/40 bg-danger/8", ok: "border-ok/40 bg-ok/10" }[tono];
  return <div className={cn("rounded-xl border px-3 py-2 text-xs", c)}>{children}</div>;
}

export function BotonPrincipal({ children, onClick, disabled, color }: { children: ReactNode; onClick?: () => void; disabled?: boolean; color: string }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="tap flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      style={{ background: color }}>
      {children}
    </button>
  );
}
