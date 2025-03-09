"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, type Points, PointsMaterial } from "three"

interface StarMapProps {
  count?: number
  radius?: number
  constellations?: boolean
}

// Update the generateStarPositions function to create more diverse and realistic stars
function generateStarPositions(count: number, radius: number) {
  const positions = []
  const colors = []
  const sizes = []

  // Create a more realistic distribution of star types based on the Hertzsprung-Russell diagram
  // O, B stars (blue/white): 0.1%
  // A stars (blue-white): 0.6%
  // F stars (white): 3%
  // G stars (yellow-white, like our Sun): 7.5%
  // K stars (orange): 12%
  // M stars (red): 76.8%

  for (let i = 0; i < count; i++) {
    // Random position in sphere with improved distribution
    const theta = 2 * Math.PI * Math.random()
    const phi = Math.acos(2 * Math.random() - 1)

    // Use cube root for more uniform distribution in sphere
    // Add slight clustering effect for more natural star patterns
    const cluster = Math.random() < 0.3 ? 0.7 : 1.0 // 30% chance of being in a cluster
    const r = radius * Math.pow(Math.random(), 1 / 3) * cluster

    const x = r * Math.sin(phi) * Math.cos(theta)
    const y = r * Math.sin(phi) * Math.sin(theta)
    const z = r * Math.cos(phi)

    positions.push(x, y, z)

    // Random star color based on scientific star distribution
    const starType = Math.random()

    if (starType > 0.999) {
      // O stars (blue) - very rare, very bright
      const b = 0.95 + Math.random() * 0.05
      const g = b * (0.6 + Math.random() * 0.2)
      const r = g * (0.5 + Math.random() * 0.1)
      colors.push(r, g, b)
      sizes.push(Math.random() * 3.5 + 2.5) // Largest stars
    } else if (starType > 0.993) {
      // B stars (blue-white) - rare, very bright
      const b = 0.9 + Math.random() * 0.1
      const g = b * (0.8 + Math.random() * 0.1)
      const r = g * (0.7 + Math.random() * 0.1)
      colors.push(r, g, b)
      sizes.push(Math.random() * 3 + 2) // Large stars
    } else if (starType > 0.987) {
      // A stars (white with blue tinge)
      const b = 0.9 + Math.random() * 0.1
      const g = b * (0.95 + Math.random() * 0.05)
      const r = g * (0.9 + Math.random() * 0.1)
      colors.push(r, g, b)
      sizes.push(Math.random() * 2.5 + 1.8)
    } else if (starType > 0.957) {
      // F stars (white)
      const g = 0.95 + Math.random() * 0.05
      const r = g * (0.95 + Math.random() * 0.05)
      const b = g * (0.9 + Math.random() * 0.1)
      colors.push(r, g, b)
      sizes.push(Math.random() * 2 + 1.5)
    } else if (starType > 0.882) {
      // G stars (yellow-white, like our Sun)
      const r = 0.95 + Math.random() * 0.05
      const g = r * (0.9 + Math.random() * 0.1)
      const b = g * (0.75 + Math.random() * 0.15)
      colors.push(r, g, b)
      sizes.push(Math.random() * 1.8 + 1.2)
    } else if (starType > 0.762) {
      // K stars (orange)
      const r = 0.9 + Math.random() * 0.1
      const g = r * (0.6 + Math.random() * 0.2)
      const b = g * (0.5 + Math.random() * 0.1)
      colors.push(r, g, b)
      sizes.push(Math.random() * 1.5 + 1)
    } else {
      // M stars (red) - most common, least bright
      const r = 0.85 + Math.random() * 0.15
      const g = r * (0.3 + Math.random() * 0.3)
      const b = g * (0.3 + Math.random() * 0.2)
      colors.push(r, g, b)
      sizes.push(Math.random() * 1 + 0.5) // Smallest stars
    }
  }

  return { positions, colors, sizes }
}

// Update constellation data with more traditional Uzbek constellations and improved positioning
const constellationData = [
  // Ursa Major (Big Dipper)
  {
    name: "Katta Ayiq (Yetti Qaroqchi)",
    stars: [
      [150, 120, -60],
      [135, 97, -67],
      [120, 90, -75],
      [105, 82, -67],
      [97, 97, -52],
      [112, 112, -45],
      [127, 127, -52],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 0],
    ],
    color: 0x6688cc, // Blue
  },
  // Orion
  {
    name: "Orion (Mergan)",
    stars: [
      [-90, 45, 150],
      [-75, 60, 135],
      [-82, 75, 142],
      [-67, 67, 150],
      [-78, 30, 142],
      [-60, 15, 150],
      [-78, -30, 142],
      [-95, 10, 130],
      [-60, 10, 130],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [0, 4],
      [4, 5],
      [5, 6],
      [4, 7],
      [7, 8],
      [8, 5],
    ],
    color: 0x66aadd, // Light blue
  },
  // Cassiopeia
  {
    name: "Kassiopeya",
    stars: [
      [30, 135, -120],
      [45, 150, -112],
      [60, 157, -97],
      [75, 142, -90],
      [90, 127, -97],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
    color: 0xcc6688, // Pinkish
  },
  // Cygnus (Swan)
  {
    name: "Oqqush",
    stars: [
      [120, 180, 60],
      [135, 165, 45],
      [150, 150, 30],
      [165, 135, 15],
      [180, 120, 0],
      [142, 142, 30],
      [157, 157, 30],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [2, 5],
      [2, 6],
    ],
    color: 0x88aaee, // Light blue-purple
  },
  // Scorpius
  {
    name: "Chayon",
    stars: [
      [-150, -90, 60],
      [-140, -100, 50],
      [-130, -110, 45],
      [-120, -120, 40],
      [-110, -130, 38],
      [-100, -140, 40],
      [-90, -150, 45],
      [-85, -165, 50],
      [-95, -145, 35],
      [-85, -155, 30],
      [-75, -165, 25],
      [-70, -175, 20],
      [-65, -185, 15],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [5, 8],
      [8, 9],
      [9, 10],
      [10, 11],
      [11, 12],
    ],
    color: 0xdd6644, // Reddish
  },
  // Pleaides
  {
    name: "Hulkar",
    stars: [
      [200, 100, 200],
      [210, 105, 205],
      [195, 110, 210],
      [205, 115, 195],
      [215, 103, 215],
      [193, 107, 205],
      [203, 112, 212],
    ],
    lines: [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 4],
      [2, 5],
      [3, 6],
    ],
    color: 0x88ccee, // Light blue
  },
]

