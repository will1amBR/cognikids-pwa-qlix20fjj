import type { AppLanguage } from '@/types/cognikids'

export interface AreaDiagnostic {
  moduleId: string
  moduleName: string
  score: number // 0 to 100
  status: 'doing_well' | 'needs_improvement'
  statusLabel: string
  statusColor: string
  statusBg: string
  statusBorder: string
  statusIcon: string
  summary: string
  levelUpTips: {
    whatToPractice: string
    recommendedGames: string[]
    homeReinforcement: string
  }
}

export interface ChildOverallDiagnostic {
  overallScore: number
  overallStatus: 'doing_well' | 'needs_improvement'
  statusLabel: string
  summary: string
  areas: AreaDiagnostic[]
  priorityAreas: AreaDiagnostic[]
  strongAreas: AreaDiagnostic[]
}

const MODULE_DATA_MAP: Record<
  string,
  {
    nameKey: string
    ptName: string
    games: string[]
    wellPractice: Record<string, string>
    wellHome: Record<string, string>
    improvePractice: Record<string, string>
    improveHome: Record<string, string>
  }
> = {
  speech: {
    nameKey: 'module.speech',
    ptName: 'Fala & Linguagem',
    games: ['Fazenda Falante (Fala & Voz)', 'Rima Divertida', 'Qual é o Som?'],
    wellPractice: {
      'pt-BR': 'A criança pronuncia fonemas com segurança e vocabulário expressivo rico.',
      en: 'The child articulates phonemes confidently with rich expressive vocabulary.',
      es: 'El niño pronuncia fonemas con seguridad y amplio vocabulario.',
      de: 'Das Kind artikuliert Laute sicher mit reichem Ausdruckswortschatz.',
      fr: 'L’enfant prononce les phonèmes avec assurance et un vocabulaire riche.',
    },
    wellHome: {
      'pt-BR':
        'Continue conversando durante a rotina e pedindo para a criança descrever historinhas.',
      en: 'Keep conversing during daily routines and ask your child to narrate small stories.',
      es: 'Continúa conversando durante el día y pídele que describa historias cortas.',
      de: 'Sprich im Alltag viel mit dem Kind und lass es kleine Erlebnisse nacherzählen.',
      fr: 'Poursuivez les échanges au quotidien en demandant à l’enfant de raconter des histoires.',
    },
    improvePractice: {
      'pt-BR':
        'Articulação de fonemas iniciais, repetição silábica pausada e imitação de sons de animais.',
      en: 'Articulation of initial phonemes, slow syllable repetition, and animal sound mimicry.',
      es: 'Articulación de fonemas iniciales, repetición silábica pausada e imitación de sonidos.',
      de: 'Artikulation von Anfangslauten, langsame Silbenwiederholung und Nachahmung von Tierlauten.',
      fr: 'Articulation des premiers phonèmes, répétition syllabique et imitation de sons.',
    },
    improveHome: {
      'pt-BR':
        'Brinque de cantar cantigas rimadas em frente ao espelho, exagerando o movimento da boca.',
      en: 'Sing rhyming nursery songs in front of the mirror, exaggerating mouth movements playfully.',
      es: 'Canten canciones con rimas frente al espejo exagerando el movimiento de la boca.',
      de: 'Singt Reime vor dem Spiegel und übertreibt dabei spielerisch die Mundbewegungen.',
      fr: 'Chantez des comptines devant le miroir en exagérant les mouvements de la bouche.',
    },
  },

  memory: {
    nameKey: 'module.memory',
    ptName: 'Memória & Atenção',
    games: ['Memória dos Dinos', 'Cadê o Bichinho?'],
    wellPractice: {
      'pt-BR': 'Boa retenção visual imediata e foco sustentado nas rodadas de pares.',
      en: 'Great immediate visual retention and sustained focus in memory matching rounds.',
      es: 'Buena retención visual inmediata y atención sostenida en pares.',
      de: 'Gute unmittelbare visuelle Merkfähigkeit und Ausdauer beim Paaresuchen.',
      fr: 'Bonne mémoire visuelle immédiate et attention soutenue dans les paires.',
    },
    wellHome: {
      'pt-BR': 'Desafie a criança a lembrar onde guardou brinquedos ou detalhes de livros lidos.',
      en: 'Challenge your child to recall toy spots or details from recently read books.',
      es: 'Desafía al niño a recordar dónde guardó juguetes o detalles de cuentos leídos.',
      de: 'Frage das Kind nach Details aus vorgelesenen Büchern oder versteckten Spielsachen.',
      fr: 'Invitez l’enfant à se souvenir de l’emplacement des jouets ou de détails de livres.',
    },
    improvePractice: {
      'pt-BR': 'Rastreamento visual de 2 a 4 elementos e jogos de memória de curta duração.',
      en: 'Visual tracking of 2 to 4 items and short-interval memory matching.',
      es: 'Seguimiento visual de 2 a 4 elementos y memoria de corta duración.',
      de: 'Visuelle Suche mit 2 bis 4 Elementen und kurze Merkspiele.',
      fr: 'Recherche visuelle de 2 à 4 éléments et jeux de mémoire courts.',
    },
    improveHome: {
      'pt-BR': 'Coloque 3 objetos na mesa, cubra um e pergunte: "Qual objeto sumiu?".',
      en: 'Place 3 items on a table, hide one under a cloth, and ask: "Which one disappeared?".',
      es: 'Coloca 3 objetos en la mesa, cubre uno y pregunta: "¿Cuál desapareció?".',
      de: 'Lege 3 Gegenstände auf den Tisch, verdecke einen und frage: "Was fehlt?".',
      fr: 'Posez 3 objets sur une table, cachez-en un et demandez : "Lequel a disparu ?".',
    },
  },

  logic: {
    nameKey: 'module.logic',
    ptName: 'Lógica & Cognição',
    games: ['Caixa das Formas', 'Conta Dinos (1 a 10)', 'Sequência de Padrões'],
    wellPractice: {
      'pt-BR': 'Compreensão sólida de ordenação, classificação por cores/formas e contagem.',
      en: 'Solid grasp of sorting, color/shape categorization, and playful counting.',
      es: 'Comprensión sólida de clasificación por formas, colores y conteo.',
      de: 'Sicheres Verständnis von Formen, Farbsortierung und Zahlenmengen.',
      fr: 'Solide compréhension du tri, des formes géométriques et du comptage.',
    },
    wellHome: {
      'pt-BR': 'Peça para agrupar meias por cores ou contar frutas na cesta da cozinha.',
      en: 'Ask them to group socks by color or count fruits into the kitchen bowl.',
      es: 'Pídele agrupar calcetines por color o contar frutas en la cocina.',
      de: 'Lass Socken nach Farben sortieren oder Äpfel in der Schale zählen.',
      fr: 'Demandez de trier les chaussettes par couleur ou de compter les fruits.',
    },
    improvePractice: {
      'pt-BR': 'Identificação individual de círculos/quadrados e contagem 1-a-1 com objetos reais.',
      en: 'Individual circle/square identification and 1-to-1 tactile counting.',
      es: 'Identificación de círculos/cuadrados y conteo 1 a 1 con objetos reales.',
      de: 'Erkennen von Kreis/Quadrat und Eins-zu-eins-Zählen mit echten Gegenständen.',
      fr: 'Identification des cercles/carrés et comptage un à un avec des objets réels.',
    },
    improveHome: {
      'pt-BR': 'Separe tampinhas coloridas e blocos de montar, pedindo para colocar azul com azul.',
      en: 'Sort colored plastic cups and building blocks: "Let’s put blue with blue!".',
      es: 'Separen tapitas de colores y bloques: "¡Pongamos azul con azul!".',
      de: 'Sortiert bunte Bausteine: "Lass uns blau zu blau legen!".',
      fr: 'Triez des bouchons de couleur : "Mettons le bleu avec le bleu !".',
    },
  },

  motor: {
    nameKey: 'module.motor',
    ptName: 'Motricidade',
    games: ['Estoura Bolhas', 'Sequência de Cores'],
    wellPractice: {
      'pt-BR': 'Excelente coordenação olho-mão, agilidade de toque e rastreamento de movimento.',
      en: 'Excellent hand-eye coordination, touch precision, and visual tracking.',
      es: 'Excelente coordinación ojo-mano, agilidad de toque y destreza.',
      de: 'Hervorragende Hand-Auge-Koordination und präzise Tippbewegungen.',
      fr: 'Excellente coordination œil-main et précision du toucher.',
    },
    wellHome: {
      'pt-BR': 'Estimule brincadeiras com massinha de modelar, encaixes e pintura a dedo.',
      en: 'Encourage playdough modeling, nesting cups, and finger painting.',
      es: 'Estimula juegos con plastilina, encajes y pintura de dedos.',
      de: 'Fördere Kneten, Steckspiele und Fingerfarben-Malen.',
      fr: 'Encouragez la pâte à modeler, les encastrements et la peinture aux doigts.',
    },
    improvePractice: {
      'pt-BR': 'Treino de toque centralizado, preensão em pinça e desaceleração do movimento.',
      en: 'Central target tapping, pincer grasp exercises, and steady movements.',
      es: 'Práctica de toque centrado, agarre de pinza y movimientos pausados.',
      de: 'Gezieltes Antippen, Pinzettengriff und ruhige Fingerführung.',
      fr: 'Entraînement au toucher centré, pince fine et mouvements posés.',
    },
    improveHome: {
      'pt-BR': 'Rasgar papéis coloridos com as pontinhas dos dedos e colar em folhas brancas.',
      en: 'Tear colored paper with fingertips and glue them onto paper sheets.',
      es: 'Rasgar papelitos de colores con los dedos y pegarlos en hojas blancas.',
      de: 'Buntes Papier mit den Fingerspitzen zerreißen und aufkleben.',
      fr: 'Déchirer du papier avec le bout des doigts et coller sur des feuilles.',
    },
  },

  socioemotional: {
    nameKey: 'module.socioemotional',
    ptName: 'Socioemocional',
    games: ['Carinhas Felizes', 'Clima e Roupinha'],
    wellPractice: {
      'pt-BR': 'Identificação clara de sentimentos (alegria, tristeza, calma) e autonomia básica.',
      en: 'Clear identification of core feelings (happy, sad, calm) and daily autonomy.',
      es: 'Identificación clara de emociones (alegría, tristeza, calma) y autonomía.',
      de: 'Sicheres Benennen von Grundgefühlen (Freude, Trauer) und Alltagsselbstständigkeit.',
      fr: 'Identification claire des émotions (joie, tristesse, calme) et autonomie.',
    },
    wellHome: {
      'pt-BR': 'Pergunte no fim do dia: "Qual momento te deixou mais feliz hoje?".',
      en: 'Ask at bedtime: "What part of today made you smile the biggest?".',
      es: 'Pregúntale al final del día: "¿Qué te hizo más feliz hoy?".',
      de: 'Frage abends: "Was hat dich heute am glücklichsten gemacht?".',
      fr: 'Demandez le soir : "Quel moment t’a rendu le plus heureux aujourd’hui ?".',
    },
    improvePractice: {
      'pt-BR': 'Nomeação de expressões faciais simples e rotina guiada de vestir/tempo.',
      en: 'Naming facial expressions and guided weather/dressing matching.',
      es: 'Nombrar expresiones faciales y asociar ropa con el clima.',
      de: 'Benennen von Gesichtsausdrücken und Zuordnen von Kleidung zum Wetter.',
      fr: 'Nommer les expressions du visage et associer les vêtements à la météo.',
    },
    improveHome: {
      'pt-BR':
        'Fazer caretas no espelho imitando "cara de surpreso", "cara de contente" e "cara de bravo".',
      en: 'Make funny mirror faces together: "surprised face", "happy face", and "sleepy face".',
      es: 'Hagan caras en el espejo imitando sorpresa, alegría y calma.',
      de: 'Macht Grimassen vor dem Spiegel: "überrascht", "fröhlich" und "müde".',
      fr: 'Faites des grimaces devant la glace : visage surpris, joyeux et calme.',
    },
  },
}

