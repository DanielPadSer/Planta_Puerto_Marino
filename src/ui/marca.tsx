import { Fish, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function Marca({ subtitulo }: { subtitulo?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-primary)]">
        <Fish size={20} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">Puerto Marino</span>
          <span className="rounded-full bg-primary-soft px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-primary">PLANTA</span>
        </div>
        {subtitulo && <p className="font-mono text-[11px] tracking-wide text-muted-foreground">{subtitulo}</p>}
      </div>
    </div>
  );
}

export function PillConexion({ enLinea = true, pendientes = 0, className }: { enLinea?: boolean; pendientes?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border bg-surface px-3 py-1.5 text-xs font-medium", className)}>
      <span className={cn("size-2 rounded-full", enLinea ? "bg-ok" : "bg-warn")} />
      {enLinea ? <Wifi size={20} className="hidden" /> : <WifiOff size={20} className="hidden" />}
      {enLinea ? "En línea · Sincronizado" : `Sin conexión · ${pendientes} pendientes`}
    </span>
  );
}

export function Chip({ tono, children }: { tono: "ok" | "warn" | "danger" | "readonly" | "primary"; children: React.ReactNode }) {
  const t = {
    ok: "bg-ok/15 text-ok",
    warn: "bg-warn/15 text-warn",
    danger: "bg-danger/12 text-danger",
    readonly: "bg-muted text-muted-foreground",
    primary: "bg-primary-soft text-primary",
  }[tono];
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold", t)}>{children}</span>;
}

export function Circulo({ codigo, color, size = 28 }: { codigo: string; color: string; size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-full font-mono text-[11px] font-bold text-primary-foreground" style={{ background: color, width: size, height: size }}>
      {codigo}
    </span>
  );
}
