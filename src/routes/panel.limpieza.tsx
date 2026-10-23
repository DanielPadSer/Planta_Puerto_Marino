import { createFileRoute } from '@tanstack/react-router';
import { Limpieza } from '@/features/panel-calidad/Limpieza';
export const Route = createFileRoute('/panel/limpieza')({
 head:()=>({meta:[{title:'Limpieza y equipos · Puerto Marino'},{name:'description',content:'Matriz N0, N1 y N2, procedimientos y estados de equipos.'},{property:'og:title',content:'Limpieza y equipos · Puerto Marino'},{property:'og:description',content:'Matriz N0, N1 y N2, procedimientos y estados de equipos.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:Limpieza,
});
