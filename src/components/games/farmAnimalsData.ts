export interface AnimalItem {
  id: string
  name: string
  emoji: string
  soundKey: string
  actionDescription: string
  promptText: string
  acceptedAliases: string[]
  bgGradient: string
  minAgeMonths: number
}

export const FARM_ANIMALS: AnimalItem[] = [
  {
    id: 'leao',
    name: 'Leão',
    emoji: '🦁',
    soundKey: 'leao',
    actionDescription: 'O leão é o rei da selva e solta um rugido bem forte!',
    promptText: 'Agora é a sua vez! Fale: Leão!',
    acceptedAliases: ['leao', 'leão', 'rei leao', 'rugido', 'miau grande', 'rau'],
    bgGradient: 'from-amber-400 to-orange-500',
    minAgeMonths: 12,
  },
  {
    id: 'vaca',
    name: 'Vaca',
    emoji: '🐮',
    soundKey: 'vaca',
    actionDescription: 'A vaquinha vive no pasto e faz: Muuu!',
    promptText: 'Agora fale bem bonito: Vaca!',
    acceptedAliases: ['vaca', 'vaquinha', 'mu', 'muu', 'muuu', 'bicho mu'],
    bgGradient: 'from-emerald-400 to-teal-600',
    minAgeMonths: 12,
  },
  {
    id: 'pato',
    name: 'Pato',
    emoji: '🦆',
    soundKey: 'pato',
    actionDescription: 'O patinho nada na lagoa e faz: Quá quá!',
    promptText: 'Agora repita com o Tico: Pato!',
    acceptedAliases: ['pato', 'patinho', 'qua', 'qua qua', 'quack'],
    bgGradient: 'from-sky-400 to-blue-600',
    minAgeMonths: 12,
  },
  {
    id: 'gato',
    name: 'Gato',
    emoji: '🐱',
    soundKey: 'gato',
    actionDescription: 'O gatinho adora carinho e faz: Miau miau!',
    promptText: 'Agora fale: Gato!',
    acceptedAliases: ['gato', 'gatinho', 'miau', 'miau miau', 'miauzinho'],
    bgGradient: 'from-purple-400 to-indigo-600',
    minAgeMonths: 12,
  },
  {
    id: 'cachorro',
    name: 'Cachorro',
    emoji: '🐶',
    soundKey: 'cachorro',
    actionDescription: 'O cachorrinho abana o rabinho e faz: Au au!',
    promptText: 'Agora fale: Cachorro!',
    acceptedAliases: ['cachorro', 'cachorrinho', 'cao', 'cão', 'au au', 'auau', 'toto', 'totó'],
    bgGradient: 'from-amber-500 to-yellow-600',
    minAgeMonths: 12,
  },
  {
    id: 'ovelha',
    name: 'Ovelha',
    emoji: '🐑',
    soundKey: 'ovelha',
    actionDescription: 'A ovelhinha tem lã fofinha e faz: Mééé!',
    promptText: 'Agora fale: Ovelha!',
    acceptedAliases: ['ovelha', 'ovelhinha', 'me', 'meee', 'mé', 'mééé'],
    bgGradient: 'from-rose-400 to-pink-600',
    minAgeMonths: 12,
  },
  {
    id: 'elefante',
    name: 'Elefante',
    emoji: '🐘',
    soundKey: 'elefante',
    actionDescription: 'O elefante tem uma tromba gigante!',
    promptText: 'Agora tente falar: Elefante!',
    acceptedAliases: ['elefante', 'elefantinho', 'fante', 'tromba'],
    bgGradient: 'from-cyan-500 to-blue-700',
    minAgeMonths: 18,
  },
  {
    id: 'macaco',
    name: 'Macaco',
    emoji: '🐒',
    soundKey: 'macaco',
    actionDescription: 'O macaco pula nos galhos e faz: Uh uh ah ah!',
    promptText: 'Agora fale: Macaco!',
    acceptedAliases: ['macaco', 'macaquinho', 'uh uh', 'uh uh ah ah', 'caco'],
    bgGradient: 'from-orange-500 to-amber-700',
    minAgeMonths: 18,
  },
]
