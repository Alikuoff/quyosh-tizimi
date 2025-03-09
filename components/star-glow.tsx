"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Bloom, EffectComposer } from "@react-three/postprocessing"
import { KernelSize } from "postprocessing"

export default function StarGlow() {
  const effectRef = useRef(null)

  useFrame(({ clock }) => {
    if (effectRef.current) {
      // Subtle animation of bloom intensity
      const time = clock.getElapsedTime()
      effectRef.current.intensity = 0.5 + Math.sin(time * 0.2) * 0.05
    }
  })

  return (
    <EffectComposer multisampling={8}>
      <Bloom
        ref={effectRef}
        kernelSize={KernelSize.SMALL}
        luminanceThreshold={0.85}
        luminanceSmoothing={0.5}
        intensity={0.5}
      />
    </EffectComposer>
  )
}

