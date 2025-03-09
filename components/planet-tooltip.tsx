"use client"

import { useState, useEffect } from "react"
import { useThree } from "@react-three/fiber"
import type { Vector3 } from "three"

interface PlanetTooltipProps {
  planetName: string
  position: Vector3
  visible: boolean
}

export default function PlanetTooltip({ planetName, position, visible }: PlanetTooltipProps) {
  const { camera, size } = useThree()
  const [screenPosition, setScreenPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!visible) return

    // Convert 3D position to screen coordinates
    const vector = position.clone()
    vector.project(camera)

    // Convert to CSS coordinates
    const x = (vector.x * 0.5 + 0.5) * size.width
    const y = (-(vector.y * 0.5) + 0.5) * size.height

    setScreenPosition({ x, y })
  }, [position, camera, size, visible])

  if (!visible) return null

  return (
    <div
      className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${screenPosition.x}px`,
        top: `${screenPosition.y - 30}px`,
      }}
    >
      <div className="bg-black/80 text-white px-3 py-1.5 rounded-md text-sm font-bold whitespace-nowrap">
        {planetName}
      </div>
    </div>
  )
}