export default function StarMap({ count = 10000, radius = 400, constellations = true }: StarMapProps) {
  const starsRef = useRef<Points>(null)
  const constellationPointsRef = useRef<Points>(null)
  const constellationLinesRef = useRef<any[]>([])

  // Generate random stars
  const { positions, colors, sizes } = useMemo(() => {
    return generateStarPositions(count, radius)
  }, [count, radius])

  // Generate constellations
  const constellationPoints = useMemo(() => {
    if (!constellations) return { positions: [], colors: [], sizes: [] }

    const positions: number[] = []
    const colors: number[] = []
    const sizes: number[] = []

    constellationData.forEach((constellation) => {
      constellation.stars.forEach((star) => {
        positions.push(star[0], star[1], star[2])
        // Constellation stars are brighter
        colors.push(1, 1, 1)
        sizes.push(3)
      })
    })

    return { positions, colors, sizes }
  }, [constellations])

  // Generate constellation lines
  const constellationLines = useMemo(() => {
    if (!constellations) return []

    const lines: { positions: number[]; color: Color }[] = []

    constellationData.forEach((constellation) => {
      constellation.lines.forEach((line) => {
        const startStar = constellation.stars[line[0]]
        const endStar = constellation.stars[line[1]]

        lines.push({
          positions: [startStar[0], startStar[1], startStar[2], endStar[0], endStar[1], endStar[2]],
          color: new Color(constellation.color || 0x4466cc),
        })
      })
    })

    return lines
  }, [constellations])

  // Create a material for star twinkling effect
  const starTwinkleMaterial = useMemo(() => {
    return new PointsMaterial({
      size: 1,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: AdditiveBlending,
    })
  }, [])

  // Create stars geometry
  const starsGeometry = useMemo(() => {
    const geometry = new BufferGeometry()
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3))
    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3))
    geometry.setAttribute("size", new Float32BufferAttribute(sizes, 1))
    return geometry
  }, [positions, colors, sizes])

  // Create constellation points geometry
  const constellationPointsGeometry = useMemo(() => {
    const geometry = new BufferGeometry()
    geometry.setAttribute("position", new Float32BufferAttribute(constellationPoints.positions, 3))
    geometry.setAttribute("color", new Float32BufferAttribute(constellationPoints.colors, 3))
    geometry.setAttribute("size", new Float32BufferAttribute(constellationPoints.sizes, 1))
    return geometry
  }, [constellationPoints])

  // Create stars material
  const starsMaterial = useMemo(() => {
    return new PointsMaterial({
      size: 1,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: AdditiveBlending,
    })
  }, [])

  // Create constellation points material
  const constellationPointsMaterial = useMemo(() => {
    return new PointsMaterial({
      size: 3,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: AdditiveBlending,
    })
  }, [])

  // Slow rotation animation
  useFrame(({ clock }) => {
    // Animate stars for subtle twinkling effect
    if (starsRef.current && starTwinkleMaterial) {
      const time = clock.getElapsedTime()

      // Subtle opacity pulsing for twinkling effect
      starTwinkleMaterial.opacity = 0.7 + Math.sin(time * 0.5) * 0.1

      // Very slow rotation for the star field
      starsRef.current.rotation.y = time * 0.01
      starsRef.current.rotation.x = Math.sin(time * 0.005) * 0.01
    }

    if (starsRef.current) {
      starsRef.current.rotation.y = clock.getElapsedTime() * 0.01
    }

    if (constellationPointsRef.current) {
      constellationPointsRef.current.rotation.y = clock.getElapsedTime() * 0.01
    }

    constellationLinesRef.current.forEach((line) => {
      if (line) {
        line.rotation.y = clock.getElapsedTime() * 0.01
      }
    })
  })

  return (
    <>
      {/* Random stars background */}
      <points ref={starsRef} geometry={starsGeometry} material={starTwinkleMaterial} />

      {/* Constellation stars (brighter) */}
      {constellations && (
        <points
          ref={constellationPointsRef}
          geometry={constellationPointsGeometry}
          material={constellationPointsMaterial}
        />
      )}

      {/* Constellation lines */}
      {constellations &&
        constellationLines.map((line, i) => (
          <line key={i} ref={(el) => (constellationLinesRef.current[i] = el)}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={line.positions.length / 3}
                array={new Float32Array(line.positions)}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color={line.color} transparent opacity={0.4} />
          </line>
        ))}
    </>
  )
}

