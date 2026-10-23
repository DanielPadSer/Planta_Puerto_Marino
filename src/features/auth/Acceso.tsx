import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, ExternalLink, Lock, Monitor, ShieldCheck, Tablet } from "lucide-react";
import maqueta from "@/assets/maqueta-planta.png.asset.json";
import { ESTACIONES, SYNC } from "@/mocks/estaciones";
import type { EstacionId } from "@/domain/types";
import { Chip, Circulo, Marca, PillConexion } from "@/ui/marca";
import { cn } from "@/lib/utils";

type Modo = "planta" | "panel";
const PESTANAS = {
  pasa: "Cada tablet se registra una vez y recibe un token de dispositivo criptográfico. Tu PIN de operario funciona sobre ese token. Todo pesaje y lote guarda operario, dispositivo y marca de tiempo exacta.",
  registra: "Operario, estación, dispositivo, hora exacta y cada valor capturado (peso, temperatura, tiempo). Nada se borra: las correcciones quedan como nuevos registros.",
  software: "Valida tu PIN, abre la estación y guarda localmente si no hay conexión. Al volver la red, sincroniza los eventos pendientes en orden.",
} as const;

export function Acceso() {
  const [modo, setModo] = useState<Modo>("planta");
  const [sel, setSel] = useState<EstacionId>("marinado");
  const [tab, setTab] = useState<keyof typeof PESTANAS>("pasa");
  const navigate = useNavigate();
  const est = ESTACIONES.find((e) => e.id === sel) ?? ESTACIONES[0]!;

  const continuar = () => {
    if (modo === "panel") navigate({ to: "/panel/login" });
    else navigate({ to: "/pin/$estacion", params: { estacion: sel } });
  };

  return (
    <div className="access-screen relative min-h-screen overflow-hidden">
      <img src={maqueta.url} alt="" className="absolute inset-0 size-full scale-110 object-cover opacity-60 blur-md" />
      <div className="relative flex min-h-screen items-center justify-center p-6">
        <main className="glass w-full max-w-[860px] rounded-[var(--radius-panel)] p-7">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <Marca subtitulo="PLANTA BUCARAMANGA · TRAZABILIDAD HACCP" />
            <div className="text-right">
              <PillConexion />
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">Últ. sinc. {SYNC.ultima} · {SYNC.pendientes} eventos pendientes</p>
            </div>
          </header>

          <h1 className="mt-6 text-3xl font-bold tracking-tight">¿Qué quieres abrir hoy?</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Elige tu acceso. Cada persona entra con su propio PIN o contraseña, para que cada registro quede firmado por quien lo hizo.</p>

          <div className="mt-5 grid grid-cols-2 gap-1 rounded-[var(--radius-card)] bg-muted p-1">
            {([["planta", Tablet, "Estaciones de planta · PIN", "Para operarios en tablet. Ingresas con tu PIN de 4–6 dígitos."], ["panel", Monitor, "Panel web · Contraseña", "Para gerencia, ingeniería, sedes y administración desde navegador."]] as const).map(([id, Icon, t, d]) => (
              <button key={id} onClick={() => setModo(id)} className={cn("tap rounded-2xl p-3 text-left transition", modo === id ? "bg-surface shadow-sm" : "text-muted-foreground hover:bg-surface/50")}>
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Icon size={20} /> {t}
                  {id === "planta" ? modo === id && <span className="ml-auto size-2 rounded-full bg-primary" /> : <ExternalLink size={20} className="ml-auto text-muted-foreground" />}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{d}</p>
              </button>
            ))}
          </div>

          {modo === "planta" ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {ESTACIONES.map((e) => {
                const activa = e.id === sel;
                return (
                  <button key={e.id} onClick={() => setSel(e.id)}
                    className={cn("relative min-h-[96px] rounded-[var(--radius-card)] border-2 bg-muted/60 p-3 text-left transition hover:bg-surface", activa ? "bg-surface" : "border-transparent")}
                    style={activa ? { borderColor: e.color } : undefined}>
                    {activa && <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full text-primary-foreground" style={{ background: e.color }}><Check size={14} /></span>}
                    <div className="flex items-center justify-between"><Circulo codigo={e.codigo} color={e.color} /><Chip tono="primary">Activa</Chip></div>
                    <p className="mt-2 text-sm font-semibold">{e.nombre}</p>
                    <p className="text-[11px] leading-tight text-muted-foreground">{e.descripcion}</p>
                    <p className="mt-2 font-mono text-[10px]" style={{ color: e.color }}>{e.dispositivo}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-3 rounded-[var(--radius-card)] bg-muted/60 p-5 text-sm text-muted-foreground">
              <Lock size={20} /> Ingresarás con tu correo y contraseña en la siguiente pantalla.
            </div>
          )}

          <footer className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <a href="#" className="text-sm text-muted-foreground underline">¿Esta tablet es nueva? Registrar dispositivo</a>
            <button onClick={continuar}
              className="tap inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:brightness-110"
              style={{ background: modo === "panel" ? "var(--primary)" : est.color }}>
              {modo === "panel" ? "Continuar al Panel web" : `Continuar a ${est.codigo} ${est.nombre}`} <ArrowRight size={20} />
            </button>
          </footer>
        </main>
      </div>

      <aside className="glass absolute bottom-4 left-4 hidden w-[340px] rounded-[var(--radius-card)] p-4 xl:block">
        <p className="flex items-center gap-2 font-mono text-[11px] font-semibold"><ShieldCheck size={16} /> QUÉ PASA AL ENTRAR</p>
        <div className="mt-2 flex gap-1">
          {([["pasa", "Qué pasa"], ["registra", "Qué se registra"], ["software", "Qué hace el software"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={cn("whitespace-nowrap rounded-full px-2 py-1 font-mono text-[10px]", tab === k ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground")}>{l}</button>
          ))}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{PESTANAS[tab]}</p>
      </aside>
      <p className="absolute bottom-4 right-4 hidden font-mono text-[10px] text-muted-foreground md:flex"><Lock size={12} className="mr-1" />Todo el tráfico va cifrado (HTTPS / TLS 1.3)</p>
      <Link to="/planta" className="sr-only">Planta</Link>
    </div>
  );
}
