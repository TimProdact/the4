"use client";

import { Suspense, useLayoutEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { DropTheme } from "@/lib/drop-themes";

function GlbModel({ url, scale }: { url: string; scale: number }) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);

  useLayoutEffect(() => {
    const root = group.current;
    if (!root) return;

    scene.traverse(child => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const fitScale = scale / maxDim;

    root.scale.setScalar(fitScale);
    root.position.set(-center.x * fitScale, -center.y * fitScale, -center.z * fitScale);
  }, [scene, scale]);

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

function ViewerScene({ theme }: { theme: DropTheme }) {
  const { ambient, keyIntensity, keyPosition, fillIntensity, fillPosition, bg } = theme.lighting;

  return (
    <>
      <color attach="background" args={[bg ?? theme.colors.bg]} />
      <ambientLight intensity={ambient} />
      <directionalLight position={keyPosition} intensity={keyIntensity} />
      <directionalLight position={fillPosition} intensity={fillIntensity} />
      <Suspense fallback={null}>
        <GlbModel url={theme.model} scale={theme.modelScale} />
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

interface GlbViewerProps {
  theme: DropTheme;
  active?: boolean;
}

export function GlbViewer({ theme, active = true }: GlbViewerProps) {
  if (!active) {
    return <div className="h-full w-full" />;
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <Suspense fallback={<ViewerFallback />}>
        <Canvas
          key={theme.id}
          className="!h-full !w-full touch-none"
          camera={{ position: [0, 0, theme.cameraZ], fov: 40 }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 1.5]}
        >
          <ViewerScene theme={theme} />
        </Canvas>
      </Suspense>
    </div>
  );
}
