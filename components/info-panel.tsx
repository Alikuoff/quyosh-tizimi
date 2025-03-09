"use client"

import { useState, useEffect } from "react"
import { usePlanetContext } from "@/context/planet-context"
import { useTimeContext } from "@/context/time-context"
import { X, ZoomIn, ZoomOut, Calendar } from "lucide-react"

export default function InfoPanel() {
  const { activePlanet, focusedPlanet, setFocusedPlanet } = usePlanetContext()
  const { currentTime } = useTimeContext()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (activePlanet) {
      setIsVisible(true)
    }
  }, [activePlanet])

  if (!activePlanet || !isVisible) return null

  const isFocused = focusedPlanet?.id === activePlanet.id

  const handleFocusToggle = () => {
    if (isFocused) {
      setFocusedPlanet(null)
    } else {
      setFocusedPlanet(activePlanet)
    }
  }

  return (
    <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 bg-black/80 backdrop-blur-md p-4 rounded-lg border border-white/20 text-white">
      <div className="flex justify-between items-start mb-3">
        <h2 className="text-2xl font-bold">{activePlanet.name}</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleFocusToggle}
            className="text-white/70 hover:text-white bg-white/10 p-1.5 rounded-md"
            title={isFocused ? "Umumiy ko'rinishga qaytish" : "Yaqinlashtirish"}
          >
            {isFocused ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white/70 hover:text-white bg-white/10 p-1.5 rounded-md"
            title="Yopish"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-xs text-white/70 flex items-center mb-1">
          <Calendar size={14} className="mr-1" />
          <span>
            Vaqt: {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
          </span>
        </div>

        <p className="text-sm text-white/90">{activePlanet.description}</p>

        <div className="grid grid-cols-2 gap-3 text-sm mt-3">
          <div className="bg-white/10 p-2 rounded">
            <p className="text-white/60 text-xs">Radiusi:</p>
            <p className="font-medium">{activePlanet.radius} (masshtablangan)</p>
          </div>
          <div className="bg-white/10 p-2 rounded">
            <p className="text-white/60 text-xs">Orbital tezligi:</p>
            <p className="font-medium">{activePlanet.orbitalSpeed}</p>
          </div>
          <div className="bg-white/10 p-2 rounded">
            <p className="text-white/60 text-xs">Aylanish tezligi:</p>
            <p className="font-medium">{activePlanet.rotationSpeed}</p>
          </div>
          <div className="bg-white/10 p-2 rounded">
            <p className="text-white/60 text-xs">Quyoshdan masofasi:</p>
            <p className="font-medium">{activePlanet.orbitalRadius} (masshtablangan)</p>
          </div>
        </div>

        {activePlanet.id === "earth" && (
          <div className="bg-blue-900/30 p-3 rounded-lg mt-2">
            <p className="text-xs text-white/80">
              Yer - bizning uyimiz, Quyosh tizimidagi yagona hayot mavjud bo'lgan sayyora. Uning atmosferasi azot va
              kisloroddan iborat bo'lib, suyuq suv mavjudligi hayot uchun muhim sharoit yaratadi.
            </p>
          </div>
        )}

        {activePlanet.hasRings && (
          <div className="bg-amber-900/30 p-3 rounded-lg mt-2">
            <p className="text-xs text-white/80">
              Saturn halqalari asosan muz va chang zarrachalaridan iborat bo'lib, ular sayyora atrofida aylanadi.
              Halqalar kengligi 282,000 km ga yetadi, lekin qalinligi atigi 10 metrdan kam.
            </p>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-white/60 mb-1">Boshqaruv:</p>
          <div className="flex items-center space-x-2 text-xs">
            <span className="bg-white/10 px-2 py-1 rounded">Sichqoncha</span>
            <span className="text-white/40">-</span>
            <span>Aylanish va masshtablash</span>
          </div>
          <div className="flex items-center space-x-2 text-xs mt-1">
            <span className="bg-white/10 px-2 py-1 rounded">Bosish</span>
            <span className="text-white/40">-</span>
            <span>Sayyora haqida ma'lumot</span>
          </div>
        </div>
      </div>
    </div>
  )
}

