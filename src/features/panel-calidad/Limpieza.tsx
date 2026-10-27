import { useState } from "react";
import { ShieldCheck, ClipboardCheck, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PanelLayout } from "@/app/PanelLayout";
import {
  PASOS_POE,
} from "@/domain/reglas";
import { TabsPanel, EstadoChip, MotivoForm, EjemploPanel, Tabla, Drawer } from "./ui";
import { useCalidad } from "./store";
import { MatrizEditable } from "./MatrizEditable";
import { BannerSoloLectura, BotonRestringido, useModoLectura, usePuede } from "@/ui/permisos";
const EQUIPOS = [
  { id: "EQ-01", nombre: "Marmita 1", estado: "Liberado" },
  { id: "EQ-02", nombre: "Marmita 2", estado: "Usado" },
  { id: "EQ-03", nombre: "Horno", estado: "Liberado" },
  { id: "EQ-04", nombre: "Marinador", estado: "Por verificar" },
  { id: "EQ-05", nombre: "Abatidor", estado: "Fuera de servicio" },
];
export function Limpieza() {
  const [tab, setTab] = useState("Matriz de cambio");
  const [nivel, setNivel] = useState("N2");
  const [version, setVersion] = useState(2);
  const [open, setOpen] = useState(false);
  const [pasos, setPasos] = useState(PASOS_POE.N2);
  const [ppm, setPpm] = useState(200);
  const [contacto, setContacto] = useState(10);
  const [fin, setFin] = useState(true);
  const [aplica, setAplica] = useState(false);
  const auditar = useCalidad((s) => s.auditar);
  const lectura = useModoLectura("limpieza.matriz");
  const puedeEstadoEquipos = usePuede("editar", "equipos.estado");
  const poe = (
    <fieldset disabled={lectura} className="contents">
      <div className="flex gap-2">
        <EstadoChip tono="primary">v{version} · vigente</EstadoChip>
        <EstadoChip tono="warn">Parámetro N2</EstadoChip>
      </div>
      <h2>Nivel N2 · Limpieza profunda</h2>
      <p className="text-sm text-muted-foreground">
        Cambio de especie o perfil de alérgenos. Sin excepción ante cambio de perfil.
      </p>
      <h3 className="section-eyebrow">PASOS DEL PROCEDIMIENTO</h3>
      {pasos.map((p, i) => (
        <label key={i} className="poe-step">
          <b>{i + 1}</b>
          <input
            aria-label={`Paso ${i + 1}`}
            className="panel-input"
            value={p}
            onChange={(e) => setPasos(pasos.map((x, j) => (i === j ? e.target.value : x)))}
          />
        </label>
      ))}
      <div className="detail-two">
        <label className="field-label">
          Desinfectante (ppm)
          <input
            type="number"
            className="panel-input"
            value={ppm}
            onChange={(e) => setPpm(Number(e.target.value))}
          />
        </label>
        <label className="field-label">
          Contacto (min)
          <input
            type="number"
            className="panel-input"
            value={contacto}
            onChange={(e) => setContacto(Number(e.target.value))}
          />
        </label>
      </div>
      <p className="detail-box">
        Prueba ATP o de alérgeno <EstadoChip tono="warn">Si aplica · por confirmar</EstadoChip>
      </p>
      <label className="flex justify-between text-sm">
        Limpieza obligatoria de fin de turno
        <input
          type="checkbox"
          checked={fin}
          onChange={(e) => setFin(e.target.checked)}
          className="size-5 accent-primary"
        />
      </label>
      <label className="flex justify-between text-sm">
        Registrar prueba si aplica
        <input
          type="checkbox"
          checked={aplica}
          onChange={(e) => setAplica(e.target.checked)}
          className="size-5 accent-primary"
        />
      </label>
      {!lectura && (
        <MotivoForm
          label="Guardar nueva versión del POE"
          onSubmit={(d) => {
            if (ppm <= 0 || contacto <= 0 || pasos.some((p) => !p.trim())) {
              toast.error("Completa los pasos y las mediciones.");
              return;
            }
            auditar(
              "Procedimiento N2",
              "Parámetros",
              `v${version}`,
              JSON.stringify({ pasos, ppm, contacto, fin, aplica }),
              d.motivo,
              version + 1,
            );
            setVersion(version + 1);
            toast.success(`POE v${version + 1} guardado`);
          }}
        />
      )}{" "}
    </fieldset>
  );
  return (
    <PanelLayout
      title="Limpieza y equipos"
      subtitle="Matriz de cambio de producto, procedimientos y equipos controlados"
      active="/panel/limpieza"
      action={
        lectura ? undefined : (
          <Button onClick={() => setOpen(true)}>
            <Plus size={20} />
            Editar procedimiento
          </Button>
        )
      }
    >
      <BannerSoloLectura recurso="limpieza.matriz" />
      <TabsPanel
        tabs={["Matriz de cambio", "Procedimientos (POE)", "Equipos", "Registros de limpieza"]}
        value={tab}
        onChange={setTab}
      />
      <div className="cleaning-grid">
        <section className="panel-surface p-5">
          {tab === "Matriz de cambio" ? (
            <MatrizEditable onNivel={(n) => setNivel(n === "N3" ? "N2" : n)} soloLectura={lectura} />
          ) : tab === "Procedimientos (POE)" ? (
            <Tabla
              data={[
                { id: "POE-01", nombre: "Limpieza superficial", nivel: "N1", version: 1 },
                { id: "POE-02", nombre: "Limpieza profunda", nivel: "N2", version },
              ]}
              onSelect={(p) => {
                setNivel(p.nivel);
                setOpen(true);
              }}
              cols={[
                { key: "id", label: "Código" },
                { key: "nombre", label: "Procedimiento" },
                { key: "nivel", label: "Nivel" },
                { key: "version", label: "Versión" },
              ]}
            />
          ) : tab === "Equipos" ? (
            <Tabla
              data={EQUIPOS}
              cols={[
                { key: "id", label: "Equipo" },
                { key: "nombre", label: "Nombre" },
                {
                  key: "estado",
                  label: "Estado",
                  render: (e) => (
                    <EstadoChip tono={e.estado === "Liberado" ? "ok" : "warn"}>
                      {e.estado}
                    </EstadoChip>
                  ),
                },
                {
                  key: "nombre",
                  label: "Acciones",
                  render: (e) => (
                    <span className="flex flex-wrap gap-2">
                      {puedeEstadoEquipos && e.estado !== "Fuera de servicio" && (
                        <Button
                          variant="outline"
                          className="min-h-12"
                          onClick={() =>
                            toast.success(`${e.nombre} marcado como fuera de servicio · simulado`)
                          }
                        >
                          Fuera de servicio
                        </Button>
                      )}
                      {e.estado !== "Liberado" && (
                        <BotonRestringido
                          accion="firmar"
                          recurso="bandeja.limpiezas"
                          className="min-h-12"
                          onClick={() =>
                            toast.success(`${e.nombre} liberado por la ingeniera · simulado`)
                          }
                        >
                          Liberar equipo
                        </BotonRestringido>
                      )}
                    </span>
                  ),
                },
              ]}
            />
          ) : (
            <>
              <Tabla
                data={[
                  {
                    id: "LIM-014",
                    equipo: "Marmita 2",
                    nivel: "N2",
                    operario: "Luisa Gómez",
                    estado: "Por verificar",
                  },
                  {
                    id: "LIM-015",
                    equipo: "Marinador 1",
                    nivel: "N2",
                    operario: "Carlos Mendoza",
                    estado: "Por verificar",
                  },
                ]}
                cols={[
                  { key: "id", label: "Registro" },
                  { key: "equipo", label: "Equipo" },
                  { key: "nivel", label: "Nivel" },
                  { key: "operario", label: "Responsable" },
                  { key: "estado", label: "Estado" },
                ]}
              />
              <p className="detail-box mt-4">
                Solo la encargada de limpieza libera equipos desde su estación.
              </p>
            </>
          )}
        </section>
        <aside className="panel-surface p-5 space-y-4">
          {nivel === "N2" ? (
            poe
          ) : (
            <>
              <h2>{nivel === "N0" ? "N0 · Mismo producto" : "N1 · Limpieza superficial"}</h2>
              <p className="text-sm">
                {nivel === "N0"
                  ? "Automático. No requiere procedimiento adicional."
                  : "Retiro de residuos visibles. Cambiar de especie o perfil de alérgenos siempre exige N2."}
              </p>
              <Button onClick={() => setNivel("N2")}>
                <ClipboardCheck size={20} />
                Ver limpieza profunda
              </Button>
            </>
          )}
        </aside>
      </div>
      <div className="equipment-strip">
        <ShieldCheck size={20} />
        <strong>Estado de equipos</strong>
        {EQUIPOS.map((e) => (
          <span key={e.id}>
            {e.nombre}
            <EstadoChip
              tono={
                e.estado === "Liberado"
                  ? "ok"
                  : e.estado === "Fuera de servicio"
                    ? "danger"
                    : "warn"
              }
            >
              {e.estado}
            </EstadoChip>
          </span>
        ))}
      </div>
      <Drawer open={open} onClose={() => setOpen(false)} title="Procedimiento de limpieza N2">
        {poe}
      </Drawer>
    </PanelLayout>
  );
}
