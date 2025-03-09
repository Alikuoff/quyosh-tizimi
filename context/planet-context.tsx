"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Planet = {
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

type PlanetContextType = {
  planets: Planet[]
  setPlanets: (planets: Planet[]) => void
  activePlanet: Planet | null
  setActivePlanet: (planet: Planet | null) => void
  focusedPlanet: Planet | null
  setFocusedPlanet: (planet: Planet | null) => void
}

const PlanetContext = createContext<PlanetContextType | undefined>(undefined)

export function PlanetProvider({ children }: { children: ReactNode }) {
  const [planets, setPlanets] = useState<Planet[]>([])
  const [activePlanet, setActivePlanet] = useState<Planet | null>(null)
  const [focusedPlanet, setFocusedPlanet] = useState<Planet | null>(null)

  return (
    <PlanetContext.Provider
      value={{
        planets,
        setPlanets,
        activePlanet,
        setActivePlanet,
        focusedPlanet,
        setFocusedPlanet,
      }}
    >
      {children}
    </PlanetContext.Provider>
  )
}

export function usePlanetContext() {
  const context = useContext(PlanetContext)
  if (context === undefined) {
    throw new Error("usePlanetContext must be used within a PlanetProvider")
  }
  return context
}

