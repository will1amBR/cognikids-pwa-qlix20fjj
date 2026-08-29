export interface Child {
  id: string
  user_id: string
  name: string
  birth_date: string
  favorite_color?: string
  avatar?: string
  created?: string
  updated?: string
}

export interface GameSession {
  id: string
  user_id: string
  child_id: string
  module_id: string
  game_id: string
  game_title: string
  stars: number
  score: number
  accuracy: number
  rounds_completed: number
  total_rounds: number
  details?: Record<string, any>
  created: string
}

export interface ModuleProgress {
  id: string
  user_id: string
  child_id: string
  module_id: string
  mastery_percentage: number
  total_played: number
  last_played_at?: string
}

export interface ModuleDefinition {
  id: string
  title: string
  subtitle: string
  color: string
  lightColor: string
  icon: string
  description: string
  minAgeMonths: number
  maxAgeMonths: number
  activities: {
    id: string
    title: string
    description: string
    ageRange: string
    badge?: string
  }[]
}

export const COGNIKIDS_MODULES: ModuleDefinition[] = [
  {
    id: 'speech',
    title: 'Fala & Linguagem',
    subtitle: 'Comunicação e Vocabulário',
    color: '#FF7A45', // Vibrant Orange
    lightColor: '#FFF2EB',
    icon: '🗣️',
    description: 'Estimula a articulação, repertório de palavras e associação sonora.',
    minAgeMonths: 6,
    maxAgeMonths: 60,
    activities: [
      {
        id: 'fazenda_falante',
        title: 'A Fazenda & Dinossauros Falantes',
        description:
          'Veja animais, dinos, frutas, cores e corpo, fale no microfone e receba estrelas!',
        ageRange: '12–60 meses',
        badge: 'Estrela',
      },
      {
        id: 'cade_o_bichinho',
        title: 'Cadê o Bichinho / Objeto?',
        description: 'Reconhecimento receptivo: escute a palavra e selecione a imagem correta.',
        ageRange: '6–36 meses',
      },
      {
        id: 'som_do_bicho',
        title: 'Qual é o Som?',
        description: 'Associe o som característico ou rugido ao animal/dino correspondente.',
        ageRange: '12–60 meses',
        badge: 'Novo',
      },
    ],
  },
  {
    id: 'memory',
    title: 'Memória & Atenção',
    subtitle: 'Foco e Retenção Visual',
    color: '#4EA8DE', // Bright Sky Blue
    lightColor: '#EBF6FC',
    icon: '🧩',
    description: 'Fortalece a memória de trabalho e concentração com desafios lúdicos de pares.',
    minAgeMonths: 12,
    maxAgeMonths: 60,
    activities: [
      {
        id: 'par_dos_animais',
        title: 'Par dos Bichinhos & Frutas',
        description: 'Encontre as cartas iguais e ouça a comemoração ao formar pares!',
        ageRange: '18–60 meses',
        badge: 'Popular',
      },
      {
        id: 'memoria_dinos',
        title: 'Memória Jurássica dos Dinos',
        description: 'Encontre os pares de T-Rex, Tricerátops, Estegossauro e seus amigos.',
        ageRange: '24–60 meses',
        badge: 'Novo',
      },
    ],
  },
  {
    id: 'logic',
    title: 'Lógica & Cognição',
    subtitle: 'Formas, Cores e Números',
    color: '#FFB703', // Warm Sunshine Amber
    lightColor: '#FFF8E7',
    icon: '🧠',
    description: 'Classificação por cores, formas geométricas e contagem de 1 a 10.',
    minAgeMonths: 18,
    maxAgeMonths: 60,
    activities: [
      {
        id: 'caixa_das_formas',
        title: 'Caixa das Formas & Cores',
        description: 'Encaixe a forma ou identifique a cor certa para aprender círculos e tons.',
        ageRange: '18–60 meses',
      },
      {
        id: 'conta_dinos',
        title: 'Contar Bichinhos e Dinos',
        description: 'Conte quantos dinossauros ou frutas aparecem na tela (1 a 10).',
        ageRange: '24–60 meses',
        badge: 'Novo',
      },
      {
        id: 'sequencia_cores',
        title: 'Sequência das Cores & Mágica',
        description: 'Descubra qual a próxima cor ou número na sequência divertida do Tico.',
        ageRange: '24–60 meses',
        badge: 'Novo',
      },
    ],
  },
  {
    id: 'motor',
    title: 'Motricidade',
    subtitle: 'Coordenação e Toque',
    color: '#06D6A0', // Fresh Mint Green
    lightColor: '#E6FBF5',
    icon: '✋',
    description: 'Precisão motora fina, rastreamento visual e agilidade de toque.',
    minAgeMonths: 6,
    maxAgeMonths: 60,
    activities: [
      {
        id: 'estoura_bolhas',
        title: 'Estoura Bolhas com Dinos',
        description: 'Toque rápido nas bolhas coloridas e descubra dinos e frutas lá dentro!',
        ageRange: '6–60 meses',
      },
    ],
  },
  {
    id: 'socioemotional',
    title: 'Socioemocional',
    subtitle: 'Sentimentos e Empatia',
    color: '#E63946', // Warm Coral Red / Pink
    lightColor: '#FDEDEE',
    icon: '❤️',
    description: 'Reconhecimento de expressões faciais, emoções e autorregulação.',
    minAgeMonths: 18,
    maxAgeMonths: 60,
    activities: [
      {
        id: 'carinhas_felizes',
        title: 'Como Eu Me Sinto?',
        description:
          'Descubra carinhas de feliz, calmo e corajoso com historinhas do Tico e seus amigos.',
        ageRange: '18–60 meses',
      },
    ],
  },
]

export interface DailyActivityItem {
  id: string
  title: string
  moduleId: string
  moduleTitle: string
  moduleColor: string
  icon: string
  description: string
  reason: string
}

export interface EvolutionSummary {
  period: 'week' | 'month'
  totalSessions: number
  totalStars: number
  averageAccuracy: number
  previousTotalSessions: number
  previousAverageAccuracy: number
  accuracyChange: number // positive, negative or 0
  sessionsChange: number
  moduleBreakdown: {
    moduleId: string
    title: string
    color: string
    icon: string
    currentMastery: number
    previousMastery: number
    delta: number
    trend: 'up' | 'stable' | 'down'
    sessionsCount: number
  }[]
}

export function calculateAgeMonths(birthDateStr: string): number {
  if (!birthDateStr) return 0
  const birth = new Date(birthDateStr)
  const now = new Date()
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (now.getDate() < birth.getDate()) {
    months--
  }
  return Math.max(0, months)
}

export function formatChildAge(birthDateStr: string): string {
  const months = calculateAgeMonths(birthDateStr)
  if (months < 1) return 'Recém-nascido'
  if (months < 12) return `${months} ${months === 1 ? 'mês' : 'meses'}`

  const years = Math.floor(months / 12)
  const remMonths = months % 12

  if (remMonths === 0) {
    return `${years} ${years === 1 ? 'ano' : 'anos'}`
  }
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${remMonths} ${remMonths === 1 ? 'mês' : 'meses'}`
}
