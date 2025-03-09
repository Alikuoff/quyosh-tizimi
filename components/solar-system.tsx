"use client"

import { Suspense, useState, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import PlanetSystem from "./planet-system"
import InfoPanel from "./info-panel"
import TimeControls from "./time-controls"
import LoadingScreen from "./loading-screen"
import { PlanetProvider } from "@/context/planet-context"
import { TimeProvider } from "@/context/time-context"
import CameraControls from "./camera-controls"
import StarMap from "./star-map"
// Import the new StarGlow component
import StarGlow from "./star-glow"
// Import the Nebula component
import Nebula from "./nebula"
export default function SolarSystem() {
  const [isLoading, setIsLoading] = useState(true)
  const controlsRef = useRef(null)

  return (
    <TimeProvider>
      <PlanetProvider>
        <div className="relative w-full h-full">
          {isLoading && <LoadingScreen />}
          <Canvas
            camera={{ position: [0, 25, 60], fov: 45 }} // Adjusted position and FOV for better view
            onCreated={() => setTimeout(() => setIsLoading(false), 2000)}
            fallback={
              <div className="flex h-full w-full items-center justify-center bg-black">
                <p className="text-white text-lg">Loading 3D Scene...</p>
              </div>
            }
          >
            <color attach="background" args={["#000000"]} /> {/* Pure black background */}
            <ambientLight intensity={0.3} /> {/* Reduced ambient light for more contrast */}
            <pointLight position={[0, 0, 0]} intensity={5} color="#ffdd20" /> {/* Increased sun brightness */}
            <directionalLight position={[50, 30, 50]} intensity={0.4} color="#ffffff" />{" "}
            {/* Reduced directional light */}
            <hemisphereLight args={["#bde8ff", "#2b3c5a", 0.2]} /> {/* Reduced hemisphere light */}
            <Suspense fallback={null}>
              {/* Add the StarMap component with more stars for better background */}
              <StarMap count={30000} radius={700} constellations={true} />
              <Nebula position={[350, 150, -450]} color="#4466aa" scale={250} />
              <Nebula position={[-500, -200, -300]} color="#aa66aa" scale={200} />
              <Nebula position={[-300, 400, 100]} color="#5588aa" scale={150} />
              <PlanetSystem />
              <StarGlow />
            </Suspense>
            <CameraControls />
          </Canvas>
          <TimeControls />
          <InfoPanel />
        </div>
      </PlanetProvider>
    </TimeProvider>
  )
}

