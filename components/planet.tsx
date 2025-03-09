"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"
import type { Mesh, Group } from "three"
import { usePlanetContext } from "@/context/planet-context"

interface PlanetProps {
  planet: {
    id: string
    name: string
    radius: number
    position: [number, number, number]
    rotationSpeed: number
    orbitalSpeed: number
    orbitalRadius: number
    texture: string
    emissive?: boolean
    hasRings?: boolean
    description: string
  }
  onClick: () => void
}

export default function Planet({ planet, onClick }: PlanetProps) {
  const { id, radius, position, rotationSpeed, orbitalSpeed, orbitalRadius, emissive, hasRings } = planet

  const meshRef = useRef<Mesh>(null)
  const orbitRef = useRef<Group>(null)
  const ringsRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const { activePlanet } = usePlanetContext()

  // Load texture with error handling
  const { texture: texturePath } = planet

  // Use useTexture with fallback for the planet texture
  const planetTexture = useTexture(texturePath)

  // Load rings texture unconditionally
  const ringsTexture = useTexture(
    hasRings ? "/placeholder.svg?height=512&width=512&text=Rings" : "/placeholder.svg?height=1&width=1&text=",
  )

  // Highlight active planet
  const isActive = activePlanet?.id === id

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Self rotation
      meshRef.current.rotation.y += rotationSpeed
    }

    if (orbitRef.current && orbitalSpeed > 0) {
      // Orbital rotation
      orbitRef.current.rotation.y = clock.getElapsedTime() * orbitalSpeed
    }

    if (ringsRef.current) {
      // Keep rings rotation aligned
      ringsRef.current.rotation.x = -0.5
    }
  })

  return (
    <>
      {/* Orbital path (except for sun) */}
      {orbitalRadius > 0 && (
        <mesh rotation-x={-Math.PI / 2}>
          <ringGeometry args={[orbitalRadius - 0.1, orbitalRadius + 0.1, 64]} />
          <meshBasicMaterial color="#ffffff" opacity={0.1} transparent />
        </mesh>
      )}

      {/* Orbital group */}
      <group ref={orbitRef}>
        {orbitalRadius > 0 ? (
          <group position={[orbitalRadius, 0, 0]}>
            <mesh
              ref={meshRef}
              onClick={onClick}
              onPointerOver={() => setHovered(true)}
              onPointerOut={() => setHovered(false)}
            >
              <sphereGeometry args={[radius, 32, 32]} />
              <meshStandardMaterial
                map={planetTexture}
                emissive={emissive ? "#ffcc00" : "#000000"}
                emissiveIntensity={emissive ? 0.5 : 0}
                metalness={0.2}
                roughness={0.8}
                color={hovered || isActive ? "#ffffff" : "#cccccc"}
              />
            </mesh>

            {/* Saturn rings */}
            {hasRings && (
              <mesh ref={ringsRef}>
                <ringGeometry args={[radius + 0.5, radius + 3, 32]} />
                <meshStandardMaterial
                  map={ringsTexture}
                  transparent
                  opacity={0.8}
                  side={2}
                  color="#ffcc88" // Add a color in case texture doesn't load properly
                />
              </mesh>
            )}
          </group>
        ) : (
          // Sun (at center)
          <mesh
            ref={meshRef}
            onClick={onClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
          >
            <sphereGeometry args={[radius, 32, 32]} />
            <meshStandardMaterial
              map={planetTexture}
              emissive={emissive ? "#ffcc00" : "#000000"}
              emissiveIntensity={emissive ? 0.5 : 0}
              metalness={0.2}
              roughness={0.8}
              color={hovered || isActive ? "#ffffff" : "#cccccc"}
            />
          </mesh>
        )}
      </group>
    </>
  )
}

