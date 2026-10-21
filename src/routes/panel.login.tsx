import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft } from "lucide-react";
import { Marca } from "@/ui/marca";

const esquema = z.object({
  correo: z.string().trim().email("Correo no válido").max(255),
  clave: z.string().min(6, "Mínimo 6 caracteres").max(128),
});
type Datos = z.infer<typeof esquema>;

export const Route = createFileRoute("/panel/login")({
  head: () => ({
    meta: [
      { title: "Panel web · Puerto Marino" },
      { name: "description", content: "Acceso al panel web para gerencia, ingeniería, sedes y administración." },
      { property: "og:title", content: "Panel web · Puerto Marino" },
      { property: "og:description", content: "Acceso al panel web para gerencia, ingeniería, sedes y administración." },
    ],
  }),
  component: PanelLogin,
});

function PanelLogin() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<Datos>({ resolver: zodResolver(esquema) });
  const campo = "tap w-full rounded-2xl border bg-surface px-4 outline-none focus:border-primary";
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <form onSubmit={handleSubmit(() => navigate({ to: "/panel/bandeja" }))} className="glass w-full max-w-md space-y-4 rounded-[var(--radius-panel)] p-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ChevronLeft size={20} /> Volver</Link>
        <Marca subtitulo="PANEL WEB · CONTRASEÑA" />
        <label className="block text-sm font-medium">Correo<input {...register("correo")} type="email" className={campo} /></label>
        {errors.correo && <p className="text-xs text-danger">{errors.correo.message}</p>}
        <label className="block text-sm font-medium">Contraseña<input {...register("clave")} type="password" className={campo} /></label>
        {errors.clave && <p className="text-xs text-danger">{errors.clave.message}</p>}
        <button className="tap w-full rounded-2xl bg-primary font-semibold text-primary-foreground shadow-[var(--shadow-primary)]">Entrar al panel</button>
        <p className="text-center text-xs text-muted-foreground">Demo: cualquier correo y contraseña de 6+ caracteres.</p>
      </form>
    </div>
  );
}
