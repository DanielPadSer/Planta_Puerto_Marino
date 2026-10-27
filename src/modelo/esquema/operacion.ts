import { tabla, pk, txt, largo, ent, dec, bool, fecha, ts, json, fk, uq, CAPTURA, VERSION } from "./tipos";

export const RECEPCION = {
  PerfilTrama: tabla("recepcion_perfiltrama", "K", "recepcion", "Cómo leer la trama serial de cada modelo de báscula.", {
    id: pk(), nombre: uq(txt(60)), baudios: ent(), bits_datos: ent(false, "smallint"), paridad: txt(1), bits_parada: ent(false, "smallint"), patron_peso: txt(120), marca_estable: txt(20), unidad: txt(5), ...VERSION,
  }),
  Bascula: tabla("recepcion_bascula", "K", "recepcion", "Básculas físicas con capacidad, división y calibración.", {
    id: pk(), estacion_id: fk("Estacion"), perfil_id: fk("PerfilTrama"), marca: txt(60), modelo: txt(60), serial: uq(txt(60)), capacidad_kg: dec("10,3"), division_kg: dec("6,3"), calibracion_vigente_hasta: fecha(true), ...VERSION,
  }),
  Recepcion: tabla("recepcion_recepcion", "C", "recepcion", "Llegada de un proveedor con su documento.", {
    id: pk(), codigo: uq(txt(20)), proveedor_id: fk("Proveedor"), estacion_id: fk("Estacion"), fecha: ts(), numero_documento: txt(40), estado: txt(10), observaciones: largo(), ...CAPTURA,
  }),
  LineaRecepcion: tabla("recepcion_linearecepcion", "C", "recepcion", "Cada producto recibido con temperatura, lote e inspección.", {
    id: pk(), recepcion_id: fk("Recepcion"), producto_id: fk("Producto"), kg_documento: dec("10,3", true), temperatura_c: dec("5,1", true), lote_proveedor: txt(40), fecha_vencimiento_proveedor: fecha(true), inspeccion: txt(10), observacion_inspeccion: txt(255), ...CAPTURA,
  }),
  Pesaje: tabla("recepcion_pesaje", "C", "recepcion", "Cada tanda pesada: bruto, tara, hielo y neto; manual exige autorización.", {
    id: pk(), linea_id: fk("LineaRecepcion"), bascula_id: fk("Bascula", true), secuencia: ent(false, "smallint"), bruto_kg: dec("10,3"), tara_total_kg: dec("10,3"), descuento_hielo_kg: dec("10,3"), neto_kg: dec("10,3"), metodo_tara: txt(10), origen: txt(10), estable: bool(), trama_cruda: txt(120), autorizado_por_id: fk("Usuario", true), motivo_manual: txt(255), ...CAPTURA,
  }),
  PesajeContenedor: tabla("recepcion_pesajecontenedor", "C", "recepcion", "Contenedores descontados como tara en un pesaje.", {
    id: pk(), pesaje_id: fk("Pesaje"), contenedor_id: fk("Contenedor", true), descripcion: txt(80), cantidad: ent(), tara_unitaria_kg: dec("10,3"), ...CAPTURA,
  }),
};

export const INVENTARIO = {
  Lote: tabla("inventario_lote", "C", "inventario", "Unidad de trazabilidad; nace al escanear materia prima o al producir.", {
    id: pk(), codigo: uq(txt(30)), tipo: txt(15), producto_id: fk("Producto"), estado_calidad: txt(12), condicion: txt(10), ruta: txt(15), cantidad_inicial_kg: dec("10,3"), fecha_elaboracion: fecha(), fecha_vencimiento: fecha(), receta_id: fk("Receta", true), linea_recepcion_id: fk("LineaRecepcion", true), ...CAPTURA,
  }),
  LoteOrigen: tabla("inventario_loteorigen", "C", "inventario", "Genealogía: qué lotes y cuántos kg formaron otro lote.", {
    id: pk(), lote_destino_id: fk("Lote"), lote_origen_id: fk("Lote"), cantidad_kg: dec("10,3"), ...CAPTURA,
  }),
  SaldoLote: tabla("inventario_saldolote", "V", "inventario", "Vista calculada: saldo por lote y ubicación a partir de los movimientos.", {
    id: pk("varchar(80)"), lote_id: fk("Lote"), ubicacion_id: fk("Ubicacion"), saldo_kg: dec("10,3"),
  }),
  Movimiento: tabla("inventario_movimiento", "C", "inventario", "Entradas, salidas, traslados y mermas; nunca se edita el saldo directamente.", {
    id: pk(), lote_id: fk("Lote"), tipo: txt(12), cantidad_kg: dec("10,3"), ubicacion_origen_id: fk("Ubicacion", true), ubicacion_destino_id: fk("Ubicacion", true), canastilla_id: fk("Canastilla", true), motivo: txt(255), ref_tipo: txt(10), ref_id: fk("", true), ...CAPTURA,
  }),
  Paquete: tabla("inventario_paquete", "C", "inventario", "Paquete etiquetado de producto terminado.", {
    id: pk(), codigo: uq(txt(40)), lote_id: fk("Lote"), peso_kg: dec("10,3"), unidades: ent(false, "smallint"), bascula_id: fk("Bascula", true), origen_peso: txt(10), estable: bool(), autorizado_por_id: fk("Usuario", true), motivo_manual: txt(255), fecha_empaque: ts(), estado: txt(12), ubicacion_id: fk("Ubicacion", true), ...CAPTURA,
  }),
};

