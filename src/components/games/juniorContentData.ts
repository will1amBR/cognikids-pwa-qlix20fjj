import { AppLanguage } from '@/types/cognikids'

export interface JuniorWordItem {
  id: string
  category: string
  difficulty: 'basic' | 'intermediate' | 'advanced'
  pt: {
    word: string
    phrase: string
    hint: string
    phonetic: string
  }
  en: {
    word: string
    phrase: string
    hint: string
    phonetic: string
  }
  es: {
    word: string
    phrase: string
    hint: string
    phonetic: string
  }
  de: {
    word: string
    phrase: string
    hint: string
    phonetic: string
  }
  fr: {
    word: string
    phrase: string
    hint: string
    phonetic: string
  }
}

export const JUNIOR_VOCABULARY_LIST: JuniorWordItem[] = [
  {
    id: 'jw_astronaut',
    category: 'Ciência & Espaço',
    difficulty: 'intermediate',
    pt: {
      word: 'Astronauta',
      phrase: 'O astronauta viaja para o espaço em um foguete.',
      hint: 'Pessoa que explora as estrelas e a lua',
      phonetic: 'As-tro-nau-ta',
    },
    en: {
      word: 'Astronaut',
      phrase: 'The astronaut travels to outer space in a rocket.',
      hint: 'A person trained to travel in a spacecraft',
      phonetic: 'As-tro-naut',
    },
    es: {
      word: 'Astronauta',
      phrase: 'El astronauta viaja al espacio en un cohete.',
      hint: 'Persona que viaja por el espacio exterior',
      phonetic: 'As-tro-nau-ta',
    },
    de: {
      word: 'Astronaut',
      phrase: 'Der Astronaut reist mit einer Rakete ins Weltall.',
      hint: 'Ein Mensch, der in den Weltraum fliegt',
      phonetic: 'As-tro-naut',
    },
    fr: {
      word: 'Astronaute',
      phrase: "L'astronaute voyage dans l'espace en fusée.",
      hint: 'Une personne qui voyage dans les étoiles',
      phonetic: 'As-tro-note',
    },
  },
  {
    id: 'jw_telescope',
    category: 'Ciência & Espaço',
    difficulty: 'intermediate',
    pt: {
      word: 'Telescópio',
      phrase: 'Com o telescópio conseguimos ver planetas distantes.',
      hint: 'Instrumento óptico para observar o céu noturno',
      phonetic: 'Te-les-có-pio',
    },
    en: {
      word: 'Telescope',
      phrase: 'With the telescope we can observe distant planets.',
      hint: 'An optical instrument to see distant objects',
      phonetic: 'Te-le-scope',
    },
    es: {
      word: 'Telescopio',
      phrase: 'Con el telescopio podemos ver los planetas.',
      hint: 'Instrumento para mirar las estrellas lejanas',
      phonetic: 'Te-les-co-pio',
    },
    de: {
      word: 'Teleskop',
      phrase: 'Mit dem Teleskop beobachten wir ferne Planeten.',
      hint: 'Ein Instrument zur Beobachtung des Sternenhimmels',
      phonetic: 'Te-les-kop',
    },
    fr: {
      word: 'Télescope',
      phrase: 'Avec le télescope, nous observons les planètes.',
      hint: 'Instrument pour observer le ciel et les étoiles',
      phonetic: 'Té-les-cop',
    },
  },
  {
    id: 'jw_dinosaur',
    category: 'História & Natureza',
    difficulty: 'basic',
    pt: {
      word: 'Dinossauro',
      phrase: 'O dinossauro fóssil foi descoberto no museu.',
      hint: 'Réptil gigante que viveu há milhões de anos',
      phonetic: 'Di-nos-sau-ro',
    },
    en: {
      word: 'Dinosaur',
      phrase: 'The giant dinosaur lived millions of years ago.',
      hint: 'An ancient prehistoric creature',
      phonetic: 'Di-no-saur',
    },
    es: {
      word: 'Dinosaurio',
      phrase: 'El gran dinosaurio vivió hace millones de años.',
      hint: 'Animal prehistórico fascinante',
      phonetic: 'Di-no-sau-rio',
    },
    de: {
      word: 'Dinosaurier',
      phrase: 'Der Dinosaurier lebte vor vielen Millionen Jahren.',
      hint: 'Ein urzeitliches Riesentier',
      phonetic: 'Di-no-sau-ri-er',
    },
    fr: {
      word: 'Dinosaure',
      phrase: 'Le dinosaure géant vivait il y a très longtemps.',
      hint: 'Un grand animal préhistorique',
      phonetic: 'Di-no-zor',
    },
  },
  {
    id: 'jw_volcano',
    category: 'Geografia & Planeta',
    difficulty: 'intermediate',
    pt: {
      word: 'Vulcão',
      phrase: 'A montanha do vulcão expeliu lava e cinzas.',
      hint: 'Abertura na crosta terrestre por onde sai magma',
      phonetic: 'Vul-cão',
    },
    en: {
      word: 'Volcano',
      phrase: 'The volcano erupts with glowing orange lava.',
      hint: 'A mountain with an opening that emits lava',
      phonetic: 'Vol-ca-no',
    },
    es: {
      word: 'Volcán',
      phrase: 'El volcán activo expulsa lava brillante.',
      hint: 'Montaña con cráter que expulsa fuego y cenizas',
      phonetic: 'Vol-cán',
    },
    de: {
      word: 'Vulkan',
      phrase: 'Der Vulkan stößt heiße rote Lava aus.',
      hint: 'Ein Berg, der Feuer und Lava spuckt',
      phonetic: 'Vul-kan',
    },
    fr: {
      word: 'Volcan',
      phrase: 'Le volcan entre en éruption avec de la lave.',
      hint: 'Une montagne qui crache de la lave et du feu',
      phonetic: 'Vol-can',
    },
  },
  {
    id: 'jw_adventure',
    category: 'Linguagem & Criatividade',
    difficulty: 'basic',
    pt: {
      word: 'Aventura',
      phrase: 'Tico e seus amigos começaram uma grande aventura.',
      hint: 'Uma jornada cheia de descobertas e emoção',
      phonetic: 'A-ven-tu-ra',
    },
    en: {
      word: 'Adventure',
      phrase: 'We are embarking on an exciting new adventure!',
      hint: 'An unusual and exciting journey',
      phonetic: 'Ad-ven-ture',
    },
    es: {
      word: 'Aventura',
      phrase: '¡Vamos a comenzar una emocionante aventura!',
      hint: 'Un viaje lleno de descubrimientos divertidos',
      phonetic: 'A-ven-tu-ra',
    },
    de: {
      word: 'Abenteuer',
      phrase: 'Wir beginnen ein spannendes neues Abenteuer!',
      hint: 'Ein aufregendes Erlebnis voller Entdeckungen',
      phonetic: 'A-ben-teu-er',
    },
    fr: {
      word: 'Aventure',
      phrase: 'Nous partons pour une merveilleuse aventure !',
      hint: 'Un voyage palpitant et plein de découvertes',
      phonetic: 'A-van-ture',
    },
  },
  {
    id: 'jw_ecosystem',
    category: 'Ciências & Meio Ambiente',
    difficulty: 'advanced',
    pt: {
      word: 'Ecossistema',
      phrase: 'A floresta tropical é um ecossistema muito rico.',
      hint: 'Conjunto de seres vivos e ambiente interagindo',
      phonetic: 'E-cos-sis-te-ma',
    },
    en: {
      word: 'Ecosystem',
      phrase: 'The coral reef is a rich marine ecosystem.',
      hint: 'A biological community of interacting organisms',
      phonetic: 'E-co-sys-tem',
    },
    es: {
      word: 'Ecosistema',
      phrase: 'El bosque es un ecosistema lleno de vida y fauna.',
      hint: 'Comunidad biológica en su hábitat natural',
      phonetic: 'E-co-sis-te-ma',
    },
    de: {
      word: 'Ökosystem',
      phrase: 'Der Wald ist ein wichtiges Ökosystem für die Erde.',
      hint: 'Eine Gemeinschaft von Pflanzen und Tieren',
      phonetic: 'Ö-ko-sys-tem',
    },
    fr: {
      word: 'Écosystème',
      phrase: 'La forêt est un écosystème précieux pour la planète.',
      hint: "Ensemble d'êtres vivants vivant en harmonie",
      phonetic: 'É-co-sis-tème',
    },
  },
]

