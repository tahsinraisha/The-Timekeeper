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
      <pointLight position={[0,5,0]}  intensity={4} color="#B0D8FF" />
      <pointLight position={[0,0,0]}  intensity={2} color="#4A9EFF" />

      <mesh position={[0,-1,0]} rotation={[-Math.PI/2,0,0]}>
        <planeGeometry args={[20,20]} />
        <meshStandardMaterial color="#0A2040" roughness={0.05} metalness={0.3} transparent opacity={0.9} />
      </mesh>

      {/* Time orb */}
      <group position={[0,1,0]}>
        <mesh>
          <sphereGeometry args={[1.2,32,32]} />
          <meshStandardMaterial color="#4A9EFF" transparent opacity={0.15} side={THREE.BackSide} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.8,32,32]} />
          <meshStandardMaterial color="#80C0FF" transparent opacity={0.1} wireframe />
        </mesh>
        <ClockMechanism frozen glowing />
      </group>

      <HumanCharacter position={[-2,-1,0.5]}  emotion="fearful"    scale={0.9} name="bystander" />
      <HumanCharacter position={[2,-1,-0.5]}   emotion="sad"        scale={0.85} name="bystander" />
      <HumanCharacter position={[0,-1,-2]}     emotion="neutral"    scale={0.95} name="bystander" />
      <HumanCharacter position={[0,-1,1.5]}    emotion="determined" name="elias" />

      <ParticleField count={500} color="#80C0FF" size={0.02} />

      {Array.from({length:10}).map((_,i) => (
        <mesh key={i}
          position={[(Math.random()-0.5)*6, Math.random()*3-0.5, (Math.random()-0.5)*4]}
          rotation={[Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI]}
        >
          <boxGeometry args={[0.1+Math.random()*0.3, 0.1+Math.random()*0.2, 0.05]} />
          <meshStandardMaterial color="#80C0FF" transparent opacity={0.6} metalness={0.3} />
        </mesh>
      ))}

      <Stars radius={30} depth={10} count={2000} factor={3} />
    </>
  );
}