export const PRODUCCION = {
  RegistroControl: tabla("produccion_registrocontrol", "C", "produccion", "Control de cocción, marinado o enfriamiento contra la regla vigente.", {
    id: pk(), lote_id: fk("Lote"), tipo_control: txt(15), uso_equipo_id: fk("UsoEquipo", true), regla_id: fk("ReglaControl", true), version_regla: ent(true), inicio: ts(), fin: ts(true), temp_inicial_c: dec("5,1", true), temp_final_c: dec("5,1", true), temp_centro_c: dec("5,1", true), tiempo_min: ent(true), resultado: txt(10), observacion: txt(255), ...CAPTURA,
  }),
  PesajeProceso: tabla("produccion_pesajeproceso", "C", "produccion", "Pesos de entrada y salida en cada etapa del proceso.", {
    id: pk(), lote_id: fk("Lote"), etapa: txt(12), bascula_id: fk("Bascula", true), canastilla_id: fk("Canastilla", true), kg_entrada: dec("10,3"), bruto_kg: dec("10,3"), tara_kg: dec("10,3"), neto_kg: dec("10,3"), origen: txt(10), estable: bool(), autorizado_por_id: fk("Usuario", true), motivo_manual: txt(255), ...CAPTURA,
  }),
  Merma: tabla("produccion_merma", "C", "produccion", "Merma con causa tipificada y responsable.", {
    id: pk(), lote_id: fk("Lote"), etapa: txt(20), causa_id: fk("CausaMerma"), cantidad_kg: dec("10,3"), responsable_id: fk("Usuario"), movimiento_id: fk("Movimiento", true), observacion: txt(255), ...CAPTURA,
  }),
  HistorialEstadoLote: tabla("calidad_historialestadolote", "C", "produccion", "Cada cambio de estado de calidad de un lote, con motivo y firma.", {
    id: pk(), lote_id: fk("Lote"), estado_anterior: txt(12), estado_nuevo: txt(12), motivo: txt(255), autorizado_por_id: fk("Usuario", true), ...CAPTURA,
  }),
  NoConformidad: tabla("calidad_noconformidad", "C", "produccion", "Desviación con causa, decisión y cierre verificado.", {
    id: pk(), codigo: uq(txt(20)), origen: txt(40), descripcion: largo(), causa: largo(), decision: txt(25), estado: txt(10), lote_id: fk("Lote", true), equipo_id: fk("Equipo", true), responsable_id: fk("Usuario"), cierre_verificado_por_id: fk("Usuario", true), fecha_cierre: ts(true), ...CAPTURA,
  }),
  AccionCorrectiva: tabla("calidad_accioncorrectiva", "C", "produccion", "Acciones comprometidas para cerrar una no conformidad.", {
    id: pk(), no_conformidad_id: fk("NoConformidad"), descripcion: largo(), responsable_id: fk("Usuario"), fecha_compromiso: fecha(true), fecha_cierre: fecha(true), estado: txt(10), lote_id: fk("Lote", true), equipo_id: fk("Equipo", true), ...CAPTURA,
  }),
  RegistroBPM: tabla("calidad_registrobpm", "C", "produccion", "Controles BPM de turno por estación.", {
    id: pk(), tipo: txt(40), estacion_id: fk("Estacion"), fecha: ts(), valores: json(), resultado: txt(10), observacion: txt(255), ...CAPTURA,
  }),
  CertificadoManipulador: tabla("calidad_certificadomanipulador", "R", "produccion", "Certificados del personal con vigencia y soporte.", {
    id: pk(), usuario_id: fk("Usuario"), tipo: txt(20), emisor: txt(120), numero: txt(40), fecha_expedicion: fecha(), fecha_vencimiento: fecha(), horas: dec("5,1", true), soporte_url: txt(200), ...VERSION,
  }),
};

