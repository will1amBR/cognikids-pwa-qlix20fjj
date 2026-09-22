import React from 'react'

export interface ItemIllustrationProps {
  itemId: string
  fallbackEmoji?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  altText?: string
}

const SIZE_CLASSES = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-32 h-32 sm:w-36 sm:h-36',
  xl: 'w-40 h-40 sm:w-48 sm:h-48',
}

/**
 * Rich colorful SVG illustrations for animals, fruits, dinosaurs and game objects.
 * Designed directly in SVG with rounded kid-friendly shapes, warm shading and expressive eyes.
 * Includes emoji fallback if an unknown item ID is requested.
 */
export const ItemIllustration: React.FC<ItemIllustrationProps> = ({
  itemId,
  fallbackEmoji = '⭐',
  className = '',
  size = 'lg',
  altText,
}) => {
  const normalizedId = (itemId || '').toLowerCase().trim()
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.lg

  switch (normalizedId) {
    // ================= ANIMAIS DA FAZENDA / SELVA ================= //
    case 'leao':
    case 'lion':
    case 'leon':
    case 'löwe':
      return (
        <svg
          viewBox="0 0 160 160"
          className={`${sizeClass} ${className}`}
          role="img"
          aria-label={altText || 'Leão'}
        >
          {/* Big Fluffy Mane */}
          <circle cx="80" cy="80" r="70" fill="#F59E0B" />
          <circle cx="40" cy="50" r="24" fill="#D97706" />
          <circle cx="120" cy="50" r="24" fill="#D97706" />
          <circle cx="30" cy="90" r="24" fill="#D97706" />
          <circle cx="130" cy="90" r="24" fill="#D97706" />
          <circle cx="50" cy="125" r="24" fill="#D97706" />
          <circle cx="110" cy="125" r="24" fill="#D97706" />
          <circle cx="80" cy="135" r="22" fill="#D97706" />
          {/* Ears */}
          <circle cx="46" cy="46" r="14" fill="#FBBF24" />
          <circle cx="46" cy="46" r="8" fill="#F87171" />
          <circle cx="114" cy="46" r="14" fill="#FBBF24" />
          <circle cx="114" cy="46" r="8" fill="#F87171" />
          {/* Head */}
          <circle cx="80" cy="84" r="46" fill="#FDE68A" />
          {/* Cheeks */}
          <ellipse cx="68" cy="96" rx="14" ry="10" fill="#FEF3C7" />
          <ellipse cx="92" cy="96" rx="14" ry="10" fill="#FEF3C7" />
          {/* Eyes */}
          <circle cx="64" cy="76" r="6" fill="#1E293B" />
          <circle cx="62" cy="74" r="2" fill="#FFFFFF" />
          <circle cx="96" cy="76" r="6" fill="#1E293B" />
          <circle cx="94" cy="74" r="2" fill="#FFFFFF" />
          {/* Nose & Mouth */}
          <polygon points="80,88 72,80 88,80" fill="#B45309" />
          <path
            d="M 80 88 L 80 96 M 80 96 Q 74 104 68 96 M 80 96 Q 86 104 92 96"
            stroke="#92400E"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          {/* Whiskers */}
          <line
            x1="44"
            y1="92"
            x2="28"
            y2="90"
            stroke="#78350F"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="44"
            y1="98"
            x2="26"
            y2="102"
            stroke="#78350F"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="116"
            y1="92"
            x2="132"
            y2="90"
            stroke="#78350F"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="116"
            y1="98"
            x2="134"
            y2="102"
            stroke="#78350F"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      )

    case 'vaca':
    case 'cow':
    case 'kuh':
    case 'vache':
      return (
        <svg
          viewBox="0 0 160 160"
          className={`${sizeClass} ${className}`}
          role="img"
          aria-label={altText || 'Vaca'}
        >
          {/* Horns */}
          <path
            d="M 44 46 Q 32 20 48 24"
            stroke="#F59E0B"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 116 46 Q 128 20 112 24"
            stroke="#F59E0B"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
          />
          {/* Ears */}
          <ellipse
            cx="32"
            cy="62"
            rx="18"
            ry="10"
            transform="rotate(-20 32 62)"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="2"
          />
          <ellipse cx="32" cy="62" rx="10" ry="5" transform="rotate(-20 32 62)" fill="#F472B6" />
          <ellipse
            cx="128"
            cy="62"
            rx="18"
            ry="10"
            transform="rotate(20 128 62)"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="2"
          />
          <ellipse cx="128" cy="62" rx="10" ry="5" transform="rotate(20 128 62)" fill="#F472B6" />
          {/* Head */}
          <ellipse
            cx="80"
            cy="74"
            rx="46"
            ry="42"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="3"
          />
          {/* Spots */}
          <path d="M 52 46 Q 66 38 74 52 Q 68 68 50 62 Z" fill="#1E293B" />
          <path d="M 106 46 Q 118 42 122 56 Q 112 70 98 62 Z" fill="#1E293B" />
          <circle cx="80" cy="38" r="7" fill="#1E293B" />
          {/* Eyes */}
          <circle cx="62" cy="70" r="5.5" fill="#1E293B" />
          <circle cx="60" cy="68" r="1.8" fill="#FFFFFF" />
          <circle cx="98" cy="70" r="5.5" fill="#1E293B" />
          <circle cx="96" cy="68" r="1.8" fill="#FFFFFF" />
          {/* Large Snout */}
          <ellipse
            cx="80"
            cy="106"
            rx="36"
            ry="24"
            fill="#FBCFE8"
            stroke="#F472B6"
            strokeWidth="2.5"
          />
          {/* Nostrils */}
          <ellipse cx="68" cy="104" rx="5" ry="7" fill="#BE185D" />
          <ellipse cx="92" cy="104" rx="5" ry="7" fill="#BE185D" />
          {/* Sweet Smile */}
          <path
            d="M 72 118 Q 80 125 88 118"
            stroke="#BE185D"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )

    case 'pato':
    case 'duck':
    case 'ente':
    case 'canard':
      return (
        <svg
          viewBox="0 0 160 160"
          className={`${sizeClass} ${className}`}
          role="img"
          aria-label={altText || 'Pato'}
        >
          {/* Water ripples */}
          <ellipse cx="80" cy="138" rx="60" ry="12" fill="#38BDF8" opacity="0.6" />
          {/* Body */}
          <ellipse cx="80" cy="98" rx="46" ry="32" fill="#FBBF24" />
          {/* Wing */}
          <path d="M 64 96 Q 84 84 94 104 Q 74 116 64 96 Z" fill="#F59E0B" />
          {/* Head */}
          <circle cx="80" cy="56" r="32" fill="#FBBF24" />
          {/* Cute Tuft of feathers */}
          <path
            d="M 80 24 Q 84 14 88 24 Q 92 14 94 28"
            stroke="#F59E0B"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          {/* Cheeks */}
          <circle cx="66" cy="62" r="6" fill="#F87171" opacity="0.5" />
          <circle cx="94" cy="62" r="6" fill="#F87171" opacity="0.5" />
          {/* Big Eyes */}
          <circle cx="68" cy="52" r="6" fill="#1E293B" />
          <circle cx="66" cy="50" r="2" fill="#FFFFFF" />
          <circle cx="92" cy="52" r="6" fill="#1E293B" />
          <circle cx="90" cy="50" r="2" fill="#FFFFFF" />
          {/* Big Orange Bill */}
          <path
            d="M 60 68 Q 80 62 100 68 Q 80 88 60 68 Z"
            fill="#FB923C"
            stroke="#EA580C"
            strokeWidth="2"
          />
          <circle cx="74" cy="68" r="1.5" fill="#C2410C" />
          <circle cx="86" cy="68" r="1.5" fill="#C2410C" />
        </svg>
      )

    case 'gato':
    case 'cat':
    case 'katze':
    case 'chat':
      return (
        <svg
          viewBox="0 0 160 160"
          className={`${sizeClass} ${className}`}
          role="img"
          aria-label={altText || 'Gato'}
        >
          {/* Pointy Ears */}
          <polygon points="34,64 42,22 74,48" fill="#FB923C" />
          <polygon points="40,58 46,30 68,48" fill="#FCA5A5" />
          <polygon points="126,64 118,22 86,48" fill="#FB923C" />
          <polygon points="120,58 114,30 92,48" fill="#FCA5A5" />
          {/* Head */}
          <ellipse cx="80" cy="84" rx="46" ry="40" fill="#FB923C" />
          {/* Forehead Stripes */}
          <path
            d="M 80 48 L 80 62 M 72 50 L 75 60 M 88 50 L 85 60"
            stroke="#C2410C"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Eyes (big shiny) */}
          <ellipse cx="62" cy="78" rx="7" ry="8" fill="#10B981" />
          <ellipse cx="62" cy="78" rx="3.5" ry="7" fill="#064E3B" />
          <circle cx="60" cy="75" r="2" fill="#FFFFFF" />
          <ellipse cx="98" cy="78" rx="7" ry="8" fill="#10B981" />
          <ellipse cx="98" cy="78" rx="3.5" ry="7" fill="#064E3B" />
          <circle cx="96" cy="75" r="2" fill="#FFFFFF" />
          {/* Nose & Mouth */}
          <polygon points="80,92 74,86 86,86" fill="#F472B6" />
          <path
            d="M 80 92 L 80 98 M 80 98 Q 74 104 68 98 M 80 98 Q 86 104 92 98"
            stroke="#9A3412"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Cheeks */}
          <circle cx="52" cy="92" r="6" fill="#F87171" opacity="0.4" />
          <circle cx="108" cy="92" r="6" fill="#F87171" opacity="0.4" />
          {/* Whiskers */}
          <line
            x1="48"
            y1="92"
            x2="24"
            y2="88"
            stroke="#9A3412"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="48"
            y1="98"
            x2="22"
            y2="100"
            stroke="#9A3412"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="112"
            y1="92"
            x2="136"
            y2="88"
            stroke="#9A3412"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="112"
            y1="98"
            x2="138"
            y2="100"
            stroke="#9A3412"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )

    case 'cachorro':
    case 'dog':
    case 'hund':
    case 'chien':
      return (
        <svg
          viewBox="0 0 160 160"
          className={`${sizeClass} ${className}`}
          role="img"
          aria-label={altText || 'Cachorro'}
        >
          {/* Floppy Ears */}
          <path d="M 44 48 C 20 54 20 92 36 98 C 46 102 52 84 46 62 Z" fill="#92400E" />
          <path d="M 116 48 C 140 54 140 92 124 98 C 114 102 108 84 114 62 Z" fill="#92400E" />
          {/* Head */}
          <ellipse cx="80" cy="80" rx="44" ry="42" fill="#FDE68A" />
          {/* Eye Patch */}
          <ellipse cx="62" cy="74" rx="14" ry="16" fill="#D97706" />
          {/* Eyes */}
          <circle cx="62" cy="74" r="5.5" fill="#1E293B" />
          <circle cx="60" cy="72" r="1.8" fill="#FFFFFF" />
          <circle cx="98" cy="74" r="5.5" fill="#1E293B" />
          <circle cx="96" cy="72" r="1.8" fill="#FFFFFF" />
          {/* Muzzle */}
          <ellipse cx="80" cy="98" rx="26" ry="18" fill="#FFFFFF" />
          {/* Big Black Nose */}
          <ellipse cx="80" cy="92" rx="10" ry="7" fill="#1E293B" />
          <ellipse cx="78" cy="90" rx="3" ry="2" fill="#FFFFFF" />
          {/* Tongue Panting */}
          <path d="M 76 108 C 76 122 84 122 84 108 Z" fill="#F43F5E" />
          {/* Mouth line */}
          <path
            d="M 80 96 L 80 106 M 80 106 Q 72 112 66 104 M 80 106 Q 88 112 94 104"
            stroke="#78350F"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )

    case 'ovelha':
    case 'sheep':
    case 'schaf':
    case 'mouton':
      return (
        <svg
          viewBox="0 0 160 160"
          className={`${sizeClass} ${className}`}
          role="img"
          aria-label={altText || 'Ovelha'}
        >
          {/* Cloud-like Wool Body */}
          <circle cx="50" cy="50" r="22" fill="#F1F5F9" />
          <circle cx="80" cy="40" r="22" fill="#F1F5F9" />
          <circle cx="110" cy="50" r="22" fill="#F1F5F9" />
          <circle cx="125" cy="80" r="22" fill="#F1F5F9" />
          <circle cx="115" cy="110" r="22" fill="#F1F5F9" />
          <circle cx="80" cy="122" r="22" fill="#F1F5F9" />
          <circle cx="45" cy="110" r="22" fill="#F1F5F9" />
          <circle cx="35" cy="80" r="22" fill="#F1F5F9" />
          <circle cx="80" cy="80" r="42" fill="#FFFFFF" />
          {/* Droopy Ears */}
          <ellipse
            cx="36"
            cy="86"
            rx="14"
            ry="7"
            transform="rotate(25 36 86)"
            fill="#FDA4AF"
            stroke="#F43F5E"
            strokeWidth="1.5"
          />
          <ellipse
            cx="124"
            cy="86"
            rx="14"
            ry="7"
            transform="rotate(-25 124 86)"
            fill="#FDA4AF"
            stroke="#F43F5E"
            strokeWidth="1.5"
          />
          {/* Face */}
          <ellipse cx="80" cy="88" rx="28" ry="26" fill="#FCE7F3" />
          {/* Little Wool Tuft on Top */}
          <circle cx="72" cy="66" r="8" fill="#FFFFFF" />
          <circle cx="80" cy="62" r="9" fill="#FFFFFF" />
          <circle cx="88" cy="66" r="8" fill="#FFFFFF" />
          {/* Eyes */}
          <circle cx="68" cy="86" r="4" fill="#1E293B" />
          <circle cx="67" cy="85" r="1.2" fill="#FFFFFF" />
          <circle cx="92" cy="86" r="4" fill="#1E293B" />
          <circle cx="91" cy="85" r="1.2" fill="#FFFFFF" />
          {/* Rosy Cheeks */}
          <circle cx="62" cy="94" r="4" fill="#FB7185" opacity="0.6" />
          <circle cx="98" cy="94" r="4" fill="#FB7185" opacity="0.6" />
          {/* Nose & Mouth */}
          <polygon points="80,96 76,92 84,92" fill="#E11D48" />
          <path
            d="M 80 96 L 80 102 M 80 102 Q 74 106 70 102 M 80 102 Q 86 106 90 102"
            stroke="#E11D48"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )

    case 'elefante':
    case 'elephant':
    case 'elefant':
      return (
        <svg
          viewBox="0 0 160 160"
          className={`${sizeClass} ${className}`}
          role="img"
          aria-label={altText || 'Elefante'}
        >
          {/* Giant Ears */}
          <circle cx="36" cy="74" r="28" fill="#94A3B8" />
          <circle cx="36" cy="74" r="18" fill="#FBCFE8" />
          <circle cx="124" cy="74" r="28" fill="#94A3B8" />
          <circle cx="124" cy="74" r="18" fill="#FBCFE8" />
          {/* Head */}
          <circle cx="80" cy="76" r="40" fill="#CBD5E1" />
          {/* Eyes */}
          <circle cx="62" cy="68" r="5" fill="#1E293B" />
          <circle cx="60" cy="66" r="1.5" fill="#FFFFFF" />
          <circle cx="98" cy="68" r="5" fill="#1E293B" />
          <circle cx="96" cy="66" r="1.5" fill="#FFFFFF" />
          {/* Cheeks */}
          <circle cx="56" cy="82" r="6" fill="#F472B6" opacity="0.5" />
          <circle cx="104" cy="82" r="6" fill="#F472B6" opacity="0.5" />
          {/* Tusks */}
          <path
            d="M 64 96 Q 54 116 68 116"
            stroke="#FFFFFF"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 96 96 Q 106 116 92 116"
            stroke="#FFFFFF"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          {/* Long Trunk curled up happily */}
          <path
            d="M 80 82 Q 76 112 80 126 Q 84 140 96 136 Q 104 130 96 122"
            stroke="#94A3B8"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )

    case 'macaco':
    case 'monkey':
    case 'affe':
    case 'singe':
      return (
        <svg
          viewBox="0 0 160 160"
          className={`${sizeClass} ${className}`}
          role="img"
          aria-label={altText || 'Macaco'}
        >
          {/* Round Ears */}
          <circle cx="28" cy="80" r="18" fill="#78350F" />
          <circle cx="28" cy="80" r="10" fill="#FDE68A" />
          <circle cx="132" cy="80" r="18" fill="#78350F" />
          <circle cx="132" cy="80" r="10" fill="#FDE68A" />
          {/* Head Outer */}
          <circle cx="80" cy="80" r="44" fill="#92400E" />
          {/* Heart/Mask Face Shape */}
          <path
            d="M 80 62 C 64 48 46 62 52 82 C 56 96 74 112 80 114 C 86 112 104 96 108 82 C 114 62 96 48 80 62 Z"
            fill="#FDE68A"
          />
          {/* Eyes */}
          <circle cx="68" cy="74" r="5" fill="#1E293B" />
          <circle cx="66" cy="72" r="1.5" fill="#FFFFFF" />
          <circle cx="92" cy="74" r="5" fill="#1E293B" />
          <circle cx="90" cy="72" r="1.5" fill="#FFFFFF" />
          {/* Nostrils */}
          <circle cx="76" cy="88" r="2" fill="#78350F" />
          <circle cx="84" cy="88" r="2" fill="#78350F" />
          {/* Big Cheeky Smile */}
          <path
            d="M 68 96 Q 80 108 92 96"
            stroke="#78350F"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )

    case 'porco':
    case 'pig':
    case 'schwein':
    case 'cochon':
      return (
        <svg
          viewBox="0 0 160 160"
          className={`${sizeClass} ${className}`}
          role="img"
          aria-label={altText || 'Porquinho'}
        >
          {/* Ears */}
          <polygon points="40,56 46,24 74,44" fill="#F472B6" />
          <polygon points="120,56 114,24 86,44" fill="#F472B6" />
          {/* Head */}
          <circle cx="80" cy="80" r="44" fill="#FBCFE8" stroke="#F472B6" strokeWidth="2" />
          {/* Eyes */}
          <circle cx="62" cy="72" r="5" fill="#1E293B" />
          <circle cx="60" cy="70" r="1.5" fill="#FFFFFF" />
          <circle cx="98" cy="72" r="5" fill="#1E293B" />
          <circle cx="96" cy="70" r="1.5" fill="#FFFFFF" />
          {/* Cheeks */}
          <circle cx="52" cy="86" r="6" fill="#F43F5E" opacity="0.4" />
          <circle cx="108" cy="86" r="6" fill="#F43F5E" opacity="0.4" />
          {/* Snout */}
          <ellipse
            cx="80"
            cy="92"
            rx="20"
            ry="15"
            fill="#F472B6"
            stroke="#DB2777"
            strokeWidth="2"
          />
          <ellipse cx="73" cy="92" rx="4" ry="6" fill="#9D174D" />
          <ellipse cx="87" cy="92" rx="4" ry="6" fill="#9D174D" />
          {/* Little Smile underneath */}
          <path
            d="M 74 112 Q 80 118 86 112"
            stroke="#DB2777"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )

    case 'sapo':
    case 'frog':
    case 'frosch':
    case 'grenouille':
      return (
        <svg
          viewBox="0 0 160 160"
          className={`${sizeClass} ${className}`}
          role="img"
          aria-label={altText || 'Sapo'}
        >
          {/* Big Frog Eyeballs protruding */}
          <circle cx="52" cy="52" r="20" fill="#22C55E" />
          <circle cx="52" cy="52" r="14" fill="#FFFFFF" />
          <circle cx="54" cy="52" r="7" fill="#1E293B" />
          <circle cx="52" cy="50" r="2" fill="#FFFFFF" />
          <circle cx="108" cy="52" r="20" fill="#22C55E" />
          <circle cx="108" cy="52" r="14" fill="#FFFFFF" />
          <circle cx="106" cy="52" r="7" fill="#1E293B" />
          <circle cx="104" cy="50" r="2" fill="#FFFFFF" />
          {/* Head/Body */}
          <ellipse cx="80" cy="92" rx="48" ry="36" fill="#22C55E" />
          {/* Light green belly */}
          <ellipse cx="80" cy="100" rx="32" ry="22" fill="#86EFAC" />
          {/* Rosy Cheeks */}
          <circle cx="48" cy="92" r="7" fill="#F87171" opacity="0.5" />
          <circle cx="112" cy="92" r="7" fill="#F87171" opacity="0.5" />
          {/* Nostrils */}
          <circle cx="74" cy="80" r="2" fill="#15803D" />
          <circle cx="86" cy="80" r="2" fill="#15803D" />
          {/* Huge Happy Smile */}
          <path
            d="M 54 94 Q 80 118 106 94"
            stroke="#15803D"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )

    // ================= DINOSSAUROS ================= //
    case 'trex':
    case 't-rex':
    case 'tiranossauro rex':
    case 'rex':
      return (
        <svg
          viewBox="0 0 160 160"
          className={`${sizeClass} ${className}`}
          role="img"
          aria-label={altText || 'T-Rex'}
        >
          {/* Back ridges */}
          <polygon points="46,38 40,24 54,34" fill="#047857" />
          <polygon points="62,32 58,18 72,28" fill="#047857" />
          <polygon points="78,32 76,16 88,28" fill="#047857" />
          {/* Head & Jaws */}
          <path
            d="M 44 80 Q 40 40 76 36 Q 116 34 126 56 Q 130 76 116 84 L 112 84 Q 106 82 98 84 L 88 84 Q 80 84 76 96 L 112 96 Q 116 112 98 116 Q 64 120 44 80 Z"
            fill="#10B981"
          />
          {/* Sharp Friendly Teeth */}
          <polygon points="90,84 94,90 98,84" fill="#FFFFFF" />
          <polygon points="100,84 104,90 108,84" fill="#FFFFFF" />
          <polygon points="110,84 114,90 118,84" fill="#FFFFFF" />
          <polygon points="92,96 96,92 100,96" fill="#FFFFFF" />
          <polygon points="102,96 106,92 110,96" fill="#FFFFFF" />
          {/* Big Yellow Eye */}
          <circle cx="70" cy="54" r="9" fill="#FBBF24" />
          <circle cx="71" cy="54" r="5" fill="#1E293B" />
          <circle cx="69" cy="52" r="1.5" fill="#FFFFFF" />
          {/* Nostril */}
          <ellipse cx="118" cy="62" rx="2.5" ry="4" fill="#065F46" />
          {/* Little T-Rex Arm */}
          <path
            d="M 52 98 Q 42 106 48 112 Q 54 112 56 104"
            stroke="#047857"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )

    case 'braquiossauro':
      return (
        <svg
          viewBox="0 0 160 160"
          className={`${sizeClass} ${className}`}
          role="img"
          aria-label={altText || 'Braquiossauro'}
        >
          {/* Body */}
          <ellipse cx="96" cy="116" rx="46" ry="28" fill="#0EA5E9" />
          {/* Tail */}
          <path
            d="M 136 120 Q 152 126 156 138"
            stroke="#0EA5E9"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          {/* Legs */}
          <rect x="74" y="128" width="12" height="22" rx="6" fill="#0284C7" />
          <rect x="110" y="128" width="12" height="22" rx="6" fill="#0284C7" />
          {/* Super Long Neck */}
          <path
            d="M 76 116 Q 66 70 54 44"
            stroke="#0EA5E9"
            strokeWidth="22"
            fill="none"
            strokeLinecap="round"
          />
          {/* Cute Little Head */}
          <ellipse cx="50" cy="38" rx="16" ry="12" fill="#38BDF8" />
          {/* Eye */}
          <circle cx="46" cy="34" r="4" fill="#1E293B" />
          <circle cx="45" cy="33" r="1.2" fill="#FFFFFF" />
          {/* Sweet Smile */}
          <path
            d="M 42 42 Q 48 46 56 42"
            stroke="#0369A1"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )

    case 'triceratops':
      return (
        <svg
          viewBox="0 0 160 160"
          className={`${sizeClass} ${className}`}
          role="img"
          aria-label={altText || 'Tricerátops'}
        >
          {/* Large Frill/Shield */}
          <path
            d="M 38 68 C 30 38 70 20 80 20 C 90 20 130 38 122 68 C 114 84 46 84 38 68 Z"
            fill="#F59E0B"
            stroke="#D97706"
            strokeWidth="3"
          />
          {/* Frill Dots */}
          <circle cx="56" cy="38" r="5" fill="#FEF3C7" />
          <circle cx="80" cy="32" r="5" fill="#FEF3C7" />
          <circle cx="104" cy="38" r="5" fill="#FEF3C7" />
          {/* Brow Horns */}
          <path
            d="M 54 62 Q 44 42 38 46"
            stroke="#FFFFFF"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 106 62 Q 116 42 122 46"
            stroke="#FFFFFF"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          {/* Head */}
          <ellipse cx="80" cy="88" rx="36" ry="32" fill="#FBBF24" />
          {/* Nose Horn */}
          <polygon points="80,80 74,92 86,92" fill="#FFFFFF" />
          {/* Eyes */}
          <circle cx="62" cy="78" r="5" fill="#1E293B" />
          <circle cx="60" cy="76" r="1.5" fill="#FFFFFF" />
          <circle cx="98" cy="78" r="5" fill="#1E293B" />
          <circle cx="96" cy="76" r="1.5" fill="#FFFFFF" />
          {/* Beak / Mouth */}
          <path
            d="M 72 106 Q 80 114 88 106"
            stroke="#B45309"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )

    // ================= FRUTAS ================= //
    case 'banana':
      return (
        <svg
          viewBox="0 0 160 160"
          className={`${sizeClass} ${className}`}
          role="img"
          aria-label={altText || 'Banana'}
        >
          {/* Sweet Yellow Banana Curve */}
          <path
            d="M 40 46 C 42 78 68 126 124 118 C 96 112 66 84 62 48 Z"
            fill="#FACC15"
            stroke="#EAB308"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Inner shade line */}
          <path
            d="M 48 52 C 54 82 80 116 118 114"
            stroke="#FDE047"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          {/* Stem & Tip */}
          <rect
            x="36"
            y="38"
            width="7"
            height="12"
            rx="2"
            transform="rotate(-30 36 38)"
            fill="#65A30D"
          />
          <circle cx="123" cy="118" r="3" fill="#78350F" />
          {/* Cartoon Smiley Face */}
          <circle cx="68" cy="80" r="3.5" fill="#78350F" />
          <circle cx="82" cy="88" r="3.5" fill="#78350F" />
          <path
            d="M 72 90 Q 78 96 84 92"
            stroke="#78350F"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )

    case 'maca':
    case 'apple':
    case 'apfel':
    case 'pomme':
      return (
        <svg
          viewBox="0 0 160 160"
          className={`${sizeClass} ${className}`}
          role="img"
          aria-label={altText || 'Maçã'}
        >
          {/* Leaf & Stem */}
          <path
            d="M 80 48 Q 78 28 88 24"
            stroke="#78350F"
            strokeWidth="4.5"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx="98" cy="28" rx="14" ry="7" transform="rotate(-25 98 28)" fill="#22C55E" />
          {/* Apple Heart Body */}
          <path
            d="M 80 54 C 64 36 34 50 34 84 C 34 116 66 136 80 136 C 94 136 126 116 126 84 C 126 50 96 36 80 54 Z"
            fill="#EF4444"
          />
          {/* Glossy Highlight */}
          <ellipse
            cx="54"
            cy="74"
            rx="8"
            ry="16"
            transform="rotate(-30 54 74)"
            fill="#FCA5A5"
            opacity="0.6"
          />
          {/* Kawaii Face */}
          <circle cx="68" cy="88" r="4" fill="#FFFFFF" />
          <circle cx="68" cy="88" r="3" fill="#1E293B" />
          <circle cx="92" cy="88" r="4" fill="#FFFFFF" />
          <circle cx="92" cy="88" r="3" fill="#1E293B" />
          <circle cx="60" cy="96" r="4" fill="#F43F5E" opacity="0.6" />
          <circle cx="100" cy="96" r="4" fill="#F43F5E" opacity="0.6" />
          <path
            d="M 76 96 Q 80 102 84 96"
            stroke="#7F1D1D"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )

    case 'laranja':
    case 'orange':
      return (
        <svg
          viewBox="0 0 160 160"
          className={`${sizeClass} ${className}`}
          role="img"
          aria-label={altText || 'Laranja'}
        >
          <path
            d="M 80 44 Q 80 26 86 24"
            stroke="#78350F"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx="96" cy="30" rx="12" ry="6" transform="rotate(-20 96 30)" fill="#16A34A" />
          <circle cx="80" cy="88" r="46" fill="#F97316" />
          <circle cx="80" cy="88" r="40" fill="#FB923C" />
          {/* Smiling Face */}
          <circle cx="68" cy="84" r="4" fill="#7C2D12" />
          <circle cx="92" cy="84" r="4" fill="#7C2D12" />
          <path
            d="M 74 94 Q 80 102 86 94"
            stroke="#7C2D12"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )

    case 'uva':
    case 'grape':
    case 'traube':
      return (
        <svg
          viewBox="0 0 160 160"
          className={`${sizeClass} ${className}`}
          role="img"
          aria-label={altText || 'Uva'}
        >
          <path
            d="M 80 38 Q 78 20 86 18"
            stroke="#78350F"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx="94" cy="24" rx="12" ry="6" fill="#16A34A" />
          {/* Grape cluster */}
          <circle cx="64" cy="54" r="14" fill="#8B5CF6" />
          <circle cx="80" cy="50" r="14" fill="#7C3AED" />
          <circle cx="96" cy="54" r="14" fill="#8B5CF6" />
          <circle cx="56" cy="74" r="14" fill="#7C3AED" />
          <circle cx="74" cy="72" r="14" fill="#9333EA" />
          <circle cx="92" cy="72" r="14" fill="#7C3AED" />
          <circle cx="106" cy="74" r="14" fill="#8B5CF6" />
          <circle cx="66" cy="94" r="14" fill="#8B5CF6" />
          <circle cx="84" cy="94" r="14" fill="#7C3AED" />
          <circle cx="98" cy="94" r="14" fill="#9333EA" />
          <circle cx="74" cy="114" r="14" fill="#7C3AED" />
          <circle cx="90" cy="114" r="14" fill="#8B5CF6" />
          <circle cx="80" cy="132" r="12" fill="#7C3AED" />
        </svg>
      )

    // ================= FALLBACK COM EMOJI BONITO ================= //
    default:
      return (
        <div
          className={`${sizeClass} ${className} flex items-center justify-center select-none text-5xl sm:text-6xl drop-shadow-md transition-transform`}
          role="img"
          aria-label={altText || itemId}
        >
          <span>{fallbackEmoji}</span>
        </div>
      )
  }
}

export default ItemIllustration
