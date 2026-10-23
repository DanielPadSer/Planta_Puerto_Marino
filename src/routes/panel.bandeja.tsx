import { createFileRoute } from '@tanstack/react-router';
import { Bandeja } from '@/features/panel-calidad/Bandeja';
export const Route = createFileRoute('/panel/bandeja')({
 head:()=>({meta:[{title:'Bandeja de decisiones · Puerto Marino'},{name:'description',content:'Lotes en cuarentena, limpiezas y avisos del panel de calidad Puerto Marino.'},{property:'og:title',content:'Bandeja de decisiones · Puerto Marino'},{property:'og:description',content:'Decisiones de ingeniería de alimentos con evidencia y trazabilidad.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:Bandeja,
});