export const EQUIPOS = {
  Equipo: tabla("equipos_equipo", "K", "equipos", "Equipos con estado y última categoría procesada.", {
    id: pk(), codigo: uq(txt(20)), nombre: txt(80), tipo: txt(40), estacion_id: fk("Estacion"), estado: txt(15), ultima_categoria_id: fk("CategoriaSanitaria", true), ultimo_uso_fin: ts(true), tiempo_max_uso_min: ent(true), ...VERSION,
  }),
  MatrizCambio: tabla("equipos_matrizcambio", "K", "equipos", "Nivel de limpieza exigido entre categorías; versionada.", {
    id: pk(), categoria_desde_id: fk("CategoriaSanitaria"), categoria_hacia_id: fk("CategoriaSanitaria"), nivel: txt(2), version_matriz: ent(), ...VERSION,
  }),
  ProcedimientoLimpieza: tabla("equipos_procedimientolimpieza", "K", "equipos", "POE por nivel de limpieza.", {
    id: pk(), nivel: txt(2), nombre: txt(80), version_procedimiento: ent(), ...VERSION,
  }),
  PasoLimpieza: tabla("equipos_pasolimpieza", "K", "equipos", "Pasos del POE, con medición y rango cuando aplica.", {
    id: pk(), procedimiento_id: fk("ProcedimientoLimpieza"), orden: ent(false, "smallint"), descripcion: txt(255), requiere_medicion: bool(), medicion_nombre: txt(60), unidad: txt(15), rango_min: dec("10,3", true), rango_max: dec("10,3", true), tipo_resultado: txt(20), ...VERSION,
  }),
  RegistroLimpieza: tabla("equipos_registrolimpieza", "C", "equipos", "Limpieza ejecutada y verificada antes de liberar el equipo.", {
    id: pk(), equipo_id: fk("Equipo"), procedimiento_id: fk("ProcedimientoLimpieza"), nivel: txt(2), inicio: ts(), fin: ts(true), estado: txt(15), ejecutor_id: fk("Usuario"), verificador_id: fk("Usuario", true), motivo_rechazo: txt(255), liberado_en: ts(true), ...CAPTURA,
  }),
  RegistroLimpiezaPaso: tabla("equipos_registrolimpiezapaso", "C", "equipos", "Resultado de cada paso del POE.", {
    id: pk(), registro_id: fk("RegistroLimpieza"), paso_id: fk("PasoLimpieza"), cumplido: bool(), valor_medido: dec("10,3", true), resultado_prueba: txt(20), fuera_de_rango: bool(), ...CAPTURA,
  }),
  UsoEquipo: tabla("equipos_usoequipo", "C", "equipos", "Qué categoría y lote pasó por un equipo y con qué limpieza previa.", {
    id: pk(), equipo_id: fk("Equipo"), categoria_id: fk("CategoriaSanitaria"), lote_id: fk("Lote", true), limpieza_id: fk("RegistroLimpieza", true), inicio: ts(), fin: ts(true), ...CAPTURA,
  }),
  CambioEstadoEquipo: tabla("equipos_cambioestadoequipo", "C", "equipos", "Historial de estados del equipo.", {
    id: pk(), equipo_id: fk("Equipo"), estado_anterior: txt(15), estado_nuevo: txt(15), motivo: txt(255), ref_tipo: txt(10), ref_id: fk("", true), ...CAPTURA,
  }),
};

