"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type TimeContextType = {
  currentTime: Date
  setCurrentTime: (time: Date) => void
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  timeSpeed: number
  setTimeSpeed: (speed: number) => void
}

const TimeContext = createContext<TimeContextType | undefined>(undefined)

export function TimeProvider({ children }: { children: ReactNode }) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [timeSpeed, setTimeSpeed] = useState<number>(24) // Default: 24 hours per step

  return (
    <TimeContext.Provider
      value={{
        currentTime,
        setCurrentTime,
        isPlaying,
        setIsPlaying,
        timeSpeed,
        setTimeSpeed,
      }}
    >
      {children}
    </TimeContext.Provider>
  )
}

export function useTimeContext() {
  const context = useContext(TimeContext)
  if (context === undefined) {
    throw new Error("useTimeContext must be used within a TimeProvider")
  }
  return context
}

