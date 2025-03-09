"use client"

import { useRef, useState, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { MeshDistortMaterial, Sphere, MeshWobbleMaterial, Html } from "@react-three/drei"
import { type Mesh, DoubleSide, Color, AdditiveBlending, type Group, ShaderMaterial } from "three"

interface BlackHoleProps {
  radius: number
  position: [number, number, number]
  rotationSpeed: number
  onClick: () => void
}

export default function BlackHole({ radius, position, rotationSpeed, onClick }: BlackHoleProps) {
  const blackHoleRef = useRef<Mesh>(null)
  const accretionDiskRef = useRef<Mesh>(null)
  const effectRef = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)

  // Enhance the black hole shader for more realistic gravitational lensing
  const gravitationalLensingMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
      fragmentShader: `
      uniform float time;
      varying vec2 vUv;
      
      float rand(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float r = length(p);
        
        // Enhanced event horizon effect
        float eventHorizon = smoothstep(0.3, 0.4, r);
        
        // Stronger gravitational lensing near the center
        float distortion = 1.0 / (r * 6.0 + 0.05);
        
        // Accretion disk glow
        float diskGlow = smoothstep(0.4, 0.5, r) * smoothstep(0.9, 0.7, r);
        
        // Varying colors based on distance from center
        vec3 color = mix(
          vec3(0.0, 0.0, 0.0), // Black at center
          mix(
            vec3(0.8, 0.3, 0.0) * diskGlow * 2.0, // Orange-red accretion disk
            vec3(0.1, 0.3, 0.6) * distortion, // Blue-ish lensing effect
            smoothstep(0.5, 0.7, r)
          ),
          eventHorizon
        );
        
        // Add some stars/points around the black hole
        if (rand(vUv + vec2(time * 0.01)) > 0.997) {
          color += vec3(1.0, 1.0, 1.0) * 0.8;
        }
        
        // Add subtle time variation
        color += vec3(0.05, 0.02, 0.0) * sin(time * 0.2 + r * 10.0) * diskGlow;
        
        // Fade out at the edges
        float alpha = smoothstep(1.0, 0.6, r);
        
        gl_FragColor = vec4(color, alpha * 0.8);
      }
    `,
      transparent: true,
      blending: AdditiveBlending,
      side: DoubleSide,
      depthWrite: false,
    })
  }, [])

  // Animation for the black hole and its accretion disk
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()

    if (blackHoleRef.current) {
      blackHoleRef.current.rotation.z = time * rotationSpeed
    }

    if (accretionDiskRef.current) {
      accretionDiskRef.current.rotation.x = Math.PI / 2 // Keep horizontal
      accretionDiskRef.current.rotation.z = time * rotationSpeed * 2 // Rotate faster than the black hole
    }

    if (effectRef.current) {
      effectRef.current.rotation.z = -time * rotationSpeed * 0.5 // Rotate opposite to the black hole
    }

    // Update shader time uniform
    if (gravitationalLensingMaterial && gravitationalLensingMaterial.uniforms) {
      gravitationalLensingMaterial.uniforms.time.value = time
    }
  })

  // Update the accretion disk for more realism
  return (
    <group position={position}>
      {/* Event horizon (the black sphere) */}
      <mesh
        ref={blackHoleRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[radius * 0.4, 64, 64]} />
        <meshBasicMaterial color="black" />
      </mesh>

      {/* Accretion disk - more detailed with inner and outer parts */}
      <mesh ref={accretionDiskRef}>
        <ringGeometry args={[radius * 0.5, radius * 2, 128]} />
        <meshStandardMaterial
          side={DoubleSide}
          emissive={new Color("#ff3300")}
          emissiveIntensity={3}
          color="#ff7700"
          opacity={0.9}
          transparent
        />
      </mesh>

      {/* Inner bright ring - more intense */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.41, radius * 0.5, 128]} />
        <meshBasicMaterial color="#ffaa00" side={DoubleSide} transparent opacity={0.95} blending={AdditiveBlending} />
      </mesh>

      {/* Additional inner hot spot */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.4, radius * 0.45, 128]} />
        <meshBasicMaterial color="#ffffff" side={DoubleSide} transparent opacity={0.8} blending={AdditiveBlending} />
      </mesh>

      {/* Gravitational lensing effect - enhanced */}
      <group ref={effectRef}>
        <mesh>
          <sphereGeometry args={[radius * 3, 64, 64]} />
          <primitive object={gravitationalLensingMaterial} attach="material" />
        </mesh>
      </group>

      {/* Distortion effect around the black hole - more intense */}
      <Sphere args={[radius * 1.2, 64, 64]}>
        <MeshDistortMaterial color="#000000" transparent opacity={0.5} distort={0.8} speed={2.5} factor={1.5} />
      </Sphere>

      {/* Outer glow effect - more subtle */}
      <Sphere args={[radius * 3.5, 32, 32]}>
        <MeshWobbleMaterial color="#000033" factor={0.15} speed={1.2} transparent opacity={0.08} />
      </Sphere>

      {/* Name hover label */}
      {hovered && (
        <Html position={[0, radius + 1, 0]} center distanceFactor={15}>
          <div className="bg-black/80 text-white px-2 py-1 rounded-md text-sm font-bold whitespace-nowrap">
            Qora tuynuk
          </div>
        </Html>
      )}
    </group>
  )
}

