import { useState } from "react";
import { KeyRound, UserPlus, ShieldCheck, CircleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PanelLayout } from "@/app/PanelLayout";
import { Tabla, EstadoChip, MotivoForm, Buscador } from "./ui";
import { RutaProtegida, usePuede, useRol } from "@/ui/permisos";
import { useCalidad } from "./store";
import { ejecutarEscritura } from "@/mocks/servicios";
import { ErrorPermiso } from "@/domain/permisos";

interface UsuarioFila {
  id: string;
  nombre: string;
  rol: string;
  estado: "Activo" | "Desactivado";
  ultimoAcceso: string;
  esOperario: boolean;
}

const INICIAL: UsuarioFila[] = [
  { id: "OP-01", nombre: "Carlos Mendoza", rol: "Operario", estado: "Activo", ultimoAcceso: "27/10/2026 06:12", esOperario: true },
  { id: "OP-02", nombre: "Marta Pinzón", rol: "Operaria", estado: "Activo", ultimoAcceso: "27/10/2026 11:30", esOperario: true },
  { id: "OP-03", nombre: "Andrés Silva", rol: "Operario", estado: "Activo", ultimoAcceso: "26/10/2026 15:44", esOperario: true },
  { id: "OP-04", nombre: "Luisa Gómez", rol: "Encargada de limpieza", estado: "Activo", ultimoAcceso: "27/10/2026 07:15", esOperario: true },
  { id: "PN-01", nombre: "Luisa Gómez", rol: "Ingeniera de alimentos", estado: "Activo", ultimoAcceso: "27/10/2026 13:02", esOperario: false },
  { id: "PN-02", nombre: "Carlos Mendoza", rol: "Supervisor", estado: "Activo", ultimoAcceso: "27/10/2026 12:58", esOperario: false },
  { id: "PN-03", nombre: "Dirección Puerto Marino", rol: "Administrador", estado: "Activo", ultimoAcceso: "25/10/2026 09:10", esOperario: false },
];

const ROLES_ASIGNABLES = [
  "Operario",
  "Supervisor",
  "Encargada de limpieza",
  "Ingeniera de alimentos",
  "Sede",
  "Administrador",
];