/* ─── SCENE: COLLAPSING ──────────────────────────────────────────── */
function CollapsingScene({ progress }) {
  const group = useRef();
  const t     = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (group.current) group.current.rotation.z = Math.sin(t.current*0.5) * (0.02 + progress*0.08);
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.2} color="#FF4030" />
      <pointLight position={[0,5,0]}   intensity={5} color="#FF6030" />
      <pointLight position={[-3,3,2]}  intensity={3} color="#FF2000" />
      <pointLight position={[3,2,-2]}  intensity={2} color="#FF8000" />

      {Array.from({length:16}).map((_,i) => {
        const x   = (i%4)*2-3;
        const z   = Math.floor(i/4)*2-3;
        const drop = (i%5===0?-1:0) + progress*(i%3===0?-2:0);
        return (
          <mesh key={i} position={[x, drop-0.5, z]} rotation={[Math.random()*0.1*progress,0,Math.random()*0.1*progress]}>
            <boxGeometry args={[1.9,0.2,1.9]} />
            <meshStandardMaterial color={`hsl(${20+i*5},40%,${10+i}%)`} roughness={0.9} />
          </mesh>
        );
      })}

      {[-3,0,3].map((x,i) => (
        <mesh key={i} position={[x,1.5-progress*(1+i),-4]} rotation={[0,0,progress*(i%2===0?0.3:-0.3)]}>
          <boxGeometry args={[0.8,4,0.8]} />
          <meshStandardMaterial color="#1A1010" roughness={0.9} />
        </mesh>
      ))}

      <ParticleField count={250} color="#FF4020" size={0.025} />
      <ParticleField count={160} color="#FF8000" size={0.018} />

      <HumanCharacter position={[0,-0.3,1]} emotion="determined" name="elias" scale={1.1} />

      {Array.from({length:8}).map((_,i) => {
        const angle = (i/8)*Math.PI*2;
        const r = 1.5 + progress*2;
        return (
          <mesh key={i} position={[Math.sin(angle)*r, Math.cos(angle)*r*0.5+1, -1]}>
            <torusGeometry args={[0.2+i*0.05, 0.02, 8, 16, Math.PI*0.4]} />
            <meshStandardMaterial color={T.gold} metalness={0.9} roughness={0.1} emissive="#C9A84C" emissiveIntensity={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ─── SCENE: RESOLUTION ──────────────────────────────────────────── */
function ResolutionScene({ progress }) {
  const lightRef = useRef();
  const t        = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (lightRef.current) lightRef.current.intensity = 2 + Math.sin(t.current*0.8)*0.5 + progress*3;
  });

  return (
    <>
      <ambientLight intensity={0.4+progress*0.6} color="#FFD080" />
      <pointLight ref={lightRef} position={[0,3,0]} intensity={3} color="#FFD080" />
      <spotLight  position={[0,8,2]} intensity={4*progress} color="#FFFFFF" angle={0.3} />

      <mesh position={[0,-1,0]} rotation={[-Math.PI/2,0,0]}>
        <planeGeometry args={[20,20]} />
        <meshStandardMaterial color="#1A1000" roughness={0.6} metalness={0.2} />
      </mesh>

      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <group position={[0,1.5,-1]} scale={1.2}>
          <ClockMechanism glowing={progress>0.3} />
        </group>
      </Float>

      <HumanCharacter position={[-0.8,-1,0.5]} emotion="happy"  name="elias"     scale={1} />
      <HumanCharacter position={[0.8,-1,0.5]}  emotion="happy"  name="bystander" scale={0.95} />

      <Sparkles count={200} scale={6} size={3} speed={0.4} color="#C9A84C" />
      <ParticleField count={250} color="#F0D080" size={0.015} />

      {[0,1,2].map(i => <TimeRipple key={i} delay={i*0.7} />)}
    </>
  );
}

/* ─── CINEMATIC CAMERA ───────────────────────────────────────────── */
function CinematicCamera({ scene, progress }) {
  const { camera } = useThree();
  const t          = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;

    const targets = {
      workshop:   new THREE.Vector3(Math.sin(t.current*0.1)*0.5,   1.5+Math.sin(t.current*0.15)*0.3, 5-progress*2),
      city:       new THREE.Vector3(Math.sin(t.current*0.08)*1,    2+progress*2,                      6-progress*3),
      frozen:     new THREE.Vector3(Math.sin(t.current*0.1)*2,     1.5,                               4),
      collapsing: new THREE.Vector3(Math.sin(t.current*0.2)*1.5,   1+progress*1.5,                    4+Math.sin(t.current*0.1)*1),
      resolution: new THREE.Vector3(Math.sin(t.current*0.07)*1,    1.5-progress*0.5,                  4-progress),
    };

    const target = targets[scene] || new THREE.Vector3(0, 1.5, 5);
    camera.position.lerp(target, 0.02);
    camera.lookAt(0, 0.5, 0);
  });

  return null;
}

/* ─── CHAPTERS DATA ──────────────────────────────────────────────── */
const CHAPTERS = [
  {
    id: "workshop",
    subtitle: "Chapter I",
    title: "THE DISCOVERY",
    headline: "A Clock That Shouldn't Exist",
    body: "In the cobbled streets of New Geneva, young watchmaker Elias Voss spends his evenings among gears and glass — until the night a mysterious clock arrives, its hands moving against the very flow of time.",
    accent: "#C9A84C",
  },
  {
    id: "city",
    subtitle: "Chapter II",
    title: "THE WORLD ABOVE",
    headline: "A City Suspended in Motion",
    body: "Armed with the clock's secret, Elias steps into New Geneva at midnight — a city of impossible towers and electric rivers, where every soul rushes toward a future none of them chose.",
    accent: "#4A9EFF",
  },
  {
    id: "frozen",
    subtitle: "Chapter III",
    title: "THE SILENCE",
    headline: "When Time Stopped Breathing",
    body: "With a single turn of the crown, the world crystallizes. Crowds freeze mid-stride. Rain hangs like chandeliers. Only Elias walks through the stillness — understanding, for the first time, the terrible weight of the moment.",
    accent: "#80C0FF",
  },
  {
    id: "collapsing",
    subtitle: "Chapter IV",
    title: "THE BREAKING",
    headline: "Reality Begins to Shatter",
    body: "Time was never meant to be rewound. The clock fractures. The city cracks. Entire moments fall from existence. With the world collapsing, Elias faces his final choice: surrender the clock, or lose everything.",
    accent: "#C42B2B",
  },
  {
    id: "resolution",
    subtitle: "Chapter V",
    title: "THE RESTORATION",
    headline: "Some Moments Are Worth Keeping",
    body: "Elias returns the stolen seconds. Time flows again. The world heals, imperfect and precious. And in the amber light of a restored dawn, he understands: the greatest craft is not to stop time — but to honor it.",
    accent: "#C9A84C",
  },
];

/* ─── UI: TITLE CARD ─────────────────────────────────────────────── */
function TitleCard({ visible, onEnter }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(ellipse at center, #0D0800 0%, #000 100%)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 1s ease",
      }}
    >
      {/* Spinning rings */}
      {[200, 280, 360].map((sz, i) => (
        <div key={i} style={{
          position: "absolute", width: sz, height: sz,
          border: `1px solid ${T.gold}`, borderRadius: "50%", opacity: 0.15,
          animation: `spinClock ${12+i*8}s linear infinite ${i%2===0?"":"reverse"}`,
        }} />
      ))}

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 2rem", maxWidth: 600 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.5em", textTransform: "uppercase", color: T.gold, fontFamily: "monospace", marginBottom: 32, opacity: 0.6 }}>
          An Interactive Cinematic Experience
        </div>

        <h1 style={{ fontSize: "clamp(3rem,10vw,5.5rem)", fontWeight: 900, color: T.ivory, fontFamily: "Georgia,serif", lineHeight: 1, margin: 0, textShadow: `0 0 60px ${T.goldDark}` }}>
          THE
        </h1>
        <h1 style={{ fontSize: "clamp(3rem,10vw,5.5rem)", fontWeight: 900, color: T.gold, fontFamily: "Georgia,serif", lineHeight: 1, margin: "0 0 2rem", textShadow: `0 0 80px ${T.gold}80` }}>
          TIMEKEEPER
        </h1>

        <div style={{ width: 96, height: 1, background: T.gold, margin: "0 auto 2rem", opacity: 0.6 }} />

        <p style={{ fontSize: "clamp(0.85rem,2vw,1rem)", lineHeight: 1.8, color: T.ivory, fontFamily: "Georgia,serif", opacity: 0.75, marginBottom: 48 }}>
          A story about a young watchmaker who discovers a clock capable of bending time —
          and the terrible cost of stopping it.
        </p>

        <button
          onClick={onEnter}
          style={{
            padding: "1rem 2.5rem",
            border: `1px solid ${T.gold}`,
            background: "transparent",
            color: T.gold,
            fontFamily: "monospace",
            fontSize: 11,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
          onMouseEnter={e => { e.target.style.background = `${T.gold}18`; e.target.style.boxShadow = `0 0 30px ${T.gold}30`; }}
          onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.boxShadow = "none"; }}
        >
          Begin the Experience →
        </button>

        <div style={{ marginTop: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.4 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.3em", color: T.ivory, fontFamily: "monospace" }}>SCROLL TO JOURNEY</div>
          <div style={{ width: 1, height: 48, background: T.gold, animation: "pulseGlow 2s ease-in-out infinite" }} />
        </div>
      </div>
    </div>
  );
}

