/**
 * Capa C: datos de ejemplo coherentes y cruzados (un recorrido completo de camarón
 * desde el proveedor hasta la sede). Valores de ejemplo: los reales los define la
 * ingeniería de alimentos. Los ids son claves legibles; el SQL las convierte en UUID.
 */
import type { Datos } from "./esquema";
import { saldos } from "./consultas";

const T = (hora: string, dia = "26") => `2026-10-${dia}T${hora}:00-05:00`;
const cap = (hora: string, usuario: string, dispositivo: string, dia = "26") => ({
  creado_en: T(hora, dia),
  creado_por_id: usuario,
  dispositivo_id: dispositivo,
  hora_dispositivo: T(hora, dia),
  evento_sync_id: null,
  estado_sync: "sincronizado",
  anulado: false,
});
const ver = (version = 1, activo = true) => ({ version, activo, actualizado_en: T("06:00", "01") });

const movimientos: Datos["Movimiento"] = [
  { id: "mv-01", lote_id: "lt-0238", tipo: "entrada", cantidad_kg: 120, ubicacion_origen_id: null, ubicacion_destino_id: "ub-cf1", canastilla_id: "cn-0042", motivo: "Ingreso desde recepción", ref_tipo: "recepcion", ref_id: "rec-0241", ...cap("06:30", "usr-andres", "dev-cf1") },
  { id: "mv-02", lote_id: "lt-0238", tipo: "salida", cantidad_kg: 31.5, ubicacion_origen_id: "ub-cf1", ubicacion_destino_id: null, canastilla_id: "cn-0042", motivo: "Salida FEFO a cocción", ref_tipo: "proceso", ref_id: "lt-0301", ...cap("07:50", "usr-andres", "dev-cf1") },
  { id: "mv-03", lote_id: "lt-0238", tipo: "salida", cantidad_kg: 20, ubicacion_origen_id: "ub-cf1", ubicacion_destino_id: null, canastilla_id: null, motivo: "Salida FEFO a marinado", ref_tipo: "proceso", ref_id: "lt-0302", ...cap("08:10", "usr-andres", "dev-cf1") },
  { id: "mv-04", lote_id: "lt-0238", tipo: "merma", cantidad_kg: 1.5, ubicacion_origen_id: "ub-cf1", ubicacion_destino_id: null, canastilla_id: null, motivo: "Escurrido de hielo", ref_tipo: "merma", ref_id: "mer-01", ...cap("08:15", "usr-andres", "dev-cf1") },
  { id: "mv-05", lote_id: "lt-0150", tipo: "entrada", cantidad_kg: 10, ubicacion_origen_id: null, ubicacion_destino_id: "ub-cf1", canastilla_id: null, motivo: "Insumo preparado", ref_tipo: "proceso", ref_id: null, ...cap("09:00", "usr-carlos", "dev-cf1", "24") },
  { id: "mv-06", lote_id: "lt-0150", tipo: "salida", cantidad_kg: 2, ubicacion_origen_id: "ub-cf1", ubicacion_destino_id: null, canastilla_id: null, motivo: "Marinada para LT-0302", ref_tipo: "proceso", ref_id: "lt-0302", ...cap("08:12", "usr-andres", "dev-cf1") },
  { id: "mv-07", lote_id: "lt-0301", tipo: "entrada", cantidad_kg: 30, ubicacion_origen_id: null, ubicacion_destino_id: "ub-cf2", canastilla_id: "cn-0042", motivo: "Producto cocido a CF-2", ref_tipo: "proceso", ref_id: null, ...cap("09:30", "usr-sofia", "dev-emp") },
  { id: "mv-08", lote_id: "lt-0301", tipo: "salida", cantidad_kg: 2, ubicacion_origen_id: "ub-cf2", ubicacion_destino_id: null, canastilla_id: "cn-0043", motivo: "Despacho RM-0112", ref_tipo: "remision", ref_id: "rm-0112", ...cap("12:50", "usr-sofia", "dev-desp") },
  { id: "mv-09", lote_id: "lt-0302", tipo: "entrada", cantidad_kg: 20, ubicacion_origen_id: null, ubicacion_destino_id: "ub-cf3", canastilla_id: null, motivo: "Producto marinado a CF-3", ref_tipo: "proceso", ref_id: null, ...cap("10:20", "usr-sofia", "dev-emp") },
  { id: "mv-10", lote_id: "lt-0301", tipo: "devolucion", cantidad_kg: 0.5, ubicacion_origen_id: null, ubicacion_destino_id: "ub-cf2", canastilla_id: null, motivo: "Devolución de sede", ref_tipo: "devolucion", ref_id: "dv-01", ...cap("16:00", "usr-pedro", "dev-sede") },
];

