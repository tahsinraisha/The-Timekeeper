"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Stars,
  Float,
  Sparkles,
} from "@react-three/drei";
import * as THREE from "three";

/* ─── DESIGN TOKENS ─────────────────────────────────────────────── */
const T = {
  gold: "#C9A84C",
  goldLight: "#F0D080",
  goldDark: "#7A5C1E",
  obsidian: "#0A0A0F",
  deepBlue: "#050818",
  midnight: "#080C1A",
  azure: "#1A3A6B",
  electric: "#4A9EFF",
  crimson: "#C42B2B",
  ivory: "#F5F0E8",
};

/* ─── UTILITY ────────────────────────────────────────────────────── */
const lerp = (a, b, t) => a + (b - a) * t;

/* ─── PARTICLE FIELD ─────────────────────────────────────────────── */
function ParticleField({ count = 600, color = "#4A9EFF", size = 0.015 }) {
  const mesh = useRef();
  const positions = useRef(new Float32Array(count * 3));
  const velocities = useRef(new Float32Array(count * 3));

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      positions.current[i * 3]     = (Math.random() - 0.5) * 30;
      positions.current[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions.current[i * 3 + 2] = (Math.random() - 0.5) * 15;
      velocities.current[i * 3]     = (Math.random() - 0.5) * 0.003;
      velocities.current[i * 3 + 1] = (Math.random() - 0.5) * 0.003;
      velocities.current[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
    }
  }, [count]);

  useFrame(() => {
    if (!mesh.current) return;
    const pos = mesh.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3]     += velocities.current[i * 3];
      pos[i * 3 + 1] += velocities.current[i * 3 + 1];
      pos[i * 3 + 2] += velocities.current[i * 3 + 2];
      if (Math.abs(pos[i * 3])     > 15) velocities.current[i * 3]     *= -1;
      if (Math.abs(pos[i * 3 + 1]) > 10) velocities.current[i * 3 + 1] *= -1;
      if (Math.abs(pos[i * 3 + 2]) > 8)  velocities.current[i * 3 + 2] *= -1;
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions.current}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color={color} size={size} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/* ─── CLOCK MECHANISM ────────────────────────────────────────────── */
function ClockMechanism({ frozen = false, glowing = false }) {
  const group    = useRef();
  const outerRing = useRef();
  const innerRing = useRef();
  const gear1    = useRef();
  const gear2    = useRef();
  const hourHand = useRef();
  const minHand  = useRef();
  const glowRef  = useRef();
  const t        = useRef(0);

  useFrame((_, delta) => {
    if (frozen) return;
    t.current += delta;
    const spd = glowing ? 4 : 1;
    if (outerRing.current) outerRing.current.rotation.z += delta * 0.2 * spd;
    if (innerRing.current) innerRing.current.rotation.z -= delta * 0.4 * spd;
    if (gear1.current)    gear1.current.rotation.z    += delta * 0.8 * spd;
    if (gear2.current)    gear2.current.rotation.z    -= delta * 1.2 * spd;
    if (hourHand.current) hourHand.current.rotation.z  = -t.current * 0.05 * spd;
    if (minHand.current)  minHand.current.rotation.z   = -t.current * 0.6  * spd;
    if (glowRef.current && glowing) {
      glowRef.current.material.opacity = 0.3 + Math.sin(t.current * 3) * 0.2;
    }
    if (group.current) {
      group.current.rotation.y = Math.sin(t.current * 0.3) * 0.15;
      group.current.position.y = Math.sin(t.current * 0.5) * 0.1;
    }
  });

  const gM  = { color: "#C9A84C", metalness: 0.9, roughness: 0.1 };
  const dkM = { color: "#1A1A2E", metalness: 0.7, roughness: 0.3 };

  return (
    <group ref={group}>
      <mesh ref={outerRing}>
        <torusGeometry args={[2.2, 0.08, 16, 80]} />
        <meshStandardMaterial {...gM} />
      </mesh>
      <mesh ref={innerRing}>
        <torusGeometry args={[1.8, 0.05, 16, 64]} />
        <meshStandardMaterial color="#F0D080" metalness={0.95} roughness={0.05} />
      </mesh>
      <mesh position={[0, 0, -0.1]}>
        <circleGeometry args={[1.75, 64]} />
        <meshStandardMaterial {...dkM} />
      </mesh>

      {/* Hour markers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(angle) * 1.5, Math.cos(angle) * 1.5, 0]} rotation={[0, 0, -angle]}>
            <boxGeometry args={[0.06, 0.2, 0.04]} />
            <meshStandardMaterial {...gM} />
          </mesh>
        );
      })}

      <mesh ref={gear1} position={[0.6, 0.6, -0.2]}>
        <torusGeometry args={[0.35, 0.05, 8, 20]} />
        <meshStandardMaterial {...gM} />
      </mesh>
      <mesh ref={gear2} position={[-0.6, -0.6, -0.2]}>
        <torusGeometry args={[0.25, 0.04, 8, 16]} />
        <meshStandardMaterial color="#F0D080" metalness={0.9} roughness={0.1} />
      </mesh>

      <group ref={hourHand} position={[0, 0, 0.05]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.07, 1.0, 0.04]} />
          <meshStandardMaterial {...gM} />
        </mesh>
      </group>
      <group ref={minHand} position={[0, 0, 0.1]}>
        <mesh position={[0, 0.65, 0]}>
          <boxGeometry args={[0.04, 1.3, 0.04]} />
          <meshStandardMaterial color="#F0D080" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      <mesh position={[0, 0, 0.15]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color={glowing ? "#4A9EFF" : "#C42B2B"}
          emissive={glowing ? "#4A9EFF" : "#C42B2B"}
          emissiveIntensity={glowing ? 3 : 1}
        />
      </mesh>

      {glowing && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[2.5, 32, 32]} />
          <meshStandardMaterial color="#4A9EFF" transparent opacity={0.08} side={THREE.BackSide} />
        </mesh>
      )}
    </group>
  );
}

/* ─── HUMAN CHARACTER ────────────────────────────────────────────── */
function HumanCharacter({ position = [0,0,0], emotion = "neutral", walking = false, scale = 1, name = "elias" }) {
  const group    = useRef();
  const leftArm  = useRef();
  const rightArm = useRef();
  const leftLeg  = useRef();
  const rightLeg = useRef();
  const head     = useRef();
  const body     = useRef();
  const t        = useRef(0);

  const skinMap = { neutral:"#E8D5B7", happy:"#FFD89E", sad:"#B8C8E8", fearful:"#D4C4F0", determined:"#FFB86C", wonder:"#C8E8FF" };
  const skin    = skinMap[emotion] || skinMap.neutral;
  const cloth   = name === "elias" ? "#2A3A5E" : "#3E2A1E";
  const hair    = name === "elias" ? "#1A0E00" : "#8B4513";

  useFrame((_, delta) => {
    t.current += delta;
    const breathe = Math.sin(t.current * 1.5) * 0.015;
    if (body.current) body.current.scale.y = 1 + breathe;

    if (walking) {
      const stride = Math.sin(t.current * 3) * 0.4;
      if (leftArm.current)  leftArm.current.rotation.x  = -stride * 0.6;
      if (rightArm.current) rightArm.current.rotation.x =  stride * 0.6;
      if (leftLeg.current)  leftLeg.current.rotation.x  =  stride;
      if (rightLeg.current) rightLeg.current.rotation.x = -stride;
      if (group.current) group.current.position.y = position[1] + Math.abs(Math.sin(t.current * 3)) * 0.05;
    } else {
      const sway = Math.sin(t.current * 0.8) * 0.03;
      if (leftArm.current)  leftArm.current.rotation.z  =  0.15 + sway;
      if (rightArm.current) rightArm.current.rotation.z = -0.15 - sway;
    }

    if (head.current) {
      if      (emotion === "wonder")     head.current.rotation.x = -0.15 + Math.sin(t.current * 0.5) * 0.05;
      else if (emotion === "sad")        head.current.rotation.x =  0.2;
      else if (emotion === "determined") head.current.rotation.y =  Math.sin(t.current * 0.3) * 0.1;
      else                               head.current.rotation.x =  Math.sin(t.current * 0.4) * 0.03;
    }
  });

  return (
    <group ref={group} position={position} scale={scale}>
      {/* Left leg */}
      <group ref={leftLeg} position={[-0.14, 0, 0]}>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.1, 0.09, 0.9, 12]} />
          <meshStandardMaterial color={cloth} />
        </mesh>
        <mesh position={[0, -0.05, 0.02]}>
          <boxGeometry args={[0.13, 0.12, 0.28]} />
          <meshStandardMaterial color="#1A1A1A" />
        </mesh>
      </group>

      {/* Right leg */}
      <group ref={rightLeg} position={[0.14, 0, 0]}>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.1, 0.09, 0.9, 12]} />
          <meshStandardMaterial color={cloth} />
        </mesh>
        <mesh position={[0, -0.05, 0.02]}>
          <boxGeometry args={[0.13, 0.12, 0.28]} />
          <meshStandardMaterial color="#1A1A1A" />
        </mesh>
      </group>

      {/* Body */}
      <mesh ref={body} position={[0, 1.1, 0]}>
        <capsuleGeometry args={[0.22, 0.55, 8, 16]} />
        <meshStandardMaterial color={cloth} roughness={0.7} />
      </mesh>

      {/* Belt */}
      <mesh position={[0, 0.88, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.06, 16]} />
        <meshStandardMaterial color={T.gold} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Left arm */}
      <group ref={leftArm} position={[-0.32, 1.2, 0]}>
        <mesh position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.08, 0.45, 8, 12]} />
          <meshStandardMaterial color={cloth} />
        </mesh>
        <mesh position={[0, -0.56, 0]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color={skin} roughness={0.8} />
        </mesh>
      </group>

      {/* Right arm */}
      <group ref={rightArm} position={[0.32, 1.2, 0]}>
        <mesh position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.08, 0.45, 8, 12]} />
          <meshStandardMaterial color={cloth} />
        </mesh>
        <mesh position={[0, -0.56, 0]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color={skin} roughness={0.8} />
        </mesh>
      </group>

      {/* Neck */}
      <mesh position={[0, 1.52, 0]}>
        <cylinderGeometry args={[0.09, 0.1, 0.18, 12]} />
        <meshStandardMaterial color={skin} roughness={0.8} />
      </mesh>

      {/* Head */}
      <group ref={head} position={[0, 1.78, 0]}>
        <mesh>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial color={skin} roughness={0.7} />
        </mesh>
        {/* Hair cap */}
        <mesh position={[0, 0.1, -0.02]}>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial color={hair} roughness={0.9} />
        </mesh>
        {/* Face patch */}
        <mesh position={[0, 0, 0.18]}>
          <sphereGeometry args={[0.19, 24, 24]} />
          <meshStandardMaterial color={skin} roughness={0.7} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.07, 0.04, 0.2]}>
          <sphereGeometry args={[0.028, 12, 12]} />
          <meshStandardMaterial color="#1A1A2E" roughness={0.1} metalness={0.3} />
        </mesh>
        <mesh position={[0.07, 0.04, 0.2]}>
          <sphereGeometry args={[0.028, 12, 12]} />
          <meshStandardMaterial color="#1A1A2E" roughness={0.1} metalness={0.3} />
        </mesh>
        {/* Eye shine */}
        <mesh position={[-0.065, 0.055, 0.225]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} />
        </mesh>
        <mesh position={[0.075, 0.055, 0.225]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} />
        </mesh>
        {/* Mouth */}
        <mesh position={[0, -0.06, 0.21]} rotation={[0, 0, emotion === "happy" ? 0.3 : emotion === "sad" ? -0.3 : 0]}>
          <boxGeometry args={[0.07, 0.015, 0.01]} />
          <meshStandardMaterial color="#8B4040" />
        </mesh>
        {/* Eyebrows */}
        <mesh position={[-0.07, 0.1, 0.215]} rotation={[0, 0, emotion === "determined" ? -0.3 : 0.1]}>
          <boxGeometry args={[0.06, 0.012, 0.01]} />
          <meshStandardMaterial color={hair} />
        </mesh>
        <mesh position={[0.07, 0.1, 0.215]} rotation={[0, 0, emotion === "determined" ? 0.3 : -0.1]}>
          <boxGeometry args={[0.06, 0.012, 0.01]} />
          <meshStandardMaterial color={hair} />
        </mesh>
        {/* Glasses — Elias only */}
        {name === "elias" && (
          <>
            <mesh position={[-0.07, 0.04, 0.22]}>
              <torusGeometry args={[0.045, 0.006, 8, 24]} />
              <meshStandardMaterial color={T.gold} metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0.07, 0.04, 0.22]}>
              <torusGeometry args={[0.045, 0.006, 8, 24]} />
              <meshStandardMaterial color={T.gold} metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.04, 0.22]}>
              <boxGeometry args={[0.05, 0.006, 0.006]} />
              <meshStandardMaterial color={T.gold} metalness={0.9} roughness={0.1} />
            </mesh>
          </>
        )}
      </group>

      {/* Ground shadow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.28, 16]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

/* ─── FLYING VEHICLE ─────────────────────────────────────────────── */
function FlyingVehicle({ offset, height }) {
  const ref = useRef();
  const t   = useRef(offset);

  useFrame((_, delta) => {
    t.current += delta * 0.4;
    if (!ref.current) return;
    ref.current.position.x = Math.sin(t.current) * 6;
    ref.current.position.z = Math.cos(t.current) * 4 - 3;
    ref.current.position.y = height + Math.sin(t.current * 2) * 0.3;
    ref.current.rotation.y = -t.current + Math.PI / 2;
  });

  return (
    <group ref={ref}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.15, 0.6, 6, 12]} />
        <meshStandardMaterial color="#1A2A4A" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[0.8, 0.06, 0.3]} />
        <meshStandardMaterial color="#2A3A5E" metalness={0.8} roughness={0.2} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={0.5} color="#4A9EFF" distance={2} />
    </group>
  );
}