// Score threshold: >= 60% = doing_well, < 60% = needs_improvement
export function evaluateModuleDevelopment(
  moduleId: string,
  score: number,
  lang: AppLanguage = 'pt-BR',
): AreaDiagnostic {
  const meta = MODULE_DATA_MAP[moduleId] || MODULE_DATA_MAP['speech']
  const isWell = score >= 60

  const status = isWell ? 'doing_well' : 'needs_improvement'
  const statusLabel = isWell
    ? lang === 'en'
      ? 'Doing well! 🌟'
      : lang === 'es'
        ? '¡Va muy bien! 🌟'
        : lang === 'de'
          ? 'Läuft super! 🌟'
          : lang === 'fr'
            ? 'Tout va bien ! 🌟'
            : 'Está indo bem! 🌟'
    : lang === 'en'
      ? 'Needs improvement 🎯'
      : lang === 'es'
        ? 'Necesita mejorar 🎯'
        : lang === 'de'
          ? 'Verbesserungsbedarf 🎯'
          : lang === 'fr'
            ? 'À améliorer 🎯'
            : 'Precisa melhorar 🎯'

  const statusColor = isWell ? 'text-emerald-700' : 'text-amber-700'
  const statusBg = isWell ? 'bg-emerald-50' : 'bg-amber-50'
  const statusBorder = isWell ? 'border-emerald-200' : 'border-amber-200'
  const statusIcon = isWell ? '🌟' : '🎯'

  const langKey = lang.startsWith('en')
    ? 'en'
    : lang.startsWith('es')
      ? 'es'
      : lang.startsWith('de')
        ? 'de'
        : lang.startsWith('fr')
          ? 'fr'
          : 'pt-BR'

  const summary = isWell
    ? meta.wellPractice[langKey] || meta.wellPractice['pt-BR']
    : meta.improvePractice[langKey] || meta.improvePractice['pt-BR']

  const homeReinforcement = isWell
    ? meta.wellHome[langKey] || meta.wellHome['pt-BR']
    : meta.improveHome[langKey] || meta.improveHome['pt-BR']

  return {
    moduleId,
    moduleName: meta.ptName,
    score,
    status,
    statusLabel,
    statusColor,
    statusBg,
    statusBorder,
    statusIcon,
    summary,
    levelUpTips: {
      whatToPractice: summary,
      recommendedGames: meta.games,
      homeReinforcement,
    },
  }
}

