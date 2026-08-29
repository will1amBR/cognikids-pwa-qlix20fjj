import React, { createContext, useContext, useEffect, useState } from 'react'
import { soundEffects } from '@/lib/soundEffects'

interface SoundContextType {
  isMuted: boolean
  toggleMute: () => void
  playPop: () => void
  playStarReward: (starNumber?: number) => void
  playVictory: () => void
  playAnimalSound: (animal: string) => void
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
        playAnimalSound: (animal) => soundEffects.playAnimalSound(animal),
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
