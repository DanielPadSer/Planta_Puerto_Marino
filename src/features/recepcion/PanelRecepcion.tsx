import { useState } from "react";
import { Check, CheckCircle2, Pencil, Printer, Undo2 } from "lucide-react";
import { dentroTolerancia, diferenciaPct, kg, pesoContenedores, pesoNeto, redondear, TOLERANCIA_PCT } from "@/domain/reglas";
import { Chip } from "@/ui/marca";
import { BotonPrincipal, Ejemplo, PanelCuerpo, Seccion, Segmentado, Stepper } from "@/features/planta/panelUi";
import { cn } from "@/lib/utils";
import { useScale } from "./useScale";

const FACTURA_KG = 50;
const CANASTA_KG = 0.8;

export function PanelRecepcion({ color }: { color: string }) {
  const lectura = useScale(24.3);
  const [tandas, setTandas] = useState<number[]>([27.5, 24.3]);
  const [metodo, setMetodo] = useState<"catalogo" | "bascula" | "medida">("catalogo");
  const [canastas, setCanastas] = useState(4);
  const [hielo, setHielo] = useState(0);
  const [creado, setCreado] = useState(false);

  const bruto = redondear(tandas.reduce((s, t) => s + t, 0));
  const contenedores = [{ nombre: "Canasta", pesoKg: CANASTA_KG, cantidad: canastas }];
  const neto = pesoNeto(bruto, contenedores, hielo);
  const dif = diferenciaPct(FACTURA_KG, neto);
  const ok = dentroTolerancia(dif);

  return (
    <PanelCuerpo accion={
      <BotonPrincipal color={color} disabled={tandas.length === 0 || neto <= 0 || creado} onClick={() => setCreado(true)}>
        <Printer size={20} /> {creado ? "Lote LT-0245 creado" : "Crear lote LT-0245 e imprimir etiqueta"}
      </BotonPrincipal>
    }>
      <div className="space-y-3">
        <Seccion n={1} titulo="Entrega" extra={<Chip tono="ok">2,8 °C <Check size={10} /></Chip>}>
          <p className="text-sm font-semibold">Proveedor A · FV-30241 · Filete de mojarra</p>
          <p className="font-mono text-[11px] text-muted-foreground">Lote proveedor PA-7781 · Camión TKR-482</p>
        </Seccion>

        <Seccion n={2} titulo="Báscula" activa extra={<Chip tono="ok">● Báscula conectada</Chip>}>
          <div className="flex items-end justify-between rounded-2xl bg-muted p-4">
            <div>
              <p className="scale-reading font-mono text-5xl font-bold tracking-tight">{kg(lectura.kg)} <span className="text-xl text-muted-foreground">kg</span></p>
              <p className="mt-1 text-[11px] text-muted-foreground">Lectura en vivo (Báscula de piso #1)</p>
            </div>
            <span className={cn("rounded-full px-3 py-1 font-mono text-[11px] font-bold text-primary-foreground", lectura.estable ? "bg-ok" : "bg-warn")}>
              {lectura.estable ? "ESTABLE ✓" : "INESTABLE"}
            </span>
          </div>
          <button disabled={!lectura.estable} onClick={() => setTandas([...tandas, lectura.kg])}
            className="tap mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-primary font-semibold text-primary disabled:border-border disabled:text-muted-foreground">
            <Undo2 size={20} /> {lectura.estable ? "Capturar peso" : "Esperando lectura estable…"}
          </button>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {tandas.map((t, i) => (
              <button key={i} onClick={() => setTandas(tandas.filter((_, j) => j !== i))} title="Quitar tanda" className="rounded-lg bg-muted px-2 py-1 font-mono text-[11px]">Tanda {i + 1}: {kg(t)} kg ×</button>
            ))}
            <span className="ml-auto text-[11px] text-primary">+ Otra tanda: captura de nuevo</span>
          </div>
        </Seccion>

        <Seccion n={3} titulo="Descuentos y neto">
          <Segmentado opciones={[["catalogo", "Catálogo"], ["bascula", "Tara en báscula"], ["medida", "Medida ahora"]] as const} valor={metodo} onChange={setMetodo} />
          <div className="mt-3 flex items-center justify-between gap-2 text-xs">
            <span>{canastas} canastas × {kg(CANASTA_KG)} kg <span className="text-muted-foreground">(−{kg(pesoContenedores(contenedores))} kg)</span></span>
            <Stepper valor={canastas} onChange={setCanastas} max={40} />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 text-xs">
            <span>Hielo (pesar escurrido)</span>
            <Stepper valor={hielo} onChange={setHielo} paso={0.5} max={20} formato={(v) => `${kg(v)}`} />
          </div>
          <p className="mt-2 flex items-center gap-1 text-[11px] text-primary"><Pencil size={12} /> Rango configurado: tolerancia ±{TOLERANCIA_PCT} %</p>
          <p className="mt-2 rounded-xl bg-muted p-2 text-center font-mono text-[11px] text-muted-foreground">
            Bruto {kg(bruto)} − Contenedores {kg(pesoContenedores(contenedores))} − Hielo {kg(hielo)} = Neto
          </p>
          <div className="mt-2 flex items-center justify-between rounded-2xl border-2 border-primary/30 bg-primary-soft p-3">
            <span className="font-mono text-xs font-bold text-primary">PESO NETO</span>
            <span className="font-mono text-3xl font-bold text-primary">{kg(neto)} kg</span>
          </div>
          <div className="mt-2 flex justify-between text-[11px]"><span>Factura {kg(FACTURA_KG)} kg → Recibido {kg(neto)} kg</span><span className={cn("font-mono font-bold", ok ? "text-warn" : "text-danger")}>{dif > 0 ? "+" : ""}{kg(dif)} %</span></div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted"><div className={cn("h-full", ok ? "bg-warn" : "bg-danger")} style={{ width: `${Math.min(100, (neto / FACTURA_KG) * 100)}%` }} /></div>
          {!ok && <p className="mt-1 text-[11px] font-medium text-danger">Diferencia fuera de tolerancia: el lote quedará "Por validar".</p>}
        </Seccion>
        <Ejemplo />
        {creado && <p className="flex items-center gap-2 rounded-xl bg-ok/10 p-3 text-sm font-medium text-ok"><CheckCircle2 size={20} /> Lote LT-0245 creado · etiqueta enviada a la impresora.</p>}
      </div>
    </PanelCuerpo>
  );
}
