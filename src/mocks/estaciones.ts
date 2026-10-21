import type { Estacion, Operario, Alerta } from "@/domain/types";

export const ESTACIONES: Estacion[] = [
  { id: "recepcion", codigo: "1", nombre: "Recepción", descripcion: "Báscula · tara · lote LT", color: "#3B82F6", dispositivo: "Báscula 01", tablet: "Recepción 01",
    equipos: [{ nombre: "Báscula 01", detalle: "Calibrada 06:10", estado: "OK" }, { nombre: "Mesa de recepción", detalle: "Sanitizada", estado: "Liberado" }] },
  { id: "cf1", codigo: "2", nombre: "CF-1 Mat. Prima", descripcion: "Ubicación · temp. cuarto", color: "#22D3EE", dispositivo: "1.8 °C", tablet: "CF-1 01",
    equipos: [{ nombre: "Cuarto frío 1", detalle: "1,8 °C", estado: "OK" }] },
  { id: "coccion", codigo: "3A", nombre: "Cocción", descripcion: "Tiempo y temp. · HACCP", color: "#F97316", dispositivo: "CCP Activo", tablet: "Cocción 01",
    equipos: [{ nombre: "Marmita 1", detalle: "Liberado 06:40", estado: "HACCP OK" }, { nombre: "Tina de enfriamiento", detalle: "Sanitizada", estado: "Liberado" }] },
  { id: "marinado", codigo: "3B", nombre: "Marinado", descripcion: "Tipo de marinado · peso", color: "#F43F5E", dispositivo: "Celda C-04", tablet: "Marinado 01",
    equipos: [{ nombre: "Marinador 1", detalle: "Liberado 06:50", estado: "HACCP OK" }, { nombre: "Mesa de marinado", detalle: "Sanitizada", estado: "Liberado" }] },
  { id: "porcionado", codigo: "4", nombre: "Porcionado", descripcion: "Porciones · vacío · PT", color: "#F5B301", dispositivo: "Báscula 03", tablet: "Empaque 01",
    equipos: [{ nombre: "Empacadora al vacío", detalle: "Liberado 06:30", estado: "OK" }] },
  { id: "cf2", codigo: "5A", nombre: "CF-2 Terminado", descripcion: "Entrada paquetes · temp.", color: "#14B8A6", dispositivo: "-1.2 °C", tablet: "CF-2 01",
    equipos: [{ nombre: "Cuarto frío 2", detalle: "5,4 °C", estado: "Alerta" }] },
  { id: "cf3", codigo: "5B", nombre: "CF-3 Túnel", descripcion: "Congelación rápida", color: "#6366F1", dispositivo: "-35.0 °C", tablet: "CF-3 01",
    equipos: [{ nombre: "Túnel ultracongelador", detalle: "-35,0 °C", estado: "OK" }] },
  { id: "despacho", codigo: "6", nombre: "Despacho", descripcion: "FEFO · remisión REM", color: "#10B981", dispositivo: "Muelle 1", tablet: "Despacho 01",
    equipos: [{ nombre: "Muelle 1", detalle: "Disponible", estado: "OK" }] },
  { id: "limpieza", codigo: "L", nombre: "Limpieza / POE", descripcion: "ATP · libera el equipo", color: "#84CC16", dispositivo: "Sanitización", tablet: "Limpieza 01",
    equipos: [{ nombre: "Luminómetro ATP", detalle: "Calibrado", estado: "OK" }] },
  { id: "vista-planta", codigo: "P", nombre: "Vista Planta", descripcion: "Resumen, alertas, rutas", color: "#0E8A93", dispositivo: "Diorama 2.5D", tablet: "Supervisión 01",
    equipos: [{ nombre: "Pantalla de supervisión", detalle: "Conectada", estado: "OK" }] },
];

export const OPERARIO_DEMO: Operario = {
  id: "op-001", nombre: "Sandra Pérez", iniciales: "SP", rol: "supervisor", turno: "Turno Mañana (06:00–14:00)",
};

export const ALERTAS: Alerta[] = [
  { id: "a1", texto: "CF-2 terminado · 5,4 °C fuera de rango", hora: "07:52", tono: "danger" },
  { id: "a2", texto: "Cocción · LC-0245-A en revisión", hora: "07:40", tono: "warn" },
  { id: "a3", texto: "Limpieza · Marinador 1 por verificar", hora: "07:15", tono: "warn" },
];

export const SYNC = { ultima: "07:38", pendientes: 0, catalogo: "v.124", red: "INTERNA_PLANTA_WIFI" };