/* ─── UI: CHAPTER OVERLAY ────────────────────────────────────────── */
function ChapterOverlay({ chapter, chapterProgress }) {
  const ch      = CHAPTERS[chapter];
  const visible = chapterProgress > 0.2 && chapterProgress < 0.88;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 20, pointerEvents: "none" }}>
      <div style={{
        maxWidth: 480, padding: "0 2rem 0 3rem",
        display: "flex", flexDirection: "column", justifyContent: "center", height: "100%",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-20px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}>
        <div style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: ch.accent, fontFamily: "monospace", marginBottom: 12 }}>
          {ch.subtitle}
        </div>
        <h2 style={{ fontSize: "clamp(1.6rem,4vw,2.8rem)", fontWeight: 900, color: T.ivory, fontFamily: "Georgia,serif", margin: "0 0 12px", textShadow: "0 2px 20px rgba(0,0,0,0.9)", lineHeight: 1.1 }}>
          {ch.title}
        </h2>
        <div style={{ width: 48, height: 2, background: ch.accent, marginBottom: 16 }} />
        <h3 style={{ fontSize: "clamp(0.9rem,2vw,1.1rem)", fontWeight: 300, color: ch.accent, fontFamily: "Georgia,serif", margin: "0 0 16px", textShadow: "0 0 20px rgba(0,0,0,0.9)", lineHeight: 1.4 }}>
          {ch.headline}
        </h3>
        <p style={{ fontSize: "clamp(0.8rem,1.5vw,0.9rem)", lineHeight: 1.8, color: T.ivory, opacity: 0.72, fontFamily: "Georgia,serif", textShadow: "0 1px 8px rgba(0,0,0,1)" }}>
          {ch.body}
        </p>
      </div>

      {/* Scroll hint */}
      {chapterProgress < 0.1 && (
        <div style={{
          position: "absolute", bottom: 64, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          opacity: chapterProgress < 0.08 ? 0.6 : 0, transition: "opacity 0.5s",
        }}>
          <div style={{ fontSize: 10, letterSpacing: "0.3em", color: T.ivory, fontFamily: "monospace" }}>SCROLL</div>
          <div style={{ width: 1, height: 40, background: ch.accent, animation: "tickBounce 1.5s ease-in-out infinite" }} />
        </div>
      )}

      {/* Gradients */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)", pointerEvents: "none" }} />
    </div>
  );
}

