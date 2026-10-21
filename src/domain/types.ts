export type EstacionId =
  | "recepcion" | "cf1" | "coccion" | "marinado" | "porcionado"
  | "cf2" | "cf3" | "despacho" | "limpieza" | "vista-planta";

export type ZonaId =
  | "pedidos" | "recepcion" | "cf1" | "coccion" | "marinado" | "limpieza"
  | "empaque" | "cf2" | "cf3" | "despacho" | "sede";

export type Rol =
  | "operario" | "supervisor" | "limpieza" | "ingeniera" | "sede" | "administrador";

export type Estado = "ok" | "warn" | "danger" | "pending" | "readonly";

export interface Estacion {
  id: EstacionId;
  codigo: string;
  nombre: string;
  descripcion: string;
  color: string;
  dispositivo: string;
  tablet: string;
  equipos: { nombre: string; detalle: string; estado: string }[];
}

export interface Zona {
  id: ZonaId;
  codigo: string;
  nombre: string;
  color: string;
  x: number;
  y: number;
  estado?: { texto: string; tono: Estado };
  alerta?: boolean;
}

export interface Operario {
  id: string;
  nombre: string;
  iniciales: string;
  rol: Rol;
  turno: string;
}

export interface Alerta {
  id: string;
  texto: string;
  hora: string;
  tono: Estado;
}

export type FiltroRuta = "todo" | "cocido" | "marinado";
