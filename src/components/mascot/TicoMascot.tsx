import React, { useEffect, useState } from 'react'
import { ChildTicoEquipped, ticoGamificationService } from '@/services/ticoGamification'

export interface MascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  mood?: 'happy' | 'talking' | 'celebrating' | 'listening' | 'waving'
  emotion?: 'happy' | 'talking' | 'celebrating' | 'listening' | 'waving'
  className?: string
  animate?: boolean
  equipped?: ChildTicoEquipped
  childId?: string
  showEquipped?: boolean // default true
}

export const TicoMascot: React.FC<MascotProps> = ({
  size = 'md',
  mood,
  emotion,
  className = '',
  animate = true,
  equipped: propEquipped,
  childId,
  showEquipped = true,
}) => {
  const activeMood = mood || emotion || 'happy'
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
  }

  // Active equipped items
  const [equipped, setEquipped] = useState<ChildTicoEquipped>(() => {
    if (propEquipped) return propEquipped
    if (!showEquipped) return {}
    return ticoGamificationService.getEquippedSync(childId)
  })

  // Listen to wardrobe changes in realtime
  useEffect(() => {
    if (propEquipped) {
      setEquipped(propEquipped)
      return
    }
    if (!showEquipped) {
      setEquipped({})
      return
    }

    const updateEquipped = () => {
      setEquipped(ticoGamificationService.getEquippedSync(childId))
    }
    updateEquipped()

    const handleCustomEvent = (e: any) => {
      if (!childId || e.detail?.childId === childId) {
        updateEquipped()
      }
    }

    window.addEventListener('cognikids_tico_updated', handleCustomEvent)
    return () => {
      window.removeEventListener('cognikids_tico_updated', handleCustomEvent)
    }
  }, [propEquipped, childId, showEquipped])

  const hat = equipped.hat
  const glasses = equipped.glasses
  const shoes = equipped.shoes
  const accessory = equipped.accessory

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
        className="w-full h-full drop-shadow-md overflow-visible"
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
          {/* Gold shimmer gradient for crown/medal */}
          <linearGradient id="goldShimmer" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#FDE047" />
            <stop offset="0.5" stopColor="#F59E0B" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>
        </defs>

        {/* Tail feathers */}
        <path d="M22 80 C10 88 8 102 18 108 C26 102 30 92 28 82 Z" fill="#FF7A45" />
        <path d="M18 84 C8 94 12 108 22 112 C28 104 30 96 26 86 Z" fill="#4EA8DE" />

        {/* Accessory: Super Hero Cape (Behind Body) */}
        {accessory === 'acc_cape_super' && (
          <g className="animate-pulse">
            <path
              d="M30 60 C15 70 8 98 12 114 C22 112 36 94 40 76 Z"
              fill="#EF4444"
              stroke="#B91C1C"
              strokeWidth="1.5"
            />
            <path d="M12 114 C18 116 26 112 32 106" stroke="#FDE047" strokeWidth="2" fill="none" />
          </g>
        )}

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

        {/* --- CUSTOMIZABLE WARDROBE ITEMS --- */}

        {/* 1. GLASSES OVER EYE & BEAK */}
        {glasses === 'glasses_star' && (
          <g>
            {/* Star frame around eye */}
            <polygon
              points="50,34 54,43 64,43 56,49 59,59 50,53 41,59 44,49 36,43 46,43"
              fill="#F59E0B"
              stroke="#D97706"
              strokeWidth="1.5"
              opacity="0.95"
            />
            {/* Bridge towards beak */}
            <path d="M58 46 L68 47" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="50" cy="46" r="4" fill="#FEF08A" opacity="0.4" />
          </g>
        )}

        {glasses === 'glasses_sun_cool' && (
          <g>
            {/* Cool Wayfarer/Aviator dark sunglasses */}
            <path
              d="M40 40 C48 38 58 38 60 46 C60 52 50 56 42 54 C36 52 36 44 40 40 Z"
              fill="#0F172A"
              stroke="#334155"
              strokeWidth="2"
            />
            <path d="M42 42 L56 46" stroke="#94A3B8" strokeWidth="1.5" opacity="0.7" />
            <path d="M60 45 L68 46" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {glasses === 'glasses_nerd_round' && (
          <g>
            <circle cx="50" cy="46" r="13" fill="none" stroke="#0284C7" strokeWidth="3" />
            <path d="M62 46 L69 46" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
            {/* Soft glass shine */}
            <path
              d="M44 40 C48 38 54 40 56 44"
              stroke="#BAE6FD"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        )}

        {glasses === 'glasses_swimming' && (
          <g>
            <rect
              x="36"
              y="38"
              width="28"
              height="16"
              rx="8"
              fill="#06D6A0"
              fillOpacity="0.4"
              stroke="#059669"
              strokeWidth="2.5"
            />
            <path
              d="M36 46 C30 46 25 44 24 43"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path d="M64 46 L70 46" stroke="#059669" strokeWidth="2.5" />
          </g>
        )}

        {/* 2. ACCESSORIES (Pescoço / Peito) */}
        {accessory === 'acc_bowtie_green' && (
          <g>
            {/* Bowtie on neck */}
            <polygon points="46,75 58,68 58,82" fill="#10B981" />
            <polygon points="46,75 34,68 34,82" fill="#10B981" />
            <circle cx="46" cy="75" r="3.5" fill="#047857" />
          </g>
        )}

        {accessory === 'acc_medal_gold' && (
          <g>
            {/* Ribbon */}
            <path d="M42 66 L47 80 L52 66" stroke="#3B82F6" strokeWidth="3" fill="none" />
            {/* Medal */}
            <circle
              cx="47"
              cy="84"
              r="7"
              fill="url(#goldShimmer)"
              stroke="#B45309"
              strokeWidth="1.5"
            />
            <polygon
              points="47,79 48.5,82.5 52,82.5 49,85 50,88 47,86 44,88 45,85 42,82.5 45.5,82.5"
              fill="#FFFFFF"
            />
          </g>
        )}

        {accessory === 'acc_scarf_winter' && (
          <g>
            {/* Cozy Orange Scarf wrapped around neck */}
            <path
              d="M38 68 C44 65 58 66 64 71 C62 76 44 78 38 74 Z"
              fill="#F97316"
              stroke="#C2410C"
              strokeWidth="1.5"
            />
            <path
              d="M48 72 L46 88 C46 90 52 90 53 88 L55 72"
              fill="#EA580C"
              stroke="#C2410C"
              strokeWidth="1"
            />
            {/* Scarf fringes */}
            <line x1="47" y1="88" x2="47" y2="91" stroke="#FDE047" strokeWidth="1.5" />
            <line x1="50" y1="88" x2="50" y2="91" stroke="#FDE047" strokeWidth="1.5" />
            <line x1="53" y1="88" x2="53" y2="91" stroke="#FDE047" strokeWidth="1.5" />
          </g>
        )}

        {/* 3. SHOES / CALÇADOS */}
        {shoes === 'shoes_sneakers_blue' && (
          <g>
            {/* Left foot shoe */}
            <ellipse cx="44" cy="103" rx="9" ry="5" fill="#3B82F6" />
            <ellipse cx="44" cy="105" rx="8" ry="2" fill="#FFFFFF" />
            <path d="M38 102 L44 102" stroke="#FFFFFF" strokeWidth="1.5" />
            {/* Right foot shoe */}
            <ellipse cx="62" cy="103" rx="9" ry="5" fill="#3B82F6" />
            <ellipse cx="62" cy="105" rx="8" ry="2" fill="#FFFFFF" />
            <path d="M56 102 L62 102" stroke="#FFFFFF" strokeWidth="1.5" />
          </g>
        )}

        {shoes === 'shoes_sneakers_red' && (
          <g>
            <ellipse cx="44" cy="103" rx="9" ry="5" fill="#EF4444" />
            <ellipse cx="44" cy="105" rx="8" ry="2" fill="#FFFFFF" />
            <ellipse cx="62" cy="103" rx="9" ry="5" fill="#EF4444" />
            <ellipse cx="62" cy="105" rx="8" ry="2" fill="#FFFFFF" />
          </g>
        )}

        {shoes === 'shoes_golden_boots' && (
          <g>
            {/* Magic golden boots with stars */}
            <rect x="36" y="96" width="14" height="10" rx="3" fill="url(#goldShimmer)" />
            <ellipse cx="44" cy="105" rx="8" ry="3" fill="#D97706" />
            <rect x="54" y="96" width="14" height="10" rx="3" fill="url(#goldShimmer)" />
            <ellipse cx="62" cy="105" rx="8" ry="3" fill="#D97706" />
            <circle cx="43" cy="101" r="1.5" fill="#FFFFFF" />
            <circle cx="61" cy="101" r="1.5" fill="#FFFFFF" />
          </g>
        )}

        {shoes === 'shoes_rollers' && (
          <g>
            {/* Purple roller skates with wheels */}
            <rect x="37" y="97" width="14" height="6" rx="2" fill="#8B5CF6" />
            <circle cx="39" cy="106" r="2.5" fill="#F43F5E" />
            <circle cx="49" cy="106" r="2.5" fill="#F43F5E" />
            <rect x="55" y="97" width="14" height="6" rx="2" fill="#8B5CF6" />
            <circle cx="57" cy="106" r="2.5" fill="#F43F5E" />
            <circle cx="67" cy="106" r="2.5" fill="#F43F5E" />
          </g>
        )}

        {/* 4. HATS (Chapéus no topo da cabeça) */}
        {hat === 'hat_cap_orange' && (
          <g>
            {/* Baseball cap forward/side */}
            <path
              d="M34 32 C34 18 58 16 64 26 C66 28 66 32 64 34 C54 36 38 36 34 32 Z"
              fill="#FF7A45"
            />
            {/* Visor pointing towards beak */}
            <path
              d="M58 26 C68 24 82 28 88 33 C80 37 66 34 60 33 Z"
              fill="#EA580C"
              stroke="#C2410C"
              strokeWidth="1"
            />
            {/* Button on top */}
            <circle cx="48" cy="20" r="2.5" fill="#FFFFFF" />
          </g>
        )}

        {hat === 'hat_crown_gold' && (
          <g className="animate-bounce" style={{ animationDuration: '3s' }}>
            <polygon
              points="34,30 38,15 46,24 54,12 62,24 70,15 74,30"
              fill="url(#goldShimmer)"
              stroke="#B45309"
              strokeWidth="1.5"
            />
            {/* Jewels on crown */}
            <circle cx="38" cy="15" r="2" fill="#EF4444" />
            <circle cx="54" cy="12" r="2.5" fill="#3B82F6" />
            <circle cx="70" cy="15" r="2" fill="#10B981" />
            <circle cx="54" cy="26" r="2" fill="#EF4444" />
          </g>
        )}

        {hat === 'hat_party_cone' && (
          <g>
            <polygon points="52,10 38,32 66,32" fill="#EC4899" stroke="#BE185D" strokeWidth="1.5" />
            <circle cx="52" cy="9" r="3.5" fill="#FBBF24" />
            {/* Stripes */}
            <line x1="43" y1="24" x2="61" y2="24" stroke="#67E8F9" strokeWidth="2.5" />
            <line x1="47" y1="18" x2="57" y2="18" stroke="#FDE047" strokeWidth="2" />
          </g>
        )}

        {hat === 'hat_detective' && (
          <g>
            {/* Sherlock / Detective brown hat */}
            <ellipse cx="52" cy="30" rx="20" ry="4" fill="#78350F" />
            <path
              d="M36 30 C36 18 68 18 68 30 Z"
              fill="#92400E"
              stroke="#78350F"
              strokeWidth="1.5"
            />
            <rect x="40" y="27" width="24" height="3" fill="#D97706" />
          </g>
        )}

        {hat === 'hat_chef' && (
          <g>
            {/* Chef Toque */}
            <path
              d="M40 26 C36 16 48 10 52 14 C56 8 68 12 66 22 C72 20 74 28 66 28 L38 28 Z"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />
            <rect
              x="38"
              y="26"
              width="28"
              height="5"
              fill="#F8FAFC"
              stroke="#CBD5E1"
              strokeWidth="1"
            />
          </g>
        )}

        {/* Fallback Expressions based on mood if no hat equipped */}
        {!hat && activeMood === 'celebrating' && (
          <g>
            <polygon points="46,18 36,36 56,36" fill="#FFB703" />
            <circle cx="46" cy="17" r="3" fill="#E63946" />
          </g>
        )}

        {activeMood === 'talking' && (
          /* Sound waves near beak */
          <g stroke="#FF7A45" strokeWidth="2.5" strokeLinecap="round" fill="none">
            <path d="M116 42 C120 46 120 54 116 58" />
            <path d="M121 38 C127 44 127 58 121 64" />
          </g>
        )}

        {activeMood === 'listening' && (
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
export default TicoMascot