export const DESPACHO = {
  PedidoSede: tabla("despacho_pedidosede", "C", "despacho", "Pedido de una sede a la planta.", {
    id: pk(), codigo: uq(txt(20)), sede_id: fk("Sede"), fecha_entrega: fecha(), estado: txt(12), observacion: txt(255), ...CAPTURA,
  }),
  LineaPedido: tabla("despacho_lineapedido", "C", "despacho", "Productos y cantidades pedidas.", {
    id: pk(), pedido_id: fk("PedidoSede"), producto_id: fk("Producto"), cantidad: dec("10,3"), unidad: txt(5), ...CAPTURA,
  }),
  Remision: tabla("despacho_remision", "C", "despacho", "Documento de despacho con vehículo y temperatura.", {
    id: pk(), codigo: uq(txt(20)), sede_id: fk("Sede"), pedido_id: fk("PedidoSede", true), estado: txt(12), fecha_despacho: ts(true), temperatura_c: dec("5,1", true), conductor: txt(120), placa_vehiculo: txt(10), observaciones: largo(), ...CAPTURA,
  }),
  LineaRemision: tabla("despacho_linearemision", "C", "despacho", "Producto despachado contra una línea de pedido.", {
    id: pk(), remision_id: fk("Remision"), producto_id: fk("Producto"), linea_pedido_id: fk("LineaPedido", true), cantidad: dec("10,3"), unidad: txt(5), cantidad_kg: dec("10,3", true), receta_id: fk("Receta", true), ...CAPTURA,
  }),
  ComponenteRemision: tabla("despacho_componenteremision", "C", "despacho", "Insumos teóricos y despachados de un kit.", {
    id: pk(), linea_remision_id: fk("LineaRemision"), insumo_id: fk("Producto"), kg_teoricos: dec("10,3"), kg_despachados: dec("10,3"), ...CAPTURA,
  }),
  RemisionPaquete: tabla("despacho_remisionpaquete", "C", "despacho", "Paquetes escaneados al cargar la remisión.", {
    id: pk(), remision_id: fk("Remision"), paquete_id: fk("Paquete"), linea_remision_id: fk("LineaRemision", true), canastilla_id: fk("Canastilla", true), escaneado_en: ts(), ...CAPTURA,
  }),
  RecepcionSede: tabla("despacho_recepcionsede", "C", "despacho", "Recibo de la remisión en la sede.", {
    id: pk(), remision_id: fk("Remision"), recibido_por_id: fk("Usuario"), fecha: ts(), temperatura_c: dec("5,1", true), observaciones: largo(), ...CAPTURA,
  }),
  LineaRecepcionSede: tabla("despacho_linearecepcionsede", "C", "despacho", "Cantidades recibidas y diferencias.", {
    id: pk(), recepcion_sede_id: fk("RecepcionSede"), linea_remision_id: fk("LineaRemision"), cantidad_recibida_kg: dec("10,3"), diferencia_kg: dec("10,3"), motivo: txt(255), ...CAPTURA,
  }),
  Devolucion: tabla("despacho_devolucion", "C", "despacho", "Producto devuelto con su movimiento de inventario.", {
    id: pk(), lote_id: fk("Lote"), paquete_id: fk("Paquete", true), remision_id: fk("Remision", true), cantidad_kg: dec("10,3"), motivo: txt(255), movimiento_id: fk("Movimiento", true), ...CAPTURA,
  }),
  PlantillaEtiqueta: tabla("etiquetas_plantillaetiqueta", "K", "despacho", "Plantillas ZPL versionadas.", {
    id: pk(), tipo: txt(20), version_plantilla: ent(), zpl: largo(), ...VERSION,
  }),
  Impresora: tabla("etiquetas_impresora", "K", "despacho", "Impresoras de etiquetas por estación.", {
    id: pk(), nombre: uq(txt(80)), modelo: txt(60), conexion: txt(10), ip: txt(45, true), puerto: ent(), estacion_id: fk("Estacion"), ...VERSION,
  }),
  BloqueConsecutivo: tabla("etiquetas_bloqueconsecutivo", "S", "despacho", "Rangos de códigos reservados por dispositivo para imprimir sin conexión.", {
    id: pk(), dispositivo_id: fk("Dispositivo"), prefijo: txt(10), desde: ent(), hasta: ent(), ultimo_usado: ent(true), estado: txt(10), asignado_en: ts(),
  }),
  Etiqueta: tabla("etiquetas_etiqueta", "C", "despacho", "Cada etiqueta impresa; las reimpresiones exigen motivo.", {
    id: pk(), codigo: uq(txt(40)), plantilla_id: fk("PlantillaEtiqueta"), version_plantilla: ent(), impresora_id: fk("Impresora", true), lote_id: fk("Lote", true), paquete_id: fk("Paquete", true), equipo_id: fk("Equipo", true), canastilla_id: fk("Canastilla", true), es_reimpresion: bool(), motivo_reimpresion: txt(255), impresa_en: ts(), ...CAPTURA,
  }),
  EventoSync: tabla("sync_eventosync", "S", "despacho", "Cola de eventos capturados sin conexión, con contador por dispositivo.", {
    id: pk(), dispositivo_id: fk("Dispositivo"), usuario_id: fk("Usuario", true), tipo: txt(40), payload: json(), hora_dispositivo: ts(), contador: ent(), recibido_en: ts(), estado: txt(12), detalle_error: txt(255), aplicado_en: ts(true),
  }),
  ConflictoSync: tabla("sync_conflictosync", "S", "despacho", "Conflictos de sincronización y su resolución firmada.", {
    id: pk(), evento_id: fk("EventoSync"), motivo: txt(255), estado: txt(12), resolucion: txt(20), ajuste: json(true), motivo_resolucion: txt(255), resuelto_por_id: fk("Usuario", true), resuelto_en: ts(true), creado_en: ts(),
  }),
};

