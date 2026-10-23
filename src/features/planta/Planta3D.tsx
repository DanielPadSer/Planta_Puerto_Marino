/** Maqueta 3D de la planta (GLB + manifiesto). Solo se monta en el navegador. */
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { OrbitControls as OrbitImpl } from "three-stdlib";
import type { ZonaId } from "@/domain/types";
import modeloAsset from "@/assets/planta/planta_embutidos.glb.asset.json";
import manifiesto from "./manifiesto.json";

const MODELO = modeloAsset.url;
const FONDO = "#eef0f4";
const ALTURA_GENERAL = 0.32;

export const ID_ZONA: Record<string, ZonaId> = {
  P0: "pedidos", P1: "recepcion", P2: "cf1", P3A: "coccion", PL: "limpieza", P3B: "marinado",
  P4: "empaque", P5A: "cf2", P5B: "cf3", P6: "despacho", P7: "sede",
};
const ID_MANIFIESTO = Object.fromEntries(Object.entries(ID_ZONA).map(([k, v]) => [v, k])) as Record<ZonaId, string>;
const ESTACIONES = manifiesto.estaciones;
useGLTF.preload(MODELO);

type V3 = [number, number, number];
interface Props {
  zona: ZonaId | null;
  onSeleccionar?: (z: ZonaId) => void;
  atenuadas?: ZonaId[];
  estados?: Partial<Record<ZonaId, { texto: string; tono: string; alerta?: boolean }>>;
}

