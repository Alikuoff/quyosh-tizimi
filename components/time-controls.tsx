"use client"

import { useState, useEffect } from "react"
import { useTimeContext } from "@/context/time-context"
import { Calendar, Clock, Play, Pause, SkipForward, SkipBack, RefreshCw } from "lucide-react"

export default function TimeControls() {
  const { currentTime, setCurrentTime, isPlaying, setIsPlaying, timeSpeed, setTimeSpeed } = useTimeContext()

  const [dateString, setDateString] = useState("")
  const [timeString, setTimeString] = useState("")

  // Format date and time strings when currentTime changes
  useEffect(() => {
    const date = new Date(currentTime)
    setDateString(date.toLocaleDateString())
    setTimeString(date.toLocaleTimeString())
  }, [currentTime])

  // Handle time progression when playing
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentTime((prevTime) => {
        const newTime = new Date(prevTime)
        // Add hours based on timeSpeed
        newTime.setHours(newTime.getHours() + timeSpeed)
        return newTime
      })
    }, 100) // Update every 100ms

    return () => clearInterval(interval)
  }, [isPlaying, timeSpeed, setCurrentTime])

  // Handle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  // Reset to current time
  const resetToNow = () => {
    setCurrentTime(new Date())
  }

  // Skip forward/backward
  const skipTime = (days: number) => {
    setCurrentTime((prevTime) => {
      const newTime = new Date(prevTime)
      newTime.setDate(newTime.getDate() + days)
      return newTime
    })
  }

  // Change simulation speed
  const changeSpeed = (newSpeed: number) => {
    setTimeSpeed(newSpeed)
  }

  return (
    <div className="absolute top-4 left-4 right-4 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 bg-black/80 backdrop-blur-md p-3 rounded-lg border border-white/20 text-white">
      <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 md:space-x-4">
        <div className="flex items-center space-x-2">
          <Calendar size={16} className="text-white/70" />
          <span className="text-sm font-medium">{dateString}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Clock size={16} className="text-white/70" />
          <span className="text-sm font-medium">{timeString}</span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => skipTime(-30)}
            className="p-1.5 rounded-md bg-white/10 hover:bg-white/20"
            title="30 kun orqaga"
          >
            <SkipBack size={16} />
          </button>

          <button
            onClick={() => skipTime(-1)}
            className="p-1.5 rounded-md bg-white/10 hover:bg-white/20"
            title="1 kun orqaga"
          >
            <SkipBack size={14} />
          </button>

          <button onClick={togglePlay} className="p-1.5 rounded-md bg-white/10 hover:bg-white/20">
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <button
            onClick={() => skipTime(1)}
            className="p-1.5 rounded-md bg-white/10 hover:bg-white/20"
            title="1 kun oldinga"
          >
            <SkipForward size={14} />
          </button>

          <button
            onClick={() => skipTime(30)}
            className="p-1.5 rounded-md bg-white/10 hover:bg-white/20"
            title="30 kun oldinga"
          >
            <SkipForward size={16} />
          </button>

          <button
            onClick={resetToNow}
            className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 ml-1"
            title="Hozirgi vaqtga qaytish"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-white/70">Tezlik:</span>
          <div className="flex space-x-1">
            {[1, 6, 24, 72].map((speed) => (
              <button
                key={speed}
                onClick={() => changeSpeed(speed)}
                className={`px-2 py-1 text-xs rounded-md ${timeSpeed === speed ? "bg-blue-600" : "bg-white/10 hover:bg-white/20"}`}
              >
                {speed === 1 ? "1 soat" : speed === 24 ? "1 kun" : `${speed} soat`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