/* ─── UI: HUD ────────────────────────────────────────────────────── */
function HUD({ chapter, onChapterClick }) {
  const ch = CHAPTERS[chapter];

  return (
    <>
      {/* Top bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "1.25rem 2rem",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)",
      }}>
        <div style={{ fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", color: T.gold, fontFamily: "monospace", fontWeight: 900 }}>
          The Timekeeper
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {CHAPTERS.map((_, i) => (
            <button key={i} onClick={() => onChapterClick(i)} style={{
              width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontFamily: "monospace", cursor: "pointer",
              color: i === chapter ? T.gold : `${T.ivory}40`,
              border: `1px solid ${i === chapter ? T.gold : "transparent"}`,
              background: i === chapter ? `${T.gold}10` : "transparent",
              transition: "all 0.3s",
            }}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom right label */}
      <div style={{
        position: "fixed", bottom: 24, right: 32, zIndex: 50, textAlign: "right",
        color: `${T.ivory}40`, fontFamily: "monospace", fontSize: 10, letterSpacing: "0.2em",
        lineHeight: 1.8,
      }}>
        <div>{ch.subtitle.toUpperCase()}</div>
        <div style={{ color: ch.accent }}>{ch.title}</div>
      </div>

      {/* Progress bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 2, zIndex: 50, background: "rgba(255,255,255,0.08)" }}>
        <div style={{
          height: "100%",
          width: `${((chapter + 0.5) / CHAPTERS.length) * 100}%`,
          background: `linear-gradient(to right, ${T.goldDark}, ${T.gold})`,
          transition: "width 0.4s ease",
        }} />
      </div>

      {/* Side dots */}
      <div style={{ position: "fixed", right: 24, top: "50%", transform: "translateY(-50%)", zIndex: 50, display: "flex", flexDirection: "column", gap: 10 }}>
        {CHAPTERS.map((_, i) => (
          <div key={i} style={{
            width: 3, borderRadius: 9999,
            height: i === chapter ? 28 : 8,
            background: i === chapter ? T.gold : `${T.gold}30`,
            transition: "all 0.4s ease",
          }} />
        ))}
      </div>
    </>
  );
}

