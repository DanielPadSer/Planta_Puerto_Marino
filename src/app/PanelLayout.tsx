import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Inbox,
  FileSliders,
  ShieldCheck,
  Refrigerator,
  Monitor,
  Users,
  ListTree,
  Network,
  ChartNoAxesColumn,
  History,
  ChevronDown,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  ChevronRight,
  Database,
  KeyRound,
  TableProperties,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCalidad } from "@/features/panel-calidad/store";
import { useConexion } from "@/features/panel-calidad/ui";
import { useSesionPanel } from "@/features/auth/sesionPanel";
import { puede, ETIQUETA_ROL, type Recurso, type RolPanel } from "@/domain/permisos";
import { cn } from "@/lib/utils";
import { Logo } from "@/ui/logo";

interface ItemNav {
  name: string;
  path: string;
  icon: typeof Inbox;
  recurso: Recurso | null; // null = visible para todos los roles del panel
}

export const panelNav: ItemNav[] = [
  { name: "Bandeja", path: "/panel/bandeja", icon: Inbox, recurso: null },
  { name: "Reglas por producto", path: "/panel/reglas", icon: FileSliders, recurso: "reglas" },
  { name: "Limpieza y equipos", path: "/panel/limpieza", icon: ShieldCheck, recurso: "limpieza.matriz" },
  { name: "Monitoreo", path: "/panel/cuartos-frios", icon: Refrigerator, recurso: "cuartosFrios" },
  { name: "Dispositivos y equipos", path: "/panel/dispositivos", icon: Monitor, recurso: "dispositivos.registro" },
  { name: "Personal y BPM", path: "/panel/personal", icon: Users, recurso: "personal.operarios" },
  { name: "Catálogos", path: "/panel/catalogos", icon: ListTree, recurso: "catalogos.tecnicos" },
  { name: "Trazabilidad", path: "/panel/trazabilidad", icon: Network, recurso: "trazabilidad" },
  { name: "Reportes", path: "/panel/reportes", icon: ChartNoAxesColumn, recurso: "reportes" },
  { name: "Historial de cambios", path: "/panel/historial", icon: History, recurso: "historial" },
  { name: "Modelo de datos", path: "/panel/modelo-datos", icon: Database, recurso: null },
];

const navAdmin: ItemNav[] = [
  { name: "Usuarios y roles", path: "/panel/usuarios", icon: Users, recurso: "usuarios.gestion" },
  { name: "Permisos por rol", path: "/panel/permisos", icon: TableProperties, recurso: "usuarios.gestion" },
];

