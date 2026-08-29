/**
 * Fuzzy word matching and pronunciation evaluation for pt-BR toddler speech.
 * Toddlers aged 12-60 months often have phonological simplifications
 * (e.g., "au-au" for cão, "papo" for sapo, "toto" for cachorro, "au" for leão/gato).
 */

// Normalize string: remove accents, lowercase, trim punctuation
export function normalizePtText(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Levenshtein distance calculation
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length
  const n = s2.length
  const d: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) d[i][0] = i
  for (let j = 0; j <= n; j++) d[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost, // substitution
      )
    }
  }
  return d[m][n]
}

// String similarity between 0 and 1
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizePtText(str1)
  const s2 = normalizePtText(str2)

  if (s1 === s2) return 1
  if (!s1 || !s2) return 0

  // Direct containment bonus (child said "o leão é grande" -> includes "leao")
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.95
  }

  // Token match bonus
  const tokens1 = s1.split(' ')
  const tokens2 = s2.split(' ')
  for (const t1 of tokens1) {
    for (const t2 of tokens2) {
      if (t1 === t2 && t1.length >= 2) return 0.92
    }
  }

  const maxLen = Math.max(s1.length, s2.length)
  const distance = levenshteinDistance(s1, s2)
  const sim = 1 - distance / maxLen
  return Math.max(0, Math.min(1, sim))
}

export interface EvaluationResult {
  score: number // 0 to 100
  stars: number // 1, 2, or 3
  feedback: string
  praise: string
  isRecognized: boolean
  matchType: 'exact' | 'phonetic' | 'alias' | 'partial' | 'attempt'
}

const PRAISES_3_STARS = [
  'Incrível! Você falou certinho! 🌟',
  'Que orgulho! Pronúncia maravilhosa! 🎉',
  'Uau! Você é um campeão da fala! 👏',
  'Perfeito! O Tico adorou sua voz! 🦜',
  'Sensacional! Que voz linda! ✨',
]

const PRAISES_2_STARS = [
  'Muito bem! Você quase acertou perfeitamente! 🎈',
  'Ótima tentativa! Você está aprendendo rápido! 🌱',
  'Bom trabalho! Continue falando assim! 👍',
  'Muito legal! Cada dia falando melhor! 🚀',
]

const PRAISES_1_STAR = [
  'Boa tentativa! Vamos tentar mais uma vez juntos? 💫',
  'Você conseguiu fazer um som lindo! Vamos treinar! 💖',
  'Adorei ouvir sua voz! Aos pouquinhos a gente aprende! 🐥',
]

export function evaluateSpeechAccuracy(
  transcript: string,
  targetWord: string,
  acceptedAliases: string[] = [],
  childAgeMonths: number = 36,
): EvaluationResult {
  const normTranscript = normalizePtText(transcript)
  const normTarget = normalizePtText(targetWord)
  const normAliases = acceptedAliases.map(normalizePtText)

  // Age tolerance: toddlers (<36 months) have a more forgiving grading threshold
  const ageFactor = childAgeMonths <= 24 ? 0.25 : childAgeMonths <= 36 ? 0.15 : 0.05

  // 1. Direct exact match
  if (normTranscript === normTarget || normTranscript.split(' ').includes(normTarget)) {
    const praise = PRAISES_3_STARS[Math.floor(Math.random() * PRAISES_3_STARS.length)]
    return {
      score: 100,
      stars: 3,
      feedback: `Você falou exatamente "${targetWord}"!`,
      praise,
      isRecognized: true,
      matchType: 'exact',
    }
  }

  // 2. Alias match (e.g. "au au" for cachorro, "miau" for gato)
  for (const alias of normAliases) {
    if (normTranscript === alias || normTranscript.includes(alias)) {
      const score = Math.min(100, Math.round(90 + ageFactor * 40))
      const praise = PRAISES_3_STARS[Math.floor(Math.random() * PRAISES_3_STARS.length)]
      return {
        score,
        stars: 3,
        feedback: `Muito bem! O som do bichinho também vale!`,
        praise,
        isRecognized: true,
        matchType: 'alias',
      }
    }
  }

  // 3. Similarity check with target and aliases
  let bestSim = calculateSimilarity(normTranscript, normTarget)
  for (const alias of normAliases) {
    const simAlias = calculateSimilarity(normTranscript, alias)
    if (simAlias > bestSim) bestSim = simAlias
  }

  // Boost similarity for toddlers
  const adjustedSim = Math.min(1, bestSim + ageFactor)
  const finalScore = Math.round(adjustedSim * 100)

  if (finalScore >= 75) {
    const praise = PRAISES_3_STARS[Math.floor(Math.random() * PRAISES_3_STARS.length)]
    return {
      score: finalScore,
      stars: 3,
      feedback: `Excelente pronúncia de "${targetWord}"!`,
      praise,
      isRecognized: true,
      matchType: 'phonetic',
    }
  } else if (finalScore >= 45) {
    const praise = PRAISES_2_STARS[Math.floor(Math.random() * PRAISES_2_STARS.length)]
    return {
      score: Math.max(50, finalScore),
      stars: 2,
      feedback: `Quase lá! Ouvimos você falar bem pertinho de "${targetWord}".`,
      praise,
      isRecognized: true,
      matchType: 'partial',
    }
  } else {
    const praise = PRAISES_1_STAR[Math.floor(Math.random() * PRAISES_1_STAR.length)]
    return {
      score: Math.max(30, finalScore),
      stars: 1,
      feedback: `Ouvimos sua tentativa! Praticar faz a gente ficar craque!`,
      praise,
      isRecognized: false,
      matchType: 'attempt',
    }
  }
}
