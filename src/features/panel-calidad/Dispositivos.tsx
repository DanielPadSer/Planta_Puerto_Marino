import { useState } from "react";
import {
  Monitor,
  WifiOff,
  Scale,
  Plus,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PanelLayout } from "@/app/PanelLayout";
import { KPIs, Buscador, TabsPanel, Tabla, EstadoChip, Drawer, MotivoForm } from "./ui";
import { useCalidad } from "./store";
import type { Dispositivo } from "@/domain/calidad";
const tipos = [
  "Todos",
  "Computadores de planta",
  "Básculas",
  "Impresoras",
  "Lectores",
  "Termómetros",
  "Sensores IoT",
];
export function Dispositivos() {
  const { dispositivos, editarDispositivo, agregarDispositivo } = useCalidad();
  const [tab, setTab] = useState("Todos");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<Dispositivo | null>(null);
  const [wizard, setWizard] = useState(false);
  const [step, setStep] = useState(0);
  const [tipo, setTipo] = useState("Computadores de planta");
  const [nombre, setNombre] = useState("");
  const [estacion, setEstacion] = useState("Recepción");
  const [modelo, setModelo] = useState("");
  const [tested, setTested] = useState(false);
  const [periferico, setPeriferico] = useState("Báscula Recepción");
  const rows = dispositivos.filter(
    (d) =>
      (tab === "Todos" || d.tipo === tab) &&
      `${d.nombre} ${d.estacion} ${d.id}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <PanelLayout
      title="Dispositivos y equipos"
      subtitle="Registro y control del hardware que se usa en la planta"
      active="/panel/dispositivos"
      action={
        <Button
          onClick={() => {
            setWizard(true);
            setStep(0);
            setTested(false);
            setNombre("");
            setModelo("");
          }}
        >
          <Plus size={20} />
          Registrar dispositivo
        </Button>
      }
    >
      <KPIs
        items={[
          {
            label: "Dispositivos registrados",
            value: dispositivos.length,
            icon: <Monitor size={20} />,
          },
          {
            label: "Sin conexión",
            value: dispositivos.filter((d) => d.estado === "Sin conexión").length,
            icon: <WifiOff size={20} />,
          },
          { label: "Básculas de planta", value: 3, icon: <Scale size={20} /> },
          { label: "Por validar o vencer", value: 2, icon: <ShieldCheck size={20} /> },
        ]}
      />
      <TabsPanel tabs={tipos} disabled={["Sensores IoT"]} value={tab} onChange={setTab} />
      <section className="panel-surface p-5 mt-4">
        <div className="flex justify-between items-center mb-4">
          <h2>Hardware de planta</h2>
          <span className="text-xs text-muted-foreground">Identidad y conectividad simuladas</span>
        </div>
        <Buscador
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre, estación o serie…"
        />
        <div className="mt-4">
          <Tabla
            data={rows}
            onSelect={(d) => setDraft({ ...d })}
            cols={[
              {
                key: "nombre",
                label: "Dispositivo",
                render: (d) => (
                  <span>
                    <b>{d.nombre}</b>
                    <small className="block text-xs text-muted-foreground mt-1">
                      {d.id} · {d.modelo}
                    </small>
                  </span>
                ),
              },
              { key: "estacion", label: "Estación" },
              { key: "tipo", label: "Tipo" },
              {
                key: "estado",
                label: "Estado",
                render: (d) => (
                  <EstadoChip
                    tono={
                      d.revocado
                        ? "danger"
                        : d.estado === "Activo" || d.estado === "Operativa"
                          ? "ok"
                          : "warn"
                    }
                  >
                    {d.estado}
                  </EstadoChip>
                ),
              },
              { key: "contacto", label: "Último contacto" },
              { key: "pendientes", label: "Pendientes" },
            ]}
          />
        </div>
      </section>
      <Drawer
        open={draft !== null}
        onClose={() => setDraft(null)}
        title={draft?.nombre ?? "Dispositivo"}
      >
        {draft && (
          <>
            <h3 className="section-eyebrow">IDENTIDAD</h3>
            <label className="field-label">
              Nombre
              <input
                className="panel-input"
                value={draft.nombre}
                onChange={(e) => setDraft({ ...draft, nombre: e.target.value })}
              />
            </label>
            <div className="detail-two">
              <label className="field-label">
                Estación
                <select
                  className="panel-input"
                  value={draft.estacion}
                  onChange={(e) => setDraft({ ...draft, estacion: e.target.value })}
                >
                  {["Recepción", "Empaque", "Cocción", "Despacho", "Cuartos fríos"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label className="field-label">
                Modelo
                <input
                  className="panel-input"
                  value={draft.modelo}
                  onChange={(e) => setDraft({ ...draft, modelo: e.target.value })}
                />
              </label>
            </div>
            <h3 className="section-eyebrow">CONEXIÓN</h3>
            <div className="detail-box flex justify-between items-center">
              <code>pm_••••••••••7f35</code>
              <Button
                variant="outline"
                className="text-danger"
                disabled={draft.revocado}
                onClick={() => setDraft({ ...draft, revocado: true, estado: "Token revocado" })}
              >
                Revocar token
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              La revocación se aplica al guardar con motivo.
            </p>
            <h3 className="section-eyebrow">SINCRONIZACIÓN</h3>
            <div className="detail-two">
              <p className="detail-box">
                Última sync
                <br />
                <b>{draft.contacto}</b>
              </p>
              <p className="detail-box">
                Pendientes
                <br />
                <b>{draft.pendientes}</b>
              </p>
            </div>
            <h3 className="section-eyebrow">BLOQUE DE CONSECUTIVOS</h3>
            <div className="consecutive-bar">
              <div />
            </div>
            <p className="text-xs text-muted-foreground">
              LT-0245–0400 · 82 % disponible · aviso al 20 %
            </p>
            <h3 className="section-eyebrow">PERIFÉRICOS</h3>
            <select
              className="panel-input"
              value={periferico}
              onChange={(e) => setPeriferico(e.target.value)}
            >
              {[
                "Báscula Recepción",
                "Lector Recepción 01",
                "Impresora Zebra",
                "Sin periféricos",
              ].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <MotivoForm
              onSubmit={(d) => {
                if (!draft.nombre.trim()) {
                  toast.error("Ingresa el nombre del dispositivo");
                  return;
                }
                editarDispositivo(draft, d.motivo + ` · Periférico: ${periferico}`);
                setDraft(null);
                toast.success("Dispositivo actualizado");
              }}
            />
          </>
        )}
      </Drawer>
      <Dialog open={wizard} onOpenChange={setWizard}>
        <DialogContent className="panel-wizard">
          <DialogTitle>Registrar dispositivo</DialogTitle>
          <DialogDescription>Alta simulada de hardware de planta</DialogDescription>
          <div className="wizard-steps">
            {["Tipo", "Datos", "Configuración", "Prueba", "Activar"].map((x, i) => (
              <span key={x} className={i === step ? "text-primary font-bold" : ""}>
                <b>{i + 1}</b>
                {x}
              </span>
            ))}
          </div>
          {step === 0 ? (
            <label className="field-label">
              Tipo de dispositivo
              <select
                className="panel-input"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                {tipos.slice(1, -1).map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
          ) : step === 1 ? (
            <>
              <label className="field-label">
                Nombre
                <input
                  className="panel-input"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </label>
              <label className="field-label">
                Modelo / serie
                <input
                  className="panel-input"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                />
              </label>
            </>
          ) : step === 2 ? (
            <label className="field-label">
              Estación asignada
              <select
                className="panel-input"
                value={estacion}
                onChange={(e) => setEstacion(e.target.value)}
              >
                {["Recepción", "Empaque", "Cocción", "Despacho", "Cuartos fríos"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
          ) : step === 3 ? (
            <div className="space-y-3">
              <p>Verificación de conexión y periféricos</p>
              <Button
                variant="outline"
                onClick={() => {
                  setTested(true);
                  toast.success("Prueba simulada correcta");
                }}
              >
                <Check size={20} />
                Ejecutar prueba
              </Button>
              {tested && <EstadoChip>Prueba correcta</EstadoChip>}
            </div>
          ) : (
            <div className="detail-box">
              <b>{nombre}</b>
              <p>
                {tipo} · {estacion} · {modelo || "Por confirmar"}
              </p>
              <p>Prueba correcta · listo para activar</p>
            </div>
          )}
          <div className="flex justify-between mt-4">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
              <ArrowLeft size={20} />
              Anterior
            </Button>
            <Button
              onClick={() => {
                if (step === 1 && !nombre.trim()) {
                  toast.error("El nombre es obligatorio");
                  return;
                }
                if (step === 3 && !tested) {
                  toast.error("Ejecuta la prueba antes de continuar");
                  return;
                }
                if (step < 4) {
                  setStep(step + 1);
                  return;
                }
                agregarDispositivo({
                  id: `DSP-${Date.now()}`,
                  nombre,
                  tipo,
                  estacion,
                  modelo: modelo || "Por confirmar",
                  estado: "Activo",
                  contacto: "Ahora",
                  pendientes: 0,
                  revocado: false,
                });
                setWizard(false);
                toast.success("Dispositivo activado");
              }}
            >
              {step === 4 ? "Activar dispositivo" : "Siguiente"}
              <ArrowRight size={20} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PanelLayout>
  );
}
