import { useState } from "react";
import { Thermometer, Settings2, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PanelLayout } from "@/app/PanelLayout";
import { TabsPanel, EstadoChip, Tabla, Drawer, MotivoForm, EjemploPanel } from "./ui";
import { useCalidad } from "./store";
const INITIAL = [
  {
    id: "CF-1",
    nombre: "Materia prima",
    temp: 1.5,
    min: 0,
    max: 4,
    horarios: "06:00, 12:00, 18:00",
    aviso: true,
  },
  {
    id: "CF-2",
    nombre: "Producto terminado",
    temp: 5.4,
    min: 0,
    max: 4,
    horarios: "06:00, 12:00, 18:00",
    aviso: true,
  },
  {
    id: "CF-3",
    nombre: "Congelación",
    temp: -35,
    min: -38,
    max: -18,
    horarios: "06:00, 12:00, 18:00",
    aviso: true,
  },
];
export function CuartosFrios() {
  const [rooms, setRooms] = useState(INITIAL);
  const [sel, setSel] = useState("CF-1");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(INITIAL[0]);
  const auditar = useCalidad((s) => s.auditar);
  const room = rooms.find((r) => r.id === sel) ?? INITIAL[0];
  if (!room) return null;
  const range = room.max - room.min;
  const vals = Array.from(
    { length: 24 },
    (_, i) =>
      room.min + range * (0.3 + 0.18 * Math.sin(i * 0.7)) + (room.id === "CF-2" && i > 19 ? 2 : 0),
  );
  return (
    <PanelLayout
      title="Cuartos fríos"
      subtitle="Temperaturas, registros y condiciones de almacenamiento"
      active="/panel/cuartos-frios"
      action={
        <Button
          variant="outline"
          onClick={() => {
            setDraft(room);
            setOpen(true);
          }}
        >
          <Settings2 size={20} />
          Configurar cuarto
        </Button>
      }
    >
      <TabsPanel
        tabs={["Registros y temperaturas", "Sensores IoT · próximamente"]}
        disabled={["Sensores IoT · próximamente"]}
        value="Registros y temperaturas"
        onChange={() => {}}
      />
      <div className="cold-room-grid">
        {rooms.map((r) => (
          <Button
            key={r.id}
            variant="ghost"
            className={`cold-room-card ${sel === r.id ? "ring-2 ring-primary/30" : ""}`}
            onClick={() => setSel(r.id)}
          >
            <div className="flex justify-between w-full">
              <span>
                <strong>{r.id}</strong>
                <small>{r.nombre}</small>
              </span>
              <Thermometer size={20} />
            </div>
            <div className="cold-temp">
              <b className={r.temp > r.max ? "text-danger" : "text-primary"}>
                {r.temp.toLocaleString("es-CO")} °C
              </b>
              <EstadoChip tono={r.temp > r.max ? "danger" : "ok"}>
                {r.temp > r.max ? "Fuera de rango" : "Conforme"}
              </EstadoChip>
            </div>
            <span className="text-xs text-muted-foreground">
              Rango {r.min} a {r.max} °C · último registro 12:00
            </span>
          </Button>
        ))}
      </div>
      <section className="panel-surface p-6 mt-5">
        <div className="flex justify-between">
          <h2>{room.id} · Temperatura de las últimas 24 h</h2>
          <span className="text-xs text-muted-foreground">
            Banda permitida: {room.min} a {room.max} °C
          </span>
        </div>
        <div className="temperature-chart">
          <div className="chart-y">
            <span>{room.max + 3} °C</span>
            <span>{room.max} °C</span>
            <span>{room.min} °C</span>
            <span>{room.min - 2} °C</span>
          </div>
          <svg
            viewBox="0 0 1000 180"
            preserveAspectRatio="none"
            role="img"
            aria-label={`Gráfica de temperatura ${room.id}`}
          >
            <rect x="0" y="45" width="1000" height="90" className="chart-band" />
            {[45, 90, 135].map((y) => (
              <line key={y} x1="0" x2="1000" y1={y} y2={y} className="chart-grid-line" />
            ))}
            <polyline
              points={vals
                .map((v, i) => `${(i * 1000) / 23},${135 - ((v - room.min) / range) * 90}`)
                .join(" ")}
              className="chart-temperature-line"
            />
          </svg>
        </div>
        <div className="chart-hours">
          {["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:00"].map((x) => (
            <span key={x}>{x}</span>
          ))}
        </div>
      </section>
      <section className="panel-surface p-5 mt-5">
        <h2 className="mb-4">Registros de temperatura · {room.id}</h2>
        <Tabla
          data={["06:00", "12:00", "18:00"].map((h, i) => ({
            id: `${room.id}-${i}`,
            hora: `23/10/2026 · ${h}`,
            temperatura: i === 1 ? room.temp : room.min + range * 0.4,
            operario: i === 1 ? "Carlos Mendoza" : "Luisa Gómez",
            dispositivo: `Tablet ${room.id}`,
            estado: i === 1 && room.temp > room.max ? "Fuera de rango" : "Conforme",
          }))}
          cols={[
            { key: "hora", label: "Fecha y hora" },
            {
              key: "temperatura",
              label: "Temperatura",
              render: (r) => <span className="font-mono">{r.temperatura.toFixed(1)} °C</span>,
            },
            { key: "operario", label: "Responsable" },
            { key: "dispositivo", label: "Dispositivo" },
            {
              key: "estado",
              label: "Estado",
              render: (r) => (
                <EstadoChip tono={r.estado === "Conforme" ? "ok" : "danger"}>{r.estado}</EstadoChip>
              ),
            },
          ]}
        />
        <EjemploPanel />
      </section>
      <Drawer open={open} onClose={() => setOpen(false)} title={`Configuración ${draft?.id ?? ""}`}>
        {draft && (
          <>
            <div className="detail-two">
              <label className="field-label">
                Temperatura mínima
                <input
                  type="number"
                  className="panel-input"
                  value={draft.min}
                  onChange={(e) => setDraft({ ...draft, min: Number(e.target.value) })}
                />
              </label>
              <label className="field-label">
                Temperatura máxima
                <input
                  type="number"
                  className="panel-input"
                  value={draft.max}
                  onChange={(e) => setDraft({ ...draft, max: Number(e.target.value) })}
                />
              </label>
            </div>
            <label className="field-label">
              Horarios de registro
              <input
                className="panel-input"
                value={draft.horarios}
                onChange={(e) => setDraft({ ...draft, horarios: e.target.value })}
              />
            </label>
            <label className="flex gap-3 text-sm">
              <input
                type="checkbox"
                checked={draft.aviso}
                onChange={(e) => setDraft({ ...draft, aviso: e.target.checked })}
              />
              Avisar si falta un registro
            </label>
            <MotivoForm
              onSubmit={(d) => {
                if (draft.min >= draft.max || !draft.horarios.trim()) {
                  toast.error("Revisa el rango y los horarios.");
                  return;
                }
                setRooms(rooms.map((r) => (r.id === draft.id ? draft : r)));
                auditar(
                  draft.id,
                  "Configuración",
                  JSON.stringify(room),
                  JSON.stringify(draft),
                  d.motivo,
                );
                setOpen(false);
                toast.success("Configuración guardada");
              }}
            />
            <EjemploPanel />
          </>
        )}
      </Drawer>
    </PanelLayout>
  );
}
