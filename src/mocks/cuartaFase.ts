import type { Alergeno, DocumentoPersonal, OperarioPersonal, PlantillaBPM, Perfil, Receta, RegistroBPM } from '@/domain/cuartaFase';
export const HOY_DEMO = '2026-10-26';
const documento = (id: string, tipo: DocumentoPersonal['tipo'], venceEn: string): DocumentoPersonal => ({ id:`DOC-${id}-${tipo}`,operarioId:id,tipo,emitidoEn:'2026-03-12',venceEn,entidad:'Entidad formadora demo',horas:tipo === 'capacitacion_bpm' ? 10 : undefined,archivoNombre:tipo === 'capacitacion_bpm' ? 'capacitacion-bpm.pdf':'certificado-medico.pdf' });
export const PERSONAL_DEMO: OperarioPersonal[] = [
 {id:'OP-001',nombre:'Operario Demo 01',rol:'operario',documentos:[documento('OP-001','certificado_medico','2027-03-12'),documento('OP-001','capacitacion_bpm','2026-11-25')]},
 {id:'OP-002',nombre:'Operario Demo 02',rol:'operario',documentos:[documento('OP-002','certificado_medico','2027-01-05'),documento('OP-002','capacitacion_bpm','2027-02-18')]},
 {id:'OP-003',nombre:'Operario Demo 03',rol:'operario',documentos:[documento('OP-003','certificado_medico','2026-10-02'),documento('OP-003','capacitacion_bpm','2027-05-15')]},
 {id:'IA-004',nombre:'Ingeniera Demo',rol:'ingeniera',documentos:[documento('IA-004','certificado_medico','2027-08-28'),documento('IA-004','capacitacion_bpm','2027-09-14')]},
 {id:'EL-005',nombre:'Encargada Demo',rol:'encargada_limpieza',documentos:[documento('EL-005','certificado_medico','2027-03-12')]},
];
const textos = ['Lavado y desinfección de manos','Uñas cortas sin esmalte','Sin joyas ni reloj','Cabello recogido y cubierto','Uniforme limpio y completo: gorro, tapabocas y botas','Sin fiebre, diarrea, vómito ni infección respiratoria','Heridas cubiertas y protegidas','Pisos y mesas limpios','Sin evidencia de plagas','Lavamanos con jabón, desinfectante y toallas'];
export const PLANTILLAS_DEMO: PlantillaBPM[] = [1,2].map(version => ({id:`BPM-v${version}`,version,items:textos.slice(0,version === 1 ? 8 : 10).map((texto,i) => ({id:`BPM-${i+1}`,texto,grupo:i<4 ? 'Higiene personal':i===4 ? 'Dotación':i<7 ? 'Salud':'Área de trabajo',observacionObligatoriaSiFalla:true}))}));
export const REGISTROS_BPM: RegistroBPM[] = PERSONAL_DEMO.slice(0,3).map((o,i) => ({id:`BPM-REG-${i+1}`,operarioId:o.id,plantillaVersion:2,firmadoEn:`2026-10-26T0${6+i}:00:00`,dispositivoId:`TABLET-0${i+1}`,turno:'Mañana',respuestas:textos.map((_,n) => ({itemId:`BPM-${n+1}`,cumple:!(i===0 && n===5),observacion:i===0 && n===5 ? 'Síntoma reportado; revisión del supervisor registrada.':undefined}))}));
const nombres = ['Gluten','Crustáceos','Huevo','Pescado','Maní','Soya','Leche y derivados','Frutos secos de nuez'];
const descripciones = ['Trigo, cebada, centeno y avena.','Camarón, langostino, cangrejo y derivados.','Albúmina, yema y preparaciones con huevo.','Pescado y productos derivados.','Pastas, aceites y preparados de maní.','Salsa de soya y proteína de soya.','Caseína, suero y derivados lácteos.','Nueces, almendras y avellanas.'];
export const ALERGENOS_DEMO: Alergeno[] = nombres.map((nombreRotulado,i) => ({id:`ALG-${String(i+1).padStart(3,'0')}`,codigo:`ALG-${String(i+1).padStart(3,'0')}`,nombreRotulado,descripcion:descripciones[i] ?? '',activo:true,version:i===3 ? 3:1,normaReferencia:'Res. 5109 de 2005 · por confirmar'}));
export const PERFILES_DEMO: Perfil[] = [
 {id:'ING-01',codigo:'ING-01',nombre:'Salsa base marinada',tipo:'Ingrediente',alergenoIds:[],estadoFicha:'sin_perfil',version:1,riesgoCruzado:true,notas:''},
 {id:'PR-01',codigo:'PR-01',nombre:'Filete de mojarra',tipo:'Producto',alergenoIds:['ALG-004'],estadoFicha:'validado',version:3,riesgoCruzado:false,notas:'Perfil verificado con ficha técnica activa.'},
 {id:'PR-02',codigo:'PR-02',nombre:'Vegetales porcionados',tipo:'Producto',alergenoIds:[],estadoFicha:'validado',version:1,riesgoCruzado:false,notas:'Sin alérgenos reportados.'},
 {id:'KIT-01',codigo:'KIT-01',nombre:'Kit de mariscos marinados',tipo:'Kit',alergenoIds:[],estadoFicha:'revision',version:1,riesgoCruzado:true,notas:'Perfil calculado desde los componentes.'},
 {id:'ING-02',codigo:'ING-02',nombre:'Filete de pescado',tipo:'Ingrediente',alergenoIds:['ALG-004'],estadoFicha:'validado',version:3,riesgoCruzado:false,notas:''},
 {id:'ING-03',codigo:'ING-03',nombre:'Camarón pelado',tipo:'Ingrediente',alergenoIds:['ALG-002'],estadoFicha:'validado',version:2,riesgoCruzado:false,notas:''},
 {id:'ING-04',codigo:'ING-04',nombre:'Sal marina',tipo:'Ingrediente',alergenoIds:[],estadoFicha:'validado',version:1,riesgoCruzado:false,notas:''},
 ...Array.from({length:17},(_,i): Perfil => ({id:`REG-${i+1}`,codigo:`REG-${i+1}`,nombre:`${i%2 ? 'Producto':'Ingrediente'} demo ${i+1}`,tipo:i%2 ? 'Producto':'Ingrediente',alergenoIds:i<4 ? []:['ALG-004'],estadoFicha:i<4 ? 'sin_perfil':'validado',version:1,riesgoCruzado:false,notas:''})),
];
export const RECETAS_DEMO: Receta[] = [
 {id:'REC-01',codigo:'KIT-01',nombre:'Kit de mariscos marinados',version:1,componentes:[{ingredienteId:'ING-02',proporcion:40},{ingredienteId:'ING-03',proporcion:40},{ingredienteId:'ING-01',proporcion:20}]},
 {id:'REC-02',codigo:'KIT-02',nombre:'Pescado porcionado con sal',version:2,componentes:[{ingredienteId:'ING-02',proporcion:98},{ingredienteId:'ING-04',proporcion:2}]},
];
export interface LoteAlergenos { id:string; producto:string; perfilId:string; fecha:string; vencimiento:string; declarados:string[]; version:number; estado:string; destino:string }
export const LOTES_ALERGENOS: LoteAlergenos[] = [
 {id:'LT-AL-001',producto:'Filete de mojarra',perfilId:'PR-01',fecha:'2026-10-26',vencimiento:'2026-11-02',declarados:['ALG-004'],version:3,estado:'Liberado',destino:'Sede Norte demo'},
 {id:'LT-AL-002',producto:'Kit de mariscos marinados',perfilId:'KIT-01',fecha:'2026-10-26',vencimiento:'2026-11-01',declarados:['ALG-004','ALG-002'],version:3,estado:'Retenido en cuarentena',destino:'Sede Centro demo'},
 {id:'LT-AL-003',producto:'Vegetales porcionados',perfilId:'PR-02',fecha:'2026-10-25',vencimiento:'2026-10-30',declarados:[],version:1,estado:'Bloqueado',destino:'Sede Norte demo'},
];
