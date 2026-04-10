import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Sphere, Cylinder, Capsule, Line, Html, useGLTF, Center, Environment, Bounds } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Activity, Brain, Heart, Layers, Play, Pause, ZoomIn, Info, Volume2, VolumeX, Upload, X } from 'lucide-react';
import { EcorcheModel } from './EcorcheModel';

// --- 3D Components ---

function Bed() {
  return (
    <group position={[0, -0.5, 0]}>
      {/* Main Base */}
      <RoundedBox args={[1.2, 0.4, 2.4]} radius={0.05} position={[0, 0.2, 0]}>
        <meshStandardMaterial color="#1f1b18" roughness={0.8} />
      </RoundedBox>
      {/* Mattress */}
      <RoundedBox args={[1.1, 0.15, 2.3]} radius={0.05} position={[0, 0.475, 0]}>
        <meshStandardMaterial color="#2c2724" roughness={0.9} />
      </RoundedBox>
    </group>
  );
}

function SpeakerWave({ position, target, progress }: { position: [number, number, number], target: [number, number, number], progress: number }) {
  const ref = useRef<THREE.Group>(null);
  const targetVec = new THREE.Vector3(...target);
  const startVec = new THREE.Vector3(...position);
  
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.elapsedTime * (0.5 + progress * 0.5)) % 1;
    ref.current.position.lerpVectors(startVec, targetVec, t);
    ref.current.lookAt(targetVec);
    
    const scale = 0.5 + t * 2;
    ref.current.scale.setScalar(scale);
    
    ref.current.children.forEach((child) => {
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - t) * 0.15 * progress;
    });
  });

  return (
    <group ref={ref}>
      <mesh>
        <torusGeometry args={[0.1, 0.002, 16, 32]} />
        <meshBasicMaterial color="#00f2fe" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function Hotspot({ position, title, desc, visible }: { position: [number, number, number], title: string, desc: string, visible: boolean }) {
  const [hovered, setHovered] = useState(false);
  
  if (!visible) return null;

  return (
    <Html position={position} center>
      <div 
        className="relative flex items-center justify-center"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className={`w-2 h-2 rounded-full bg-blue-500/80 border border-white shadow-[0_0_10px_rgba(59,130,246,0.5)] cursor-pointer transition-transform duration-300 ${hovered ? 'scale-150' : 'scale-100'}`} />
        
        {hovered && (
          <div className="absolute left-3 w-36 p-2 bg-white/90 backdrop-blur-md rounded-lg shadow-2xl border border-blue-500/20 pointer-events-none animate-in fade-in zoom-in duration-200 z-50">
            <h4 className="text-[10px] font-bold text-blue-600 mb-0.5 uppercase tracking-wider">{title}</h4>
            <p className="text-[9px] text-gray-600 leading-tight">{desc}</p>
          </div>
        )}
      </div>
    </Html>
  );
}

function SoundPulse({ start, target, delay = 0 }: { start: [number, number, number], target: [number, number, number], delay?: number }) {
  const ref = useRef<THREE.Group>(null);
  const startVec = useMemo(() => new THREE.Vector3(...start), [start]);
  const targetVec = useMemo(() => new THREE.Vector3(...target), [target]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = ((clock.elapsedTime * 0.5 + delay) % 1); // 0 to 1
    ref.current.position.lerpVectors(startVec, targetVec, t);
    ref.current.lookAt(targetVec);
    
    const scale = 1 + t * 3;
    ref.current.scale.setScalar(scale);
    
    ref.current.children.forEach((child, i) => {
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - t) * (0.3 - i * 0.1);
    });
  });

  return (
    <group ref={ref}>
      <mesh>
        <torusGeometry args={[0.05, 0.004, 16, 32]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, 0, 0.02]} scale={0.8}>
        <torusGeometry args={[0.05, 0.002, 16, 32]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.15} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function Speaker({ position, target }: { position: [number, number, number], target: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.lookAt(new THREE.Vector3(...target));
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <RoundedBox args={[0.4, 0.3, 0.3]} radius={0.02}>
        <meshStandardMaterial color="#1f1b18" roughness={0.2} metalness={0.8} />
      </RoundedBox>
      <mesh position={[0, 0, 0.16]}>
        <circleGeometry args={[0.1, 32]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      <mesh position={[0, 0, 0.15]}>
        <ringGeometry args={[0.11, 0.12, 32]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function SoundWaves({ progress }: { progress: number }) {
  const waves = useRef<(THREE.Mesh | null)[]>([]);
  
  useFrame(({ clock }) => {
    waves.current.forEach((wave, i) => {
      if (!wave) return;
      const speed = 0.15 + (1 - progress) * 0.4;
      const t = (clock.elapsedTime * speed + i * 0.2) % 1;
      
      wave.position.y = -0.15 + (t * 0.8);
      wave.scale.setScalar(1 + t * 0.3);
      
      const mat = wave.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.sin(t * Math.PI) * 0.12 * progress;
      
      const stressColor = new THREE.Color('#ef4444');
      const calmColor = new THREE.Color('#00f2fe');
      mat.color.lerpColors(stressColor, calmColor, progress);
    });
  });

  return (
    <group position={[0, 0, 0]}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} ref={el => { waves.current[i] = el; }} rotation={[-Math.PI/2, 0, 0]}>
          <torusGeometry args={[0.7, 0.003, 16, 100]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

function Model({ progress, layer }: { progress: number, layer: string }) {
  const { scene } = useGLTF('/angiology.glb');
  const vascularMats = useRef<THREE.MeshStandardMaterial[]>([]);
  const nervousMats = useRef<THREE.MeshStandardMaterial[]>([]);

  useEffect(() => {
    vascularMats.current = [];
    nervousMats.current = [];
    
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        if (mesh.material) {
          // Clone material to avoid affecting other instances
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          mesh.material = mat;
          const matName = mat.name || '';
          
          const isVascular = matName.includes('Artery') || matName.includes('Vein');
          const isMuscle = matName.includes('Muscle') || matName.includes('Cartilage') || matName.includes('Ligament');
          
          let targetOpacity = 1;
          
          if (layer === 'all') {
            targetOpacity = isMuscle ? 0.4 : 1;
          } else if (layer === 'skin') {
            targetOpacity = isMuscle ? 1 : 0.1;
          } else if (layer === 'vascular') {
            targetOpacity = isVascular ? 1 : 0.05;
          } else if (layer === 'nervous') {
            targetOpacity = isVascular ? 1 : 0.05;
          }
          
          mat.transparent = targetOpacity < 1;
          mat.opacity = targetOpacity;
          mat.depthWrite = !mat.transparent;
          
          mat.emissive = new THREE.Color('#000000');
          mat.emissiveIntensity = 0;
          
          if (layer === 'nervous' && isVascular) {
            nervousMats.current.push(mat);
            mat.emissiveIntensity = 0.8;
          } else if (isVascular && (layer === 'all' || layer === 'vascular')) {
            vascularMats.current.push(mat);
            const color = matName.includes('Artery') ? '#ef4444' : '#3b82f6';
            mat.emissive = new THREE.Color(color);
            mat.emissiveIntensity = 0.2;
          } else if (isMuscle && layer === 'all') {
            mat.emissive = new THREE.Color('#4a3b32');
            mat.emissiveIntensity = 0.1;
          }
          
          // Add custom shader for vibration diffusion
          if (isVascular) {
            mat.onBeforeCompile = (shader) => {
              shader.uniforms.uTime = { value: 0 };
              shader.uniforms.uProgress = { value: 0 };
              shader.vertexShader = `
                varying vec3 vWorldPos;
                ${shader.vertexShader}
              `.replace(
                `#include <worldpos_vertex>`,
                `#include <worldpos_vertex>
                 vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
              );
              shader.fragmentShader = `
                uniform float uTime;
                uniform float uProgress;
                varying vec3 vWorldPos;
                ${shader.fragmentShader}
              `.replace(
                `#include <emissivemap_fragment>`,
                `#include <emissivemap_fragment>
                 // Center of the body (chest/heart area)
                 vec3 center = vec3(0.0, 0.2, 0.0);
                 float dist = distance(vWorldPos, center);
                 
                 // Drainage speed accelerates with progress (from stress to recovery)
                 float flowSpeed = 3.0 + uProgress * 15.0; 
                 
                 // + uTime makes the wave travel towards the center (dist decreasing)
                 // This creates the "drainage" effect along the nerves/vessels
                 float flowPhase = dist * 25.0 + uTime * flowSpeed;
                 
                 // Create distinct fluid droplets/pulses
                 float droplets = pow(sin(flowPhase) * 0.5 + 0.5, 6.0);
                 
                 // High frequency vibration along the paths
                 float vibration = sin(dist * 80.0 - uTime * 40.0) * 0.5 + 0.5;
                 
                 // Combine effects: more pronounced as progress increases
                 float drainage = droplets * 3.0 + vibration * 0.8;
                 
                 // Multiply the base emissive color by the drainage effect
                 totalEmissiveRadiance *= (0.3 + drainage * (0.5 + uProgress * 1.5));
                `
              );
              mat.userData.shader = shader;
            };
          }
          
          mat.needsUpdate = true;
        }
      }
    });

    // Log size
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    console.log('Angiology Model Size:', size);
  }, [scene, layer]);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    
    // Global color transition from Red (Stress/Inflammation) to Cyan (Recovered/Healthy)
    const stateColor = new THREE.Color().lerpColors(new THREE.Color('#ef4444'), new THREE.Color('#00f2fe'), progress);

    if (layer === 'all' || layer === 'vascular') {
      vascularMats.current.forEach(mat => {
        // Apply the dynamic color to show the state of the body
        mat.emissive.copy(stateColor);
        mat.emissiveIntensity = 0.6 + progress * 0.4;
        
        if (mat.userData.shader) {
          mat.userData.shader.uniforms.uTime.value = time;
          mat.userData.shader.uniforms.uProgress.value = progress;
        }
      });
    } else if (layer === 'nervous') {
      nervousMats.current.forEach(mat => {
        mat.emissive.copy(stateColor);
        mat.emissiveIntensity = 1.0;
        
        if (mat.userData.shader) {
          mat.userData.shader.uniforms.uTime.value = time;
          mat.userData.shader.uniforms.uProgress.value = progress;
        }
      });
    }
  });

  return (
    <group>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

useGLTF.preload('/angiology.glb');
useGLTF.preload('/ecorche_-_anatomy_study.glb');

function DataStreams({ progress }: { progress: number }) {
  const count = 40;
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < count; i++) {
      pts.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 1.5
        ),
        speed: 0.005 + Math.random() * 0.01,
        offset: Math.random() * Math.PI * 2
      });
    }
    return pts;
  }, []);

  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const p = points[i];
      const t = clock.elapsedTime * p.speed + p.offset;
      child.position.y = ((p.position.y + clock.elapsedTime * p.speed * 2 + 1) % 2) - 1;
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - Math.abs(child.position.y)) * 0.2 * progress;
    });
  });

  return (
    <group ref={groupRef}>
      {points.map((p, i) => (
        <mesh key={i} position={p.position}>
          <sphereGeometry args={[0.005, 8, 8]} />
          <meshBasicMaterial color="#00f2fe" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function GhostSkin({ layer, progress }: { layer: string, progress: number }) {
  const groupRef = useRef<THREE.Group>(null);

  let opacity = 0.2;
  let depthWrite = false;
  let color = '#ffffff';
  let roughness = 1;

  if (layer === 'skin') {
    opacity = 1;
    depthWrite = true;
    color = '#e8c8b8';
    roughness = 0.4;
  } else if (layer === 'all') {
    opacity = 0.25;
    depthWrite = false;
  } else {
    opacity = 0.02;
    depthWrite = false;
  }

  // Dynamic color based on progress
  const skinColor = new THREE.Color().lerpColors(new THREE.Color('#ffffff'), new THREE.Color('#e0f2fe'), progress);
  const finalColor = layer === 'skin' ? color : `#${skinColor.getHexString()}`;

  return (
    <group ref={groupRef} scale={0.025} position={[0, 0.01, 0.00]} rotation={[-Math.PI / 2, 0, 0]}>
      <Center>
        <EcorcheModel opacity={opacity} depthWrite={depthWrite} color={finalColor} roughness={roughness} />
      </Center>
    </group>
  );
}

function DetailedMannequin({ layer, progress, targetChest, speakers, bedSpeaker }: { layer: string, progress: number, targetChest: [number, number, number], speakers: [number, number, number][], bedSpeaker: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Breathing animation: chest expands slightly. Slower as progress increases.
      const breathSpeed = 2 - progress * 1.5; 
      const breath = Math.sin(clock.elapsedTime * breathSpeed) * 0.002;
      groupRef.current.scale.set(1, 1 + breath * 0.5, 1 + breath);
    }
    
    if (pulseRef.current) {
      // Heartbeat pulse effect
      const pulseSpeed = 12 - (progress * 8);
      const pulse = Math.pow((Math.sin(clock.elapsedTime * pulseSpeed) + 1) / 2, 4) * 0.004;
      pulseRef.current.scale.setScalar(1 + pulse);
    }
  });

  const showSkin = layer === 'all' || layer === 'skin';
  const showNervous = layer === 'all' || layer === 'nervous';
  const showVascular = layer === 'all' || layer === 'vascular';

  return (
    <group ref={groupRef} position={[0, 0.15, 0]}>
      <group ref={pulseRef} rotation={[-Math.PI / 2, 0, 0]} scale={1.1}>
        {/* Internal Layer (Vascular/Nervous/Muscles) */}
        <Model progress={progress} layer={layer} />

        {/* Ghost Skin Layer (Old Model) */}
        <GhostSkin layer={layer} progress={progress} />
      </group>

      {/* Data Streams / Particles */}
      <DataStreams progress={progress} />

      {/* Speaker Waves */}
      {speakers.map((pos, i) => (
        <SpeakerWave key={i} position={pos} target={targetChest} progress={progress} />
      ))}
      <SpeakerWave position={bedSpeaker} target={targetChest} progress={progress} />

      {/* Hotspots */}
      <Hotspot position={[0, 0.1, -0.88]} title="Cortex Cérébral" desc="Ondes Thêta stimulées, favorisant un état méditatif profond." visible={showNervous} />
      <Hotspot position={[-0.06, 0.15, -0.35]} title="Myocarde" desc="Baisse de la fréquence cardiaque et augmentation de la VFC." visible={showVascular} />
      <Hotspot position={[0, 0.05, -0.5]} title="Nerf Vague" desc="Activation parasympathique, réduction immédiate du cortisol." visible={showNervous} />
    </group>
  );
}

function MiniGraph({ color, progress, type, customData, timeline }: { color: string, progress: number, type: 'hrv' | 'stress', customData?: any[] | null, timeline: number }) {
  const points = useMemo(() => {
    let pts = "";
    if (customData && customData.length > 0) {
      const maxVal = 100;
      const visibleData = customData.filter((d: any) => d.time <= timeline);
      const dataToDraw = visibleData.slice(-50);
      
      if (dataToDraw.length === 0) return "";
      
      for (let i = 0; i < 50; i++) {
        const x = i * 2;
        const dataIndex = Math.floor((i / 50) * dataToDraw.length);
        const d = dataToDraw[dataIndex] || dataToDraw[dataToDraw.length - 1];
        const val = d ? d[type] : 0;
        const y = 30 - (val / maxVal) * 30;
        pts += `${x},${y} `;
      }
    } else {
      for (let i = 0; i < 50; i++) {
        const x = i * 2;
        let y = 15;
        if (type === 'hrv') {
          const freq = 0.8 - progress * 0.5;
          y += Math.sin(i * freq) * 10 * (0.3 + progress * 0.7);
        } else {
          const noise = (Math.random() - 0.5) * 20 * (1 - progress);
          y += noise;
        }
        pts += `${x},${y} `;
      }
    }
    return pts;
  }, [progress, type, customData, timeline]);

  return (
    <svg width="100%" height="30" className="mt-2 opacity-80 overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-500" />
    </svg>
  );
}

function HolographicData({ progress, target, customData, timeline }: { progress: number, target: any, customData?: any[] | null, timeline: number }) {
  // Only show holograms in global view
  if (target) return null;

  let hrv = Math.round(42 + (progress * 43));
  let stress = Math.round(85 - (progress * 70));

  if (customData && customData.length > 0) {
    const closest = customData.reduce((prev: any, curr: any) => 
      Math.abs(curr.time - timeline) < Math.abs(prev.time - timeline) ? curr : prev
    );
    hrv = closest.hrv;
    stress = closest.stress;
  }

  return (
    <group>
      <Html position={[0.8, 1.2, -0.6]} center className="pointer-events-none">
        <div className="bg-white/20 backdrop-blur-3xl border border-white/30 p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-56 transition-all duration-500 hover:scale-105">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Variabilité Cardiaque</span>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-4xl font-bold text-gray-900 tabular-nums">{hrv}</span>
            <span className="text-xs font-medium text-gray-500">ms</span>
          </div>
          <MiniGraph color="#3b82f6" progress={progress} type="hrv" customData={customData} timeline={timeline} />
        </div>
      </Html>
      
      <Html position={[-0.8, 0.8, 0.4]} center className="pointer-events-none">
        <div className="bg-white/20 backdrop-blur-3xl border border-white/30 p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-56 transition-all duration-500 hover:scale-105">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Niveau de Stress</span>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-4xl font-bold text-gray-900 tabular-nums">{stress}</span>
            <span className="text-xs font-medium text-gray-500">%</span>
          </div>
          <MiniGraph color="#ef4444" progress={progress} type="stress" customData={customData} timeline={timeline} />
        </div>
      </Html>
    </group>
  );
}

function CameraController({ target, controlsRef }: { target: any, controlsRef: any }) {
  const { camera } = useThree();
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const targetLookAt = useMemo(() => new THREE.Vector3(), []);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevTarget = useRef(target);

  useEffect(() => {
    if (target !== prevTarget.current) {
      setIsTransitioning(true);
      prevTarget.current = target;
    }
  }, [target]);
  
  useFrame(() => {
    if (isTransitioning && controlsRef.current) {
      if (target) {
        targetPos.fromArray(target.position);
        targetLookAt.fromArray(target.lookAt);
      } else {
        // Return to default global view
        targetPos.set(2.5, 2.0, 2.5);
        targetLookAt.set(0, 0, 0);
      }
      
      camera.position.lerp(targetPos, 0.05);
      controlsRef.current.target.lerp(targetLookAt, 0.05);
      
      if (camera.position.distanceTo(targetPos) < 0.05 && controlsRef.current.target.distanceTo(targetLookAt) < 0.05) {
        setIsTransitioning(false);
      }
    }
  });
  return null;
}

// --- 3D Scene Content ---

function SceneContent({ 
  zoomTarget, 
  controlsRef, 
  activeLayer, 
  progress, 
  targetChest, 
  speakers, 
  bedSpeaker, 
  customData, 
  timeline 
}: { 
  zoomTarget: any, 
  controlsRef: any, 
  activeLayer: string, 
  progress: number, 
  targetChest: [number, number, number], 
  speakers: [number, number, number][], 
  bedSpeaker: [number, number, number],
  customData: any[] | null,
  timeline: number
}) {
  return (
    <>
      <color attach="background" args={['#F5F5F7']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-2, 2, -2]} intensity={0.5} />
      <Environment preset="city" />
      
      <CameraController target={zoomTarget} controlsRef={controlsRef} />
      <OrbitControls ref={controlsRef} enablePan={true} minDistance={0.5} maxDistance={10} />
      
      <Bed />
      <DetailedMannequin layer={activeLayer} progress={progress} targetChest={targetChest} speakers={speakers} bedSpeaker={bedSpeaker} />
      <SoundWaves progress={progress} />
      <HolographicData progress={progress} target={zoomTarget} customData={customData} timeline={timeline} />

      {/* Overhead Speakers and their sound pulses */}
      {speakers.map((pos, i) => (
        <group key={`speaker-${i}`}>
          <Speaker position={pos} target={targetChest} />
          <SoundPulse start={pos} target={targetChest} delay={i * 0.6} />
        </group>
      ))}

      {/* Bed Speaker Pulse (coming from below) */}
      <SoundPulse start={bedSpeaker} target={targetChest} delay={0.3} />
    </>
  );
}

// --- Main Component ---

export function Studio3D() {
  const [timeline, setTimeline] = useState(0); // 0 to 40 minutes
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [activeLayer, setActiveLayer] = useState('all');
  const [zoomTarget, setZoomTarget] = useState<any>(null);
  const controlsRef = useRef<any>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const [customData, setCustomData] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (Array.isArray(json)) {
            setCustomData(json);
          } else {
            alert("Le fichier JSON doit contenir un tableau de données.");
          }
        } catch (err) {
          console.error("Invalid JSON file");
          alert("Erreur: Le fichier doit être un JSON valide.");
        }
      };
      reader.readAsText(file);
    }
  };

  const loadExampleData = () => {
    const example = [];
    for (let i = 0; i <= 40; i += 0.5) {
      example.push({
        time: i,
        hrv: Math.round(40 + (i / 40) * 45 + Math.random() * 10),
        stress: Math.max(0, Math.round(85 - (i / 40) * 75 + Math.random() * 10))
      });
    }
    setCustomData(example);
  };

  const progress = timeline / 40; // 0.0 to 1.0

  // Audio Logic
  useEffect(() => {
    if (!isMuted && isPlaying) {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContext();
        oscRef.current = audioCtxRef.current.createOscillator();
        gainRef.current = audioCtxRef.current.createGain();
        
        oscRef.current.connect(gainRef.current);
        gainRef.current.connect(audioCtxRef.current.destination);
        
        oscRef.current.type = 'sine';
        oscRef.current.start();
      }
      
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      // Binaural/Drone effect: frequency drops as progress increases (relaxing)
      const freq = 136.1 - (progress * 30); // 136.1Hz (Ohm) down to ~106Hz
      const vol = 0.05 + (progress * 0.05); // Very soft volume
      
      oscRef.current!.frequency.setTargetAtTime(freq, audioCtxRef.current.currentTime, 0.5);
      gainRef.current!.gain.setTargetAtTime(vol, audioCtxRef.current.currentTime, 0.5);
      
    } else {
      if (gainRef.current && audioCtxRef.current) {
        gainRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.5);
      }
    }
  }, [isPlaying, isMuted, progress]);

  // Playback logic
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeline((prev) => {
          if (prev >= 40) {
            setIsPlaying(false);
            return 40;
          }
          return prev + 0.5; // Increment by 30 seconds
        });
      }, 100); // Speed of playback
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const getPhaseData = (time: number) => {
    if (time < 10) return { title: "Pénétration Biophysique", desc: "Les ondes (40-80Hz) traversent les tissus profonds, initiant un micro-massage cellulaire." };
    if (time < 20) return { title: "Réveil des Mécanorécepteurs", desc: "Conversion de l'énergie mécanique en signaux électriques via les corpuscules de Pacini." };
    if (time < 30) return { title: "Shift Autonomique", desc: "Le Nerf Vague s'active. Le système parasympathique prend le relais sur le stress." };
    return { title: "Cohérence Globale", desc: "Synchronisation cardiaque parfaite et émission d'ondes cérébrales Thêta (récupération profonde)." };
  };

  const phase = getPhaseData(timeline);

  const zoomPresets = {
    global: null,
    brain: { position: [0.5, 0.7, -1.2], lookAt: [0, 0.3, -0.8] },
    heart: { position: [0.4, 0.5, -0.2], lookAt: [-0.08, 0.3, -0.2] },
    cell: { position: [0.2, 0.4, 0.3], lookAt: [0, 0.25, 0.3] },
  };

  const targetChest: [number, number, number] = [0, 0.25, -0.3];
  const speakers: [number, number, number][] = [
    [-1.5, 1.5, -1.5], // Front Left
    [1.5, 1.5, -1.5],  // Front Right
    [0, 1.5, 1.5]      // Rear Center
  ];
  const bedSpeaker: [number, number, number] = [0, -0.1, -0.2]; // Inside the bed

  return (
    <section className="py-24 bg-[#E5E5EA] relative overflow-hidden" id="studio">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-semibold text-[#1D1D1F] tracking-tight mb-4">
            Voyage au Cœur de la Récupération
          </h2>
          <p className="text-xl text-[#86868B]">
            Explorez les mécanismes physiologiques d'une session AudioVitality de 40 minutes.
          </p>
        </div>
      </div>

      <div className="relative w-full h-[700px] bg-white/50 rounded-3xl overflow-hidden shadow-2xl border border-black/5 max-w-7xl mx-auto">
        
        {/* 3D Canvas */}
        <Canvas shadows camera={{ position: [2.5, 2.0, 2.5], fov: 45 }}>
          <Suspense fallback={
            <Html center>
              <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-black/10 text-blue-500 font-semibold flex items-center gap-3 whitespace-nowrap">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Chargement du modèle 3D...
              </div>
            </Html>
          }>
            <SceneContent 
              zoomTarget={zoomTarget}
              controlsRef={controlsRef}
              activeLayer={activeLayer}
              progress={progress}
              targetChest={targetChest}
              speakers={speakers}
              bedSpeaker={bedSpeaker}
              customData={customData}
              timeline={timeline}
            />
          </Suspense>
        </Canvas>

        {/* --- 2D UI OVERLAYS --- */}

        {/* Left Panel */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-auto max-h-[calc(100%-100px)] overflow-y-auto pb-4 hidden md:flex">
          {/* Phase Info */}
          <div className="w-72 bg-white/40 backdrop-blur-2xl p-4 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/40 transition-all duration-500">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700">Analyse en Direct</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">{phase.title}</h3>
            <p className="text-xs text-gray-800 leading-relaxed">{phase.desc}</p>
          </div>

          {/* Data Injection */}
          <div className="w-72 bg-white/40 backdrop-blur-2xl p-3 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-2 px-1">Données Personnelles</div>
            <div className="flex flex-col gap-1">
              <input 
                type="file" 
                accept=".json" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 text-gray-800 hover:bg-white/50"
              >
                <Upload className="w-3.5 h-3.5" /> Importer JSON
              </button>
              <button 
                onClick={loadExampleData}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 text-gray-800 hover:bg-white/50"
              >
                <Activity className="w-3.5 h-3.5" /> Data Démo
              </button>
              {customData && (
                <button 
                  onClick={() => setCustomData(null)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 text-red-600 hover:bg-red-50"
                >
                  <X className="w-3.5 h-3.5" /> Effacer Data
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-auto max-h-[calc(100%-100px)] overflow-y-auto pb-4">
          {/* Audio Toggle */}
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="bg-white/40 backdrop-blur-2xl p-3 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/40 flex items-center justify-center hover:bg-white/60 transition-colors w-12 h-12 self-end"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-gray-700" /> : <Volume2 className="w-5 h-5 text-blue-600" />}
          </button>

          {/* Layers */}
          <div className="bg-white/40 backdrop-blur-2xl p-3 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/40 w-64">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-2 px-1">Couches Anatomiques</div>
            <div className="flex flex-col gap-1">
              {[
                { id: 'all', label: 'Corps Entier', icon: Layers },
                { id: 'nervous', label: 'Système Nerveux', icon: Brain },
                { id: 'vascular', label: 'Système Vasculaire', icon: Heart },
                { id: 'skin', label: 'Tissus & Fascias', icon: Activity },
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => setActiveLayer(l.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                    activeLayer === l.id 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <l.icon className="w-3.5 h-3.5" />
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom Targets */}
          <div className="bg-white/40 backdrop-blur-2xl p-3 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/40 w-64">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-2 px-1">Focus Micro-Cellulaire</div>
            <div className="flex flex-col gap-1">
              <button onClick={() => setZoomTarget(zoomPresets.global)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${!zoomTarget ? 'bg-gray-100/80 text-black shadow-sm' : 'text-gray-800 hover:bg-white/50'}`}>
                <ZoomIn className="w-3.5 h-3.5" /> Vue Globale
              </button>
              <button onClick={() => setZoomTarget(zoomPresets.brain)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${zoomTarget === zoomPresets.brain ? 'bg-gray-100/80 text-black shadow-sm' : 'text-gray-800 hover:bg-white/50'}`}>
                <Brain className="w-3.5 h-3.5" /> Tronc Cérébral
              </button>
              <button onClick={() => setZoomTarget(zoomPresets.heart)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${zoomTarget === zoomPresets.heart ? 'bg-gray-100/80 text-black shadow-sm' : 'text-gray-800 hover:bg-white/50'}`}>
                <Heart className="w-3.5 h-3.5" /> Cohérence Cardiaque
              </button>
              <button onClick={() => setZoomTarget(zoomPresets.cell)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${zoomTarget === zoomPresets.cell ? 'bg-gray-100/80 text-black shadow-sm' : 'text-gray-800 hover:bg-white/50'}`}>
                <Activity className="w-3.5 h-3.5" /> Récepteurs Fasciaux
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Panel: Timeline */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-3xl pointer-events-auto">
          <div className="bg-white/40 backdrop-blur-3xl p-4 md:p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50">
            <div className="flex items-center gap-4 md:gap-6">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {isPlaying ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5 ml-1" fill="currentColor" />}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="text-xl md:text-2xl font-bold text-gray-900 tabular-nums">
                      {Math.floor(timeline)}
                    </span>
                    <span className="text-gray-500 font-medium ml-1 text-xs md:text-sm">min</span>
                  </div>
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-0.5">État du Patient</span>
                    <span className="text-xs font-medium text-gray-700 truncate">
                      {progress < 0.3 ? "Stress Aigu" : progress < 0.7 ? "Transition Parasympathique" : "Cohérence Cardiaque"}
                    </span>
                  </div>
                </div>
                
                <div className="relative h-2 md:h-3 bg-gray-200/50 rounded-full overflow-hidden backdrop-blur-sm">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 transition-all duration-300 ease-out"
                    style={{ width: `${(timeline / 40) * 100}%` }}
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="40" 
                    step="0.1"
                    value={timeline}
                    onChange={(e) => {
                      setTimeline(parseFloat(e.target.value));
                      setIsPlaying(false);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                </div>
                
                <div className="flex justify-between mt-1.5 px-1">
                  <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Début Session</span>
                  <div className="flex gap-4 md:gap-8">
                    <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-tighter">10m</span>
                    <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-tighter">20m</span>
                    <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-tighter">30m</span>
                  </div>
                  <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Récupération Totale</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Bio-Graphs Overlay */}
        <div className="absolute bottom-28 left-4 flex flex-col gap-2 pointer-events-none hidden lg:flex">
          <div className="w-56 bg-white/30 backdrop-blur-xl p-3 rounded-2xl border border-white/30 shadow-xl">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Variabilité Cardiaque (VFC)</span>
              <span className="text-[10px] font-bold text-blue-600">{Math.round(40 + progress * 60)} ms</span>
            </div>
            <div className="h-8 w-full">
              <MiniGraph color="#3b82f6" progress={progress} type="hrv" customData={customData} timeline={timeline} />
            </div>
          </div>
          
          <div className="w-56 bg-white/30 backdrop-blur-xl p-3 rounded-2xl border border-white/30 shadow-xl">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Niveau de Stress (Cortisol)</span>
              <span className="text-[10px] font-bold text-red-500">{Math.round(80 - progress * 60)}%</span>
            </div>
            <div className="h-8 w-full">
              <MiniGraph color="#ef4444" progress={progress} type="stress" customData={customData} timeline={timeline} />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
