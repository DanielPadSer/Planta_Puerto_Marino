import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, ExternalLink, Lock, Play } from "lucide-react";
import type { ZonaId } from "@/domain/types";
import { Aviso, BotonPrincipal, Ejemplo, Fila, PanelCuerpo, Seccion } from "./panelUi";

interface Config {
  secciones: { titulo: string; filas: [string, string][] }[];
  aviso?: { tono: "warn" | "danger"; texto: string };
  medicion?: { label: string; unidad: string };
  boton: string;
  bloqueo?: string;
}

const CONFIG: Partial<Record<ZonaId, Config>> = {
  coccion: {
    secciones: [
      { titulo: "Equipo", filas: [["Marmita 1", "Liberado · HACCP OK"], ["Limpieza", "N2 · 06:40"]] },
      { titulo: "Lotes de entrada", filas: [["LT-0238", "20,8 kg"], ["LT-0245", "9,2 kg"]] },
      { titulo: "Regla vigente v.12", filas: [["Temp. en el centro", "≥ 85 °C"], ["Tiempo", "≥ 3 min"], ["Enfriamiento etapa 1", "60 → 21 °C en ≤ 2 h"], ["Enfriamiento etapa 2", "21 → 4 °C en ≤ 4 h"]] },
    ],
    medicion: { label: "Temperatura en el centro", unidad: "°C" },
    boton: "Iniciar cocción LC-0246-A",
  },
  marinado: {
    secciones: [
      { titulo: "Lotes e ingredientes", filas: [["LT-0245", "18,0 kg"], ["Marinada cítrica", "Lote MC-112 · 1,8 L"]] },
      { titulo: "Tiempo y temperatura", filas: [["Tiempo de marinado", "45 min"], ["Temperatura", "≤ 4 °C"]] },
      { titulo: "Equipo", filas: [["Marinador 1", "Liberado 06:50"]] },
    ],
    aviso: { tono: "warn", texto: "Producto crudo: debe mantenerse refrigerado y etiquetarse como tal." },
    boton: "Iniciar marinado LM-0246-A",
  },
  cf2: {
    secciones: [
      { titulo: "Paquetes que entran", filas: [["PT-0245-017", "250 g · vence 29/09"], ["PT-0245-016", "250 g · vence 29/09"], ["PT-0245-015", "250 g · vence 29/09"]] },
      { titulo: "Estante", filas: [["B-1", "62 paquetes · 8 celdas libres"]] },
      { titulo: "Vencimientos próximos", filas: [["PT-0231-*", "24 paquetes · vence 26/09"]] },
    ],
    aviso: { tono: "danger", texto: "Temperatura del cuarto 5,4 °C (límite 4,0 °C). Lote PM-8921 en alerta." },
    boton: "Guardar 3 paquetes en B-1",
  },
  cf3: {
    secciones: [
      { titulo: "Entrada al túnel", filas: [["Hora de entrada", "06:12"], ["Paquetes", "PT-0244-001 a 040"], ["Temp. del túnel", "-35,0 °C"]] },
    ],
    medicion: { label: "Temperatura del centro", unidad: "°C" },
    boton: "Marcar congelado",
    bloqueo: "Mide la temperatura del centro para habilitar",
  },
  despacho: {
    secciones: [
      { titulo: "Pedidos de sedes", filas: [["Sede Cabecera", "40 paquetes"], ["Sede Floridablanca", "18 paquetes"]] },
      { titulo: "FEFO sugerido", filas: [["PT-0231-*", "vence 26/09"], ["PT-0238-*", "vence 28/09"]] },
      { titulo: "Remisión", filas: [["REM-1182", "Borrador · 0 de 40"]] },
    ],
    boton: "Escanear paquetes del pedido",
  },
};

export function PanelGenerico({ zona, color }: { zona: ZonaId; color: string }) {
  const [medida, setMedida] = useState("");
  const [hecho, setHecho] = useState(false);

  if (zona === "pedidos" || zona === "sede") {
    return (
      <PanelCuerpo accion={<Link to="/panel/login" className="tap flex w-full items-center justify-center gap-2 rounded-2xl font-semibold text-primary-foreground" style={{ background: color }}><ExternalLink size={20} /> Abrir Panel web</Link>}>
        <div className="space-y-3"><Aviso tono="warn">Esta función se usa desde el Panel web.</Aviso></div>
      </PanelCuerpo>
    );
  }
  const c = CONFIG[zona];
  if (!c) return null;
  const falta = !!c.medicion && medida.trim() === "";

  return (
    <PanelCuerpo accion={
      <BotonPrincipal color={color} disabled={falta || hecho} onClick={() => setHecho(true)}>
        {falta ? <Lock size={20} /> : <Play size={20} />} {falta && c.bloqueo ? c.bloqueo : c.boton}
      </BotonPrincipal>
    }>
      <div className="space-y-3">
        {c.aviso && <Aviso tono={c.aviso.tono}>{c.aviso.texto}</Aviso>}
        {c.secciones.map((s, i) => (
          <Seccion key={s.titulo} n={i + 1} titulo={s.titulo} activa={i === 0}>
            {s.filas.map(([k, v]) => <Fila key={k} k={k} v={v} />)}
          </Seccion>
        ))}
        {c.medicion && (
          <Seccion n={c.secciones.length + 1} titulo="Medición">
            <label className="text-xs">{c.medicion.label} ({c.medicion.unidad})
              <input value={medida} onChange={(e) => setMedida(e.target.value.replace(/[^\d,.-]/g, ""))} inputMode="decimal" className="tap mt-1 w-full rounded-xl border px-3 font-mono text-lg" placeholder="0,0" />
            </label>
          </Seccion>
        )}
        <Ejemplo />
        {hecho && <p className="flex items-center gap-2 rounded-xl bg-ok/10 p-3 text-sm font-medium text-ok"><CheckCircle2 size={20} /> Registro guardado con operario, dispositivo y hora.</p>}
      </div>
    </PanelCuerpo>
  );
}
