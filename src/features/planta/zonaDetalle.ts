import type { Estado, ZonaId } from "@/domain/types";

export interface Hotspot { x: number; y: number; texto: string; tono: "ok" | "warn" | "danger" | "info" }

export interface ZonaDetalle {
  focal: { x: number; y: number };
  escala: number;
  subtitulo: string;
  meta: string;
  chip: { texto: string; tono: Estado };
  que: { pasa: string; registra: string; software: string };
  hotspots: Hotspot[];
}

// Orden para "zona anterior / siguiente"
export const ORDEN_ZONAS: ZonaId[] = ["pedidos", "recepcion", "cf1", "coccion", "marinado", "limpieza", "empaque", "cf2", "cf3", "despacho", "sede"];

export const DETALLE: Record<ZonaId, ZonaDetalle> = {
  pedidos: {
    focal: { x: 53.5, y: 88 }, escala: 2.2, subtitulo: "Pedidos de sedes y plan del día", meta: "Se gestiona desde el Panel web",
    chip: { texto: "Solo lectura", tono: "readonly" },
    que: { pasa: "Las sedes envían sus pedidos y la planta arma el plan del día.", registra: "Pedidos por sede, producto y cantidad.", software: "Consolida pedidos y sugiere qué despachar por FEFO." },
    hotspots: [],
  },
  recepcion: {
    focal: { x: 40, y: 50 }, escala: 2.1, subtitulo: "Báscula descuenta la tara", meta: "Báscula de piso #1 · Impresora Zebra",
    chip: { texto: "Entrega abierta", tono: "ok" },
    que: { pasa: "Llega el camión del proveedor, se pesa en tandas y se crea el lote LT.", registra: "Proveedor, producto, peso, temperatura, lote del proveedor y responsable. La fecha y la hora las pone el sistema.", software: "Descuenta contenedores e hielo, compara contra factura e imprime la etiqueta del lote." },
    hotspots: [
      { x: 38, y: 47, texto: "Impresora · Etiqueta LT-0245", tono: "info" },
      { x: 41, y: 55, texto: "Báscula de piso · 48,6 kg · ESTABLE", tono: "ok" },
      { x: 52, y: 58, texto: "Camión Proveedor A · Factura FV-30241", tono: "info" },
    ],
  },
  cf1: {
    focal: { x: 52, y: 38 }, escala: 2.0, subtitulo: "FEFO y retiros parciales", meta: "Cuarto frío 1 · 3 estantes",
    chip: { texto: "1,5 °C · Conforme", tono: "ok" },
    que: { pasa: "La materia prima se guarda en estantes y sale hacia producción.", registra: "Se escanea la etiqueta del lote, el estante donde queda y la temperatura del cuarto. Al sacarla para producción, se vuelve a escanear.", software: "Sugiere el lote que vence primero y bloquea los lotes en cuarentena o vencidos." },
    hotspots: [
      { x: 49, y: 34, texto: "CF-1 · 1,5 °C", tono: "ok" },
      { x: 56, y: 40, texto: "Estante B-2 · LT-0245 · 48,6 kg", tono: "info" },
      { x: 50, y: 45, texto: "Sugerido FEFO · LT-0238 · vence 26/09", tono: "warn" },
    ],
  },
  coccion: {
    focal: { x: 26, y: 55 }, escala: 2.1, subtitulo: "Tiempo y temperatura · CCP", meta: "Marmita 1 · Tina de enfriamiento",
    chip: { texto: "En revisión", tono: "warn" },
    que: { pasa: "El lote se cocina y luego se enfría en dos etapas.", registra: "Lotes de entrada, temperatura en el centro, tiempo y enfriamiento.", software: "Valida contra la regla vigente y bloquea el inicio si el equipo no está liberado." },
    hotspots: [{ x: 24, y: 52, texto: "Marmita 1 · Liberada", tono: "ok" }, { x: 30, y: 60, texto: "Tina de enfriamiento", tono: "info" }],
  },
  marinado: {
    focal: { x: 19, y: 36 }, escala: 2.2, subtitulo: "Tipo de marinado · peso", meta: "Marinador 1 · Mesa de marinado",
    chip: { texto: "Producto crudo", tono: "warn" },
    que: { pasa: "El lote se marina con la receta del día.", registra: "Lotes, ingredientes con su lote, tiempo y temperatura.", software: "Calcula proporciones y avisa que el producto sigue crudo." },
    hotspots: [{ x: 21, y: 34, texto: "Marinador 1 · Liberado", tono: "ok" }],
  },
  limpieza: {
    focal: { x: 40, y: 68 }, escala: 2.1, subtitulo: "Libera el equipo para producción", meta: "Estación de lavado · Desinfectante 200 ppm",
    chip: { texto: "1 por verificar", tono: "warn" },
    que: { pasa: "Cada equipo usado se limpia según el nivel exigido y luego se verifica.", registra: "Pasos del procedimiento, concentración, tiempo de contacto y prueba ATP o de alérgenos si aplica (por confirmar); quién limpió y quién verifica.", software: "Calcula el nivel N0/N1/N2 por la matriz y no libera el equipo hasta verificarlo." },
    hotspots: [
      { x: 37, y: 70, texto: "Estación de lavado", tono: "ok" },
      { x: 45, y: 72, texto: "Canastillas y utensilios · lavado", tono: "info" },
      { x: 34, y: 77, texto: "Desinfectante · 200 ppm", tono: "ok" },
    ],
  },
  empaque: {
    focal: { x: 34, y: 25 }, escala: 2.0, subtitulo: "Unión de rutas · sellado al vacío", meta: "Mesa de porcionado · Selladora 1 · Zebra ZD421",
    chip: { texto: "Liberado", tono: "ok" },
    que: { pasa: "Llegan lotes cocidos o marinados, se porcionan y se sellan al vacío.", registra: "Lote de entrada (escaneado), número de porciones y peso por porción.", software: "Calcula el vencimiento con la vida útil vigente e imprime una etiqueta por paquete." },
    hotspots: [
      { x: 31, y: 22, texto: "Mesa de porcionado · Liberada", tono: "ok" },
      { x: 28, y: 28, texto: "Selladora al vacío 1 · Liberada", tono: "ok" },
      { x: 38, y: 32, texto: "PT-0245-017 · 250 g · vence 29/09", tono: "info" },
    ],
  },
  cf2: {
    focal: { x: 50, y: 16 }, escala: 2.1, subtitulo: "Producto terminado refrigerado", meta: "Cuarto frío 2 · Estantes B-1 a B-6",
    chip: { texto: "5,4 °C · Alerta", tono: "danger" },
    que: { pasa: "Los paquetes terminados se guardan refrigerados.", registra: "Se escanean los paquetes que entran, el estante y la temperatura del cuarto.", software: "Avisa los vencimientos próximos y las temperaturas fuera de rango." },
    hotspots: [{ x: 48, y: 13, texto: "CF-2 · 5,4 °C", tono: "danger" }, { x: 53, y: 18, texto: "Estante B-1 · 62 paquetes", tono: "info" }],
  },
  cf3: {
    focal: { x: 43, y: 10 }, escala: 2.2, subtitulo: "Congelación rápida", meta: "Túnel ultracongelador · -35 °C",
    chip: { texto: "-35,0 °C", tono: "ok" },
    que: { pasa: "Los paquetes entran al túnel hasta congelarse en el centro.", registra: "Hora de entrada y temperatura del centro del producto.", software: "No deja marcar congelado hasta registrar la medición." },
    hotspots: [{ x: 42, y: 8, texto: "Túnel · -35,0 °C", tono: "ok" }],
  },
  despacho: {
    focal: { x: 60, y: 32 }, escala: 2.0, subtitulo: "FEFO · remisión REM", meta: "Muelle 1 · Camión refrigerado",
    chip: { texto: "Muelle 1 libre", tono: "ok" },
    que: { pasa: "Se arman los pedidos de las sedes y se cargan al camión.", registra: "Paquetes escaneados por pedido y la remisión.", software: "Sugiere paquetes por FEFO y genera la remisión REM." },
    hotspots: [{ x: 62, y: 30, texto: "Muelle 1 · Disponible", tono: "ok" }],
  },
  sede: {
    focal: { x: 80, y: 45 }, escala: 2.0, subtitulo: "La sede recibe y confirma", meta: "Se gestiona desde el Panel web",
    chip: { texto: "Solo lectura", tono: "readonly" },
    que: { pasa: "La sede recibe la remisión y confirma los paquetes.", registra: "Paquetes recibidos, temperatura y novedades.", software: "Cierra la trazabilidad del lote hasta la sede." },
    hotspots: [],
  },
};