export const SEMILLA: Datos = {
  /* ---------- Seguridad y catálogos ---------- */
  Sede: [
    { id: "sede-planta", nombre: "Planta Puerto Marino", tipo: "planta", sede_id: null, ...ver() },
    { id: "sede-norte", nombre: "Sede Norte", tipo: "punto_venta", sede_id: "sede-planta", ...ver() },
  ],
  CategoriaSanitaria: [
    { id: "cat-pescado", nombre: "Pescado", es_alergeno: false, ...ver() },
    { id: "cat-crustaceos", nombre: "Crustáceos", es_alergeno: true, ...ver() },
    { id: "cat-moluscos", nombre: "Moluscos", es_alergeno: true, ...ver() },
    { id: "cat-vegetal", nombre: "Vegetal", es_alergeno: false, ...ver() },
  ],
  Alergeno: [
    { id: "alg-crus", codigo: "CRUS", nombre: "Crustáceos", ...ver() },
    { id: "alg-moll", codigo: "MOLL", nombre: "Moluscos", ...ver() },
    { id: "alg-pesc", codigo: "PESC", nombre: "Pescado", ...ver() },
  ],
  Ubicacion: [
    { id: "ub-rec", codigo: "REC", nombre: "Muelle de recepción", tipo: "area", temp_objetivo_c: null, ...ver() },
    { id: "ub-cf1", codigo: "CF-1", nombre: "Cuarto frío materia prima", tipo: "cuarto_frio", temp_objetivo_c: 2, ...ver() },
    { id: "ub-cf2", codigo: "CF-2", nombre: "Cuarto frío producto cocido", tipo: "cuarto_frio", temp_objetivo_c: 2, ...ver() },
    { id: "ub-cf3", codigo: "CF-3", nombre: "Cuarto frío producto marinado", tipo: "cuarto_frio", temp_objetivo_c: 1, ...ver() },
    { id: "ub-desp", codigo: "DESP", nombre: "Zona de despacho", tipo: "area", temp_objetivo_c: null, ...ver() },
  ],
  Usuario: [
    { id: "usr-andres", nombre: "Andrés Rojas", rol: "operario", documento: "1020304050", pin_hash: "sha256:demo-andres", sede_id: "sede-planta", ...ver() },
    { id: "usr-sofia", nombre: "Sofía Pérez", rol: "operario", documento: "1030405060", pin_hash: "sha256:demo-sofia", sede_id: "sede-planta", ...ver() },
    { id: "usr-carlos", nombre: "Carlos Mejía", rol: "supervisor", documento: "79123456", pin_hash: "sha256:demo-carlos", sede_id: "sede-planta", ...ver() },
    { id: "usr-luisa", nombre: "Luisa Gómez", rol: "ingeniera", documento: "52987654", pin_hash: "sha256:demo-luisa", sede_id: "sede-planta", ...ver() },
    { id: "usr-marta", nombre: "Marta Díaz", rol: "limpieza", documento: "41234567", pin_hash: "sha256:demo-marta", sede_id: "sede-planta", ...ver() },
    { id: "usr-pedro", nombre: "Pedro Silva", rol: "sede", documento: "80111222", pin_hash: "sha256:demo-pedro", sede_id: "sede-norte", ...ver() },
  ],
  Estacion: [
    { id: "est-rec", codigo: "1", nombre: "Recepción", tipo: "recepcion", ubicacion_id: "ub-rec", ...ver() },
    { id: "est-cf1", codigo: "2", nombre: "CF-1", tipo: "almacen", ubicacion_id: "ub-cf1", ...ver() },
    { id: "est-coc", codigo: "3A", nombre: "Cocción", tipo: "proceso", ubicacion_id: null, ...ver() },
    { id: "est-mar", codigo: "3B", nombre: "Marinado", tipo: "proceso", ubicacion_id: null, ...ver() },
    { id: "est-emp", codigo: "4", nombre: "Empaque", tipo: "proceso", ubicacion_id: null, ...ver() },
    { id: "est-desp", codigo: "6", nombre: "Despacho", tipo: "despacho", ubicacion_id: "ub-desp", ...ver() },
  ],
  Producto: [
    { id: "prod-crudo", codigo: "MP-CAM-01", nombre: "Camarón crudo con cáscara", tipo: "materia_prima", unidad: "kg", ruta: "", categoria_sanitaria_id: "cat-crustaceos", ...ver() },
    { id: "prod-cocido", codigo: "PT-CAM-C1", nombre: "Camarón cocido pelado", tipo: "terminado", unidad: "kg", ruta: "cocido", categoria_sanitaria_id: "cat-crustaceos", ...ver() },
    { id: "prod-marinado", codigo: "PT-CAM-M1", nombre: "Camarón marinado al ajillo", tipo: "terminado", unidad: "kg", ruta: "marinado", categoria_sanitaria_id: "cat-crustaceos", ...ver() },
    { id: "prod-marinada", codigo: "INS-MAR-01", nombre: "Marinada de ajo y limón", tipo: "insumo", unidad: "kg", ruta: "", categoria_sanitaria_id: "cat-vegetal", ...ver() },
  ],
  Dispositivo: [
    { id: "dev-rec", nombre: "Tableta Recepción", tipo: "tableta", token_hash: "sha256:dev-rec", estacion_id: "est-rec", propietario_id: null, revocado: false },
    { id: "dev-cf1", nombre: "Tableta CF-1", tipo: "tableta", token_hash: "sha256:dev-cf1", estacion_id: "est-cf1", propietario_id: null, revocado: false },
    { id: "dev-coc", nombre: "Tableta Cocción", tipo: "tableta", token_hash: "sha256:dev-coc", estacion_id: "est-coc", propietario_id: null, revocado: false },
    { id: "dev-emp", nombre: "Tableta Empaque", tipo: "tableta", token_hash: "sha256:dev-emp", estacion_id: "est-emp", propietario_id: null, revocado: false },
    { id: "dev-desp", nombre: "Tableta Despacho", tipo: "tableta", token_hash: "sha256:dev-desp", estacion_id: "est-desp", propietario_id: null, revocado: false },
    { id: "dev-pc", nombre: "PC-CAL-01", tipo: "pc", token_hash: "sha256:dev-pc", estacion_id: null, propietario_id: "usr-luisa", revocado: false },
    { id: "dev-sede", nombre: "Tableta Sede Norte", tipo: "tableta", token_hash: "sha256:dev-sede", estacion_id: null, propietario_id: "usr-pedro", revocado: false },
  ],
  Auditoria: [
    { id: "aud-01", entidad: "Lote", entidad_id: "lt-0301", accion: "cambio_estado", antes: { estado_calidad: "cuarentena" }, despues: { estado_calidad: "liberado" }, motivo: "Cocción conforme y temperatura de centro 92 °C", usuario_id: "usr-luisa", dispositivo_id: "dev-pc", creado_en: T("11:00") },
    { id: "aud-02", entidad: "MatrizCambio", entidad_id: "mc-05", accion: "nueva_version", antes: { nivel: "N0", version_matriz: 1 }, despues: { nivel: "N1", version_matriz: 2 }, motivo: "Hallazgo de residuos vegetales en auditoría interna", usuario_id: "usr-luisa", dispositivo_id: "dev-pc", creado_en: T("08:00", "20") },
  ],
  Proveedor: [{ id: "prov-pacifico", nombre: "Pesquera del Pacífico S.A.S.", nit: "900123456-7", contacto: "compras@pesqueradelpacifico.co", ...ver() }],
  Contenedor: [
    { id: "cont-canastilla", nombre: "Canastilla azul 20 kg", tara_kg: 1.7, retornable: true, ...ver() },
    { id: "cont-caja", nombre: "Caja de cartón encerada", tara_kg: 0.4, retornable: false, ...ver() },
  ],
  ProductoAlergeno: [
    { id: "pa-01", producto_id: "prod-crudo", alergeno_id: "alg-crus" },
    { id: "pa-02", producto_id: "prod-cocido", alergeno_id: "alg-crus" },
    { id: "pa-03", producto_id: "prod-marinado", alergeno_id: "alg-crus" },
  ],
  Receta: [
    { id: "rcp-cocido", producto_id: "prod-cocido", version: 2, rendimiento_esperado_pct: 95.2, vigente_desde: "2026-10-01", activo: true },
    { id: "rcp-marinado", producto_id: "prod-marinado", version: 1, rendimiento_esperado_pct: 90, vigente_desde: "2026-09-15", activo: true },
  ],
  ItemReceta: [
    { id: "ir-01", receta_id: "rcp-cocido", insumo_id: "prod-crudo", cantidad_por_unidad: 1.05, merma_esperada_pct: 4.8 },
    { id: "ir-02", receta_id: "rcp-marinado", insumo_id: "prod-crudo", cantidad_por_unidad: 1, merma_esperada_pct: 5 },
    { id: "ir-03", receta_id: "rcp-marinado", insumo_id: "prod-marinada", cantidad_por_unidad: 0.1, merma_esperada_pct: 0 },
  ],
  CausaMerma: [
    { id: "cm-escurrido", nombre: "Escurrido de hielo", etapa: "cf1", ...ver() },
    { id: "cm-coccion", nombre: "Pérdida por cocción", etapa: "coccion", ...ver() },
  ],
  Parametro: [
    { id: "par-tol", clave: "tolerancia_recepcion_pct", valor: "3", tipo: "numero", descripcion: "Diferencia máxima entre factura y peso recibido", ...ver() },
    { id: "par-vida-c", clave: "vida_util_cocido_dias", valor: "5", tipo: "numero", descripcion: "Vida útil del producto cocido", ...ver() },
  ],
  ReglaControl: [
    { id: "rg-coc", producto_id: "prod-cocido", tipo_control: "coccion", temp_min_c: 90, temp_max_c: 100, tiempo_min_min: 3, tiempo_max_min: 5, exige_temp_centro: true, version_regla: 2, vigente_desde: "2026-10-01" },
    { id: "rg-mar", producto_id: "prod-marinado", tipo_control: "marinado", temp_min_c: 0, temp_max_c: 4, tiempo_min_min: 30, tiempo_max_min: 120, exige_temp_centro: false, version_regla: 1, vigente_desde: "2026-09-15" },
  ],

  /* ---------- Recepción y báscula ---------- */
  PerfilTrama: [{ id: "pt-toledo", nombre: "Toledo continuo", baudios: 9600, bits_datos: 8, paridad: "N", bits_parada: 1, patron_peso: "^(ST|US),GS,([+-]\\d+\\.\\d+)kg$", marca_estable: "ST", unidad: "kg", ...ver() }],
  Bascula: [
    { id: "bas-rec", estacion_id: "est-rec", perfil_id: "pt-toledo", marca: "Toledo", modelo: "2096", serial: "TL-2096-0081", capacidad_kg: 300, division_kg: 0.05, calibracion_vigente_hasta: "2027-03-31", ...ver() },
    { id: "bas-emp", estacion_id: "est-emp", perfil_id: "pt-toledo", marca: "Toledo", modelo: "Ariva", serial: "TL-ARV-1120", capacidad_kg: 30, division_kg: 0.005, calibracion_vigente_hasta: "2027-01-15", ...ver() },
  ],
  Recepcion: [{ id: "rec-0241", codigo: "RC-0241", proveedor_id: "prov-pacifico", estacion_id: "est-rec", fecha: T("06:10"), numero_documento: "FV-88213", estado: "cerrada", observaciones: "Camión a 2 °C, hielo suficiente", ...cap("06:10", "usr-andres", "dev-rec") }],
  LineaRecepcion: [{ id: "lr-0241-1", recepcion_id: "rec-0241", producto_id: "prod-crudo", kg_documento: 120, temperatura_c: 2.1, lote_proveedor: "PP-2610-A", fecha_vencimiento_proveedor: "2026-10-30", inspeccion: "aprobada", observacion_inspeccion: "Olor y color característicos", ...cap("06:12", "usr-andres", "dev-rec") }],
  Pesaje: [
    { id: "ps-01", linea_id: "lr-0241-1", bascula_id: "bas-rec", secuencia: 1, bruto_kg: 68.2, tara_total_kg: 3.4, descuento_hielo_kg: 2.3, neto_kg: 62.5, metodo_tara: "catalogo", origen: "bascula", estable: true, trama_cruda: "ST,GS,+68.20kg", autorizado_por_id: null, motivo_manual: "", ...cap("06:18", "usr-andres", "dev-rec") },
    { id: "ps-02", linea_id: "lr-0241-1", bascula_id: null, secuencia: 2, bruto_kg: 63.4, tara_total_kg: 3.4, descuento_hielo_kg: 2.5, neto_kg: 57.5, metodo_tara: "catalogo", origen: "manual", estable: false, trama_cruda: "", autorizado_por_id: "usr-carlos", motivo_manual: "Báscula sin lectura estable por vibración del muelle", ...cap("06:24", "usr-andres", "dev-rec") },
  ],
  PesajeContenedor: [
    { id: "pc-01", pesaje_id: "ps-01", contenedor_id: "cont-canastilla", descripcion: "Canastilla azul", cantidad: 2, tara_unitaria_kg: 1.7, ...cap("06:18", "usr-andres", "dev-rec") },
    { id: "pc-02", pesaje_id: "ps-02", contenedor_id: "cont-canastilla", descripcion: "Canastilla azul", cantidad: 2, tara_unitaria_kg: 1.7, ...cap("06:24", "usr-andres", "dev-rec") },
  ],

  /* ---------- Inventario y trazabilidad ---------- */
  Lote: [
    { id: "lt-0238", codigo: "LT-0238", tipo: "materia_prima", producto_id: "prod-crudo", estado_calidad: "liberado", condicion: "fresco", ruta: "", cantidad_inicial_kg: 120, fecha_elaboracion: "2026-10-26", fecha_vencimiento: "2026-10-30", receta_id: null, linea_recepcion_id: "lr-0241-1", ...cap("06:26", "usr-andres", "dev-rec") },
    { id: "lt-0150", codigo: "LT-0150", tipo: "insumo", producto_id: "prod-marinada", estado_calidad: "liberado", condicion: "refrigerado", ruta: "", cantidad_inicial_kg: 10, fecha_elaboracion: "2026-10-24", fecha_vencimiento: "2026-11-07", receta_id: null, linea_recepcion_id: null, ...cap("09:00", "usr-carlos", "dev-cf1", "24") },
    { id: "lt-0301", codigo: "LT-0301", tipo: "terminado", producto_id: "prod-cocido", estado_calidad: "liberado", condicion: "refrigerado", ruta: "cocido", cantidad_inicial_kg: 30, fecha_elaboracion: "2026-10-26", fecha_vencimiento: "2026-10-31", receta_id: "rcp-cocido", linea_recepcion_id: null, ...cap("08:00", "usr-sofia", "dev-coc") },
    { id: "lt-0302", codigo: "LT-0302", tipo: "terminado", producto_id: "prod-marinado", estado_calidad: "retenido", condicion: "refrigerado", ruta: "marinado", cantidad_inicial_kg: 20, fecha_elaboracion: "2026-10-26", fecha_vencimiento: "2026-10-29", receta_id: "rcp-marinado", linea_recepcion_id: null, ...cap("08:15", "usr-sofia", "dev-coc") },
  ],
  LoteOrigen: [
    { id: "lo-01", lote_destino_id: "lt-0301", lote_origen_id: "lt-0238", cantidad_kg: 31.5, ...cap("08:00", "usr-sofia", "dev-coc") },
    { id: "lo-02", lote_destino_id: "lt-0302", lote_origen_id: "lt-0238", cantidad_kg: 20, ...cap("08:15", "usr-sofia", "dev-coc") },
    { id: "lo-03", lote_destino_id: "lt-0302", lote_origen_id: "lt-0150", cantidad_kg: 2, ...cap("08:15", "usr-sofia", "dev-coc") },
  ],
  SaldoLote: saldos(movimientos),
  Movimiento: movimientos,
  Paquete: [
    { id: "pq-01", codigo: "PQ-0301-0001", lote_id: "lt-0301", peso_kg: 1, unidades: 1, bascula_id: "bas-emp", origen_peso: "bascula", estable: true, autorizado_por_id: null, motivo_manual: "", fecha_empaque: T("11:40"), estado: "despachado", ubicacion_id: null, ...cap("11:40", "usr-sofia", "dev-emp") },
    { id: "pq-02", codigo: "PQ-0301-0002", lote_id: "lt-0301", peso_kg: 1, unidades: 1, bascula_id: "bas-emp", origen_peso: "bascula", estable: true, autorizado_por_id: null, motivo_manual: "", fecha_empaque: T("11:42"), estado: "devuelto", ubicacion_id: "ub-cf2", ...cap("11:42", "usr-sofia", "dev-emp") },
    { id: "pq-03", codigo: "PQ-0302-0001", lote_id: "lt-0302", peso_kg: 1, unidades: 1, bascula_id: "bas-emp", origen_peso: "bascula", estable: true, autorizado_por_id: null, motivo_manual: "", fecha_empaque: T("10:15"), estado: "retenido", ubicacion_id: "ub-cf3", ...cap("10:15", "usr-sofia", "dev-emp") },
  ],

  /* ---------- Producción y calidad ---------- */
  RegistroControl: [
    { id: "rc-01", lote_id: "lt-0301", tipo_control: "coccion", uso_equipo_id: "ue-01", regla_id: "rg-coc", version_regla: 2, inicio: T("08:00"), fin: T("08:04"), temp_inicial_c: 4, temp_final_c: 94, temp_centro_c: 92, tiempo_min: 4, resultado: "conforme", observacion: "", ...cap("08:04", "usr-sofia", "dev-coc") },
    { id: "rc-02", lote_id: "lt-0302", tipo_control: "marinado", uso_equipo_id: "ue-02", regla_id: "rg-mar", version_regla: 1, inicio: T("08:20"), fin: T("09:50"), temp_inicial_c: 2.4, temp_final_c: 5.2, temp_centro_c: null, tiempo_min: 90, resultado: "no_conforme", observacion: "Temperatura final sobre el límite de 4 °C", ...cap("09:50", "usr-sofia", "dev-coc") },
  ],
  PesajeProceso: [{ id: "pp-01", lote_id: "lt-0301", etapa: "coccion", bascula_id: "bas-emp", canastilla_id: "cn-0042", kg_entrada: 31.5, bruto_kg: 31.7, tara_kg: 1.7, neto_kg: 30, origen: "bascula", estable: true, autorizado_por_id: null, motivo_manual: "", ...cap("09:20", "usr-sofia", "dev-emp") }],
  Merma: [{ id: "mer-01", lote_id: "lt-0238", etapa: "cf1", causa_id: "cm-escurrido", cantidad_kg: 1.5, responsable_id: "usr-andres", movimiento_id: "mv-04", observacion: "", ...cap("08:15", "usr-andres", "dev-cf1") }],
  HistorialEstadoLote: [
    { id: "hl-01", lote_id: "lt-0301", estado_anterior: "cuarentena", estado_nuevo: "liberado", motivo: "Cocción conforme y temperatura de centro 92 °C", autorizado_por_id: "usr-luisa", ...cap("11:00", "usr-luisa", "dev-pc") },
    { id: "hl-02", lote_id: "lt-0302", estado_anterior: "cuarentena", estado_nuevo: "retenido", motivo: "NC-0007 · marinado sobre 4 °C", autorizado_por_id: "usr-luisa", ...cap("10:05", "usr-luisa", "dev-pc") },
  ],
  NoConformidad: [{ id: "nc-07", codigo: "NC-0007", origen: "control_marinado", descripcion: "Temperatura final del marinado en 5,2 °C", causa: "Tina sin hielo de reposición durante 20 minutos", decision: "retener_y_evaluar", estado: "abierta", lote_id: "lt-0302", equipo_id: "eq-tina", responsable_id: "usr-luisa", cierre_verificado_por_id: null, fecha_cierre: null, ...cap("10:00", "usr-luisa", "dev-pc") }],
  AccionCorrectiva: [{ id: "ac-01", no_conformidad_id: "nc-07", descripcion: "Instalar alarma de temperatura en la tina de marinado", responsable_id: "usr-carlos", fecha_compromiso: "2026-10-30", fecha_cierre: null, estado: "abierta", lote_id: "lt-0302", equipo_id: "eq-tina", ...cap("10:10", "usr-luisa", "dev-pc") }],
  RegistroBPM: [{ id: "bpm-01", tipo: "control_ingreso", estacion_id: "est-emp", fecha: T("06:00"), valores: { manos: true, uniforme: true, sin_joyas: true, salud: true }, resultado: "conforme", observacion: "", ...cap("06:00", "usr-carlos", "dev-emp") }],
  CertificadoManipulador: [{ id: "cer-01", usuario_id: "usr-sofia", tipo: "manipulador", emisor: "Secretaría de Salud", numero: "MA-2026-4471", fecha_expedicion: "2026-03-01", fecha_vencimiento: "2027-03-01", horas: 10, soporte_url: "documentos/cer-01.pdf", ...ver() }],

  /* ---------- Equipos y limpieza ---------- */
  Equipo: [
    { id: "eq-marmita", codigo: "EQ-MAR-01", nombre: "Marmita 1", tipo: "marmita", estacion_id: "est-coc", estado: "Usado", ultima_categoria_id: "cat-crustaceos", ultimo_uso_fin: T("08:04"), tiempo_max_uso_min: 240, ...ver() },
    { id: "eq-tina", codigo: "EQ-TIN-01", nombre: "Tina de marinado", tipo: "tina", estacion_id: "est-mar", estado: "Por verificar", ultima_categoria_id: "cat-crustaceos", ultimo_uso_fin: T("09:50"), tiempo_max_uso_min: 180, ...ver() },
    { id: "eq-mesa", codigo: "EQ-MES-04", nombre: "Mesa de empaque 4", tipo: "mesa", estacion_id: "est-emp", estado: "En uso", ultima_categoria_id: "cat-crustaceos", ultimo_uso_fin: null, tiempo_max_uso_min: 240, ...ver() },
  ],
  MatrizCambio: [
    { id: "mc-01", categoria_desde_id: "cat-pescado", categoria_hacia_id: "cat-pescado", nivel: "N0", version_matriz: 1, ...ver() },
    { id: "mc-02", categoria_desde_id: "cat-pescado", categoria_hacia_id: "cat-crustaceos", nivel: "N2", version_matriz: 1, ...ver() },
    { id: "mc-03", categoria_desde_id: "cat-crustaceos", categoria_hacia_id: "cat-pescado", nivel: "N2", version_matriz: 1, ...ver() },
    { id: "mc-04", categoria_desde_id: "cat-crustaceos", categoria_hacia_id: "cat-crustaceos", nivel: "N0", version_matriz: 1, ...ver() },
    { id: "mc-05", categoria_desde_id: "cat-vegetal", categoria_hacia_id: "cat-pescado", nivel: "N0", version_matriz: 1, ...ver(1, false) },
    { id: "mc-06", categoria_desde_id: "cat-vegetal", categoria_hacia_id: "cat-pescado", nivel: "N1", version_matriz: 2, ...ver(2) },
    { id: "mc-07", categoria_desde_id: "cat-crustaceos", categoria_hacia_id: "cat-moluscos", nivel: "N2", version_matriz: 1, ...ver() },
  ],
  ProcedimientoLimpieza: [
    { id: "pl-n1", nivel: "N1", nombre: "Limpieza intermedia", version_procedimiento: 1, ...ver() },
    { id: "pl-n2", nivel: "N2", nombre: "Limpieza profunda por cambio de alérgeno", version_procedimiento: 3, ...ver(3) },
  ],
  PasoLimpieza: [
    { id: "pa-01", procedimiento_id: "pl-n1", orden: 1, descripcion: "Retiro de residuos visibles", requiere_medicion: false, medicion_nombre: "", unidad: "", rango_min: null, rango_max: null, tipo_resultado: "check", ...ver() },
    { id: "pa-02", procedimiento_id: "pl-n2", orden: 1, descripcion: "Desarme y retiro de residuos", requiere_medicion: false, medicion_nombre: "", unidad: "", rango_min: null, rango_max: null, tipo_resultado: "check", ...ver(3) },
    { id: "pa-03", procedimiento_id: "pl-n2", orden: 2, descripcion: "Lavado con detergente alcalino", requiere_medicion: false, medicion_nombre: "", unidad: "", rango_min: null, rango_max: null, tipo_resultado: "check", ...ver(3) },
    { id: "pa-04", procedimiento_id: "pl-n2", orden: 3, descripcion: "Desinfección y tiempo de contacto", requiere_medicion: true, medicion_nombre: "Concentración de cloro", unidad: "ppm", rango_min: 100, rango_max: 200, tipo_resultado: "numero", ...ver(3) },
    { id: "pa-05", procedimiento_id: "pl-n2", orden: 4, descripcion: "Prueba ATP", requiere_medicion: true, medicion_nombre: "ATP", unidad: "RLU", rango_min: 0, rango_max: 150, tipo_resultado: "numero", ...ver(3) },
  ],
  RegistroLimpieza: [{ id: "rl-01", equipo_id: "eq-mesa", procedimiento_id: "pl-n2", nivel: "N2", inicio: T("10:30"), fin: T("11:05"), estado: "liberado", ejecutor_id: "usr-sofia", verificador_id: "usr-marta", motivo_rechazo: "", liberado_en: T("11:10"), ...cap("11:10", "usr-marta", "dev-emp") }],
  RegistroLimpiezaPaso: [
    { id: "rlp-01", registro_id: "rl-01", paso_id: "pa-04", cumplido: true, valor_medido: 150, resultado_prueba: "dentro_rango", fuera_de_rango: false, ...cap("10:50", "usr-sofia", "dev-emp") },
    { id: "rlp-02", registro_id: "rl-01", paso_id: "pa-05", cumplido: true, valor_medido: 42, resultado_prueba: "dentro_rango", fuera_de_rango: false, ...cap("11:02", "usr-sofia", "dev-emp") },
  ],
  UsoEquipo: [
    { id: "ue-01", equipo_id: "eq-marmita", categoria_id: "cat-crustaceos", lote_id: "lt-0301", limpieza_id: null, inicio: T("08:00"), fin: T("08:04"), ...cap("08:00", "usr-sofia", "dev-coc") },
    { id: "ue-02", equipo_id: "eq-tina", categoria_id: "cat-crustaceos", lote_id: "lt-0302", limpieza_id: null, inicio: T("08:20"), fin: T("09:50"), ...cap("08:20", "usr-sofia", "dev-coc") },
    { id: "ue-03", equipo_id: "eq-mesa", categoria_id: "cat-crustaceos", lote_id: "lt-0301", limpieza_id: "rl-01", inicio: T("11:15"), fin: null, ...cap("11:15", "usr-sofia", "dev-emp") },
  ],
  CambioEstadoEquipo: [
    { id: "ce-01", equipo_id: "eq-mesa", estado_anterior: "En limpieza", estado_nuevo: "Liberado", motivo: "Limpieza N2 verificada", ref_tipo: "limpieza", ref_id: "rl-01", ...cap("11:10", "usr-marta", "dev-emp") },
    { id: "ce-02", equipo_id: "eq-tina", estado_anterior: "Usado", estado_nuevo: "Por verificar", motivo: "NC-0007 abierta", ref_tipo: "nc", ref_id: "nc-07", ...cap("10:00", "usr-luisa", "dev-pc") },
  ],

  /* ---------- Pedidos, despacho, etiquetas y sincronización ---------- */
  PedidoSede: [{ id: "ped-090", codigo: "PED-0090", sede_id: "sede-norte", fecha_entrega: "2026-10-26", estado: "despachado", observacion: "", ...cap("07:00", "usr-pedro", "dev-sede", "25") }],
  LineaPedido: [{ id: "lp-01", pedido_id: "ped-090", producto_id: "prod-cocido", cantidad: 2, unidad: "kg", ...cap("07:00", "usr-pedro", "dev-sede", "25") }],
  Remision: [{ id: "rm-0112", codigo: "RM-0112", sede_id: "sede-norte", pedido_id: "ped-090", estado: "recibida", fecha_despacho: T("13:00"), temperatura_c: 3.1, conductor: "Jorge Ruiz", placa_vehiculo: "TKM-482", observaciones: "", ...cap("12:55", "usr-sofia", "dev-desp") }],
  LineaRemision: [{ id: "lrm-01", remision_id: "rm-0112", producto_id: "prod-cocido", linea_pedido_id: "lp-01", cantidad: 2, unidad: "kg", cantidad_kg: 2, receta_id: null, ...cap("12:55", "usr-sofia", "dev-desp") }],
  ComponenteRemision: [{ id: "cr-01", linea_remision_id: "lrm-01", insumo_id: "prod-cocido", kg_teoricos: 2, kg_despachados: 2, ...cap("12:55", "usr-sofia", "dev-desp") }],
  RemisionPaquete: [
    { id: "rp-01", remision_id: "rm-0112", paquete_id: "pq-01", linea_remision_id: "lrm-01", canastilla_id: "cn-0043", escaneado_en: T("12:45"), ...cap("12:45", "usr-sofia", "dev-desp") },
    { id: "rp-02", remision_id: "rm-0112", paquete_id: "pq-02", linea_remision_id: "lrm-01", canastilla_id: "cn-0043", escaneado_en: T("12:46"), ...cap("12:46", "usr-sofia", "dev-desp") },
  ],
  RecepcionSede: [{ id: "rs-01", remision_id: "rm-0112", recibido_por_id: "usr-pedro", fecha: T("15:20"), temperatura_c: 3.8, observaciones: "", ...cap("15:20", "usr-pedro", "dev-sede") }],
  LineaRecepcionSede: [{ id: "lrs-01", recepcion_sede_id: "rs-01", linea_remision_id: "lrm-01", cantidad_recibida_kg: 2, diferencia_kg: 0, motivo: "", ...cap("15:22", "usr-pedro", "dev-sede") }],
  Devolucion: [{ id: "dv-01", lote_id: "lt-0301", paquete_id: "pq-02", remision_id: "rm-0112", cantidad_kg: 0.5, motivo: "Empaque con pérdida de vacío", movimiento_id: "mv-10", ...cap("16:00", "usr-pedro", "dev-sede") }],
  PlantillaEtiqueta: [{ id: "tpl-paq", tipo: "paquete", version_plantilla: 4, zpl: "^XA^FO40,40^BCN,80^FD{codigo}^FS^FO40,140^FD{producto}^FS^XZ", ...ver(4) }],
  Impresora: [{ id: "imp-emp", nombre: "Zebra Empaque", modelo: "ZD421", conexion: "red", ip: "10.0.4.21", puerto: 9100, estacion_id: "est-emp", ...ver() }],
  BloqueConsecutivo: [{ id: "bc-01", dispositivo_id: "dev-emp", prefijo: "PQ", desde: 1, hasta: 500, ultimo_usado: 3, estado: "activo", asignado_en: T("05:00") }],
  Etiqueta: [
    { id: "et-01", codigo: "ET-PQ-0301-0001", plantilla_id: "tpl-paq", version_plantilla: 4, impresora_id: "imp-emp", lote_id: "lt-0301", paquete_id: "pq-01", equipo_id: null, canastilla_id: null, es_reimpresion: false, motivo_reimpresion: "", impresa_en: T("11:40"), ...cap("11:40", "usr-sofia", "dev-emp") },
    { id: "et-02", codigo: "ET-PQ-0301-0001-R1", plantilla_id: "tpl-paq", version_plantilla: 4, impresora_id: "imp-emp", lote_id: "lt-0301", paquete_id: "pq-01", equipo_id: null, canastilla_id: null, es_reimpresion: true, motivo_reimpresion: "Etiqueta dañada por humedad", impresa_en: T("11:45"), ...cap("11:45", "usr-sofia", "dev-emp") },
  ],
  EventoSync: [
    { id: "ev-01", dispositivo_id: "dev-emp", usuario_id: "usr-sofia", tipo: "paquete.creado", payload: { codigo: "PQ-0301-0002" }, hora_dispositivo: T("11:42"), contador: 41, recibido_en: T("11:43"), estado: "aplicado", detalle_error: "", aplicado_en: T("11:43") },
    { id: "ev-02", dispositivo_id: "dev-emp", usuario_id: "usr-sofia", tipo: "paquete.creado", payload: { codigo: "PQ-0301-0002" }, hora_dispositivo: T("11:42"), contador: 41, recibido_en: T("11:58"), estado: "conflicto", detalle_error: "Contador repetido", aplicado_en: null },
  ],
  ConflictoSync: [{ id: "cf-01", evento_id: "ev-02", motivo: "Evento reenviado tras reconexión", estado: "resuelto", resolucion: "descartar", ajuste: null, motivo_resolucion: "Duplicado del evento ev-01 ya aplicado", resuelto_por_id: "usr-luisa", resuelto_en: T("12:10"), creado_en: T("11:58") }],

  /* ---------- Canastillas y temperatura ---------- */
  Canastilla: [
    { id: "cn-0042", codigo: "CN-0042", tipo_id: "cont-canastilla", uso: "planta", estado: "en_planta", ubicacion_id: "ub-cf1", sede_id: null, fecha_alta: "2026-01-10", ultimo_movimiento_en: T("09:30"), ...ver() },
    { id: "cn-0043", codigo: "CN-0043", tipo_id: "cont-canastilla", uso: "despacho", estado: "en_sede", ubicacion_id: null, sede_id: "sede-norte", fecha_alta: "2026-01-10", ultimo_movimiento_en: T("13:00"), ...ver() },
  ],
  ContenidoCanastilla: [{ id: "cc-01", canastilla_id: "cn-0042", lote_id: "lt-0238", paquete_id: null, cantidad_kg: 62.5, pesaje_recepcion_id: "ps-01", cargado_en: T("06:20"), retirado_en: null, retirado_por_id: null, ...cap("06:20", "usr-andres", "dev-rec") }],
  PesajeCanastilla: [{ id: "pcn-01", lote_id: "lt-0301", canastilla_id: "cn-0042", canastilla_origen_id: null, destino: "cf2", bascula_id: "bas-emp", bruto_kg: 31.7, tara_kg: 1.7, neto_kg: 30, origen: "bascula", estable: true, autorizado_por_id: null, motivo_manual: "", movimiento_id: "mv-07", ...cap("09:28", "usr-sofia", "dev-emp") }],
  MovimientoCanastilla: [{ id: "mcn-01", canastilla_id: "cn-0043", tipo: "salida_sede", estado_anterior: "en_planta", estado_nuevo: "en_sede", ubicacion_destino_id: null, sede_id: "sede-norte", remision_id: "rm-0112", entrega: "Jorge Ruiz", recibe_id: "usr-pedro", retorno_previsto: T("08:00", "29"), unidades_esperadas: 1, unidades_contadas: 1, observacion: "", ...cap("13:00", "usr-sofia", "dev-desp") }],
  SensorTemperatura: [
    { id: "sen-cf1", nombre: "Sensor CF-1", ubicacion_id: "ub-cf1", serial_panel: "PNL-7781", zona_id: 1, modelo: "TZone-2", con_sonda_externa: false, temp_min_c: 0, temp_max_c: 4, ...ver() },
    { id: "sen-cf2", nombre: "Sensor CF-2", ubicacion_id: "ub-cf2", serial_panel: "PNL-7781", zona_id: 2, modelo: "TZone-2", con_sonda_externa: true, temp_min_c: 0, temp_max_c: 4, ...ver() },
    { id: "sen-cf3", nombre: "Sensor CF-3", ubicacion_id: "ub-cf3", serial_panel: "PNL-7781", zona_id: 3, modelo: "TZone-2", con_sonda_externa: true, temp_min_c: 0, temp_max_c: 4, ...ver() },
  ],
  LecturaTemperatura: [
    { id: "lec-01", sensor_id: "sen-cf1", medido_en: T("10:00"), temperatura_c: 2.4, humedad_pct: 88, estado_zona: "normal", bateria_pct: 92, fuera_de_rango: false, recibido_en: T("10:00") },
    { id: "lec-02", sensor_id: "sen-cf2", medido_en: T("10:00"), temperatura_c: 3.1, humedad_pct: 85, estado_zona: "normal", bateria_pct: 90, fuera_de_rango: false, recibido_en: T("10:00") },
    { id: "lec-03", sensor_id: "sen-cf2", medido_en: T("14:00"), temperatura_c: 5.6, humedad_pct: 84, estado_zona: "alarma", bateria_pct: 89, fuera_de_rango: true, recibido_en: T("14:01") },
    { id: "lec-04", sensor_id: "sen-cf3", medido_en: T("10:00"), temperatura_c: 1.2, humedad_pct: 86, estado_zona: "normal", bateria_pct: 95, fuera_de_rango: false, recibido_en: T("10:00") },
  ],
  ConsultaSensores: [{ id: "cs-01", serial_panel: "PNL-7781", consultado_en: T("14:01"), resultado: "ok", lecturas_guardadas: 3, codigo_error: "", detalle: "" }],
};
