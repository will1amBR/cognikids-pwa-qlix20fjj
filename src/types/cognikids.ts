export type AppLanguage = 'pt-BR' | 'en' | 'es' | 'de' | 'fr'

export interface LanguageOption {
  code: AppLanguage
  label: string
  nativeName: string
  flag: string
  speechLang: string
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'pt-BR',
    label: 'Português',
    nativeName: 'Português (Brasil)',
    flag: '🇧🇷',
    speechLang: 'pt-BR',
  },
  { code: 'en', label: 'Inglês', nativeName: 'English', flag: '🇺🇸', speechLang: 'en-US' },
  { code: 'es', label: 'Espanhol', nativeName: 'Español', flag: '🇪🇸', speechLang: 'es-ES' },
  { code: 'de', label: 'Alemão', nativeName: 'Deutsch', flag: '🇩🇪', speechLang: 'de-DE' },
  { code: 'fr', label: 'Francês', nativeName: 'Français', flag: '🇫🇷', speechLang: 'fr-FR' },
]

export interface Child {
  id: string
  user_id: string
  name: string
  birth_date: string
  favorite_color?: string
  avatar?: string
  class_group?: string
  daily_minutes?: number
  daily_activity_count?: number
  learning_languages?: AppLanguage[]
  primary_language?: AppLanguage
  age_months?: number
  created: string
  updated: string
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
  language?: string
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

export interface ChildAchievement {
  id: string
  user_id: string
  child_id: string
  module_id: string
  badge_key: string
  title: string
  description?: string
  icon?: string
  tier?: 'bronze' | 'silver' | 'gold' | 'special'
  unlocked_at?: string
  created?: string
  updated?: string
}

export interface BadgeDefinition {
  key: string
  moduleId: string
  title: string
  description: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'special'
  requirementText: string
  requiredSessions: number
  requiredMastery: number
}

export interface InviteRecord {
  id: string
  user_id: string
  child_id?: string
  invite_code: string
  sender_child_name?: string
  status: 'active' | 'used' | 'expired'
  accepted_by_user_id?: string
  accepted_child_name?: string
  accepted_at?: string
  created?: string
  updated?: string
}

export interface SchoolAccessToken {
  id: string
  user_id: string
  child_id?: string
  access_code: string
  school_name?: string
  teacher_name?: string
  class_group?: string
  note?: string
  is_active: boolean
  last_accessed_at?: string
  expires_at?: string
  created?: string
  updated?: string
}

export interface GuardianReminderConfig {
  reminder_enabled: boolean
  reminder_time: string // format "HH:MM" e.g. "18:30"
  vocab_reminder_enabled?: boolean
  vocab_reminder_time?: string
  vocab_reminder_language?: AppLanguage | string
}

export interface LanguageEvolutionStat {
  code: AppLanguage
  label: string
  nativeName: string
  flag: string
  totalSessions: number
  averageAccuracy: number
  totalStars: number
  wordsPracticedCount: number
  status: 'doing_well' | 'in_progress' | 'not_started'
  statusLabel: string
}

export interface BilingualStatus {
  isBilingualOrMultilingual: boolean
  languagesCount: number
  languages: AppLanguage[]
  badgeTitle: string
  badgeDescription: string
}

export interface WeeklyWordRankItem {
  word: string
  language: AppLanguage
  practiceCount: number
  correctCount: number
  accuracy: number
  lastPracticed: string
}

export interface BilingualStatus {
  isBilingual: boolean
  activeLanguages: AppLanguage[]
  totalLanguages: number
  primaryLanguage: AppLanguage
  bilingualBonusPoints: number
  level: 'iniciante' | 'explorador' | 'fluente'
  description: string
}

export interface JuniorActivityDefinition {
  id: string
  title: string
  description: string
  pillar: 'language' | 'math' | 'logic' | 'memory' | 'reading'
  pillarTitle: string
  icon: string
  color: string
  lightColor: string
  ageRange: string
  badge?: string
  skillsWorked: string[]
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
  themes: {
    title: string
    whatIsWorked: string
    homeTips: string[]
  }[]
  activities: {
    id: string
    title: string
    description: string
    ageRange: string
    badge?: string
  }[]
}

export const COGNIKIDS_JUNIOR_ACTIVITIES: JuniorActivityDefinition[] = [
  {
    id: 'junior_vocab_builder',
    title: 'Mestre do Vocabulário & Frases',
    description:
      'Fale palavras avançadas, construa frases e aprenda novas expressões nos 5 idiomas.',
    pillar: 'language',
    pillarTitle: 'Vocabulário & Fala',
    icon: '🗣️',
    color: '#FF7A45',
    lightColor: '#FFF2EB',
    ageRange: '6 a 10 anos',
    badge: 'Microfone & Voz',
    skillsWorked: ['Articulação fonética', 'Expressões idiomáticas', 'Formação de frases'],
  },
  {
    id: 'junior_dictation_voice',
    title: 'Ditado de Voz & Ortografia',
    description:
      'Ouça a palavra em áudio cristalino e digite ou fale a grafia correta com suporte multilíngue.',
    pillar: 'reading',
    pillarTitle: 'Leitura & Escrita',
    icon: '✍️',
    color: '#8B5CF6',
    lightColor: '#F5F3FF',
    ageRange: '6 a 10 anos',
    badge: 'Novo',
    skillsWorked: ['Consciência ortográfica', 'Percepção auditiva', 'Escrita correta'],
  },
  {
    id: 'junior_math_quest',
    title: 'Missão Matemática & Cálculos',
    description:
      'Resolva desafios de adição, subtração, multiplicação e problemas lúdicos do Tico.',
    pillar: 'math',
    pillarTitle: 'Matemática Básica',
    icon: '🔢',
    color: '#0EA5E9',
    lightColor: '#F0F9FF',
    ageRange: '6 a 10 anos',
    badge: 'Popular',
    skillsWorked: ['Cálculo mental', 'Raciocínio quantitativo', 'Resolução de problemas'],
  },
  {
    id: 'junior_logic_matrix',
    title: 'Matriz Lógica & Dedução',
    description:
      'Desvende padrões complexos, sequências geométricas e deduções com raciocínio analítico.',
    pillar: 'logic',
    pillarTitle: 'Lógica & Dedução',
    icon: '🧠',
    color: '#F59E0B',
    lightColor: '#FEFCE8',
    ageRange: '6 a 10 anos',
    badge: 'Desafio',
    skillsWorked: ['Pensamento dedutivo', 'Identificação de matrizes', 'Classificação'],
  },
  {
    id: 'junior_memory_master',
    title: 'Super Memória & Sequências',
    description:
      'Memorize sequências de símbolos, palavras nos idiomas e reproduza no tempo ideal.',
    pillar: 'memory',
    pillarTitle: 'Memória de Trabalho',
    icon: '⚡',
    color: '#10B981',
    lightColor: '#ECFDF5',
    ageRange: '6 a 10 anos',
    badge: 'Agilidade',
    skillsWorked: ['Retenção visual-espacial', 'Foco prolongado', 'Memória de curto prazo'],
  },
]

export const COGNIKIDS_BADGES: BadgeDefinition[] = [
  // Selo Especial de Multi-idiomas
  {
    key: 'bilingual_in_progress',
    moduleId: 'speech',
    title: 'Bilíngue em construção',
    description:
      'Pratica mais de um idioma com o Tico, desenvolvendo múltiplos repertórios vocais e culturais!',
    icon: '🌍',
    tier: 'gold',
    requirementText: 'Configure e pratique 2 ou mais idiomas no perfil da criança',
    requiredSessions: 1,
    requiredMastery: 30,
  },
  // 1. Fala & Linguagem
  {
    key: 'speech_primeiras_palavras',
    moduleId: 'speech',
    title: 'Primeiras Palavras',
    description: 'Completou a primeira sessão vocal com o Tico.',
    icon: '🗣️',
    tier: 'bronze',
    requirementText: 'Jogue 1 partida de Fala & Linguagem',
    requiredSessions: 1,
    requiredMastery: 40,
  },
  {
    key: 'speech_falante_jurassico',
    moduleId: 'speech',
    title: 'Voz da Selva',
    description: 'Imitou os dinos, animais e aprendeu os sons da fazenda.',
    icon: '🦖',
    tier: 'silver',
    requirementText: 'Complete 3 partidas e alcance 65% de fala',
    requiredSessions: 3,
    requiredMastery: 65,
  },
  {
    key: 'speech_mestre_rimas',
    moduleId: 'speech',
    title: 'Mestre das Rimas',
    description: 'Percepção auditiva afiada para rimas e fonemas.',
    icon: '🌟',
    tier: 'gold',
    requirementText: 'Alcance 85% de maestria em Fala & Linguagem',
    requiredSessions: 5,
    requiredMastery: 85,
  },

  // 2. Memória & Atenção
  {
    key: 'memory_primeiros_pares',
    moduleId: 'memory',
    title: 'Detetive de Pares',
    description: 'Encontrou os primeiros pares de cartas no jogo da memória.',
    icon: '🧩',
    tier: 'bronze',
    requirementText: 'Jogue 1 partida de Memória & Atenção',
    requiredSessions: 1,
    requiredMastery: 40,
  },
  {
    key: 'memory_memoria_jurassica',
    moduleId: 'memory',
    title: 'Foco Jurássico',
    description: 'Lembrou a posição dos dinossauros sem errar.',
    icon: '🦕',
    tier: 'silver',
    requirementText: 'Complete 3 partidas com retenção visual',
    requiredSessions: 3,
    requiredMastery: 65,
  },
  {
    key: 'memory_super_memoria',
    moduleId: 'memory',
    title: 'Cérebro de Elefante',
    description: 'Memória de trabalho extraordinária em todos os tabuleiros.',
    icon: '🐘',
    tier: 'gold',
    requirementText: 'Alcance 85% de maestria em Memória',
    requiredSessions: 5,
    requiredMastery: 85,
  },

  // 3. Lógica & Cognição
  {
    key: 'logic_caixa_formas',
    moduleId: 'logic',
    title: 'Descobridor de Formas',
    description: 'Identificou círculos, quadrados e cores primárias.',
    icon: '🧠',
    tier: 'bronze',
    requirementText: 'Jogue 1 partida de Lógica & Cognição',
    requiredSessions: 1,
    requiredMastery: 40,
  },
  {
    key: 'logic_mestre_contagem',
    moduleId: 'logic',
    title: 'Contador Esperto',
    description: 'Contou dinos e frutas de 1 a 10 com precisão.',
    icon: '🔢',
    tier: 'silver',
    requirementText: 'Complete 3 partidas de contagem e sequências',
    requiredSessions: 3,
    requiredMastery: 65,
  },
  {
    key: 'logic_genio_padroes',
    moduleId: 'logic',
    title: 'Gênio dos Padrões',
    description: 'Descobriu as sequências complexas do Tico.',
    icon: '🏆',
    tier: 'gold',
    requirementText: 'Alcance 85% de maestria em Lógica',
    requiredSessions: 5,
    requiredMastery: 85,
  },

  // 4. Motricidade
  {
    key: 'motor_primeiro_toque',
    moduleId: 'motor',
    title: 'Toque Mágico',
    description: 'Estourou suas primeiras bolhas flutuantes com o dedinho.',
    icon: '🫧',
    tier: 'bronze',
    requirementText: 'Jogue 1 partida de Motricidade',
    requiredSessions: 1,
    requiredMastery: 40,
  },
  {
    key: 'motor_trilha_letras',
    moduleId: 'motor',
    title: 'Dedinho Desenhista',
    description: 'Conectou os pontos e traçou as letras e números com firmeza.',
    icon: '✍️',
    tier: 'silver',
    requirementText: 'Complete 3 partidas de precisão motora',
    requiredSessions: 3,
    requiredMastery: 65,
  },
  {
    key: 'motor_super_reflexo',
    moduleId: 'motor',
    title: 'Reflexo Ninja',
    description: 'Coordenação motora fina e rastreamento visual impecável.',
    icon: '⚡',
    tier: 'gold',
    requirementText: 'Alcance 85% de maestria em Motricidade',
    requiredSessions: 5,
    requiredMastery: 85,
  },

  // 5. Socioemocional
  {
    key: 'socioemotional_reconhece_emocoes',
    moduleId: 'socioemotional',
    title: 'Coração Empático',
    description: 'Identificou carinhas de feliz, calmo e amoroso.',
    icon: '❤️',
    tier: 'bronze',
    requirementText: 'Jogue 1 partida de Socioemocional',
    requiredSessions: 1,
    requiredMastery: 40,
  },
  {
    key: 'socioemotional_clima_autonomia',
    moduleId: 'socioemotional',
    title: 'Guardião do Clima & Autonomia',
    description: 'Aprendeu a escolher roupas adequadas para sol, chuva e frio.',
    icon: '🌤️',
    tier: 'silver',
    requirementText: 'Complete o jogo de Clima & Roupa com autonomia',
    requiredSessions: 3,
    requiredMastery: 65,
  },
  {
    key: 'socioemotional_amigo_do_tico',
    moduleId: 'socioemotional',
    title: 'Amigo do Tico & Comunidade',
    description: 'Convidou um colega para brincar ou alcançou maestria socioemocional.',
    icon: '🤝',
    tier: 'gold',
    requirementText: 'Alcance 85% em Socioemocional ou compartilhe convite',
    requiredSessions: 4,
    requiredMastery: 85,
  },
]

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
    themes: [
      {
        title: 'Articulação e Expressão Vocal',
        whatIsWorked:
          'Estimula a criança a usar a própria voz, falar nomes de animais, objetos e cores em voz alta.',
        homeTips: [
          'Brinque de imitar sons de animais durante o banho ou passeio.',
          'Aponte para objetos cotidianos e peça para a criança repetir com entusiasmo.',
          'Cante musiquinhas rimadas fazendo pausas para ela completar a última palavra.',
        ],
      },
      {
        title: 'Consciência Fonológica e Rimas',
        whatIsWorked: 'Percepção auditiva dos sons finais das palavras (ex: gato/pato, maçã/rã).',
        homeTips: [
          'Faça joguinhos verbais rápidos: "O que combina com pão? Sabão ou bola?".',
          'Leia livrinhos com textos em versos e repita as rimas com entonação divertida.',
        ],
      },
    ],
    activities: [
      {
        id: 'fazenda_falante',
        title: 'A Fazenda & Dinossauros Falantes',
        description: 'Veja animais, dinos, frutas e cores, fale no microfone e receba estrelas!',
        ageRange: '12–60 meses',
        badge: 'Microfone',
      },
      {
        id: 'rima_divertida',
        title: 'Rimas do Tico',
        description: 'Ouça as palavras e encontre quais figuras rimam pelo som final!',
        ageRange: '24–60 meses',
        badge: 'Novo',
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
    themes: [
      {
        title: 'Memória de Trabalho Visual',
        whatIsWorked: 'Retenção da posição espacial de cartas e reconhecimento de semelhanças.',
        homeTips: [
          'Esconda um brinquedinho embaixo de um de dois copos e peça para ela adivinhar onde está.',
          'Coloque 3 objetos na mesa, peça para a criança fechar os olhos, retire 1 e pergunte qual sumiu.',
        ],
      },
    ],
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
    description: 'Classificação por cores, formas geométricas, sequências e contagem de 1 a 10.',
    minAgeMonths: 18,
    maxAgeMonths: 60,
    themes: [
      {
        title: 'Classificação de Formas e Cores',
        whatIsWorked: 'Agrupamento visual por propriedades geométricas e distinção cromática.',
        homeTips: [
          'Peça ajuda para guardar os brinquedos separando por cor ou tamanho.',
          'Identifique círculos e quadrados nos objetos da casa (pratos, almofadas, portas).',
        ],
      },
      {
        title: 'Sequências Lógicas e Contagem Inicial',
        whatIsWorked:
          'Noção de ordem numérica, padrão repetitivo (AB, ABC) e contagem quantitativa.',
        homeTips: [
          'Conte os degraus da escada em voz alta ao subir com a criança.',
          'Faça fileirinhas de frutas ou peças alternando maçã-banana-maçã-banana.',
        ],
      },
    ],
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
      },
      {
        id: 'sequencia_padroes',
        title: 'Sequência & Padrões Lógicos',
        description: 'Descubra qual figura completa o padrão de repetição do Tico.',
        ageRange: '24–60 meses',
        badge: 'Novo',
      },
      {
        id: 'sequencia_cores',
        title: 'Sequência das Cores & Mágica',
        description: 'Descubra qual a próxima cor ou número na sequência divertida do Tico.',
        ageRange: '24–60 meses',
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
    themes: [
      {
        title: 'Coordenação Motora Fina e Toque Dirigido',
        whatIsWorked: 'Controle de movimento do indicador, pressão, traçado de linhas e agilidade.',
        homeTips: [
          'Estimule brincadeiras com massinha de modelar, rasgar papel e fazer bolinhas.',
          'Ofereça giz de cera grosso para desenhar livremente em folhas grandes.',
          'Pratique abotoar botões grandes ou encaixar potes com tampa.',
        ],
      },
    ],
    activities: [
      {
        id: 'estoura_bolhas',
        title: 'Estoura Bolhas com Dinos',
        description: 'Toque rápido nas bolhas coloridas e descubra dinos e frutas lá dentro!',
        ageRange: '6–60 meses',
        badge: 'Favorito',
      },
      {
        id: 'trilha_das_letras',
        title: 'Trilha das Letras & Formas',
        description: 'Conecte os pontos numéricos na ordem certa para desenhar letras e números.',
        ageRange: '24–60 meses',
        badge: 'Novo',
      },
    ],
  },
  {
    id: 'socioemotional',
    title: 'Socioemocional',
    subtitle: 'Sentimentos e Autonomia',
    color: '#E63946', // Warm Coral Red / Pink
    lightColor: '#FDEDEE',
    icon: '❤️',
    description:
      'Reconhecimento de expressões faciais, autorregulação e autonomia no vestir/clima.',
    minAgeMonths: 18,
    maxAgeMonths: 60,
    themes: [
      {
        title: 'Reconhecimento e Validação de Emoções',
        whatIsWorked:
          'Nomear o que a criança sente (alegria, medo, frustração, calma) para desenvolver autorregulação.',
        homeTips: [
          'Nomeie os sentimentos no dia a dia: "Vejo que você ficou bravo porque o bloco caiu, vamos tentar de novo?".',
          'Faça caretas no espelho imitando sentimentos e peça para a criança adivinhar.',
        ],
      },
      {
        title: 'Autonomia, Clima e Cuidado Pessoal',
        whatIsWorked:
          'Compreensão de temperatura (frio/calor), previsão de chuva e escolha de roupas adequadas.',
        homeTips: [
          'Abra a janela pela manhã com a criança e pergunte: "Como está o céu hoje? Vamos ver que roupa usar?".',
          'Deixe que ela participe na escolha entre duas opções de roupas para o passeio.',
        ],
      },
    ],
    activities: [
      {
        id: 'clima_roupa',
        title: 'Clima & Roupa Adequada',
        description: 'Analise o sol, chuva ou frio e ajude o Tico a escolher as roupas ideais!',
        ageRange: '18–60 meses',
        badge: 'Novo',
      },
      {
        id: 'carinhas_felizes',
        title: 'Como Eu Me Sinto?',
        description: 'Descubra carinhas de feliz, calmo e corajoso com historinhas do Tico.',
        ageRange: '18–60 meses',
      },
    ],
  },
]

// ================= COGNIKIDS JUNIOR MODULES (6 a 10 ANOS / 72 a 120 MESES) ================= //

export const JUNIOR_MODULES: ModuleDefinition[] = [
  {
    id: 'junior_vocab',
    title: 'Vocabulário & Fala Pro',
    subtitle: 'Expressão verbal e termos complexos nos 5 idiomas',
    color: '#6366F1', // Indigo
    lightColor: '#EEF2FF',
    icon: '🗣️',
    description:
      'Pronúncia avançada, associação de palavras ricas, significado e formação de frases completas.',
    minAgeMonths: 72,
    maxAgeMonths: 120,
    themes: [
      {
        title: 'Vocabulário Avançado & Expressão Verbal',
        whatIsWorked: 'Construção de frases complexas, termos científicos e dicção multilíngue.',
        homeTips: [
          'Conversem sobre temas do dia e encoraje explicar conceitos científicos com detalhes.',
          'Pratique a leitura de livros de aventura com vocabulário rico.',
        ],
      },
    ],
    activities: [
      {
        id: 'junior_vocab_builder',
        title: 'Construtor de Vocabulário & Frases',
        description:
          'Pronuncie termos como astronauta, ecossistema e fotossíntese com reconhecimento de voz!',
        ageRange: '6–10 anos',
        badge: 'Voz Multilíngue',
      },
    ],
  },
  {
    id: 'junior_math',
    title: 'Matemática & Contas',
    subtitle: 'Cálculo Mental e Raciocínio Quantitativo',
    color: '#06B6D4', // Cyan
    lightColor: '#ECFEFF',
    icon: '🔢',
    description:
      'Adição, subtração, multiplicação lúdica, problemas do cotidiano e raciocínio lógico-matemático.',
    minAgeMonths: 72,
    maxAgeMonths: 120,
    themes: [
      {
        title: 'Cálculo Mental e Resolução de Problemas',
        whatIsWorked: 'Operações fundamentais (adição, subtração, multiplicação) e raciocínio quantitativo.',
        homeTips: [
          'Faça pequenos desafios com preços de compras ou troco em supermercado.',
          'Proponha jogos de cartas que envolvam somas e tabuadas rápidas.',
        ],
      },
    ],
    activities: [
      {
        id: 'junior_math_quest',
        title: 'Missão Matemática do Tico',
        description: 'Resolva contas e desafios matemáticos em ritmo de aventura espacial!',
        ageRange: '6–10 anos',
        badge: 'Desafio',
      },
    ],
  },
  {
    id: 'junior_logic',
    title: 'Matriz Lógica & Padrões',
    subtitle: 'Dedução Visual e Raciocínio 2x2',
    color: '#8B5CF6', // Violet
    lightColor: '#F5F3FF',
    icon: '🧩',
    description:
      'Matrizes 2x2 de formas e cores, rotação mental, correspondência lógica e raciocínio analítico.',
    minAgeMonths: 72,
    maxAgeMonths: 120,
    themes: [
      {
        title: 'Dedução Analítica e Padrões Espaciais',
        whatIsWorked: 'Análise de relações entre linhas/colunas, eliminação lógica e rotação mental.',
        homeTips: [
          'Pratiquem jogos como xadrez, damas, sudokus infantis ou quebra-cabeças 2D.',
          'Crie enigmas desenhados no papel para a criança completar.',
        ],
      },
    ],
    activities: [
      {
        id: 'junior_logic_matrix',
        title: 'Matriz Lógica 2x2',
        description: 'Analise linhas e colunas para descobrir qual figura completa a matriz visual!',
        ageRange: '6–10 anos',
        badge: 'Raciocínio',
      },
    ],
  },
  {
    id: 'junior_dictation',
    title: 'Ditado & Ortografia',
    subtitle: 'Escuta Atenta e Soletração',
    color: '#EC4899', // Pink
    lightColor: '#FDF2F8',
    icon: '✍️',
    description:
      'Escuta de palavras nos 5 idiomas, preenchimento de letras faltantes e digitação correta.',
    minAgeMonths: 72,
    maxAgeMonths: 120,
    themes: [
      {
        title: 'Ortografia, Soletração e Consciência Grafofonêmica',
        whatIsWorked: 'Atenção auditiva, memória fonológica e domínio ortográfico nos 5 idiomas.',
        homeTips: [
          'Brinquem de forca e caça-palavras com as palavras aprendidas na semana.',
          'Escreva bilhetes com pequenas missões para ler e responder.',
        ],
      },
    ],
    activities: [
      {
        id: 'junior_dictation_game',
        title: 'Ditado & Soletração Inteligente',
        description: 'Ouça a palavra pronunciada pelo Tico e monte a soletração exata!',
        ageRange: '6–10 anos',
        badge: '5 Idiomas',
      },
    ],
  },
]

export const ALL_COGNIKIDS_MODULES: ModuleDefinition[] = [...COGNIKIDS_MODULES, ...JUNIOR_MODULES]

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
  accuracyChange: number
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
  languageBreakdown: LanguageEvolutionStat[]
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

export function formatChildAge(birthDateStr: string, lang: AppLanguage = 'pt-BR'): string {
  const months = calculateAgeMonths(birthDateStr)

  if (lang === 'en') {
    if (months < 1) return 'Newborn'
    if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'}`
    const years = Math.floor(months / 12)
    const remMonths = months % 12
    if (remMonths === 0) return `${years} ${years === 1 ? 'year' : 'years'}`
    return `${years} ${years === 1 ? 'yr' : 'yrs'} and ${remMonths} ${remMonths === 1 ? 'mo' : 'mos'}`
  }

  if (lang === 'es') {
    if (months < 1) return 'Recién nacido'
    if (months < 12) return `${months} ${months === 1 ? 'mes' : 'meses'}`
    const years = Math.floor(months / 12)
    const remMonths = months % 12
    if (remMonths === 0) return `${years} ${years === 1 ? 'año' : 'años'}`
    return `${years} ${years === 1 ? 'año' : 'años'} y ${remMonths} ${remMonths === 1 ? 'mes' : 'meses'}`
  }

  if (lang === 'de') {
    if (months < 1) return 'Neugeborenes'
    if (months < 12) return `${months} ${months === 1 ? 'Monat' : 'Monate'}`
    const years = Math.floor(months / 12)
    const remMonths = months % 12
    if (remMonths === 0) return `${years} ${years === 1 ? 'Jahr' : 'Jahre'}`
    return `${years} ${years === 1 ? 'Jahr' : 'Jahre'} und ${remMonths} ${remMonths === 1 ? 'Monat' : 'Monate'}`
  }

  if (lang === 'fr') {
    if (months < 1) return 'Nouveau-né'
    if (months < 12) return `${months} ${months === 1 ? 'mois' : 'mois'}`
    const years = Math.floor(months / 12)
    const remMonths = months % 12
    if (remMonths === 0) return `${years} ${years === 1 ? 'an' : 'ans'}`
    return `${years} ${years === 1 ? 'an' : 'ans'} et ${remMonths} ${remMonths === 1 ? 'mois' : 'mois'}`
  }

  // Default pt-BR
  if (months < 1) return 'Recém-nascido'
  if (months < 12) return `${months} ${months === 1 ? 'mês' : 'meses'}`

  const years = Math.floor(months / 12)
  const remMonths = months % 12

  if (remMonths === 0) {
    return `${years} ${years === 1 ? 'ano' : 'anos'}`
  }
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${remMonths} ${remMonths === 1 ? 'mês' : 'meses'}`
}