export function computeChildDevelopmentDiagnostic(
  progressMap: Record<string, number>,
  lang: AppLanguage = 'pt-BR',
): ChildOverallDiagnostic {
  const moduleIds = ['speech', 'memory', 'logic', 'motor', 'socioemotional']
  const areas: AreaDiagnostic[] = moduleIds.map((modId) => {
    const score = progressMap[modId] !== undefined ? progressMap[modId] : 50
    return evaluateModuleDevelopment(modId, score, lang)
  })

  const overallScore = Math.round(areas.reduce((acc, a) => acc + a.score, 0) / (areas.length || 1))

  const isWell = overallScore >= 60
  const overallStatus = isWell ? 'doing_well' : 'needs_improvement'

  const statusLabel = isWell
    ? lang === 'en'
      ? 'Overall: Doing great! 🌟'
      : lang === 'es'
        ? 'General: ¡Va muy bien! 🌟'
        : lang === 'de'
          ? 'Gesamt: Läuft prima! 🌟'
          : lang === 'fr'
            ? 'Global : Tout va très bien ! 🌟'
            : 'Geral: Está indo muito bem! 🌟'
    : lang === 'en'
      ? 'Overall: Needs playful focus 🎯'
      : lang === 'es'
        ? 'General: Necesita refuerzo 🎯'
        : lang === 'de'
          ? 'Gesamt: Spielerischer Förderbedarf 🎯'
          : lang === 'fr'
            ? 'Global : Renforcement conseillé 🎯'
            : 'Geral: Precisa de reforço lúdico 🎯'

  const summary = isWell
    ? lang === 'en'
      ? 'High neural assimilation across tested areas. On track for cognitive age.'
      : 'Alta assimilação nas áreas avaliadas. Desenvolvimento adequado e excelente fixação cerebral.'
    : lang === 'en'
      ? 'Some areas require guided repetition and short daily sessions to reach expected milestones.'
      : 'Algumas áreas pedem repetições curtas e reforço lúdico no dia a dia para acelerar a maturação.'

  const priorityAreas = areas.filter((a) => a.status === 'needs_improvement')
  const strongAreas = areas.filter((a) => a.status === 'doing_well')

  return {
    overallScore,
    overallStatus,
    statusLabel,
    summary,
    areas,
    priorityAreas,
    strongAreas,
  }
}
