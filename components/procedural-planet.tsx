"use client"

import { useRef, useState, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import type { Mesh, Group } from "three"
import { usePlanetContext } from "@/context/planet-context"
import { createProceduralPlanetTexture } from "@/lib/create-planet-textures"
import { Html } from "@react-three/drei"

interface PlanetProps {
  planet: {
    id: string
    name: string
    radius: number
    position: [number, number, number]
    realPosition?: [number, number, number]
    rotationSpeed: number
    orbitalSpeed: number
    orbitalRadius?: number
    texture: string
    emissive?: boolean
    hasRings?: boolean
    description: string
    parentId?: string // Added for satellites
  }
  onClick: () => void
}

// Update the planet colors for more vibrant appearance
const planetColors = {
  sun: "#ffdd20", // Brighter yellow
  mercury: "#b5a794", // Slightly brighter
  venus: "#e8cc9f", // More golden
  earth: "#3091dc", // Brighter blue
  mars: "#d1541e", // More vibrant red
  jupiter: "#f0b578", // Brighter orange/tan
  saturn: "#f0cb88", // Brighter gold
  uranus: "#a6d7e9", // Brighter cyan
  neptune: "#4a6add", // Brighter blue
  moon: "#c8c8c8", // Light gray for the moon
}

export default function ProceduralPlanet({ planet, onClick }: PlanetProps) {
  const {
    id,
    radius,
    rotationSpeed,
    orbitalSpeed,
    orbitalRadius = 0,
    emissive,
    hasRings,
    realPosition,
    parentId,
  } = planet

  const meshRef = useRef<Mesh>(null)
  const orbitRef = useRef<Group>(null)
  const satelliteOrbitRef = useRef<Group>(null)
  const ringsRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const { activePlanet, focusedPlanet, setFocusedPlanet } = usePlanetContext()

  // Create procedural textures
  const planetTexture = useMemo(() => {
    // Determine what type of planet to generate
    let type: "rocky" | "gas" | "sun" | "rings" | "earth" | "mars" | "venus" | "mercury" = "rocky"

    if (id === "sun") {
      type = "sun"
    } else if (id === "jupiter" || id === "saturn" || id === "uranus" || id === "neptune") {
      type = "gas"
    } else if (id === "moon") {
      type = "rocky" // Use rocky type for the moon
    } else {
      // Use specific planet type if available
      if (id === "earth") type = "earth"
      else if (id === "mars") type = "mars"
      else if (id === "venus") type = "venus"
      else if (id === "mercury") type = "mercury"
      else type = "rocky"
    }

    return createProceduralPlanetTexture({
      baseColor: planetColors[id as keyof typeof planetColors] || "#ffffff",
      type,
      noiseIntensity: id === "moon" ? 0.7 : 0.5, // More noise for the moon to show craters
      detail: id === "moon" ? 5 : 4, // More detail for the moon
    })
  }, [id])

  // Create rings texture if needed
  const ringsTexture = useMemo(() => {
    if (!hasRings) return null
    return createProceduralPlanetTexture({
      baseColor: "#e0c090",
      type: "rings",
      detail: 6,
    })
  }, [hasRings])

  // Highlight active planet
  const isActive = activePlanet?.id === id
  const isFocused = focusedPlanet?.id === id

  // Handle planet click
  const handleClick = () => {
    onClick()
    // If already focused, unfocus
    if (isFocused) {
      setFocusedPlanet(null)
    }
  }

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Self rotation
      meshRef.current.rotation.y += rotationSpeed
    }

    // Only apply orbital rotation if we're not using real positions
    if (orbitRef.current && orbitalSpeed > 0 && !realPosition && !parentId) {
      // Orbital rotation for planets around the sun
      orbitRef.current.rotation.y = clock.getElapsedTime() * orbitalSpeed

      // Ensure planets stay in their orbits and don't overlap
      if (meshRef.current && orbitalRadius > 0) {
        const planetPosition = meshRef.current.position.clone()
        const distanceFromCenter = planetPosition.length()

        // If planet is too close to the center, push it back to its orbit
        if (distanceFromCenter < orbitalRadius * 0.9) {
          planetPosition.normalize().multiplyScalar(orbitalRadius)
          meshRef.current.position.copy(planetPosition)
        }
      }
    }

    // For satellites (like the moon)
    if (satelliteOrbitRef.current && parentId) {
      // Orbital rotation for satellites around their parent planet
      satelliteOrbitRef.current.rotation.y = clock.getElapsedTime() * orbitalSpeed
    }

    if (ringsRef.current && hasRings) {
      // Keep rings rotation aligned
      ringsRef.current.rotation.x = -0.5
    }

    // Store planet ID in userData for camera targeting
    if (meshRef.current) {
      meshRef.current.userData.planetId = id
    }
  })

  // If this is a satellite (like the moon)
  if (parentId) {
    return (
      <group position={planet.position}>
        <group ref={satelliteOrbitRef}>
          <group position={[orbitalRadius, 0, 0]}>
            <mesh
              ref={meshRef}
              onClick={handleClick}
              onPointerOver={() => setHovered(true)}
              onPointerOut={() => setHovered(false)}
            >
              <sphereGeometry args={[radius, 64, 64]} />
              <meshStandardMaterial
                map={planetTexture}
                metalness={0.05}
                roughness={0.8} // More rough for the moon
                color={hovered || isActive ? "#ffffff" : "#ffffff"}
              />
            </mesh>
            {hovered && (
              <Html position={[0, radius + 0.5, 0]} center distanceFactor={15}>
                <div className="bg-black/80 text-white px-2 py-1 rounded-md text-sm font-bold whitespace-nowrap">
                  {planet.name}
                </div>
              </Html>
            )}
          </group>
        </group>
      </group>
    )
  }

  // For regular planets
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
          <group position={realPosition || [orbitalRadius, 0, 0]}>
            {/* Update the material properties in the mesh component for planets */}
            {/* Inside the return statement, update the mesh for planets (not sun) */}
            <mesh
              ref={meshRef}
              onClick={handleClick}
              onPointerOver={() => setHovered(true)}
              onPointerOut={() => setHovered(false)}
            >
              <sphereGeometry args={[radius, 64, 64]} />
              <meshStandardMaterial
                map={planetTexture}
                emissive={emissive ? "#ffcc00" : "#000000"}
                emissiveIntensity={emissive ? 0.5 : 0}
                metalness={0.05} // Lower metalness for more natural look
                roughness={0.4} // Lower roughness for more reflective surface
                color={hovered || isActive ? "#ffffff" : "#ffffff"}
                envMapIntensity={0.8} // Enhance environment reflections
              />
            </mesh>
            {hovered && (
              <Html position={[0, radius + 1, 0]} center distanceFactor={15}>
                <div className="bg-black/80 text-white px-2 py-1 rounded-md text-sm font-bold whitespace-nowrap">
                  {planet.name}
                </div>
              </Html>
            )}

            {/* Saturn rings */}
            {hasRings && (
              <mesh ref={ringsRef}>
                <ringGeometry args={[radius + 0.5, radius + 3, 128]} />
                <meshStandardMaterial
                  map={ringsTexture}
                  transparent
                  opacity={0.9}
                  side={2}
                  color="#e0c090" // Fallback color
                />
              </mesh>
            )}

            {/* Add atmospheric glow for planets with atmosphere */}
            {(id === "earth" || id === "venus") && (
              <>
                {/* Inner atmosphere */}
                <mesh scale={[radius * 1.03, radius * 1.03, radius * 1.03]}>
                  <sphereGeometry args={[1, 32, 32]} />
                  <meshBasicMaterial color={id === "earth" ? "#5f8fcf" : "#e8d3a0"} transparent opacity={0.2} />
                </mesh>

                {/* Outer atmosphere glow */}
                <mesh scale={[radius * 1.08, radius * 1.08, radius * 1.08]}>
                  <sphereGeometry args={[1, 32, 32]} />
                  <meshBasicMaterial color={id === "earth" ? "#a0c8ff" : "#f0e0b0"} transparent opacity={0.1} />
                </mesh>
              </>
            )}
            {/* Add subtle glow to gas giants */}
            {(id === "jupiter" || id === "saturn" || id === "uranus" || id === "neptune") && (
              <mesh scale={[radius * 1.05, radius * 1.05, radius * 1.05]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial color={planetColors[id as keyof typeof planetColors]} transparent opacity={0.08} />
              </mesh>
            )}
          </group>
        ) : (
          // Sun (at center)
          <>
            {/* Update the sun mesh material properties */}
            <mesh
              ref={meshRef}
              onClick={handleClick}
              onPointerOver={() => setHovered(true)}
              onPointerOut={() => setHovered(false)}
            >
              <sphereGeometry args={[radius, 64, 64]} />
              <meshStandardMaterial
                map={planetTexture}
                emissive={"#ffdd20"} // Brighter emissive color
                emissiveIntensity={1.5} // Increased intensity
                metalness={0.0} // No metalness for sun
                roughness={0.1} // Very smooth for glowing appearance
                color={hovered || isActive ? "#ffffff" : "#ffdd20"}
              />
            </mesh>
            {hovered && (
              <Html position={[0, radius + 1, 0]} center distanceFactor={15}>
                <div className="bg-black/80 text-white px-2 py-1 rounded-md text-sm font-bold whitespace-nowrap">
                  {planet.name}
                </div>
              </Html>
            )}

            {/* Update the sun glow effects */}
            <>
              {/* Inner glow */}
              <mesh scale={[radius * 1.1, radius * 1.1, radius * 1.1]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial color="#fff5e6" transparent opacity={0.3} />
              </mesh>

              {/* Middle glow */}
              <mesh scale={[radius * 1.2, radius * 1.2, radius * 1.2]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial color="#ffcc00" transparent opacity={0.2} />
              </mesh>

              {/* Outer corona */}
              <mesh scale={[radius * 1.5, radius * 1.5, radius * 1.5]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial color="#ff8800" transparent opacity={0.05} />
              </mesh>
            </>
          </>
        )}
      </group>
    </>
  )
}

