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

  junior_vocab: {
    nameKey: 'module.junior_vocab',
    ptName: 'Vocabulário & Fala Pro',
    games: ['Construtor de Vocabulário & Frases'],
    wellPractice: {
      'pt-BR':
        'Pronúncia fluida de termos complexos e estruturação de frases completas nos 5 idiomas.',
      en: 'Fluent pronunciation of advanced words and complete sentence formulation.',
      es: 'Pronunciación fluida de palabras complejas y construcción de frases completas.',
      de: 'Flüssige Aussprache anspruchsvoller Wörter und ganzer Sätze.',
      fr: 'Prononciation fluide de termes complexes et construction de phrases complètes.',
    },
    wellHome: {
      'pt-BR':
        'Incentive a criança a explicar termos científicos ou do dia a dia com suas próprias palavras.',
      en: 'Encourage your child to explain science or everyday concepts in their own words.',
      es: 'Anima al niño a explicar conceptos científicos con sus propias palabras.',
      de: 'Ermutige das Kind, naturwissenschaftliche Begriffe mit eigenen Worten zu erklären.',
      fr: 'Encouragez l’enfant à expliquer des concepts scientifiques avec ses propres mots.',
    },
    improvePractice: {
      'pt-BR': 'Treino de pronúncia de palavras polissilábicas e leitura em voz alta.',
      en: 'Practice multisyllabic pronunciation and reading aloud.',
      es: 'Práctica de pronunciación de palabras polisilábicas y lectura en voz alta.',
      de: 'Üben von mehrsilbigen Wörtern und lautes Vorlesen.',
      fr: 'Entraînement à la prononciation des mots longs et lecture à voix haute.',
    },
    improveHome: {
      'pt-BR':
        'Leiam juntos um parágrafo de enciclopédia infantil e debatam o significado dos termos novos.',
      en: 'Read an illustrated science book together and explore newly discovered words.',
      es: 'Lean juntos un párrafo de libro infantil y comenten los términos nuevos.',
      de: 'Lest zusammen ein Kindersachbuch und besprecht neue Begriffe.',
      fr: 'Lisez ensemble un livre documentaire jeunesse et discutez des mots nouveaux.',
    },
  },

  junior_math: {
    nameKey: 'module.junior_math',
    ptName: 'Matemática & Contas',
    games: ['Missão Matemática do Tico'],
    wellPractice: {
      'pt-BR': 'Raciocínio ágil em adição, subtração, multiplicação e problemas do cotidiano.',
      en: 'Agile calculation in addition, subtraction, multiplication and word problems.',
      es: 'Cálculo mental ágil en suma, resta, multiplicación y problemas prácticos.',
      de: 'Schnelles Kopfrechnen in Addition, Subtraktion, Multiplikation und Textaufgaben.',
      fr: 'Calcul mental rapide en addition, soustraction, multiplication et problèmes.',
    },
    wellHome: {
      'pt-BR': 'Faça perguntas lúdicas no mercado: "Se pegarmos 3 maçãs de R$ 2, quanto dá?".',
      en: 'Ask playful grocery math questions: "If 3 apples cost 2 each, how much total?".',
      es: 'Haz preguntas lúdicas al comprar: "Si compramos 3 manzanas a 2 cada una, ¿cuánto es?".',
      de: 'Stelle spielerische Alltagsfragen beim Einkaufen: "3 Äpfel für je 2 Euro, wie viel?".',
      fr: 'Posez des énigmes lors des courses : "Si 3 pommes coûtent 2€ chacune, quel total ?".',
    },
    improvePractice: {
      'pt-BR': 'Fixação da tabuada com contagem em grupos e decomposição numérica.',
      en: 'Reinforce times tables and group counting decomposition.',
      es: 'Refuerzo de tablas de multiplicar y conteo en grupos.',
      de: 'Festigung des Einmaleins und Gruppenzählen.',
      fr: 'Renforcement des tables de multiplication et calcul par groupes.',
    },
    improveHome: {
      'pt-BR': 'Utilize feijões ou blocos de lego para visualizar agrupamentos e divisões.',
      en: 'Use Lego bricks or beans to visualize multiplication arrays and division.',
      es: 'Usa bloques de construcción para visualizar multiplicaciones y divisiones.',
      de: 'Nutze Bausteine, um Malreihen und Aufteilungen greifbar zu machen.',
      fr: 'Utilisez des briques de construction pour visualiser les multiplications.',
    },
  },

  junior_logic: {
    nameKey: 'module.junior_logic',
    ptName: 'Matriz Lógica & Padrões',
    games: ['Matriz Lógica 2x2'],
    wellPractice: {
      'pt-BR': 'Excelente dedução analítica de matrizes visuais, rotação mental e sequências.',
      en: 'Outstanding visual matrix deduction, mental rotation, and logical sequence solving.',
      es: 'Excelente deducción de matrices visuales, rotación mental y patrones.',
      de: 'Hervorragende visuelle Mustererkennung und logisches Denken in Matrizen.',
      fr: 'Excellente déduction visuelle dans les matrices et raisonnement spatial.',
    },
    wellHome: {
      'pt-BR': 'Proponha jogos de tabuleiro estratégicos como xadrez, damas ou quebra-cabeças 2D.',
      en: 'Engage with strategic board games like chess, checkers, or 2D logic puzzles.',
      es: 'Propón juegos de mesa estratégicos como ajedrez, damas o acertijos visuales.',
      de: 'Spielt Strategiespiele wie Schach, Dame oder knifflige Logikrätsel.',
      fr: 'Proposez des jeux de stratégie comme les échecs, dames ou casse-têtes.',
    },
    improvePractice: {
      'pt-BR': 'Análise passo a passo de linhas e colunas em matrizes e dedução por eliminação.',
      en: 'Step-by-step row/column matrix analysis and process-of-elimination.',
      es: 'Análisis paso a paso de filas y columnas en matrices con descarte.',
      de: 'Schrittweise Analyse von Zeilen und Spalten in Logikmatrizen.',
      fr: 'Analyse méthodique des lignes et colonnes dans les matrices logiques.',
    },
    improveHome: {
      'pt-BR':
        'Desenhe um quadrado 2x2 no papel com 3 símbolos e peça para a criança deduzir o quarto.',
      en: 'Draw a 2x2 grid with 3 shapes on paper and ask them to deduce the missing one.',
      es: 'Dibuja una cuadrícula 2x2 con 3 figuras y pide descubrir la que falta.',
      de: 'Zeichne ein 2x2-Gitter auf Papier und lass die fehlende Form erraten.',
      fr: 'Dessinez une grille 2x2 sur papier et demandez de trouver le symbole manquant.',
    },
  },

  junior_dictation: {
    nameKey: 'module.junior_dictation',
    ptName: 'Ditado & Ortografia',
    games: ['Ditado & Soletração Inteligente'],
    wellPractice: {
      'pt-BR': 'Alta precisão ortográfica, escuta atenta e domínio de regras nos 5 idiomas.',
      en: 'High spelling accuracy, attentive listening, and multilingual vocabulary grasp.',
      es: 'Gran precisión ortográfica, escucha atenta y dominio léxico.',
      de: 'Hohe Rechtschreibgenauigkeit, aufmerksames Zuhören und sichere Wortschreibung.',
      fr: 'Grande précision orthographique, écoute attentive et maîtrise de l’écrit.',
    },
    wellHome: {
      'pt-BR':
        'Escreva bilhetinhos secretos com desafios para a criança ler e responder por escrito.',
      en: 'Write short secret notes with fun missions for your child to read and reply in writing.',
      es: 'Escribe notas secretas con misiones divertidas para que responda por escrito.',
      de: 'Schreibt euch kleine Geheimnachrichten mit kurzen Aufgaben im Alltag.',
      fr: 'Écrivez de petits mots secrets avec des énigmes à lire et répondre par écrit.',
    },
    improvePractice: {
      'pt-BR': 'Atenção aos encontros consonantais, dígrafos e acentuação gráfica.',
      en: 'Focus on consonant clusters, phonetic nuances, and spelling patterns.',
      es: 'Atención a combinaciones de letras, dígrafos y acentos.',
      de: 'Fokus auf Laut-Buchstaben-Zuordnung und Doppelkonsonanten.',
      fr: 'Attention aux graphies complexes, accents et lettres muettes.',
    },
    improveHome: {
      'pt-BR': 'Brinque de forca ou caça-palavras com as palavras aprendidas na semana.',
      en: 'Play hangman or word-search puzzles featuring the weekly vocabulary.',
      es: 'Jueguen al ahorcado o sopa de letras con las palabras de la semana.',
      de: 'Spielt Galgenmännchen oder Wortsuchrätsel mit den Wochenwörtern.',
      fr: 'Jouez au pendu ou aux mots croisés avec les mots de la semaine.',
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
  const moduleIds = [
    'speech',
    'memory',
    'logic',
    'motor',
    'socioemotional',
    'junior_vocab',
    'junior_math',
    'junior_logic',
    'junior_dictation',
  ]
  const activeIds = Object.keys(progressMap).some((k) => k.startsWith('junior_'))
    ? [
        'junior_vocab',
        'junior_math',
        'junior_logic',
        'junior_dictation',
        'speech',
        'logic',
        'memory',
      ]
    : ['speech', 'memory', 'logic', 'motor', 'socioemotional']

  const areas: AreaDiagnostic[] = activeIds.map((modId) => {
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
