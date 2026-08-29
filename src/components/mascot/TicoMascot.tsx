import React from 'react'

interface MascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  mood?: 'happy' | 'talking' | 'celebrating' | 'listening' | 'waving'
  className?: string
  animate?: boolean
}

export const TicoMascot: React.FC<MascotProps> = ({
  size = 'md',
  mood = 'happy',
  className = '',
  animate = true,
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${sizeClasses[size]} ${
        animate ? 'animate-float' : ''
      } ${className}`}
      aria-label="Tico o Tucano, mascote do CogniKids"
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient
            id="ticoBody"
            x1="20"
            y1="20"
            x2="100"
            y2="100"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1E293B" />
            <stop offset="1" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient
            id="ticoBeak"
            x1="60"
            y1="30"
            x2="115"
            y2="60"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FF7A45" />
            <stop offset="0.6" stopColor="#FFB703" />
            <stop offset="1" stopColor="#06D6A0" />
          </linearGradient>
          <linearGradient
            id="ticoChest"
            x1="40"
            y1="45"
            x2="80"
            y2="95"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#FFF2EB" />
          </linearGradient>
        </defs>

        {/* Tail feathers */}
        <path d="M22 80 C10 88 8 102 18 108 C26 102 30 92 28 82 Z" fill="#FF7A45" />
        <path d="M18 84 C8 94 12 108 22 112 C28 104 30 96 26 86 Z" fill="#4EA8DE" />

        {/* Main Body */}
        <circle cx="55" cy="65" r="38" fill="url(#ticoBody)" />

        {/* White Chest */}
        <path
          d="M42 45 C58 42 74 54 75 74 C75 88 62 98 48 98 C36 98 32 86 35 72 C37 60 38 48 42 45 Z"
          fill="url(#ticoChest)"
        />

        {/* Huge friendly Toucan Beak */}
        <path
          d="M62 40 C78 30 102 32 114 48 C116 54 110 64 96 68 C80 72 62 66 58 54 Z"
          fill="url(#ticoBeak)"
        />
        {/* Beak highlight line */}
        <path
          d="M66 42 C80 36 98 38 108 48"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
        {/* Beak tip accent */}
        <path d="M106 44 C112 48 114 54 110 58 C106 58 104 52 106 44 Z" fill="#0F172A" />

        {/* Big sparkling Eye with blue ring */}
        <circle cx="50" cy="46" r="12" fill="#4EA8DE" />
        <circle cx="50" cy="46" r="9" fill="#06D6A0" opacity="0.3" />
        <circle cx="50" cy="46" r="8" fill="#0F172A" />
        {/* Catchlights */}
        <circle cx="47" cy="43" r="3.2" fill="#FFFFFF" />
        <circle cx="53" cy="49" r="1.5" fill="#FFFFFF" />

        {/* Rosy toddler cheek */}
        <circle cx="40" cy="62" r="6" fill="#FF7A45" opacity="0.4" />

        {/* Cute small wing */}
        <path d="M32 64 C25 72 26 86 38 90 C42 85 44 75 38 68 Z" fill="#334155" />

        {/* Expressions based on mood */}
        {mood === 'celebrating' && (
          <g>
            {/* Tiny party hat */}
            <polygon points="46,18 36,36 56,36" fill="#FFB703" />
            <circle cx="46" cy="17" r="3" fill="#E63946" />
          </g>
        )}

        {mood === 'talking' && (
          /* Sound waves near beak */
          <g stroke="#FF7A45" strokeWidth="2.5" strokeLinecap="round" fill="none">
            <path d="M116 42 C120 46 120 54 116 58" />
            <path d="M121 38 C127 44 127 58 121 64" />
          </g>
        )}

        {mood === 'listening' && (
          /* Cute headphone accent */
          <g>
            <path
              d="M42 34 C46 26 58 26 62 34"
              stroke="#06D6A0"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="40" cy="42" r="5" fill="#06D6A0" />
          </g>
        )}
      </svg>
    </div>
  )
}
