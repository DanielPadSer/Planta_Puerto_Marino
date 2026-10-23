import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from "react";
import { Minus, Plus, Maximize } from "lucide-react";

const MIN = 0.6;
const MAX = 4;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export interface TableroApi { reset: () => void }

/** Lienzo 16:9 tipo Figma: arrastrar para mover, rueda o pellizco para acercar. */
export const Tablero = forwardRef<TableroApi, { children: ReactNode; controles?: boolean }>(function Tablero({ children, controles = true }, ref) {
  const cont = useRef<HTMLDivElement>(null);
  const [base, setBase] = useState({ w: 0, h: 0 });
  const [v, setV] = useState({ x: 0, y: 0, z: 1 });
  const vRef = useRef(v);
  vRef.current = v;
  const punteros = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ d: number; z: number } | null>(null);
  const movido = useRef(0);

  const encajar = useCallback(() => {
    const el = cont.current;
    if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const w = Math.max(W, (H * 16) / 9), h = (w * 9) / 16; // cubre la pantalla
    setBase({ w, h });
    setV({ x: (W - w) / 2, y: (H - h) / 2, z: 1 });
  }, []);

  useImperativeHandle(ref, () => ({ reset: encajar }), [encajar]);

  useEffect(() => {
    encajar();
    const ro = new ResizeObserver(encajar);
    if (cont.current) ro.observe(cont.current);
    return () => ro.disconnect();
  }, [encajar]);

  const zoomEn = useCallback((px: number, py: number, nz: number) => {
    setV((p) => {
      const z = clamp(nz, MIN, MAX), k = z / p.z;
      return { z, x: px - (px - p.x) * k, y: py - (py - p.y) * k };
    });
  }, []);

  useEffect(() => {
    const el = cont.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const px = e.clientX - r.left, py = e.clientY - r.top;
      if (e.ctrlKey || !e.shiftKey) {
        const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
        zoomEn(px, py, vRef.current.z * Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.0015)));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomEn]);

  const onDown = (e: React.PointerEvent) => {
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    movido.current = 0;
    if (punteros.current.size === 2) {
      const [a, b] = [...punteros.current.values()];
      pinch.current = { d: Math.hypot(a!.x - b!.x, a!.y - b!.y), z: vRef.current.z };
    }
  };
  const onMove = (e: React.PointerEvent) => {
    const prev = punteros.current.get(e.pointerId);
    if (!prev) return;
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    movido.current += Math.abs(dx) + Math.abs(dy);
    if (movido.current > 6 && !cont.current?.hasPointerCapture(e.pointerId)) cont.current?.setPointerCapture(e.pointerId);
    if (punteros.current.size === 2 && pinch.current) {
      const [a, b] = [...punteros.current.values()];
      const r = cont.current!.getBoundingClientRect();
      zoomEn((a!.x + b!.x) / 2 - r.left, (a!.y + b!.y) / 2 - r.top, pinch.current.z * (Math.hypot(a!.x - b!.x, a!.y - b!.y) / pinch.current.d));
    } else if (punteros.current.size === 1) {
      setV((p) => ({ ...p, x: p.x + dx, y: p.y + dy }));
    }
  };
  const onUp = (e: React.PointerEvent) => {
    punteros.current.delete(e.pointerId);
    if (punteros.current.size < 2) pinch.current = null;
  };
  // Evita que un arrastre dispare clics en las zonas
  const onClickCapture = (e: React.MouseEvent) => { if (movido.current > 6) { e.preventDefault(); e.stopPropagation(); } };

  const boton = (dir: number) => {
    const el = cont.current;
    if (el) zoomEn(el.clientWidth / 2, el.clientHeight / 2, vRef.current.z * (dir > 0 ? 1.3 : 1 / 1.3));
  };

  return (
    <div ref={cont} className="absolute inset-0 cursor-grab touch-none select-none overflow-hidden active:cursor-grabbing"
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onClickCapture={onClickCapture}>
      <div className="absolute left-0 top-0 origin-top-left will-change-transform" style={{ width: base.w, height: base.h, transform: `translate(${v.x}px, ${v.y}px) scale(${v.z})` }}>
        {children}
      </div>
      {controles && (
        <div className="glass absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full p-1" onPointerDown={(e) => e.stopPropagation()}>
          <button aria-label="Alejar" onClick={() => boton(-1)} className="tap grid place-items-center rounded-full hover:bg-muted"><Minus size={20} /></button>
          <span className="w-14 text-center font-mono text-xs">{Math.round(v.z * 100)} %</span>
          <button aria-label="Acercar" onClick={() => boton(1)} className="tap grid place-items-center rounded-full hover:bg-muted"><Plus size={20} /></button>
          <button aria-label="Centrar planta" onClick={encajar} className="tap grid place-items-center rounded-full hover:bg-muted"><Maximize size={20} /></button>
        </div>
      )}
    </div>
  );
});
