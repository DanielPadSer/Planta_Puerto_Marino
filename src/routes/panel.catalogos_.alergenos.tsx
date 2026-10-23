import { createFileRoute } from '@tanstack/react-router';
import { Pendiente } from '@/features/panel-calidad/Pendiente';
export const Route = createFileRoute('/panel/catalogos/alergenos')({
 head:()=>({meta:[{title:'Catálogo de alérgenos · Puerto Marino'},{name:'description',content:'Catálogo de alérgenos del panel de calidad Puerto Marino, pendiente de la siguiente fase.'},{property:'og:title',content:'Catálogo de alérgenos · Puerto Marino'},{property:'og:description',content:'Catálogo de alérgenos del panel de calidad de la planta.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:()=> <Pendiente alergenos/>,
});
