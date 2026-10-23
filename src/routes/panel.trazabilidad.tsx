import { createFileRoute } from '@tanstack/react-router';
import { Trazabilidad } from '@/features/panel-calidad/Trazabilidad';
export const Route = createFileRoute('/panel/trazabilidad')({
 head:()=>({meta:[{title:'Trazabilidad de lote · Puerto Marino'},{name:'description',content:'Genealogía, evidencias HACCP y simulacros de retiro por lote.'},{property:'og:title',content:'Trazabilidad de lote · Puerto Marino'},{property:'og:description',content:'Genealogía, evidencias HACCP y simulacros de retiro por lote.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:Trazabilidad,
});
