"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState, useSyncExternalStore } from "react";
import * as THREE from "three";

function generateParticlePositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index++) {
    const angle = index * 2.399963229728653;
    const radius = 1.2 + ((index * 37) % 100) / 42;
    const height = ((index * 53) % 100) / 48 - 1;

    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = height;
    positions[index * 3 + 2] = Math.sin(angle) * radius * 0.72;
  }

  return positions;
}

const STATIC_PARTICLE_POSITIONS = generateParticlePositions(84);

function SignalCore() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const elapsed = state.clock.getElapsedTime();
    groupRef.current.rotation.y = elapsed * 0.08;
    groupRef.current.rotation.x = Math.sin(elapsed * 0.24) * 0.08;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[1.08, 2]} />
        <meshStandardMaterial
          color="#9D3C5C"
          emissive="#5D244F"
          emissiveIntensity={0.28}
          roughness={0.72}
          metalness={0.08}
          transparent
          opacity={0.28}
        />
      </mesh>
      <mesh scale={1.012}>
        <icosahedronGeometry args={[1.1, 2]} />
        <meshBasicMaterial
          color="#D36A8F"
          wireframe
          transparent
          opacity={0.22}
        />
      </mesh>
    </group>
  );
}

function SignalRings() {
  const outerRef = useRef<THREE.Mesh>(null);
  const middleRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    if (outerRef.current) {
      outerRef.current.rotation.x = 1.22;
      outerRef.current.rotation.y = elapsed * 0.1;
    }

    if (middleRef.current) {
      middleRef.current.rotation.x = 0.68;
      middleRef.current.rotation.z = elapsed * -0.08;
    }

    if (innerRef.current) {
      innerRef.current.rotation.y = 0.92;
      innerRef.current.rotation.z = elapsed * 0.12;
    }
  });

  return (
    <group>
      <mesh ref={outerRef}>
        <torusGeometry args={[1.62, 0.012, 12, 160]} />
        <meshBasicMaterial color="#9D3C5C" transparent opacity={0.42} />
      </mesh>
      <mesh ref={middleRef}>
        <torusGeometry args={[1.28, 0.01, 12, 144]} />
        <meshBasicMaterial color="#D36A8F" transparent opacity={0.28} />
      </mesh>
      <mesh ref={innerRef}>
        <torusGeometry args={[0.88, 0.008, 12, 128]} />
        <meshBasicMaterial color="#5D244F" transparent opacity={0.46} />
      </mesh>
    </group>
  );
}

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const elapsed = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = elapsed * 0.025;
    pointsRef.current.rotation.x = Math.sin(elapsed * 0.18) * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[STATIC_PARTICLE_POSITIONS, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#D36A8F"
        size={0.022}
        sizeAttenuation
        transparent
        opacity={0.48}
        depthWrite={false}
      />
    </points>
  );
}

function hasWebGLSupport() {
  if (typeof document === "undefined") return true;

  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") || canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

function StaticCanvasFallback() {
  return (
    <div
      aria-hidden="true"
      className="relative flex h-full min-h-[260px] w-full items-center justify-center overflow-hidden rounded-[2rem]"
    >
      <div className="absolute inset-8 rounded-[2rem] border border-brand-rose/20 bg-brand-card/45" />
      <div className="absolute h-56 w-56 rounded-full border border-brand-rose/35 bg-[radial-gradient(circle_at_36%_30%,rgba(211,106,143,0.34),rgba(157,60,92,0.20)_38%,rgba(93,36,79,0.12)_68%,transparent_72%)] shadow-2xl shadow-brand-rose/15 sm:h-72 sm:w-72" />
      <div className="absolute h-40 w-72 rotate-12 rounded-full border border-brand-rose/30 sm:h-52 sm:w-96" />
      <div className="absolute h-48 w-64 -rotate-[28deg] rounded-full border border-brand-plum/45 sm:h-60 sm:w-80" />
      <div className="absolute inset-x-12 bottom-12 h-px bg-gradient-to-r from-transparent via-brand-rose/40 to-transparent" />
    </div>
  );
}

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return true;
}

function subscribePageVisibility(callback: () => void) {
  if (typeof document === "undefined") return () => {};

  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

function getPageVisibilitySnapshot() {
  if (typeof document === "undefined") return true;
  return !document.hidden;
}

function getPageVisibilityServerSnapshot() {
  return true;
}

export default function Canvas3D() {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const pageVisible = useSyncExternalStore(
    subscribePageVisibility,
    getPageVisibilitySnapshot,
    getPageVisibilityServerSnapshot,
  );
  const [webglAvailable] = useState(() => hasWebGLSupport());

  return (
    <div className="relative flex h-full min-h-[260px] w-full select-none items-center justify-center overflow-hidden sm:min-h-[340px] md:min-h-[460px]">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-rose/20 blur-3xl sm:h-72 sm:w-72" />

      {reducedMotion || !webglAvailable ? (
        <StaticCanvasFallback />
      ) : (
        <Canvas
          aria-hidden="true"
          className="pointer-events-none"
          camera={{ position: [0, 0, 4.8], fov: 48 }}
          dpr={[1, 1.5]}
          frameloop={pageVisible ? "always" : "never"}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <ambientLight intensity={1.4} />
          <pointLight position={[3, 4, 5]} intensity={2.2} color="#D36A8F" />
          <pointLight position={[-4, -3, 4]} intensity={1.4} color="#5D244F" />
          <directionalLight position={[0, 3, 4]} intensity={0.9} />

          <group scale={1.05}>
            <SignalCore />
            <SignalRings />
            <ParticleField />
          </group>
        </Canvas>
      )}
    </div>
  );
}
