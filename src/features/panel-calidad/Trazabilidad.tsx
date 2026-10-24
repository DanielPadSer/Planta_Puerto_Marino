import { useState } from "react";
import {
  Network,
  Download,
  Clock,
  Scale,
  PackageCheck,
  ShieldCheck,
  FileText,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PanelLayout } from "@/app/PanelLayout";
import { useCalidad } from "./store";
import { Buscador, EstadoChip, KPIs, downloadJSON, EjemploPanel } from "./ui";
import { cn } from "@/lib/utils";
const stages = [
  {
    id: "1",
    name: "Recepción y báscula",
    time: "06:12",
    code: "LT-0245",
    values: ["Peso neto: 48,60 kg", "Temperatura: 2,8 °C", "Báscula Recepción 1"],
    person: "Carlos Mendoza",
    device: "Tablet Recepción 01",
    pcc: "PCC-1",
  },
  {
    id: "2",
    name: "Almacenamiento CF-1 · materia prima",
    time: "06:15",
    code: "LT-0245",
    values: ["Estante B-2 (CF-1)", "Temperatura: 1,8 °C", "FEFO · vence 28/10"],
    person: "Carlos Mendoza",
    device: "Tablet CF-1",
    pcc: "",
  },
  {
    id: "3",
    name: "Sanitización de equipo (POE)",
    time: "07:15",
    code: "LIM-014",
    values: ["Marmita 2 · N2", "Desinfectante: 200 ppm", "ATP · si aplica, por confirmar"],
    person: "Luisa Gómez · encargada de limpieza",
    device: "Tablet Limpieza",
    pcc: "",
  },
  {
    id: "4",
    name: "Cocción en marmita y enfriamiento",
    time: "07:40",
    code: "LC-0245-A",
    values: ["Núcleo: 72,5 °C × 2 min 10 s", "Final: 3,2 °C en 54 min", "Marmita 2 · Abatidor"],
    person: "Andrés Silva",
    device: "Tablet Cocción 01",
    pcc: "PCC-2",
  },
  {
    id: "5",
    name: "Porcionado y empaque al vacío",
    time: "11:30",
    code: "PT-0245-017",
    values: ["194 paquetes × 250 g", "Vence: 28/10/2026", "Selladora 1 · Zebra ZD421"],
    person: "Marta Pinzón",
    device: "Tablet Empaque 02",
    pcc: "PCC-3",
  },
  {
    id: "6",
    name: "Almacenamiento CF-2 y despacho",
    time: "13:00",
    code: "REM-001",
    values: ["Estante B-1 · 2,1 °C", "Sede 2 · 194 paquetes", "Vehículo refrigerado"],
    person: "Carlos Mendoza",
    device: "Tablet Despacho 01",
    pcc: "",
  },
];
export function Trazabilidad() {
  const lotes = useCalidad((s) => s.lotes);
  const [query, setQuery] = useState("LT-0245");
  const [code, setCode] = useState("LT-0245");
  const [selected, setSelected] = useState("4");
  const [direction, setDirection] = useState("");
  const stage = stages.find((s) => s.id === selected) ?? stages[0];
  const valid =
    lotes.some((l) => l.id === code) || ["LC-0245-A", "PT-0245-017", "REM-001"].includes(code);
  const lote = lotes.find((l) => l.id === code) ?? lotes[0];
  return (
    <PanelLayout
      title="Trazabilidad de lote"
      subtitle="Árbol genealógico completo, evidencia por etapa y despachos a sedes"
      active="/panel/trazabilidad"
    >
      <section className="trace-search-band">
        <Buscador value={query} onChange={setQuery} placeholder="Buscar lote interno…" />
        <Button
          onClick={() => {
            setCode(query.trim().toUpperCase());
            setDirection("");
          }}
        >
          Consultar
        </Button>
        <span className="text-xs text-muted-foreground">RECIENTES</span>
        {["LT-0245", "LC-0245-A", "PT-0245-017", "REM-001"].map((c) => (
          <Button
            key={c}
            variant="ghost"
            onClick={() => {
              setQuery(c);
              setCode(c);
            }}
            className={cn("font-mono text-xs", code === c && "bg-primary-soft text-primary")}
          >
            {c}
          </Button>
        ))}
      </section>
      {!valid ? (
        <div className="panel-surface empty-state">
          No se encontró el lote {code}. Prueba LT-0245.
        </div>
      ) : (
        <>
          <div className="trace-summary">
            <div>
              <strong className="font-mono text-primary text-xl">{code}</strong>
              <h2>{lote?.producto ?? "Filete de mojarra"}</h2>
              <p>
                {lote?.proveedor} · Regla v{lote?.version}
              </p>
              <EstadoChip tono="primary">Evidencia simulada · HACCP</EstadoChip>
            </div>
            <KPIs
              items={[
                { label: "Ciclo planta", value: "6 h 48 min", icon: <Clock size={20} /> },
                { label: "Peso neto", value: `${lote?.kg ?? 48.6} kg`, icon: <Scale size={20} /> },
                { label: "Rendimiento", value: "194 pqts", icon: <PackageCheck size={20} /> },
                { label: "Puntos críticos", value: "3 / 3 PCC", icon: <ShieldCheck size={20} /> },
              ]}
            />
          </div>
          <div className="trace-grid">
            <section className="panel-surface p-5">
              <h2 className="flex gap-2 items-center mb-5">
                <Network size={20} />
                Árbol genealógico y trazabilidad operativa
              </h2>
              <div className="trace-stages">
                {stages.map((s) => (
                  <Button
                    variant="ghost"
                    key={s.id}
                    onClick={() => setSelected(s.id)}
                    className={cn("trace-stage", s.id === selected && "trace-stage-active")}
                  >
                    <span className="trace-number">{s.id}</span>
                    <div>
                      <div className="flex justify-between gap-2">
                        <b>{s.name}</b>
                        <small>{s.time}</small>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <code>{s.code}</code>
                        {s.pcc && <EstadoChip>{s.pcc}</EstadoChip>}
                      </div>
                      <div className="trace-values">
                        {s.values.map((v) => (
                          <span key={v}>{v}</span>
                        ))}
                      </div>
                      <small>
                        {s.person} · {s.device}
                      </small>
                    </div>
                  </Button>
                ))}
              </div>
            </section>
            <aside className="panel-surface p-5">
              {stage && (
                <>
                  <EstadoChip>Etapa {stage.id} · evidencia registrada</EstadoChip>
                  <h2 className="mt-3">{stage.name}</h2>
                  <div className="detail-box mt-4">
                    <code className="text-primary">{stage.code}</code>
                    {stage.values.map((v) => (
                      <p key={v} className="mt-3 font-semibold">
                        {v}
                      </p>
                    ))}
                  </div>
                  <h3 className="section-eyebrow mt-6">REGLA TÉCNICA APLICADA</h3>
                  <p className="detail-box mt-2">
                    RGL-088 · Filete de mojarra · v{lote?.version}
                    <br />
                    Versión conservada desde la aprobación.
                  </p>
                  <h3 className="section-eyebrow mt-6">EVIDENCIA POR ETAPA</h3>
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => toast.info(`Evidencia simulada de ${stage.name}`)}
                  >
                    <FileText size={20} />
                    Ver registro y evidencia
                  </Button>
                  <p className="detail-box mt-3 font-mono text-xs">
                    REGISTRO: {stage.code}-{stage.id}
                    <br />
                    RESPONSABLE: {stage.person}
                    <br />
                    DISPOSITIVO: {stage.device}
                    <br />
                    HORA: 23/10/2026 {stage.time}
                  </p>
                  <h3 className="section-eyebrow mt-6">SIMULACRO DE RETIRO</h3>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" onClick={() => setDirection("atrás")}>
                      <ArrowLeft size={20} />
                      Hacia atrás
                    </Button>
                    <Button variant="outline" onClick={() => setDirection("adelante")}>
                      Hacia adelante
                      <ArrowRight size={20} />
                    </Button>
                  </div>
                  {direction && (
                    <div className="detail-box mt-3">
                      <b>Retiro hacia {direction}</b>
                      <p className="mt-2 text-sm">
                        {direction === "atrás"
                          ? "Proveedor Pescados del Caribe → LT-0245 → LC-0245-A. Materia prima identificada: 48,60 kg."
                          : "LC-0245-A → 194 paquetes PT-0245 → REM-001 → Sede 2. Contactos y paquetes afectados identificados."}
                      </p>
                      <EstadoChip tono="warn">Simulacro · sin aviso real</EstadoChip>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full mt-5"
                    onClick={() =>
                      downloadJSON(`trazabilidad-${code}.json`, {
                        lote,
                        etapas: stages,
                        simulado: true,
                      })
                    }
                  >
                    <Download size={20} />
                    Exportar JSON
                  </Button>
                  <EjemploPanel />
                </>
              )}
            </aside>
          </div>
        </>
      )}
    </PanelLayout>
  );
}
