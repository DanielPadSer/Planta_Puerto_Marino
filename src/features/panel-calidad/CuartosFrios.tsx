import { useState } from "react";
import { Thermometer, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PanelLayout } from "@/app/PanelLayout";
import { TabsPanel, EstadoChip, Tabla, Drawer, MotivoForm, EjemploPanel } from "./ui";
import { useCalidad } from "./store";
import { TemperaturaChart } from "./TemperaturaChart";
import { BannerSoloLectura, useModoLectura } from "@/ui/permisos";
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
  return (
    <PanelLayout
      title="Monitoreo"
      subtitle="Temperaturas, registros y condiciones de almacenamiento de los cuartos fríos"
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
        <TemperaturaChart room={room} />
      </section>
      <section className="panel-surface p-5 mt-5">
        <h2 className="mb-4">Registros de temperatura · {room.id}</h2>
        <Tabla
          rowClassName={(r) => r.estado === "Fuera de rango" ? "temperature-alert-row" : ""}
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
              render: (r) => <span className="font-mono">{r.temperatura.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} °C</span>,
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
