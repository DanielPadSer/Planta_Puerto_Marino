import type { ProductoRegla, LoteCalidad, EventoCalidad, Dispositivo, ContenedorCalidad } from '@/domain/calidad';
export const PRODUCTOS: ProductoRegla[] = [
 {id:'RGL-088',nombre:'Filete de mojarra',categoria:'Pescado',ruta:'Cocido',alergeno:['Pescado'],version:3,temperatura:70,tiempo:2,vida:5,estado:'Vigente'},
 {id:'RGL-089',nombre:'Camarón marinado',categoria:'Crustáceos',ruta:'Marinado',alergeno:['Crustáceos'],version:2,temperatura:4,tiempo:30,vida:3,estado:'Por validar'},
 {id:'RGL-090',nombre:'Pollo desmechado',categoria:'Pollo y aves',ruta:'Cocido',alergeno:[],version:1,temperatura:74,tiempo:2,vida:5,estado:'Por validar'},
 {id:'RGL-091',nombre:'Salsa base',categoria:'Vegetal',ruta:'Cocido',alergeno:[],version:2,temperatura:75,tiempo:2,vida:3,estado:'Vigente'},
];
export const LOTES: LoteCalidad[] = [
 {id:'LT-0245',producto:'Filete de mojarra',motivo:'Temperatura fuera de rango',medicion:'6,0 °C (máx. 4 °C)',hora:'Hoy · 06:12',proveedor:'Pescados del Caribe S.A.S.',kg:48.6,estado:'Cuarentena',version:3},
 {id:'LT-0250',producto:'Camarón marinado',motivo:'Inspección no conforme',medicion:'Olor atípico',hora:'Hoy · 06:40',proveedor:'Mariscos del Pacífico',kg:30,estado:'Cuarentena',version:2},
 {id:'LT-0253',producto:'Mojarra entera',motivo:'Diferencia de peso con factura',medicion:'−3,1 % (tolerancia 3 %)',hora:'Ayer · 15:20',proveedor:'Pescados del Caribe S.A.S.',kg:50,estado:'Cuarentena',version:3},
];
export const EVENTOS: EventoCalidad[] = [
 {id:'EVT-9842',fecha:'2026-10-23 09:12',usuario:'Luisa Gómez',dispositivo:'Panel web',entidad:'Regla Filete de mojarra',campo:'Tiempo de cocción',original:'1 min',nuevo:'2 min',motivo:'Ajuste según validación térmica',version:3},
 {id:'EVT-9841',fecha:'2026-10-22 15:30',usuario:'Luisa Gómez',dispositivo:'Tablet Cocción 01',entidad:'Marmita 2',campo:'Estado',original:'En limpieza',nuevo:'Liberado',motivo:'Limpieza verificada por encargada de limpieza',version:2},
 {id:'EVT-9840',fecha:'2026-10-22 08:51',usuario:'Carlos Mendoza',dispositivo:'Tablet Recepción 01',entidad:'Pesaje LT-0245',campo:'Origen',original:'Báscula',nuevo:'Manual',motivo:'Báscula fuera de servicio',version:1},
 {id:'EVT-9839',fecha:'2026-10-21 16:40',usuario:'Luisa Gómez',dispositivo:'Panel web',entidad:'Lote LT-0240',campo:'Estado',original:'Cuarentena',nuevo:'Liberado',motivo:'Contramuestra conforme',version:3},
 {id:'EVT-9838',fecha:'2026-10-21 11:20',usuario:'Luisa Gómez',dispositivo:'Panel web',entidad:'Canasta plástica',campo:'Tara',original:'1,75 kg',nuevo:'1,80 kg',motivo:'Recalibración periódica',version:1},
];
export const DISPOSITIVOS: Dispositivo[] = [
 {id:'DSP-01',nombre:'Computador Recepción 01',tipo:'Computadores de planta',estacion:'Recepción',modelo:'Industrial IP65',estado:'Activo',contacto:'Hace 2 min',pendientes:0,revocado:false},
 {id:'DSP-02',nombre:'Computador Cocción 01',tipo:'Computadores de planta',estacion:'Cocción',modelo:'Industrial IP65',estado:'Sin conexión',contacto:'Hace 3 h',pendientes:12,revocado:false},
 {id:'BAS-01',nombre:'Báscula Recepción',tipo:'Básculas',estacion:'Recepción',modelo:'Indicador serie · 150 kg',estado:'Operativa',contacto:'Hoy · 06:05',pendientes:0,revocado:false},
 {id:'BAS-02',nombre:'Báscula Empaque',tipo:'Básculas',estacion:'Empaque',modelo:'Mesa · 30 kg',estado:'Operativa',contacto:'Hoy · 07:00',pendientes:0,revocado:false},
 {id:'BAS-03',nombre:'Báscula Cocina',tipo:'Básculas',estacion:'Cocción',modelo:'Modelo por confirmar',estado:'Por validar',contacto:'Sin verificación',pendientes:0,revocado:false},
 {id:'IMP-01',nombre:'Zebra ZD421 Empaque',tipo:'Impresoras',estacion:'Empaque',modelo:'Zebra ZD421',estado:'Operativa',contacto:'Hoy · 07:00',pendientes:0,revocado:false},
 {id:'LEC-01',nombre:'Lector Despacho 01',tipo:'Lectores',estacion:'Despacho',modelo:'Bluetooth HID',estado:'Activo',contacto:'Hace 5 min',pendientes:0,revocado:false},
 {id:'TER-01',nombre:'Termómetro CF-1',tipo:'Termómetros',estacion:'Cuartos fríos',modelo:'Sonda digital HACCP',estado:'Por vencer',contacto:'Calibración en 3 días',pendientes:0,revocado:false},
];
export const CONTENEDORES: ContenedorCalidad[] = [
 {id:'TARA-01',nombre:'Canasta plástica',tara:1.8,retornable:true,version:1},
 {id:'TARA-02',nombre:'Caja de icopor',tara:0.6,retornable:false,version:1},
 {id:'TARA-03',nombre:'Bolsa del proveedor',tara:0.05,retornable:false,version:1},
 {id:'TARA-04',nombre:'Bandeja GN 1/1 inox',tara:1.45,retornable:true,version:2},
 {id:'TARA-05',nombre:'Tina plástica 100 L',tara:3.2,retornable:true,version:1},
];
export const AVISOS = [{id:'AV-01',nombre:'Termómetro CF-1',detalle:'Calibración · vence en 3 días',tipo:'Calibración'}, {id:'AV-02',nombre:'Báscula Recepción',detalle:'Calibración · vence en 12 días',tipo:'Calibración'}, {id:'AV-03',nombre:'Carlos Mendoza',detalle:'Certificado BPM · vence en 7 días',tipo:'Documento BPM'}, {id:'AV-04',nombre:'Marta Pinzón',detalle:'Examen médico · vence en 10 días',tipo:'Documento BPM'}];