/* ─── ROOT COMPONENT ─────────────────────────────────────────────── */
export default function TimekeeperExperience() {
  const [titleVisible,    setTitleVisible]    = useState(true);
  const [chapter,         setChapter]         = useState(0);
  const [chapterProgress, setChapterProgress] = useState(0);
  const [transitioning,   setTransitioning]   = useState(false);
  const scrollRef  = useRef(null);
  const chapterRef = useRef(0);

  const SCROLL_PER_CHAPTER = 800;
  const TOTAL_SCROLL       = SCROLL_PER_CHAPTER * CHAPTERS.length;

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const sy  = scrollRef.current.scrollTop;
    const idx = Math.min(Math.floor(sy / SCROLL_PER_CHAPTER), CHAPTERS.length - 1);
    const pct = (sy % SCROLL_PER_CHAPTER) / SCROLL_PER_CHAPTER;

    if (idx !== chapterRef.current) {
      chapterRef.current = idx;
      setTransitioning(true);
      setTimeout(() => setTransitioning(false), 600);
      setChapter(idx);
    }
    setChapterProgress(pct);
  }, [SCROLL_PER_CHAPTER]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleChapterClick = (idx) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ top: idx * SCROLL_PER_CHAPTER + 50, behavior: "smooth" });
  };

  const scene = CHAPTERS[chapter]?.id || "workshop";

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#000", position: "relative" }}>
      <style>{`
        @keyframes spinClock   { to { transform: rotate(360deg); } }
        @keyframes pulseGlow   { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes tickBounce  { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.4)} }
        ::-webkit-scrollbar    { display: none; }
      `}</style>

      {/* ── TITLE CARD ── */}
      <TitleCard visible={titleVisible} onEnter={() => setTitleVisible(false)} />

      {/* ── 3D CANVAS ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <Canvas shadows camera={{ position: [0, 1.5, 5], fov: 60 }} gl={{ antialias: true }}>
          <fog attach="fog" args={["#000810", 8, 30]} />
          <Suspense fallback={null}>
            {scene === "workshop"   && <WorkshopScene   progress={chapterProgress} />}
            {scene === "city"       && <CityScene        progress={chapterProgress} />}
            {scene === "frozen"     && <FrozenScene      progress={chapterProgress} />}
            {scene === "collapsing" && <CollapsingScene  progress={chapterProgress} />}
            {scene === "resolution" && <ResolutionScene  progress={chapterProgress} />}
          </Suspense>
          <CinematicCamera scene={scene} progress={chapterProgress} />
        </Canvas>
      </div>

      {/* ── VIGNETTE ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 15, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.65) 100%)",
        opacity: transitioning ? 1 : 0.55, transition: "opacity 0.7s ease",
      }} />

      {/* ── SCROLL DRIVER ── */}
      <div ref={scrollRef} style={{ position: "fixed", inset: 0, zIndex: 10, overflowY: "scroll", scrollbarWidth: "none" }}>
        <div style={{ height: TOTAL_SCROLL }} />
      </div>

      {/* ── OVERLAY ── */}
      {!titleVisible && <ChapterOverlay chapter={chapter} chapterProgress={chapterProgress} />}
      {!titleVisible && <HUD chapter={chapter} onChapterClick={handleChapterClick} />}

      {/* ── TRANSITION FLASH ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 35, pointerEvents: "none", background: "#000",
        opacity: transitioning ? 0.45 : 0, transition: "opacity 0.3s ease",
      }} />

      {/* ── LETTERBOX BARS ── */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 50, zIndex: 60, pointerEvents: "none", background: "linear-gradient(to bottom, #000, transparent)" }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 50, zIndex: 60, pointerEvents: "none", background: "linear-gradient(to top, #000, transparent)" }} />
    </div>
  );
}