export interface JuniorMathQuestion {
  id: string
  questionPt: string
  questionEn: string
  questionEs: string
  questionDe: string
  questionFr: string
  options: number[]
  correctAnswer: number
  explanationPt: string
}

export const JUNIOR_MATH_QUESTIONS: JuniorMathQuestion[] = [
  {
    id: 'm1',
    questionPt: 'Quanto é 7 + 8?',
    questionEn: 'What is 7 + 8?',
    questionEs: '¿Cuánto es 7 + 8?',
    questionDe: 'Wie viel ist 7 + 8?',
    questionFr: 'Combien fait 7 + 8 ?',
    options: [13, 14, 15, 16],
    correctAnswer: 15,
    explanationPt: '7 + 8 = 15! Excelente raciocínio rápido!',
  },
  {
    id: 'm2',
    questionPt: 'Tico tinha 24 sementes e plantou 9. Quantas sobraram?',
    questionEn: 'Tico had 24 seeds and planted 9. How many are left?',
    questionEs: 'Tico tenía 24 semillas y plantó 9. ¿Cuántas le quedan?',
    questionDe: 'Tico hatte 24 Samen und pflanzte 9. Wie viele sind übrig?',
    questionFr: 'Tico avait 24 graines et en a planté 9. Combien en reste-t-il ?',
    options: [13, 15, 16, 17],
    correctAnswer: 15,
    explanationPt: '24 - 9 = 15 sementes guardadas!',
  },
  {
    id: 'm3',
    questionPt: 'Quanto é 6 × 4?',
    questionEn: 'What is 6 × 4?',
    questionEs: '¿Cuánto es 6 × 4?',
    questionDe: 'Wie viel ist 6 × 4?',
    questionFr: 'Combien fait 6 × 4 ?',
    options: [20, 22, 24, 28],
    correctAnswer: 24,
    explanationPt: '6 grupos de 4 somam 24!',
  },
  {
    id: 'm4',
    questionPt: 'Um pacote tem 5 maçãs. Se você comprar 6 pacotes, quantas maçãs terá?',
    questionEn: 'A pack has 5 apples. If you buy 6 packs, how many apples do you get?',
    questionEs: 'Un paquete tiene 5 manzanas. Si compras 6 paquetes, ¿cuántas tienes?',
    questionDe: 'Eine Packung hat 5 Äpfel. Wie viele Äpfel sind 6 Packungen?',
    questionFr: 'Un sachet contient 5 pommes. Combien font 6 sachets ?',
    options: [25, 30, 35, 36],
    correctAnswer: 30,
    explanationPt: '5 × 6 = 30 maçãs suculentas!',
  },
  {
    id: 'm5',
    questionPt: 'Quanto é 48 ÷ 6?',
    questionEn: 'What is 48 ÷ 6?',
    questionEs: '¿Cuánto es 48 ÷ 6?',
    questionDe: 'Wie viel ist 48 ÷ 6?',
    questionFr: 'Combien fait 48 ÷ 6 ?',
    options: [6, 7, 8, 9],
    correctAnswer: 8,
    explanationPt: '48 dividido igualmente em 6 partes dá 8!',
  },
]