function pinTemporal() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function Usuarios() {
  const rol = useRol();
  const esAdmin = usePuede("editar", "usuarios.gestion");
  const auditar = useCalidad((s) => s.auditar);
  const [usuarios, setUsuarios] = useState(INICIAL);
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState<UsuarioFila | null>(null);
  const [pin, setPin] = useState("");
  const [crear, setCrear] = useState(false);
  const [nombre, setNombre] = useState("");
  const [rolNuevo, setRolNuevo] = useState("Operario");
  const visibles = usuarios.filter(
    (u) =>
      (esAdmin || u.esOperario) &&
      `${u.nombre} ${u.rol}`.toLowerCase().includes(search.toLowerCase()),
  );
  const restablecer = (u: UsuarioFila, motivo: string) => {
    try {
      ejecutarEscritura(rol, "editar", "usuarios.pin", () => {
        const temporal = pinTemporal();
        setPin(temporal);
        auditar(
          `Usuario ${u.nombre}`,
          u.esOperario ? "PIN" : "Contraseña",
          "••••••",
          "Restablecido",
          motivo,
        );
      });
    } catch (e) {
      toast.error(e instanceof ErrorPermiso ? e.message : "No fue posible restablecer.");
      setSel(null);
    }
  };
  return (
    <RutaProtegida recurso="usuarios.pin">
      <PanelLayout
        title={esAdmin ? "Usuarios y roles" : "Usuarios"}
        subtitle={
          esAdmin
            ? "Gestión de cuentas, roles y accesos del panel y la planta"
            : "Restablecer el PIN de los operarios de planta"
        }
        active="/panel/usuarios"
        action={
          esAdmin ? (
            <Button className="min-h-12" onClick={() => setCrear(true)}>
              <UserPlus size={20} />
              Crear usuario
            </Button>
          ) : undefined
        }
      >
        <section className="panel-surface p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2>{esAdmin ? "Todos los usuarios" : "Operarios de planta"}</h2>
            <EstadoChip tono="muted">Datos simulados</EstadoChip>
          </div>
          <Buscador value={search} onChange={setSearch} placeholder="Buscar usuario…" />
          <div className="mt-4">
            <Tabla
              data={visibles}
              cols={[
                { key: "nombre", label: "Nombre" },
                { key: "rol", label: "Rol" },
                {
                  key: "estado",
                  label: "Estado",
                  render: (u) => (
                    <EstadoChip tono={u.estado === "Activo" ? "ok" : "muted"}>{u.estado}</EstadoChip>
                  ),
                },
                { key: "ultimoAcceso", label: "Último acceso" },
                {
                  key: "id",
                  label: "Acciones",
                  render: (u) => (
                    <span className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        className="min-h-12"
                        onClick={() => {
                          setSel(u);
                          setPin("");
                        }}
                      >
                        <KeyRound size={20} />
                        {u.esOperario ? "Restablecer PIN" : "Restablecer contraseña"}
                      </Button>
                      {esAdmin && (
                        <>
                          <Button
                            variant="outline"
                            className="min-h-12"
                            onClick={() => {
                              const siguiente = ROLES_ASIGNABLES[(ROLES_ASIGNABLES.indexOf(u.rol) + 1) % ROLES_ASIGNABLES.length] ?? "Operario";
                              setUsuarios(usuarios.map((x) => (x.id === u.id ? { ...x, rol: siguiente } : x)));
                              auditar(`Usuario ${u.nombre}`, "Rol", u.rol, siguiente, "Asignación de rol desde administración");
                              toast.success(`Rol de ${u.nombre}: ${siguiente}`);
                            }}
                          >
                            Cambiar rol
                          </Button>
                          <Button
                            variant="outline"
                            className="min-h-12 text-danger border-danger/30"
                            onClick={() => {
                              const estado = u.estado === "Activo" ? "Desactivado" : "Activo";
                              setUsuarios(usuarios.map((x) => (x.id === u.id ? { ...x, estado } : x)));
                              auditar(`Usuario ${u.nombre}`, "Estado", u.estado, estado, "Gestión de acceso desde administración");
                            }}
                          >
                            {u.estado === "Activo" ? "Desactivar" : "Reactivar"}
                          </Button>
                        </>
                      )}
                    </span>
                  ),
                },
              ]}
            />
          </div>
          {!esAdmin && (
            <p className="mt-4 text-xs text-muted-foreground">
              Como supervisor solo ves operarios y puedes restablecer su PIN. La creación de
              usuarios y la asignación de roles son del administrador.
            </p>
          )}
        </section>
        <Dialog
          open={!!sel}
          onOpenChange={(o) => {
            if (!o) setSel(null);
          }}
        >
          <DialogContent className="cuarta-dialog bg-surface">
            <DialogTitle>
              {sel?.esOperario ? "Restablecer PIN" : "Restablecer contraseña"} · {sel?.nombre}
            </DialogTitle>
            <DialogDescription>Acción simulada con motivo obligatorio.</DialogDescription>
            {pin ? (
              <div className="space-y-4">
                <p className="detail-box text-center">
                  <small className="block text-xs text-muted-foreground">PIN TEMPORAL</small>
                  <b className="font-mono text-3xl tracking-widest text-primary">{pin}</b>
                </p>
                <p className="flex gap-2 text-sm text-muted-foreground">
                  <CircleAlert size={20} className="shrink-0" />
                  El operario deberá cambiarlo al entrar.
                </p>
                <Button className="w-full min-h-12" onClick={() => setSel(null)}>
                  Listo
                </Button>
              </div>
            ) : (
              <MotivoForm
                label="Confirmar restablecimiento"
                onSubmit={(d) => {
                  if (sel) restablecer(sel, d.motivo);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
        <Dialog open={crear} onOpenChange={setCrear}>
          <DialogContent className="cuarta-dialog bg-surface">
            <DialogTitle>Crear usuario</DialogTitle>
            <DialogDescription>Alta simulada con rol asignado.</DialogDescription>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!nombre.trim()) return;
                const nuevo: UsuarioFila = {
                  id: `US-${Date.now()}`,
                  nombre: nombre.trim(),
                  rol: rolNuevo,
                  estado: "Activo",
                  ultimoAcceso: "Sin accesos",
                  esOperario: rolNuevo === "Operario" || rolNuevo === "Encargada de limpieza",
                };
                setUsuarios([...usuarios, nuevo]);
                auditar(`Usuario ${nuevo.nombre}`, "Registro", "No existía", `Activo · ${rolNuevo}`, "Alta de usuario desde administración");
                setCrear(false);
                setNombre("");
                toast.success("Usuario creado");
              }}
            >
              <label className="field-label">
                Nombre completo
                <input
                  required
                  className="panel-input"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </label>
              <label className="field-label">
                Rol
                <select
                  className="panel-input"
                  value={rolNuevo}
                  onChange={(e) => setRolNuevo(e.target.value)}
                >
                  {ROLES_ASIGNABLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
              <Button type="submit" className="w-full min-h-12">
                <ShieldCheck size={20} />
                Crear usuario
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PanelLayout>
    </RutaProtegida>
  );
}