export default function Planta3D(p: Props) {
  const g = manifiesto.camara_general;
  return (
    <div className="absolute inset-0" style={{ background: FONDO }}>
      <Canvas shadows="variance" dpr={[1, 2]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        camera={{ fov: g.fov_vertical, near: 0.1, far: 400, position: g.posicion as V3 }}>
        <Suspense fallback={null}><Escena {...p} /></Suspense>
      </Canvas>
    </div>
  );
}

function Escena({ zona, onSeleccionar, atenuadas = [], estados = {} }: Props) {
  const { scene: planta } = useGLTF(MODELO);
  const { gl, scene, camera, size } = useThree();
  const controls = useRef<OrbitImpl>(null);
  const estacion = zona ? ID_MANIFIESTO[zona] : null;

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env; scene.background = new THREE.Color(FONDO); scene.fog = new THREE.Fog(FONDO, 75, 170);
    return () => { env.dispose(); pmrem.dispose(); };
  }, [gl, scene]);

  const partes = useMemo(() => {
    const zonasMuros: Record<string, THREE.Object3D> = {};
    const zonasBorde: Record<string, THREE.Object3D> = {};
    planta.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        const transp = Array.isArray(mesh.material) ? false : mesh.material.transparent;
        mesh.castShadow = !transp; mesh.receiveShadow = true;
      }
      const m = /^Zona_(\w+?)_(muros|borde)$/.exec(o.name);
      if (m) { (m[2] === "muros" ? zonasMuros : zonasBorde)[m[1]!] = o; o.visible = false; }
    });
    const muros = planta.getObjectByName("Muros")?.children ?? [];
    muros.forEach((m) => { const { z0, z1 } = m.userData as { z0: number; z1: number }; m.scale.y = Math.max(Math.min(z1, ALTURA_GENERAL) - z0, 0.001); });
    return { zonasMuros, zonasBorde };
  }, [planta]);

  const anim = useRef(0);
  useEffect(() => { anim.current = 1.4; }, [size.width, size.height]);
  const tmpPos = useMemo(() => new THREE.Vector3(), []), tmpTgt = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05), k = 1 - Math.exp(-dt * 5);
    for (const [id, o] of Object.entries(partes.zonasMuros)) {
      const on = id === estacion;
      if (on) o.visible = true;
      o.scale.y += ((on ? 1 : 0.001) - o.scale.y) * k;
      if (!on && o.scale.y < 0.01) o.visible = false;
    }
    for (const [id, o] of Object.entries(partes.zonasBorde)) o.visible = id === estacion;
    if (anim.current > 0) {
      anim.current -= dt;
      const c = manifiesto.camara_general, aspect = size.width / Math.max(size.height, 1);
      tmpTgt.fromArray(c.objetivo);
      tmpPos.fromArray(c.posicion).sub(tmpTgt).multiplyScalar(Math.max(1, 16 / 9 / aspect)).add(tmpTgt);
      camera.position.lerp(tmpPos, Math.min(1, k * 1.4));
      if (controls.current) { controls.current.target.lerp(tmpTgt, Math.min(1, k * 1.4)); controls.current.update(); }
    }
  });

  const click = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 4) return;
    let o: THREE.Object3D | null = e.object;
    while (o) {
      const m = /^(?:Zona|Equipos)_(P\w+)$/.exec(o.name);
      if (m && ID_ZONA[m[1]!]) { e.stopPropagation(); onSeleccionar?.(ID_ZONA[m[1]!]!); return; }
      o = o.parent;
    }
  };

  return (
    <>
      <hemisphereLight args={["#ffffff", "#cfd5e0", 1.05]} />
      <directionalLight position={[-4, 26, 14]} intensity={2.1} color="#fffaf2" castShadow
        shadow-mapSize={[2048, 2048]} shadow-radius={5} shadow-blurSamples={10} shadow-bias={-0.0006}
        shadow-camera-left={-19} shadow-camera-right={19} shadow-camera-top={19} shadow-camera-bottom={-19}
        shadow-camera-near={2} shadow-camera-far={80} target-position={[10.5, 0, -4.5]} />
      <directionalLight position={[18, 10, -14]} intensity={0.4} />
      <mesh rotation-x={-Math.PI / 2} position-y={-0.152} receiveShadow>
        <planeGeometry args={[200, 200]} /><shadowMaterial opacity={0.18} />
      </mesh>
      <primitive object={planta} onClick={click} />
      <OrbitControls ref={controls} makeDefault enableDamping maxPolarAngle={Math.PI * 0.45} minDistance={5} maxDistance={150}
        onStart={() => { anim.current = 0; }} />
      {ESTACIONES.map((e) => {
        const zid = ID_ZONA[e.id]!;
        const activa = e.id === estacion, tenue = (!!estacion && !activa) || atenuadas.includes(zid);
        const est = estados[zid];
        return (
          <Html key={e.id} position={e.ancla as V3} center zIndexRange={[20, 0]} style={{ pointerEvents: "auto" }}>
            <button onClick={() => onSeleccionar?.(zid)} className="relative flex items-center gap-2 whitespace-nowrap border bg-surface/95 text-foreground shadow-[var(--shadow-soft)] transition"
              style={{ padding: activa ? "10px 14px" : "5px 10px", borderRadius: activa ? 14 : 10, borderColor: activa ? e.color : undefined, opacity: tenue ? 0.6 : 1, transform: "translateY(-50%)" }}>
              <span className="shrink-0 rounded-[3px]" style={{ width: activa ? 12 : 9, height: activa ? 12 : 9, background: e.color }} />
              <span className="flex flex-col items-start">
                <b style={{ fontSize: activa ? 15 : 12.5 }}>{e.num && <span className="mr-1.5" style={{ color: e.color }}>{e.num}</span>}{e.nombre}</b>
                {activa && <small className="text-xs text-muted-foreground">{e.subtitulo}</small>}
                {activa && e.area_m2 && <small className="font-mono text-[10px] text-muted-foreground">{String(e.area_m2).replace(".", ",")} m² · {e.espacio}</small>}
              </span>
              {est && !activa && <span className={`absolute -top-3 right-0 rounded-full px-1.5 font-mono text-[10px] font-semibold ${est.tono === "danger" ? "bg-danger text-primary-foreground" : "bg-warn text-foreground"}`}>{est.texto}</span>}
              {est?.alerta && <span className="absolute -left-1 -top-1 size-2.5 animate-pulse rounded-full bg-danger ring-2 ring-surface" />}
            </button>
          </Html>
        );
      })}
    </>
  );
}