/* ─── TIME RIPPLE ────────────────────────────────────────────────── */
function TimeRipple({ delay }) {
  const mesh = useRef();
  const t    = useRef(delay);

  useFrame((_, delta) => {
    t.current += delta * 0.5;
    const s = (t.current % 4) * 1.5;
    if (mesh.current) {
      mesh.current.scale.set(s, s, 1);
      mesh.current.material.opacity = Math.max(0, 0.4 - s * 0.1);
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.8, 1, 64]} />
      <meshStandardMaterial color="#C9A84C" transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ─── SCENE: WORKSHOP ────────────────────────────────────────────── */
function WorkshopScene({ progress }) {
  const li = lerp(0, 2, Math.min(progress * 3, 1));

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 3, 2]}  intensity={li}  color="#F0D080" />
      <pointLight position={[-3, 1, 1]} intensity={0.5} color="#FF6030" />
      <spotLight  position={[2, 4, 2]}  intensity={1.5} color="#FFD080" angle={0.4} penumbra={0.8} castShadow />

      {/* Floor */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1A1008" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Table */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[3, 0.1, 1.2]} />
        <meshStandardMaterial color="#3D2B1A" roughness={0.8} />
      </mesh>
      {[[-1.3,-0.4,0.5],[1.3,-0.4,0.5],[-1.3,-0.4,-0.5],[1.3,-0.4,-0.5]].map((p, i) => (
        <mesh key={i} position={p}>
          <cylinderGeometry args={[0.05, 0.05, 0.9, 8]} />
          <meshStandardMaterial color="#2A1E10" roughness={0.9} />
        </mesh>
      ))}

      {/* The Clock */}
      <group position={[0.5, 0.38, 0]} scale={0.5 + progress * 0.3}>
        <ClockMechanism glowing={progress > 0.5} />
      </group>

      {/* Elias */}
      <HumanCharacter
        position={[-0.8, -0.4, 0.8]}
        emotion={progress < 0.4 ? "neutral" : progress < 0.7 ? "wonder" : "determined"}
        name="elias"
        scale={0.9}
      />

      {/* Tool props */}
      {[[-0.8,0.18,-0.1],[0.9,0.18,0.2],[-0.3,0.18,0.3]].map((p, i) => (
        <mesh key={i} position={p}>
          <cylinderGeometry args={[0.04, 0.04, 0.08, 12]} />
          <meshStandardMaterial color={T.gold} metalness={0.9} roughness={0.1} />
        </mesh>
      ))}

      <ParticleField count={180} color="#F0D080" size={0.008} />

      {/* Shelves */}
      {[-1,0,1].map((x, i) => (
        <mesh key={i} position={[x*1.5, 1.5, -2]}>
          <boxGeometry args={[1.4, 0.06, 0.3]} />
          <meshStandardMaterial color="#2A1E10" roughness={0.9} />
        </mesh>
      ))}
    </>
  );
}