export const CANASTILLAS = {
  Canastilla: tabla("canastillas_canastilla", "K", "canastillas", "Canastillas individuales con código, uso y ubicación.", {
    id: pk(), codigo: uq(txt(20)), tipo_id: fk("Contenedor"), uso: txt(10), estado: txt(12), ubicacion_id: fk("Ubicacion", true), sede_id: fk("Sede", true), fecha_alta: fecha(), ultimo_movimiento_en: ts(true), ...VERSION,
  }),
  ContenidoCanastilla: tabla("canastillas_contenidocanastilla", "C", "canastillas", "Qué lote o paquete hay dentro de cada canastilla.", {
    id: pk(), canastilla_id: fk("Canastilla"), lote_id: fk("Lote"), paquete_id: fk("Paquete", true), cantidad_kg: dec("10,3", true), pesaje_recepcion_id: fk("Pesaje", true), cargado_en: ts(), retirado_en: ts(true), retirado_por_id: fk("MovimientoCanastilla", true), ...CAPTURA,
  }),
  PesajeCanastilla: tabla("canastillas_pesajecanastilla", "C", "canastillas", "Pesaje de una canastilla con su tara.", {
    id: pk(), lote_id: fk("Lote"), canastilla_id: fk("Canastilla"), canastilla_origen_id: fk("Canastilla", true), destino: txt(10), bascula_id: fk("Bascula", true), bruto_kg: dec("10,3"), tara_kg: dec("10,3"), neto_kg: dec("10,3"), origen: txt(10), estable: bool(), autorizado_por_id: fk("Usuario", true), motivo_manual: txt(255), movimiento_id: fk("Movimiento", true), ...CAPTURA,
  }),
  MovimientoCanastilla: tabla("canastillas_movimientocanastilla", "C", "canastillas", "Salidas a sede, retornos y conteos de canastillas.", {
    id: pk(), canastilla_id: fk("Canastilla"), tipo: txt(15), estado_anterior: txt(12), estado_nuevo: txt(12), ubicacion_destino_id: fk("Ubicacion", true), sede_id: fk("Sede", true), remision_id: fk("Remision", true), entrega: txt(80), recibe_id: fk("Usuario", true), retorno_previsto: ts(true), unidades_esperadas: ent(true), unidades_contadas: ent(true), observacion: txt(255), ...CAPTURA,
  }),
  SensorTemperatura: tabla("monitoreo_sensortemperatura", "K", "canastillas", "Sensores de cuartos fríos con su rango.", {
    id: pk(), nombre: txt(80), ubicacion_id: fk("Ubicacion"), serial_panel: txt(40), zona_id: ent(), modelo: txt(40), con_sonda_externa: bool(), temp_min_c: dec("5,1", true), temp_max_c: dec("5,1", true), ...VERSION,
  }),
  LecturaTemperatura: tabla("monitoreo_lecturatemperatura", "S", "canastillas", "Lecturas recibidas de los sensores.", {
    id: pk(), sensor_id: fk("SensorTemperatura"), medido_en: ts(), temperatura_c: dec("5,1"), humedad_pct: ent(true, "smallint"), estado_zona: txt(20), bateria_pct: ent(true, "smallint"), fuera_de_rango: bool(), recibido_en: ts(),
  }),
  ConsultaSensores: tabla("monitoreo_consultasensores", "S", "canastillas", "Cada consulta al panel de sensores y su resultado.", {
    id: pk(), serial_panel: txt(40), consultado_en: ts(), resultado: txt(5), lecturas_guardadas: ent(false, "smallint"), codigo_error: txt(20), detalle: txt(255),
  }),
};
