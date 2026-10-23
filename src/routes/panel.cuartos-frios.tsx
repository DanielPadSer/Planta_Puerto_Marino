import { createFileRoute } from '@tanstack/react-router';
import { CuartosFrios } from '@/features/panel-calidad/CuartosFrios';
export const Route = createFileRoute('/panel/cuartos-frios')({
 head:()=>({meta:[{title:'Cuartos fríos · Puerto Marino'},{name:'description',content:'Temperaturas y configuración de los cuartos CF-1, CF-2 y CF-3.'},{property:'og:title',content:'Cuartos fríos · Puerto Marino'},{property:'og:description',content:'Temperaturas y configuración de los cuartos CF-1, CF-2 y CF-3.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:CuartosFrios,
});