/* ─── SCENE: CITY ────────────────────────────────────────────────── */
function CityScene({ progress }) {
  const group = useRef();
  const t     = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (group.current) group.current.rotation.y = progress * 0.5 + Math.sin(t.current * 0.1) * 0.05;
  });

  const buildings = [
    [-4,3,-5],[-2.5,5,-6],[-1,4,-7],[1,6,-6],
    [2.5,4,-5],[4,3.5,-6],[-3.5,2,-4],[3.5,2.5,-4],
  ];

  return (
    <group ref={group}>
      <ambientLight intensity={0.2} />
      <pointLight position={[0,10,5]}  intensity={3} color="#4A9EFF" />
      <pointLight position={[-5,5,0]}  intensity={2} color="#8030FF" />
      <pointLight position={[5,5,0]}   intensity={2} color="#FF4060" />

      {/* Street */}
      <mesh position={[0,-1,0]} rotation={[-Math.PI/2,0,0]}>
        <planeGeometry args={[40,40]} />
        <meshStandardMaterial color="#0A0A14" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Glow lanes */}
      {[-2,-1,0,1,2].map((x,i) => (
        <mesh key={i} position={[x,-0.98,0]} rotation={[-Math.PI/2,0,0]}>
          <planeGeometry args={[0.05,30]} />
          <meshStandardMaterial color="#4A9EFF" emissive="#4A9EFF" emissiveIntensity={1.5} transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Buildings */}
      {buildings.map(([x,h,z], i) => (
        <group key={i} position={[x, h/2-1, z]}>
          <mesh>
            <boxGeometry args={[0.8+(i%3)*0.3, h, 0.8+(i%2)*0.4]} />
            <meshStandardMaterial color={`hsl(${220+i*15},30%,${8+i*2}%)`} roughness={0.3} metalness={0.7} />
          </mesh>
          {Array.from({ length: Math.floor(h/0.4) }).map((_,j) => (
            <mesh key={j} position={[0.41, -h/2+j*0.4+0.2, 0]}>
              <boxGeometry args={[0.02, 0.15, 0.6]} />
              <meshStandardMaterial color="#4A9EFF" emissive="#4A9EFF" emissiveIntensity={j%3===0?2:0} transparent opacity={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {[0,1,2].map(i => <FlyingVehicle key={i} offset={i*2.1} height={2+i*1.5} />)}

      <HumanCharacter position={[0,-1,2]} emotion="wonder" walking={progress>0.3} name="elias" />

      <ParticleField count={350} color="#4A9EFF" size={0.012} />
      <Stars radius={50} depth={20} count={1000} factor={2} />
    </group>
  );
}

/* ─── SCENE: FROZEN TIME ─────────────────────────────────────────── */
function FrozenScene({ progress }) {
  return (
    <>
      <ambientLight intensity={0.5} color="#8BBFFF" />
 
