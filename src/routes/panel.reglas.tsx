import { createFileRoute } from '@tanstack/react-router';
import { Reglas } from '@/features/panel-calidad/Reglas';
export const Route = createFileRoute('/panel/reglas')({
 head:()=>({meta:[{title:'Reglas por producto · Puerto Marino'},{name:'description',content:'Parámetros HACCP versionados por producto.'},{property:'og:title',content:'Reglas por producto · Puerto Marino'},{property:'og:description',content:'Parámetros HACCP versionados por producto.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:Reglas,
});
