import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, useReducedMotion } from "framer-motion";
import { Layers3, UserRound, LockKeyhole, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validarAcceso, DEMO_USUARIO, DEMO_CLAVE } from "@/domain/calidad";
import { usePanelSesion } from "./store";

const schema = z.object({
  usuario: z.string().min(1, "Ingresa tu usuario o correo"),
  clave: z.string().min(1, "Ingresa tu contraseña"),
  mantener: z.boolean(),
});
type LoginDatos = z.infer<typeof schema>;

const BURBUJAS = [
  { x: 12, y: 78, r: 10, d: 0 }, { x: 22, y: 62, r: 6, d: 1.2 }, { x: 38, y: 84, r: 14, d: 0.6 },
  { x: 55, y: 70, r: 8, d: 2 }, { x: 70, y: 88, r: 5, d: 1.6 }, { x: 8, y: 40, r: 4, d: 2.4 },
];

function Ilustracion() {
  const quieto = useReducedMotion();
  return (
    <svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice" className="pl-ilus" aria-hidden="true">
      <defs>
        <linearGradient id="pl-mar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--foreground)" />
        </linearGradient>
      </defs>
      <rect width="600" height="600" fill="url(#pl-mar)" />
      {/* rayos de luz */}
      {[120, 260, 400].map((x, i) => (
        <motion.polygon key={x} points={`${x},0 ${x + 60},0 ${x + 160},600 ${x - 40},600`} fill="var(--surface)"
          initial={{ opacity: 0.04 }} animate={quieto ? undefined : { opacity: [0.03, 0.09, 0.03] }}
          transition={{ duration: 6, repeat: Infinity, delay: i * 1.5 }} />
      ))}
      {/* pez principal */}
      <motion.g initial={{ x: -80, y: 0 }} animate={quieto ? { x: 0 } : { x: [0, 30, 0], y: [0, -14, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
        <g transform="translate(150 270)">
          <path d="M0 40 C40 -10 150 -10 190 40 C150 90 40 90 0 40Z" fill="var(--primary-soft)" />
          <path d="M190 40 L250 0 L240 40 L250 80Z" fill="var(--warn)" />
          <path d="M70 8 C90 -20 120 -20 140 4" fill="none" stroke="var(--warn)" strokeWidth="10" strokeLinecap="round" />
          <circle cx="45" cy="34" r="9" fill="var(--foreground)" />
          <circle cx="48" cy="31" r="3" fill="var(--surface)" />
          <path d="M95 22 Q110 40 95 58 M120 22 Q135 40 120 58" fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" opacity=".5" />
        </g>
      </motion.g>
      {/* camarón */}
      <motion.g animate={quieto ? undefined : { rotate: [-6, 6, -6] }} style={{ originX: "440px", originY: "430px" }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
        <path d="M400 400 C470 380 500 450 450 480 C430 490 410 470 420 455" fill="none" stroke="var(--destructive)" strokeWidth="18" strokeLinecap="round" />
        <path d="M400 400 L360 370 M404 396 L370 360" stroke="var(--destructive)" strokeWidth="3" strokeLinecap="round" />
      </motion.g>
      {/* algas */}
      {[60, 95, 520].map((x, i) => (
        <motion.path key={x} d={`M${x} 600 C${x - 20} 540 ${x + 20} 500 ${x} 440`} fill="none" stroke="var(--ok)" strokeWidth="10" strokeLinecap="round"
          animate={quieto ? undefined : { d: [`M${x} 600 C${x - 20} 540 ${x + 20} 500 ${x} 440`, `M${x} 600 C${x + 20} 540 ${x - 20} 500 ${x + 10} 445`, `M${x} 600 C${x - 20} 540 ${x + 20} 500 ${x} 440`] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }} />
      ))}
      {/* burbujas */}
      {BURBUJAS.map((b, i) => (
        <motion.circle key={i} cx={b.x * 6} cy={b.y * 6} r={b.r} fill="none" stroke="var(--surface)" strokeWidth="2" opacity=".5"
          animate={quieto ? undefined : { cy: [b.y * 6, b.y * 6 - 260], opacity: [0, 0.6, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay: b.d, ease: "easeOut" }} />
      ))}
    </svg>
  );
}

export function PanelLogin() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const entrar = usePanelSesion((s) => s.entrar);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginDatos>({
    resolver: zodResolver(schema),
    defaultValues: { usuario: DEMO_USUARIO, clave: DEMO_CLAVE, mantener: false },
  });

  return (
    <div className="pl-root">
      <motion.div className="pl-card" initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        <div className="pl-arte">
          <Ilustracion />
          <motion.div className="pl-titulo" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
            <span>PUERTO MARINO</span>
            <h2>Calidad en cada etapa</h2>
            <p>Del mar a la mesa, cada lote con su historia.</p>
          </motion.div>
          {/* ola que separa la ilustración del formulario */}
          <svg className="pl-ola" viewBox="0 0 120 600" preserveAspectRatio="none" aria-hidden="true">
            <motion.path fill="var(--surface)"
              initial={{ d: "M120 0 L60 0 C20 100 90 200 50 300 C10 400 80 500 40 600 L120 600Z" }}
              animate={{ d: ["M120 0 L60 0 C20 100 90 200 50 300 C10 400 80 500 40 600 L120 600Z", "M120 0 L50 0 C90 110 10 210 60 300 C100 400 20 500 55 600 L120 600Z", "M120 0 L60 0 C20 100 90 200 50 300 C10 400 80 500 40 600 L120 600Z"] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
          </svg>
        </div>

        <motion.div className="pl-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
          <div className="pl-top">
            <Link to="/" className="pl-marca"><span className="brand-symbol"><Layers3 size={20} /></span>Puerto Marino</Link>
            <Link to="/" className="pl-cambiar">Cambiar acceso</Link>
          </div>
          <span className="pl-rol">● Ingeniería de alimentos</span>
          <h1>Acceso al Panel Web</h1>
          <p className="pl-intro">Reglas HACCP, liberaciones sanitarias y control de calidad.</p>
          <form className="space-y-4" onSubmit={handleSubmit((d) => {
            if (!validarAcceso(d.usuario, d.clave)) { setError("Usuario o contraseña incorrectos."); return; }
            entrar();
            navigate({ to: "/panel/bandeja" });
          })}>
            <label className="pl-input"><UserRound size={20} />
              <input {...register("usuario")} aria-label="Usuario o correo corporativo" placeholder="Usuario o correo" autoComplete="username" />
            </label>
            {errors.usuario && <p className="text-danger text-xs">{errors.usuario.message}</p>}
            <label className="pl-input"><LockKeyhole size={20} />
              <input {...register("clave")} aria-label="Contraseña" placeholder="Contraseña" type={visible ? "text" : "password"} autoComplete="current-password" />
              <Button type="button" variant="ghost" size="icon" aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setVisible(!visible)}>
                {visible ? <EyeOff size={20} /> : <Eye size={20} />}
              </Button>
            </label>
            <div className="flex items-center justify-between gap-3 text-xs">
              <label className="flex items-center gap-2"><input type="checkbox" {...register("mantener")} className="size-5 accent-primary" />Mantener sesión</label>
              <span className="text-muted-foreground">¿Olvidaste la contraseña?</span>
            </div>
            {error && <p role="alert" className="text-danger text-sm">{error}</p>}
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Button disabled={!ready} className="pl-btn" type="submit">Entrar al panel <ArrowRight size={20} /></Button>
            </motion.div>
          </form>
          <p className="pl-nota"><ShieldCheck size={16} /> Acceso demo · datos simulados · contraseña: {DEMO_CLAVE}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
