"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { PointMaterial, Points } from "@react-three/drei"
import { Color, AdditiveBlending } from "three"
import { useMemo } from "react"

interface NebulaProps {
  count?: number
  radius?: number
  color?: string
  position?: [number, number, number]
  scale?: number
}

export default function Nebula({
  count = 500,
  radius = 100,
  color = "#4466aa",
  position = [250, 100, -400],
  scale = 200,
}: NebulaProps) {
  const pointsRef = useRef<any>()

  // Generate nebula points with more natural clustering
  const points = useMemo(() => {
    const points = new Float32Array(count * 3)
    const baseColor = new Color(color)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Create clustered distribution for more natural gas cloud appearance
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = radius * Math.pow(Math.random(), 0.5) // Square root for denser center

      // Apply some noise/variation to create filaments and structures
      const noise = Math.sin(theta * 5) * Math.cos(phi * 3) * 0.2

      points[i3] = r * Math.sin(phi) * Math.cos(theta) * (1 + noise)
      points[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * (1 + noise)
      points[i3 + 2] = r * Math.cos(phi) * (1 + noise)
    }

    return points
  }, [count, radius, color])

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const time = clock.getElapsedTime() * 0.1

      // Subtle rotation and pulsing
      pointsRef.current.rotation.y = time * 0.05
      pointsRef.current.rotation.x = Math.sin(time * 0.03) * 0.1

      // Subtle scale pulsing
      const pulse = Math.sin(time) * 0.05 + 1
      pointsRef.current.scale.set(pulse, pulse, pulse)
    }
  })

  return (
    <group position={position} scale={scale}>
      <Points ref={pointsRef} positions={points} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={color}
          size={5}
          sizeAttenuation={true}
          depthWrite={false}
          blending={AdditiveBlending}
          opacity={0.35}
        />
      </Points>
    </group>
  )
}