export interface JuniorLogicPattern {
  id: string
  title: string
  sequence: string[]
  options: string[]
  correctOption: string
  reason: string
}

export const JUNIOR_LOGIC_PATTERNS: JuniorLogicPattern[] = [
  {
    id: 'lp1',
    title: 'Progressão Numérica',
    sequence: ['3', '6', '9', '12', '?'],
    options: ['14', '15', '16', '18'],
    correctOption: '15',
    reason: 'Padrão de múltiplos de 3: somando +3 a cada passo (12 + 3 = 15).',
  },
  {
    id: 'lp2',
    title: 'Alternância Geométrica',
    sequence: ['🔴', '🔷', '🔴', '🔷', '🔴', '?'],
    options: ['🟡', '🔷', '🔴', '⭐'],
    correctOption: '🔷',
    reason: 'Padrão alternado A-B-A-B.',
  },
  {
    id: 'lp3',
    title: 'Dobro Sucessivo',
    sequence: ['2', '4', '8', '16', '?'],
    options: ['24', '30', '32', '36'],
    correctOption: '32',
    reason: 'Cada termo é multiplicado por 2 (16 × 2 = 32).',
  },
  {
    id: 'lp4',
    title: 'Ciclo dos Elementos',
    sequence: ['🌱', '🌿', '🌳', '🌱', '🌿', '?'],
    options: ['🌳', '🍂', '🍎', '⭐'],
    correctOption: '🌳',
    reason: 'Ciclo natural de 3 estágios da planta (semente, broto, árvore).',
  },
]
