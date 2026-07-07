"use client";

import { Suspense, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import * as THREE from "three";

const MODEL_BASE = "/models/skull";
const MTL_PATH = `${MODEL_BASE}/12140_Skull_v3_L2.mtl`;
const OBJ_PATH = `${MODEL_BASE}/12140_Skull_v3_L2.obj`;

function SkullModel() {
  const group = useRef<THREE.Group>(null);
  const materials = useLoader(MTLLoader, MTL_PATH);
  materials.preload();
  const obj = useLoader(OBJLoader, OBJ_PATH, (loader) => {
    loader.setMaterials(materials);
  });

  useLayoutEffect(() => {
    const root = group.current;
    if (!root) return;

    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2.5 / maxDim;

    root.scale.setScalar(scale);
    root.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  }, [obj]);

  return (
    <group ref={group}>
      <primitive object={obj} />
    </group>
  );
}

function ViewerScene() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 8]} intensity={1.1} />
      <directionalLight position={[-5, 2, -4]} intensity={0.35} />
      <Suspense fallback={null}>
        <SkullModel />
      </Suspense>
      <OrbitControls enablePan={false} enableZoom={false} rotateSpeed={0.85} />
    </>
  );
}

function ViewerFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--fg)]/10" />
    </div>
  );
}

function ModelError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
      <p className="text-sm text-[var(--muted)]">Не удалось загрузить 3D-модель</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 text-xs uppercase tracking-[0.2em] underline underline-offset-4"
      >
        Повторить
      </button>
    </div>
  );
}

function SkullViewerInner() {
  const params = useSearchParams();
  const [retry, setRetry] = useState(0);
  const simulateError = params.get("model_error") === "1" && retry === 0;

  if (simulateError) {
    return <ModelError onRetry={() => setRetry(n => n + 1)} />;
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <Suspense fallback={<ViewerFallback />}>
        <Canvas
          className="!h-full !w-full touch-none"
          camera={{ position: [0, 0, 4.5], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <ViewerScene />
        </Canvas>
      </Suspense>
    </div>
  );
}

export function SkullViewer() {
  return (
    <Suspense fallback={<ViewerFallback />}>
      <SkullViewerInner />
    </Suspense>
  );
}
