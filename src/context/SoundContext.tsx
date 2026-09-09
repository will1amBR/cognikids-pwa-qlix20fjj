import React, { createContext, useContext, useEffect, useState } from 'react'
import { soundEffects } from '@/lib/soundEffects'

interface SoundContextType {
  isMuted: boolean
  toggleMute: () => void
  playPop: () => void
  playStarReward: (starNumber?: number) => void
  playVictory: () => void
  playStarPop: (index?: number) => void
  playConfettiWhoosh: () => void
  playAnimalSound: (animal: string) => void
  playSound: (type: string) => void
}

const SoundContext = createContext<SoundContextType | undefined>(undefined)

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState<boolean>(soundEffects.getMuted())

  useEffect(() => {
    setIsMuted(soundEffects.getMuted())
  }, [])

  const toggleMute = () => {
    const next = !isMuted
    soundEffects.setMuted(next)
    setIsMuted(next)
    if (!next) {
      soundEffects.playPop()
    }
  }

  return (
    <SoundContext.Provider
      value={{
        isMuted,
        toggleMute,
        playPop: () => soundEffects.playPop(),
        playStarReward: (star) => soundEffects.playStarReward(star),
        playVictory: () => soundEffects.playVictory(),
        playStarPop: (index) => soundEffects.playStarPop(index),
        playConfettiWhoosh: () => soundEffects.playConfettiWhoosh(),
        playAnimalSound: (animal) => soundEffects.playAnimalSound(animal),
        playSound: (type: string) => {
          if (type === 'fanfare' || type === 'victory') soundEffects.playVictory()
          else if (type === 'confetti') soundEffects.playConfettiWhoosh()
          else if (type === 'success' || type === 'star') soundEffects.playStarReward(3)
          else soundEffects.playPop()
        },
      }}
    >
      {children}
    </SoundContext.Provider>
  )
}

export const useSound = () => {
  const context = useContext(SoundContext)
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider')
  }
  return context
}
