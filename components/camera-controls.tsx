"use client"

import { useRef, useEffect } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Vector3 } from "three"
import { usePlanetContext } from "@/context/planet-context"

export default function CameraControls() {
  const { camera, scene } = useThree()
  const controlsRef = useRef<any>(null)
  const { activePlanet, focusedPlanet, setFocusedPlanet } = usePlanetContext()

  // Animation state
  const targetPosition = useRef(new Vector3(0, 20, 50))
  const targetLookAt = useRef(new Vector3(0, 0, 0))
  const animating = useRef(false)
  const animationProgress = useRef(0)
  const startPosition = useRef(new Vector3())
  const startLookAt = useRef(new Vector3())

  // Update when focused planet changes
  useEffect(() => {
    if (!focusedPlanet) {
      // Reset to default view
      animating.current = true
      animationProgress.current = 0
      startPosition.current.copy(camera.position)
      startLookAt.current.copy(controlsRef.current.target)
      targetPosition.current.set(0, 20, 50)
      targetLookAt.current.set(0, 0, 0)
      return
    }

    // Find the planet mesh in the scene
    scene.traverse((object) => {
      if (object.userData.planetId === focusedPlanet.id) {
        // Start animation
        animating.current = true
        animationProgress.current = 0
        startPosition.current.copy(camera.position)
        startLookAt.current.copy(controlsRef.current.target)

        // Calculate target position based on planet position and radius
        const planetPosition = object.getWorldPosition(new Vector3())
        const zoomDistance = focusedPlanet.radius * 5

        // Position camera at a distance from the planet
        const direction = new Vector3(0.5, 0.5, 1).normalize()
        targetPosition.current.copy(planetPosition).add(direction.multiplyScalar(zoomDistance))
        targetLookAt.current.copy(planetPosition)
      }
    })
  }, [focusedPlanet, camera, scene])

  // Handle animation
  useFrame(() => {
    if (animating.current) {
      animationProgress.current += 0.02

      if (animationProgress.current >= 1) {
        animating.current = false
        animationProgress.current = 1
      }

      // Smooth animation using easing
      const t = easeInOutCubic(animationProgress.current)

      // Update camera position
      camera.position.lerpVectors(startPosition.current, targetPosition.current, t)

      // Update controls target
      controlsRef.current.target.lerpVectors(startLookAt.current, targetLookAt.current, t)
      controlsRef.current.update()
    }
  })

  // Easing function for smooth animation
  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={2}
      maxDistance={120}
      autoRotate={!focusedPlanet}
      autoRotateSpeed={0.05}
      enableDamping
      dampingFactor={0.1}
    />
  )
}