export function PanelLayout({
  title,
  subtitle,
  active,
  children,
  action,
}: {
  title: string;
  subtitle: string;
  active: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  const { usuario, hidratada, hidratar, salir } = useSesionPanel();
  const navigate = useNavigate();
  const online = useConexion();
  const [collapsed, setCollapsed] = useState(false);
  const [menuMovil, setMenuMovil] = useState(false);
  const [catalogos, setCatalogos] = useState(active.includes("catalogos"));
  const [notifications, setNotifications] = useState(false);
  const cuarentenas = useCalidad((s) => s.lotes.filter((l) => l.estado === "Cuarentena").length);
  const conflictos = useCalidad((s) => s.conflictos.filter((c) => c.estado === "Pendiente").length);
  const pesajes = useCalidad((s) => s.pesajesManuales.filter((p) => p.estado === "Pendiente").length);
  const rol: RolPanel = usuario?.rol ?? "ingeniera";
  // El contador de la Bandeja cuenta solo lo accionable por el rol.
  const count =
    rol === "ingeniera" ? cuarentenas + 2 + 4 : rol === "supervisor" ? conflictos + pesajes : 6;
  useEffect(() => {
    hidratar();
  }, [hidratar]);
  useEffect(() => {
    if (hidratada && !usuario) navigate({ to: "/panel/login", replace: true });
  }, [hidratada, usuario, navigate]);
  if (!hidratada || !usuario) return <div className="min-h-dvh bg-background" />;
  const items = panelNav.filter((i) => !i.recurso || puede(rol, "ver", i.recurso));
  const itemsAdmin = navAdmin.filter((i) => i.recurso && puede(rol, "ver", i.recurso));
  const verUsuarios = puede(rol, "ver", "usuarios.pin") && !puede(rol, "ver", "usuarios.gestion");
  const renderItem = (item: ItemNav) => (
    <div key={item.path}>
      <Button
        asChild
        variant="ghost"
        className={cn("quality-nav-item", active === item.path && "nav-active")}
        title={item.name}
      >
        <Link to={item.path}>
          <item.icon size={20} />
          {!collapsed && (
            <>
              <span>{item.name}</span>
              {item.path === "/panel/bandeja" && <b className="nav-badge">{count}</b>}
            </>
          )}
        </Link>
      </Button>
      {item.path === "/panel/catalogos" && !collapsed && (
        <>
          <Button
            variant="ghost"
            aria-label="Expandir catálogos"
            className="catalog-expand"
            onClick={() => setCatalogos(!catalogos)}
          >
            <ChevronDown size={20} />
          </Button>
          {catalogos && (
            <div className="catalog-subnav">
              {[
                "Contenedores y tara",
                "Categorías sanitarias",
                "Proveedores",
                "Equipos",
                "Alérgenos",
                "Ingredientes",
                "Productos",
              ].map((c) => (
                <Link
                  key={c}
                  to={c === "Alérgenos" ? "/panel/catalogos/alergenos" : "/panel/catalogos"}
                  search={c === "Alérgenos" ? {} : { catalogo: c }}
                  className={cn(
                    "catalog-link",
                    active === "/panel/catalogos/alergenos" && c === "Alérgenos" && "text-primary",
                  )}
                >
                  {c}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
  return (
    <div className={cn("quality-panel", collapsed && "sidebar-mini")} data-menu-movil={menuMovil}>
      <div className="quality-overlay" aria-hidden="true" onClick={() => setMenuMovil(false)} />
      <aside
        className="quality-sidebar"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setMenuMovil(false);
        }}
      >
        <Link to="/panel/bandeja" className="quality-brand">
          <Logo />
          {!collapsed && (
            <span>
              <strong>Puerto Marino</strong>
              <small>PANEL DE CALIDAD</small>
            </span>
          )}
        </Link>
        <nav className="quality-nav">
          {items.map(renderItem)}
          {verUsuarios &&
            renderItem({ name: "Usuarios", path: "/panel/usuarios", icon: KeyRound, recurso: "usuarios.pin" })}
          {itemsAdmin.length > 0 && (
            <>
              {!collapsed && <p className="nav-section">ADMINISTRACIÓN</p>}
              {itemsAdmin.map(renderItem)}
            </>
          )}
        </nav>
        <div className="quality-user">
          <span className="user-avatar">
            {usuario.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </span>
          {!collapsed && (
            <div>
              <strong>{usuario.nombre}</strong>
              <small>
                <span className={cn("rol-badge", `rol-badge-${rol}`)}>{ETIQUETA_ROL[rol]}</span>
              </small>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            onClick={() => {
              salir();
              navigate({ to: "/panel/login" });
            }}
          >
            <LogOut size={20} />
          </Button>
        </div>
      </aside>
      <div className="quality-main">
        <header className="quality-topbar">
          <div className="min-w-0">
            <div className="quality-breadcrumb">
              <Button
                variant="ghost"
                size="icon"
                className="quality-menu-movil"
                aria-label="Abrir menú"
                aria-expanded={menuMovil}
                onClick={() => setMenuMovil(true)}
              >
                <Menu size={20} />
              </Button>
              <Button
                className="quality-collapse"
                variant="ghost"
                size="icon"
                aria-label={collapsed ? "Mostrar menú" : "Contraer menú"}
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
              </Button>
              <span className="crumb-parent">Panel de calidad</span>
              <ChevronRight size={20} className="crumb-parent" />
              <span>{title}</span>
            </div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="topbar-actions">
            <span className={cn("rol-badge", `rol-badge-${rol}`)}>{ETIQUETA_ROL[rol]}</span>
            <span className={cn("online-pill", online ? "text-ok" : "text-warn")}>
              <span className={cn("size-2 rounded-full", online ? "bg-ok" : "bg-warn")} />
              {online ? "En línea · Sincronizado" : "Sin conexión · 0 pendientes"}
            </span>
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                className="notification-button"
                aria-label="Avisos"
                onClick={() => setNotifications(!notifications)}
              >
                <Bell size={20} />
                <span className="notification-dot" />
              </Button>
              {notifications && (
                <div className="notification-popover">
                  <strong>Avisos de calidad</strong>
                  <p>2 calibraciones próximas a vencer</p>
                  <p>2 documentos BPM por vencer</p>
                  <Button asChild variant="link">
                    <Link to="/panel/bandeja">
                      Ver bandeja <ChevronRight size={20} />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
            {action}
          </div>
        </header>
        <main className="quality-content">{children}</main>
      </div>
    </div>
  );
}
