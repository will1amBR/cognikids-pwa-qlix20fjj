import type { AppLanguage } from '@/types/cognikids'

export type TranslationKey =
  // Navigation & Shell
  | 'nav.home'
  | 'nav.children'
  | 'nav.progress'
  | 'nav.reports'
  | 'nav.themesGuide'
  | 'nav.community'
  | 'nav.settings'
  | 'nav.schoolPortal'
  | 'nav.logout'
  | 'nav.addChild'
  | 'nav.registeredChildren'
  | 'nav.language'
  | 'nav.audio'
  | 'nav.myProfile'
  | 'nav.navigation'
  | 'nav.back'

  // Header & General
  | 'app.title'
  | 'app.tagline'
  | 'app.welcomeGuardian'
  | 'app.selectChild'
  | 'app.offlineReady'
  | 'app.online'
  | 'app.offline'
  | 'app.syncing'
  | 'app.synced'
  | 'app.minutesPerDay'
  | 'app.activitiesCount'

  // Onboarding
  | 'onboarding.stepWelcomeTitle'
  | 'onboarding.stepWelcomeSubtitle'
  | 'onboarding.stepProfileTitle'
  | 'onboarding.stepProfileSubtitle'
  | 'onboarding.childName'
  | 'onboarding.childNamePlaceholder'
  | 'onboarding.birthDate'
  | 'onboarding.ageInMonths'
  | 'onboarding.favoriteColor'
  | 'onboarding.stepLanguagesTitle'
  | 'onboarding.stepLanguagesSubtitle'
  | 'onboarding.stepLanguagesHint'
  | 'onboarding.stepRecommendationsTitle'
  | 'onboarding.stepRecommendationsSubtitle'
  | 'onboarding.recommendedForAge'
  | 'onboarding.startDailySession'
  | 'onboarding.goToDashboard'
  | 'onboarding.next'
  | 'onboarding.previous'
  | 'onboarding.saving'
  | 'onboarding.welcomeTicoGreeting'
  | 'onboarding.recommendedActivitiesList'
  | 'onboarding.languagesSelectedCount'

  // Development Status
  | 'status.doingWell'
  | 'status.needsImprovement'
  | 'status.doingWellDesc'
  | 'status.needsImprovementDesc'
  | 'status.levelUpGuide'
  | 'status.whatToPractice'
  | 'status.recommendedGames'
  | 'status.homeReinforcement'
  | 'status.overallStatus'
  | 'status.areaStatus'
  | 'status.assimilationRate'
  | 'status.priorityFocus'
  | 'status.goodProgress'
  | 'status.highMastery'

  // Dashboard & Flower
  | 'dashboard.brainFlower'
  | 'dashboard.brainFlowerDesc'
  | 'dashboard.learningModules'
  | 'dashboard.clickToPlay'
  | 'dashboard.dailySession'
  | 'dashboard.dailySessionDesc'
  | 'dashboard.allGames'
  | 'dashboard.achievements'
  | 'dashboard.medals'
  | 'dashboard.medalsCount'
  | 'dashboard.playInArea'
  | 'dashboard.howToUnlock'
  | 'dashboard.unlockedAt'
  | 'dashboard.readyToPlay'
  | 'dashboard.modulesAdapted'

  // Games & Speech
  | 'game.start'
  | 'game.listening'
  | 'game.evaluating'
  | 'game.tapToSpeak'
  | 'game.tapToFinish'
  | 'game.listenAgain'
  | 'game.tryAgain'
  | 'game.nextWord'
  | 'game.completed'
  | 'game.victoryTitle'
  | 'game.speechAccuracy'
  | 'game.playAgain'
  | 'game.backToProgress'
  | 'game.roundOf'
  | 'game.languageSelector'
  | 'game.practicingIn'

  // Reports
  | 'reports.title'
  | 'reports.subtitle'
  | 'reports.weekly'
  | 'reports.monthly'
  | 'reports.exportPdf'
  | 'reports.exporting'
  | 'reports.averageAssimilation'
  | 'reports.totalGames'
  | 'reports.starsEarned'
  | 'reports.vsPrevious'
  | 'reports.pediatricianBannerTitle'
  | 'reports.pediatricianBannerDesc'
  | 'reports.generatePdfPrint'
  | 'reports.assimilationByArea'
  | 'reports.pedagogicalTips'
  | 'reports.pedagogicalTipsDesc'
  | 'reports.ticoTipTitle'
  | 'reports.ticoTipDesc'

  // Settings & Reminders
  | 'settings.title'
  | 'settings.subtitle'
  | 'settings.guardianData'
  | 'settings.guardianName'
  | 'settings.loginEmail'
  | 'settings.save'
  | 'settings.saving'
  | 'settings.changeEmail'
  | 'settings.storageOffline'
  | 'settings.storageOfflineDesc'
  | 'settings.forceSync'
  | 'settings.syncNow'
  | 'settings.reminderTitle'
  | 'settings.reminderSubtitle'
  | 'settings.reminderTime'
  | 'settings.interfaceLanguage'
  | 'settings.interfaceLanguageDesc'

  // Modules Names & Descriptions
  | 'module.speech'
  | 'module.speechSub'
  | 'module.speechDesc'
  | 'module.memory'
  | 'module.memorySub'
  | 'module.memoryDesc'
  | 'module.logic'
  | 'module.logicSub'
  | 'module.logicDesc'
  | 'module.motor'
  | 'module.motorSub'
  | 'module.motorDesc'
  | 'module.socioemotional'
  | 'module.socioemotionalSub'
  | 'module.socioemotionalDesc'

export const translations: Record<AppLanguage, Record<TranslationKey, string>> = {
  'pt-BR': {
    'nav.home': 'Início',
    'nav.children': 'Perfis',
    'nav.progress': 'Progresso',
    'nav.reports': 'Relatórios',
    'nav.themesGuide': 'Guia Pais',
    'nav.community': 'Convites & Escola',
    'nav.settings': 'Configurações',
    'nav.schoolPortal': 'Portal da Escola',
    'nav.logout': 'Sair',
    'nav.addChild': 'Adicionar nova criança',
    'nav.registeredChildren': 'Crianças cadastradas',
    'nav.language': 'Idioma',
    'nav.audio': 'Áudio',
    'nav.myProfile': 'Meus dados',
    'nav.navigation': 'Navegação',
    'nav.back': 'Voltar',

    'app.title': 'CogniKids',
    'app.tagline': 'Desenvolvimento infantil inteligente e lúdico',
    'app.welcomeGuardian': 'Bem-vindo(a), {name}!',
    'app.selectChild': 'Selecionar criança',
    'app.offlineReady': 'Modo offline pronto',
    'app.online': 'Conectado',
    'app.offline': 'Offline',
    'app.syncing': 'Sincronizando…',
    'app.synced': 'Sincronizado',
    'app.minutesPerDay': '{min} min/dia',
    'app.activitiesCount': '{count} atividades',

    'onboarding.stepWelcomeTitle': 'Bem-vindo ao CogniKids!',
    'onboarding.stepWelcomeSubtitle':
      'Vamos configurar a jornada do seu pequeno(a) com o mascote Tico.',
    'onboarding.stepProfileTitle': 'Perfil da Criança',
    'onboarding.stepProfileSubtitle':
      'Informe a idade em meses para calibrarmos os estímulos neurológicos certos.',
    'onboarding.childName': 'Nome ou apelido da criança',
    'onboarding.childNamePlaceholder': 'Ex: Sophia, Lucas, Theo...',
    'onboarding.birthDate': 'Data de nascimento ou idade em meses',
    'onboarding.ageInMonths': 'Idade: {months} meses ({formatted})',
    'onboarding.favoriteColor': 'Cor favorita (tema do perfil)',
    'onboarding.stepLanguagesTitle': 'Idiomas de Aprendizagem',
    'onboarding.stepLanguagesSubtitle':
      'Quais idiomas a criança está aprendendo ou ouvindo em casa?',
    'onboarding.stepLanguagesHint':
      'Você pode escolher vários idiomas ao mesmo tempo. As atividades se adaptarão!',
    'onboarding.stepRecommendationsTitle': 'Plano Recomendado pelo Tico',
    'onboarding.stepRecommendationsSubtitle':
      'Com base na idade ({months} meses), selecionamos as melhores atividades:',
    'onboarding.recommendedForAge': 'Recomendado para {months} meses',
    'onboarding.startDailySession': 'Iniciar Sessão Diária Inicial 🚀',
    'onboarding.goToDashboard': 'Ir para o Painel',
    'onboarding.next': 'Continuar',
    'onboarding.previous': 'Voltar',
    'onboarding.saving': 'Criando perfil…',
    'onboarding.welcomeTicoGreeting':
      'Olá! Eu sou o Tico! Vou acompanhar cada passo da fala, memória e lógica!',
    'onboarding.recommendedActivitiesList': 'Jogos selecionados para esta faixa etária:',
    'onboarding.languagesSelectedCount': '{count} idioma(s) selecionado(s)',

    'status.doingWell': 'Está indo bem! 🌟',
    'status.needsImprovement': 'Precisa melhorar 🎯',
    'status.doingWellDesc':
      'Assimilação alta e adequada para a faixa etária. Ótima fixação neuronal!',
    'status.needsImprovementDesc':
      'Assimilação abaixo do esperado para a idade. Recomenda-se reforço lúdico.',
    'status.levelUpGuide': 'Como subir de nível:',
    'status.whatToPractice': 'O que praticar',
    'status.recommendedGames': 'Jogos recomendados',
    'status.homeReinforcement': 'Reforço em casa',
    'status.overallStatus': 'Status Geral de Desenvolvimento',
    'status.areaStatus': 'Status por Área Cognitiva',
    'status.assimilationRate': 'Taxa de assimilação',
    'status.priorityFocus': 'Foco Prioritário',
    'status.goodProgress': 'Em Boa Evolução',
    'status.highMastery': 'Excelente Maestria',

    'dashboard.brainFlower': 'Cérebro em Flor',
    'dashboard.brainFlowerDesc':
      'Cada pétala cresce conforme a criança assimila novas palavras, reflexos e padrões.',
    'dashboard.learningModules': 'Módulos de Aprendizagem',
    'dashboard.clickToPlay': 'Clique para jogar',
    'dashboard.dailySession': 'Sessão Diária',
    'dashboard.dailySessionDesc': 'Rotina calibrada com jogos rápidos do dia',
    'dashboard.allGames': 'Todos os Jogos',
    'dashboard.achievements': 'Conquistas',
    'dashboard.medals': 'Galeria de Medalhas',
    'dashboard.medalsCount': '{unlocked} / {total} medalhas',
    'dashboard.playInArea': 'Jogar nesta área',
    'dashboard.howToUnlock': 'Como Desbloquear',
    'dashboard.unlockedAt': 'Conquistada em {date}',
    'dashboard.readyToPlay': '{name} está pronto(a)!',
    'dashboard.modulesAdapted': 'Módulos adaptados à idade.',

    'game.start': 'Começar',
    'game.listening': 'Estou ouvindo você...',
    'game.evaluating': 'Analisando a pronúncia…',
    'game.tapToSpeak': 'Toque no microfone e fale "{word}"',
    'game.tapToFinish': 'Ouvindo... Toque para finalizar',
    'game.listenAgain': 'Ouvir novamente',
    'game.tryAgain': 'Tentar de novo',
    'game.nextWord': 'Próximo',
    'game.completed': 'Partida Concluída! 🎉',
    'game.victoryTitle': 'Parabéns! Você arrasou! 🏆',
    'game.speechAccuracy': 'Precisão da Fala',
    'game.playAgain': 'Jogar de novo',
    'game.backToProgress': 'Voltar ao progresso',
    'game.roundOf': 'Rodada {current} de {total}',
    'game.languageSelector': 'Idioma da Atividade:',
    'game.practicingIn': 'Praticando em {lang}',

    'reports.title': 'Relatórios de Evolução & Dicas',
    'reports.subtitle':
      'Acompanhe o desenvolvimento cognitivo e vocal por período com status claro de assimilação',
    'reports.weekly': 'Semanal (7d)',
    'reports.monthly': 'Mensal (30d)',
    'reports.exportPdf': 'Exportar Relatório PDF',
    'reports.exporting': 'Gerando PDF…',
    'reports.averageAssimilation': 'Assimilação Média',
    'reports.totalGames': 'Partidas no Período',
    'reports.starsEarned': 'Estrelas Obtidas',
    'reports.vsPrevious': 'vs período anterior',
    'reports.pediatricianBannerTitle': 'Levar este relatório ao Pediatra ou à Escola?',
    'reports.pediatricianBannerDesc':
      'Gere um documento executivo formatado com o Cérebro em Flor, status por área e orientações para subir de nível.',
    'reports.generatePdfPrint': 'Gerar PDF para Impressão',
    'reports.assimilationByArea': 'Assimilação por Área do Cérebro',
    'reports.pedagogicalTips': 'Cartões de Dicas & Subida de Nível',
    'reports.pedagogicalTipsDesc':
      'Orientações práticas para subir de nível e reforço em casa conforme o desempenho',
    'reports.ticoTipTitle': 'Dica do Mascote Tico:',
    'reports.ticoTipDesc':
      'Crianças na faixa dos 0 aos 60 meses evoluem em saltos naturais. Sessões curtas de 10 a 15 minutos diários com repetição de palavras e identificação de padrões trazem os melhores resultados!',

    'settings.title': 'Ajustes & Conta',
    'settings.subtitle': 'Configurações da conta, idioma da interface e sincronização offline',
    'settings.guardianData': 'Meus Dados',
    'settings.guardianName': 'Nome do responsável',
    'settings.loginEmail': 'Email de login',
    'settings.save': 'Salvar',
    'settings.saving': 'Salvando…',
    'settings.changeEmail': 'Alterar email',
    'settings.storageOffline': 'Armazenamento & Offline',
    'settings.storageOfflineDesc':
      'O CogniKids funciona sem conexão. Suas jogadas são salvas no aparelho e sincronizadas com a nuvem automaticamente.',
    'settings.forceSync': 'Forçar sincronização manual',
    'settings.syncNow': 'Sincronizar agora',
    'settings.reminderTitle': 'Lembrete Diário da Sessão',
    'settings.reminderSubtitle':
      'Receba notificações no melhor horário para brincar com seu filho(a)',
    'settings.reminderTime': 'Horário do lembrete',
    'settings.interfaceLanguage': 'Idioma do Aplicativo (UI)',
    'settings.interfaceLanguageDesc': 'Selecione o idioma da interface entre os 5 suportados',

    'module.speech': 'Fala & Linguagem',
    'module.speechSub': 'Comunicação e Vocabulário',
    'module.speechDesc': 'Estimula a articulação, repertório de palavras e associação sonora.',
    'module.memory': 'Memória & Atenção',
    'module.memorySub': 'Foco e Retenção Visual',
    'module.memoryDesc': 'Fortalece a memória de trabalho e concentração com desafios lúdicos.',
    'module.logic': 'Lógica & Cognição',
    'module.logicSub': 'Formas, Cores e Números',
    'module.logicDesc': 'Classificação por cores, formas geométricas, sequências e contagem.',
    'module.motor': 'Motricidade',
    'module.motorSub': 'Coordenação e Toque',
    'module.motorDesc': 'Precisão motora fina, rastreamento visual e agilidade de toque.',
    'module.socioemotional': 'Socioemocional',
    'module.socioemotionalSub': 'Sentimentos e Autonomia',
    'module.socioemotionalDesc':
      'Reconhecimento de emoções, autorregulação e autonomia no vestir/clima.',
  },

  en: {
    'nav.home': 'Home',
    'nav.children': 'Profiles',
    'nav.progress': 'Progress',
    'nav.reports': 'Reports',
    'nav.themesGuide': 'Parents Guide',
    'nav.community': 'Invites & School',
    'nav.settings': 'Settings',
    'nav.schoolPortal': 'School Portal',
    'nav.logout': 'Sign out',
    'nav.addChild': 'Add new child',
    'nav.registeredChildren': 'Registered children',
    'nav.language': 'Language',
    'nav.audio': 'Audio',
    'nav.myProfile': 'My profile',
    'nav.navigation': 'Navigation',
    'nav.back': 'Back',

    'app.title': 'CogniKids',
    'app.tagline': 'Smart & playful child development',
    'app.welcomeGuardian': 'Welcome, {name}!',
    'app.selectChild': 'Select child',
    'app.offlineReady': 'Offline mode ready',
    'app.online': 'Online',
    'app.offline': 'Offline',
    'app.syncing': 'Syncing…',
    'app.synced': 'Synced',
    'app.minutesPerDay': '{min} min/day',
    'app.activitiesCount': '{count} activities',

    'onboarding.stepWelcomeTitle': 'Welcome to CogniKids!',
    'onboarding.stepWelcomeSubtitle': "Let's set up your child's journey with Tico the mascot.",
    'onboarding.stepProfileTitle': "Child's Profile",
    'onboarding.stepProfileSubtitle':
      'Enter age in months to calibrate the right neurological stimuli (0-60 months).',
    'onboarding.childName': "Child's name or nickname",
    'onboarding.childNamePlaceholder': 'e.g., Sophia, Lucas, Theo...',
    'onboarding.birthDate': 'Birth date or age in months',
    'onboarding.ageInMonths': 'Age: {months} months ({formatted})',
    'onboarding.favoriteColor': 'Favorite color (profile theme)',
    'onboarding.stepLanguagesTitle': 'Learning Languages',
    'onboarding.stepLanguagesSubtitle':
      'Which languages is your child learning or hearing at home?',
    'onboarding.stepLanguagesHint':
      'You can select multiple languages. Games and voice will adapt automatically!',
    'onboarding.stepRecommendationsTitle': 'Recommended Plan by Tico',
    'onboarding.stepRecommendationsSubtitle':
      'Based on age ({months} months), here are the best activities:',
    'onboarding.recommendedForAge': 'Recommended for {months} months',
    'onboarding.startDailySession': 'Start Initial Daily Session 🚀',
    'onboarding.goToDashboard': 'Go to Dashboard',
    'onboarding.next': 'Continue',
    'onboarding.previous': 'Back',
    'onboarding.saving': 'Creating profile…',
    'onboarding.welcomeTicoGreeting':
      "Hello! I am Tico! I'll guide speech, memory, and logic development step by step!",
    'onboarding.recommendedActivitiesList': 'Games selected for this age range:',
    'onboarding.languagesSelectedCount': '{count} language(s) selected',

    'status.doingWell': 'Doing well! 🌟',
    'status.needsImprovement': 'Needs improvement 🎯',
    'status.doingWellDesc':
      'High assimilation and on track for age. Excellent neural reinforcement!',
    'status.needsImprovementDesc':
      'Assimilation below expected for age. Playful home reinforcement recommended.',
    'status.levelUpGuide': 'How to level up:',
    'status.whatToPractice': 'What to practice',
    'status.recommendedGames': 'Recommended games',
    'status.homeReinforcement': 'Home reinforcement',
    'status.overallStatus': 'Overall Development Status',
    'status.areaStatus': 'Status by Cognitive Area',
    'status.assimilationRate': 'Assimilation rate',
    'status.priorityFocus': 'Priority Focus',
    'status.goodProgress': 'Good Progress',
    'status.highMastery': 'High Mastery',

    'dashboard.brainFlower': 'Brain in Bloom',
    'dashboard.brainFlowerDesc':
      'Each petal grows as your child assimilates new words, reflexes, and patterns.',
    'dashboard.learningModules': 'Learning Modules',
    'dashboard.clickToPlay': 'Click to play',
    'dashboard.dailySession': 'Daily Session',
    'dashboard.dailySessionDesc': 'Calibrated daily routine with quick games',
    'dashboard.allGames': 'All Games',
    'dashboard.achievements': 'Achievements',
    'dashboard.medals': 'Medals Gallery',
    'dashboard.medalsCount': '{unlocked} / {total} medals',
    'dashboard.playInArea': 'Play in this area',
    'dashboard.howToUnlock': 'How to Unlock',
    'dashboard.unlockedAt': 'Unlocked on {date}',
    'dashboard.readyToPlay': '{name} is ready!',
    'dashboard.modulesAdapted': 'Age-adapted modules.',

    'game.start': 'Start',
    'game.listening': "I'm listening to you...",
    'game.evaluating': 'Evaluating speech…',
    'game.tapToSpeak': 'Tap the mic and say "{word}"',
    'game.tapToFinish': 'Listening... Tap to finish',
    'game.listenAgain': 'Listen again',
    'game.tryAgain': 'Try again',
    'game.nextWord': 'Next',
    'game.completed': 'Round Completed! 🎉',
    'game.victoryTitle': 'Awesome! You did great! 🏆',
    'game.speechAccuracy': 'Speech Accuracy',
    'game.playAgain': 'Play again',
    'game.backToProgress': 'Back to progress',
    'game.roundOf': 'Round {current} of {total}',
    'game.languageSelector': 'Activity Language:',
    'game.practicingIn': 'Practicing in {lang}',

    'reports.title': 'Evolution Reports & Tips',
    'reports.subtitle':
      'Track vocal and cognitive development by period with clear developmental status',
    'reports.weekly': 'Weekly (7d)',
    'reports.monthly': 'Monthly (30d)',
    'reports.exportPdf': 'Export PDF Report',
    'reports.exporting': 'Generating PDF…',
    'reports.averageAssimilation': 'Average Assimilation',
    'reports.totalGames': 'Games Played',
    'reports.starsEarned': 'Stars Earned',
    'reports.vsPrevious': 'vs previous period',
    'reports.pediatricianBannerTitle': 'Share this report with Pediatrician or School?',
    'reports.pediatricianBannerDesc':
      'Generate an executive formatted PDF with Brain in Bloom, area status, and level up tips.',
    'reports.generatePdfPrint': 'Generate Printable PDF',
    'reports.assimilationByArea': 'Assimilation by Brain Area',
    'reports.pedagogicalTips': 'Tips & Level Up Cards',
    'reports.pedagogicalTipsDesc':
      'Actionable steps to level up and home reinforcement based on current performance',
    'reports.ticoTipTitle': 'Tip from Tico:',
    'reports.ticoTipDesc':
      'Children aged 0 to 60 months evolve in natural developmental spurts. Short 10-15 minute daily sessions with repetition bring the best results!',

    'settings.title': 'Settings & Account',
    'settings.subtitle': 'Account settings, interface language, and offline sync',
    'settings.guardianData': 'Guardian Profile',
    'settings.guardianName': 'Guardian name',
    'settings.loginEmail': 'Login email',
    'settings.save': 'Save',
    'settings.saving': 'Saving…',
    'settings.changeEmail': 'Change email',
    'settings.storageOffline': 'Storage & Offline',
    'settings.storageOfflineDesc':
      'CogniKids works anywhere without internet. Sessions are saved locally and synced automatically.',
    'settings.forceSync': 'Force manual sync',
    'settings.syncNow': 'Sync now',
    'settings.reminderTitle': 'Daily Session Reminder',
    'settings.reminderSubtitle': 'Get notified at the best time to play with your child',
    'settings.reminderTime': 'Reminder time',
    'settings.interfaceLanguage': 'App Language (UI)',
    'settings.interfaceLanguageDesc': 'Select your preferred interface language across 5 options',

    'module.speech': 'Speech & Language',
    'module.speechSub': 'Communication and Vocabulary',
    'module.speechDesc': 'Stimulates pronunciation, word repertoire, and sound association.',
    'module.memory': 'Memory & Attention',
    'module.memorySub': 'Focus and Visual Retention',
    'module.memoryDesc': 'Boosts working memory and concentration with playful challenges.',
    'module.logic': 'Logic & Cognition',
    'module.logicSub': 'Shapes, Colors, and Numbers',
    'module.logicDesc': 'Color sorting, geometric shapes, patterns, and counting.',
    'module.motor': 'Motor Skills',
    'module.motorSub': 'Coordination and Touch',
    'module.motorDesc': 'Fine motor control, visual tracking, and tap precision.',
    'module.socioemotional': 'Socioemotional',
    'module.socioemotionalSub': 'Feelings and Autonomy',
    'module.socioemotionalDesc':
      'Emotion recognition, self-regulation, and dressing/weather autonomy.',
  },

  es: {
    'nav.home': 'Inicio',
    'nav.children': 'Perfiles',
    'nav.progress': 'Progreso',
    'nav.reports': 'Informes',
    'nav.themesGuide': 'Guía Padres',
    'nav.community': 'Invitaciones & Escuela',
    'nav.settings': 'Ajustes',
    'nav.schoolPortal': 'Portal Escolar',
    'nav.logout': 'Cerrar sesión',
    'nav.addChild': 'Añadir nuevo niño',
    'nav.registeredChildren': 'Niños registrados',
    'nav.language': 'Idioma',
    'nav.audio': 'Audio',
    'nav.myProfile': 'Mis datos',
    'nav.navigation': 'Navegación',
    'nav.back': 'Volver',

    'app.title': 'CogniKids',
    'app.tagline': 'Desarrollo infantil inteligente y lúdico',
    'app.welcomeGuardian': '¡Bienvenido(a), {name}!',
    'app.selectChild': 'Seleccionar niño',
    'app.offlineReady': 'Modo sin conexión listo',
    'app.online': 'En línea',
    'app.offline': 'Sin conexión',
    'app.syncing': 'Sincronizando…',
    'app.synced': 'Sincronizado',
    'app.minutesPerDay': '{min} min/día',
    'app.activitiesCount': '{count} actividades',

    'onboarding.stepWelcomeTitle': '¡Bienvenido a CogniKids!',
    'onboarding.stepWelcomeSubtitle':
      'Configuremos el camino de aprendizaje de tu pequeño con Tico.',
    'onboarding.stepProfileTitle': 'Perfil del Niño',
    'onboarding.stepProfileSubtitle':
      'Indica la edad en meses para calibrar los estímulos neurológicos (0 a 60 meses).',
    'onboarding.childName': 'Nombre o apodo del niño',
    'onboarding.childNamePlaceholder': 'Ej: Sofía, Lucas, Mateo...',
    'onboarding.birthDate': 'Fecha de nacimiento o edad en meses',
    'onboarding.ageInMonths': 'Edad: {months} meses ({formatted})',
    'onboarding.favoriteColor': 'Color favorito (tema del perfil)',
    'onboarding.stepLanguagesTitle': 'Idiomas de Aprendizaje',
    'onboarding.stepLanguagesSubtitle': '¿Qué idiomas está aprendiendo o escuchando en casa?',
    'onboarding.stepLanguagesHint':
      '¡Puedes elegir varios idiomas a la vez! Las actividades se adaptarán.',
    'onboarding.stepRecommendationsTitle': 'Plan Recomendado por Tico',
    'onboarding.stepRecommendationsSubtitle':
      'Según la edad ({months} meses), seleccionamos los mejores juegos:',
    'onboarding.recommendedForAge': 'Recomendado para {months} meses',
    'onboarding.startDailySession': 'Iniciar Sesión Diaria Inicial 🚀',
    'onboarding.goToDashboard': 'Ir al Panel',
    'onboarding.next': 'Continuar',
    'onboarding.previous': 'Volver',
    'onboarding.saving': 'Creando perfil…',
    'onboarding.welcomeTicoGreeting':
      '¡Hola! ¡Soy Tico! Acompañaré cada paso del habla, memoria y lógica.',
    'onboarding.recommendedActivitiesList': 'Juegos seleccionados para esta edad:',
    'onboarding.languagesSelectedCount': '{count} idioma(s) seleccionado(s)',

    'status.doingWell': '¡Va muy bien! 🌟',
    'status.needsImprovement': 'Necesita mejorar 🎯',
    'status.doingWellDesc':
      'Alta asimilación y adecuada para la edad. ¡Excelente fijación neuronal!',
    'status.needsImprovementDesc':
      'Asimilación por debajo de lo esperado. Se recomienda refuerzo lúdico.',
    'status.levelUpGuide': 'Cómo subir de nivel:',
    'status.whatToPractice': 'Qué practicar',
    'status.recommendedGames': 'Juegos recomendados',
    'status.homeReinforcement': 'Refuerzo en casa',
    'status.overallStatus': 'Estado General de Desarrollo',
    'status.areaStatus': 'Estado por Área Cognitiva',
    'status.assimilationRate': 'Tasa de asimilación',
    'status.priorityFocus': 'Foco Prioritario',
    'status.goodProgress': 'Buena Evolución',
    'status.highMastery': 'Excelente Maestría',

    'dashboard.brainFlower': 'Cerebro en Flor',
    'dashboard.brainFlowerDesc':
      'Cada pétalo crece a medida que el niño asimila palabras, reflejos y patrones.',
    'dashboard.learningModules': 'Módulos de Aprendizaje',
    'dashboard.clickToPlay': 'Toca para jugar',
    'dashboard.dailySession': 'Sesión Diaria',
    'dashboard.dailySessionDesc': 'Rutina calibrada con juegos rápidos del día',
    'dashboard.allGames': 'Todos los Juegos',
    'dashboard.achievements': 'Logros',
    'dashboard.medals': 'Galería de Medallas',
    'dashboard.medalsCount': '{unlocked} / {total} medallas',
    'dashboard.playInArea': 'Jugar en esta área',
    'dashboard.howToUnlock': 'Cómo Desbloquear',
    'dashboard.unlockedAt': 'Desbloqueado el {date}',
    'dashboard.readyToPlay': '¡{name} está listo(a)!',
    'dashboard.modulesAdapted': 'Módulos adaptados a la edad.',

    'game.start': 'Empezar',
    'game.listening': 'Te estoy escuchando...',
    'game.evaluating': 'Evaluando pronunciación…',
    'game.tapToSpeak': 'Toca el micrófono y di "{word}"',
    'game.tapToFinish': 'Escuchando... Toca para finalizar',
    'game.listenAgain': 'Escuchar de nuevo',
    'game.tryAgain': 'Intentar de nuevo',
    'game.nextWord': 'Siguiente',
    'game.completed': '¡Partida Completada! 🎉',
    'game.victoryTitle': '¡Genial! ¡Lo hiciste de maravilla! 🏆',
    'game.speechAccuracy': 'Precisión del Habla',
    'game.playAgain': 'Jugar de nuevo',
    'game.backToProgress': 'Volver al progreso',
    'game.roundOf': 'Ronda {current} de {total}',
    'game.languageSelector': 'Idioma de la Actividad:',
    'game.practicingIn': 'Practicando en {lang}',

    'reports.title': 'Informes de Evolución & Consejos',
    'reports.subtitle':
      'Sigue el desarrollo cognitivo y vocal por período con estatus claro de asimilación',
    'reports.weekly': 'Semanal (7d)',
    'reports.monthly': 'Mensual (30d)',
    'reports.exportPdf': 'Exportar Informe PDF',
    'reports.exporting': 'Generando PDF…',
    'reports.averageAssimilation': 'Asimilación Media',
    'reports.totalGames': 'Partidas Jugadas',
    'reports.starsEarned': 'Estrellas Obtenidas',
    'reports.vsPrevious': 'vs período anterior',
    'reports.pediatricianBannerTitle': '¿Llevar este informe al Pediatra o a la Escuela?',
    'reports.pediatricianBannerDesc':
      'Genera un documento PDF ejecutivo con el Cerebro en Flor, estado por área y consejos para subir de nivel.',
    'reports.generatePdfPrint': 'Generar PDF para Imprimir',
    'reports.assimilationByArea': 'Asimilación por Área Cerebral',
    'reports.pedagogicalTips': 'Tarjetas de Consejos & Subir de Nivel',
    'reports.pedagogicalTipsDesc':
      'Orientaciones prácticas para subir de nivel y refuerzo en casa según el desempeño',
    'reports.ticoTipTitle': 'Consejo de Tico:',
    'reports.ticoTipDesc':
      'Los niños de 0 a 60 meses evolucionan en saltos naturales. ¡Sesiones cortas de 10 a 15 minutos diarios dan los mejores resultados!',

    'settings.title': 'Ajustes & Cuenta',
    'settings.subtitle':
      'Configuración de cuenta, idioma de interfaz y sincronización sin conexión',
    'settings.guardianData': 'Datos del Tutor',
    'settings.guardianName': 'Nombre del tutor',
    'settings.loginEmail': 'Correo de inicio de sesión',
    'settings.save': 'Guardar',
    'settings.saving': 'Guardando…',
    'settings.changeEmail': 'Cambiar correo',
    'settings.storageOffline': 'Almacenamiento & Modo Offline',
    'settings.storageOfflineDesc':
      'CogniKids funciona sin conexión en cualquier lugar. Las partidas se guardan localmente y se sincronizan solas.',
    'settings.forceSync': 'Forzar sincronización manual',
    'settings.syncNow': 'Sincronizar ahora',
    'settings.reminderTitle': 'Recordatorio Diario de Sesión',
    'settings.reminderSubtitle':
      'Recibe notificaciones en el mejor momento para jugar con tu hijo(a)',
    'settings.reminderTime': 'Hora del recordatorio',
    'settings.interfaceLanguage': 'Idioma de la Aplicación (UI)',
    'settings.interfaceLanguageDesc': 'Selecciona tu idioma preferido entre los 5 disponibles',

    'module.speech': 'Habla & Lenguaje',
    'module.speechSub': 'Comunicación y Vocabulario',
    'module.speechDesc': 'Estimula la articulación, repertorio de palabras y asociación sonora.',
    'module.memory': 'Memoria & Atención',
    'module.memorySub': 'Foco y Retención Visual',
    'module.memoryDesc': 'Fortalece la memoria de trabajo y la concentración con retos lúdicos.',
    'module.logic': 'Lógica & Cognición',
    'module.logicSub': 'Formas, Colores y Números',
    'module.logicDesc': 'Clasificación por colores, formas geométricas, secuencias y conteo.',
    'module.motor': 'Motricidad',
    'module.motorSub': 'Coordinación y Toque',
    'module.motorDesc': 'Precisión motora fina, seguimiento visual y destreza de toque.',
    'module.socioemotional': 'Socioemocional',
    'module.socioemotionalSub': 'Sentimientos y Autonomía',
    'module.socioemotionalDesc':
      'Reconocimiento de emociones, autorregulación y autonomía en el clima.',
  },

  de: {
    'nav.home': 'Startseite',
    'nav.children': 'Profile',
    'nav.progress': 'Fortschritt',
    'nav.reports': 'Berichte',
    'nav.themesGuide': 'Eltern-Ratgeber',
    'nav.community': 'Einladungen & Schule',
    'nav.settings': 'Einstellungen',
    'nav.schoolPortal': 'Schulportal',
    'nav.logout': 'Abmelden',
    'nav.addChild': 'Neues Kind hinzufügen',
    'nav.registeredChildren': 'Registrierte Kinder',
    'nav.language': 'Sprache',
    'nav.audio': 'Audio',
    'nav.myProfile': 'Mein Profil',
    'nav.navigation': 'Navigation',
    'nav.back': 'Zurück',

    'app.title': 'CogniKids',
    'app.tagline': 'Kluge & spielerische Frühentwicklung',
    'app.welcomeGuardian': 'Willkommen, {name}!',
    'app.selectChild': 'Kind auswählen',
    'app.offlineReady': 'Offline-Modus bereit',
    'app.online': 'Online',
    'app.offline': 'Offline',
    'app.syncing': 'Synchronisiere…',
    'app.synced': 'Synchronisiert',
    'app.minutesPerDay': '{min} Min/Tag',
    'app.activitiesCount': '{count} Aktivitäten',

    'onboarding.stepWelcomeTitle': 'Willkommen bei CogniKids!',
    'onboarding.stepWelcomeSubtitle': 'Richten wir die Lernreise deines Kindes mit Tico ein.',
    'onboarding.stepProfileTitle': 'Kinderprofil',
    'onboarding.stepProfileSubtitle':
      'Gib das Alter in Monaten an, um die richtigen Reize zu kalibrieren (0–60 Monate).',
    'onboarding.childName': 'Name oder Spitzname des Kindes',
    'onboarding.childNamePlaceholder': 'z. B. Sophia, Lukas, Felix...',
    'onboarding.birthDate': 'Geburtsdatum oder Alter in Monaten',
    'onboarding.ageInMonths': 'Alter: {months} Monate ({formatted})',
    'onboarding.favoriteColor': 'Lieblingsfarbe (Profilthema)',
    'onboarding.stepLanguagesTitle': 'Lernsprachen',
    'onboarding.stepLanguagesSubtitle': 'Welche Sprachen lernt oder hört dein Kind zu Hause?',
    'onboarding.stepLanguagesHint':
      'Du kannst mehrere Sprachen gleichzeitig wählen. Die Spiele passen sich an!',
    'onboarding.stepRecommendationsTitle': 'Empfohlener Plan von Tico',
    'onboarding.stepRecommendationsSubtitle':
      'Basierend auf dem Alter ({months} Monate) haben wir die besten Spiele gewählt:',
    'onboarding.recommendedForAge': 'Empfohlen für {months} Monate',
    'onboarding.startDailySession': 'Tägliche Einstiegssitzung starten 🚀',
    'onboarding.goToDashboard': 'Zum Dashboard',
    'onboarding.next': 'Weiter',
    'onboarding.previous': 'Zurück',
    'onboarding.saving': 'Profil wird erstellt…',
    'onboarding.welcomeTicoGreeting':
      'Hallo! Ich bin Tico! Ich begleite jeden Schritt beim Sprechen, Erinnern und Denken!',
    'onboarding.recommendedActivitiesList': 'Für diese Altersgruppe ausgewählte Spiele:',
    'onboarding.languagesSelectedCount': '{count} Sprache(n) ausgewählt',

    'status.doingWell': 'Läuft super! 🌟',
    'status.needsImprovement': 'Verbesserungsbedarf 🎯',
    'status.doingWellDesc': 'Hohe und altersgerechte Aufnahme. Ausgezeichnete neuronale Festigung!',
    'status.needsImprovementDesc':
      'Aufnahme unter dem Alterserwartungswert. Spielerische Übungen zu Hause empfohlen.',
    'status.levelUpGuide': 'So steigt dein Kind auf:',
    'status.whatToPractice': 'Was geübt werden sollte',
    'status.recommendedGames': 'Empfohlene Spiele',
    'status.homeReinforcement': 'Übung zu Hause',
    'status.overallStatus': 'Gesamtentwicklungsstatus',
    'status.areaStatus': 'Status nach kognitivem Bereich',
    'status.assimilationRate': 'Aufnahmerate',
    'status.priorityFocus': 'Vorrangiger Fokus',
    'status.goodProgress': 'Guter Fortschritt',
    'status.highMastery': 'Hervorragende Meisterschaft',

    'dashboard.brainFlower': 'Gehirn in Blüte',
    'dashboard.brainFlowerDesc':
      'Jedes Blütenblatt wächst, wenn neue Wörter, Reflexe und Muster gelernt werden.',
    'dashboard.learningModules': 'Lernmodule',
    'dashboard.clickToPlay': 'Klicken zum Spielen',
    'dashboard.dailySession': 'Tägliche Sitzung',
    'dashboard.dailySessionDesc': 'Kalibrierte tägliche Routine mit kurzen Spielen',
    'dashboard.allGames': 'Alle Spiele',
    'dashboard.achievements': 'Erfolge',
    'dashboard.medals': 'Medaillen-Galerie',
    'dashboard.medalsCount': '{unlocked} / {total} Medaillen',
    'dashboard.playInArea': 'In diesem Bereich spielen',
    'dashboard.howToUnlock': 'Wie freischalten',
    'dashboard.unlockedAt': 'Freigeschaltet am {date}',
    'dashboard.readyToPlay': '{name} ist bereit!',
    'dashboard.modulesAdapted': 'Altersgerechte Module.',

    'game.start': 'Starten',
    'game.listening': 'Ich höre dir zu...',
    'game.evaluating': 'Aussprache wird ausgewertet…',
    'game.tapToSpeak': 'Tippe auf das Mikrofon und sage "{word}"',
    'game.tapToFinish': 'Höre zu... Zum Beenden tippen',
    'game.listenAgain': 'Nochmal anhören',
    'game.tryAgain': 'Nochmal versuchen',
    'game.nextWord': 'Weiter',
    'game.completed': 'Runde abgeschlossen! 🎉',
    'game.victoryTitle': 'Klasse gemacht! Du bist spitze! 🏆',
    'game.speechAccuracy': 'Sprechgenauigkeit',
    'game.playAgain': 'Nochmal spielen',
    'game.backToProgress': 'Zurück zum Fortschritt',
    'game.roundOf': 'Runde {current} von {total}',
    'game.languageSelector': 'Aktivitätssprache:',
    'game.practicingIn': 'Übung auf {lang}',

    'reports.title': 'Entwicklungsberichte & Tipps',
    'reports.subtitle':
      'Verfolge die kognitive und stimmliche Entwicklung nach Zeitraum mit klarem Lernstatus',
    'reports.weekly': 'Wöchentlich (7 T)',
    'reports.monthly': 'Monatlich (30 T)',
    'reports.exportPdf': 'PDF-Bericht exportieren',
    'reports.exporting': 'PDF wird erstellt…',
    'reports.averageAssimilation': 'Durchschnittliche Aufnahme',
    'reports.totalGames': 'Gespielte Partien',
    'reports.starsEarned': 'Verdiente Sterne',
    'reports.vsPrevious': 'vs vorheriger Zeitraum',
    'reports.pediatricianBannerTitle': 'Diesen Bericht dem Kinderarzt oder der Kita vorlegen?',
    'reports.pediatricianBannerDesc':
      'Erstelle ein formatiertes PDF mit Gehirn in Blüte, Bereichsstatus und Aufstiegstipps.',
    'reports.generatePdfPrint': 'Druck-PDF erstellen',
    'reports.assimilationByArea': 'Aufnahme nach Gehirnbereich',
    'reports.pedagogicalTips': 'Pädagogische Karten & Aufstiegshilfe',
    'reports.pedagogicalTipsDesc':
      'Praktische Schritte zum nächsten Level und häusliche Unterstützung basierend auf Leistung',
    'reports.ticoTipTitle': 'Tipp von Tico:',
    'reports.ticoTipDesc':
      'Kinder im Alter von 0 bis 60 Monaten entwickeln sich in natürlichen Sprüngen. Kurze 10-15-minütige tägliche Einheiten bringen die besten Ergebnisse!',

    'settings.title': 'Einstellungen & Konto',
    'settings.subtitle':
      'Kontoeinstellungen, Benutzeroberflächen-Sprache und Offline-Synchronisierung',
    'settings.guardianData': 'Elterndaten',
    'settings.guardianName': 'Name des Erziehungsberechtigten',
    'settings.loginEmail': 'Anmelde-E-Mail',
    'settings.save': 'Speichern',
    'settings.saving': 'Speichern…',
    'settings.changeEmail': 'E-Mail ändern',
    'settings.storageOffline': 'Speicher & Offline-Modus',
    'settings.storageOfflineDesc':
      'CogniKids funktioniert komplett ohne Internet. Spiele werden lokal gesichert und automatisch hochgeladen.',
    'settings.forceSync': 'Manuelle Synchronisierung erzwingen',
    'settings.syncNow': 'Jetzt synchronisieren',
    'settings.reminderTitle': 'Tägliche Erinnerung',
    'settings.reminderSubtitle': 'Erhalte Benachrichtigungen zur besten Spielzeit mit deinem Kind',
    'settings.reminderTime': 'Erinnerungszeit',
    'settings.interfaceLanguage': 'App-Sprache (UI)',
    'settings.interfaceLanguageDesc': 'Wähle deine bevorzugte Sprache aus 5 verfügbaren Sprachen',

    'module.speech': 'Sprache & Sprechen',
    'module.speechSub': 'Kommunikation und Wortschatz',
    'module.speechDesc': 'Fördert Artikulation, Wortschatz und Lautzuordnung.',
    'module.memory': 'Gedächtnis & Aufmerksamkeit',
    'module.memorySub': 'Fokus und visuelle Merkfähigkeit',
    'module.memoryDesc':
      'Stärkt das Arbeitsgedächtnis und die Konzentration durch spielerische Paare.',
    'module.logic': 'Logik & Kognition',
    'module.logicSub': 'Formen, Farben und Zahlen',
    'module.logicDesc': 'Sortierung nach Farben, Formen, Musterfolgen und Zählen von 1 bis 10.',
    'module.motor': 'Motorik',
    'module.motorSub': 'Koordination und Berührung',
    'module.motorDesc': 'Feinmotorik, visuelle Verfolgung und präzise Tippbewegungen.',
    'module.socioemotional': 'Sozial-Emotional',
    'module.socioemotionalSub': 'Gefühle und Selbstständigkeit',
    'module.socioemotionalDesc':
      'Erkennen von Emotionen, Selbstregulation und wettergerechtes Anziehen.',
  },

  fr: {
    'nav.home': 'Accueil',
    'nav.children': 'Profils',
    'nav.progress': 'Progrès',
    'nav.reports': 'Rapports',
    'nav.themesGuide': 'Guide Parents',
    'nav.community': 'Invitations & École',
    'nav.settings': 'Paramètres',
    'nav.schoolPortal': 'Portail École',
    'nav.logout': 'Se déconnecter',
    'nav.addChild': 'Ajouter un enfant',
    'nav.registeredChildren': 'Enfants enregistrés',
    'nav.language': 'Langue',
    'nav.audio': 'Audio',
    'nav.myProfile': 'Mon profil',
    'nav.navigation': 'Navigation',
    'nav.back': 'Retour',

    'app.title': 'CogniKids',
    'app.tagline': 'Développement précoce intelligent et ludique',
    'app.welcomeGuardian': 'Bienvenue, {name} !',
    'app.selectChild': 'Sélectionner un enfant',
    'app.offlineReady': 'Mode hors ligne prêt',
    'app.online': 'En ligne',
    'app.offline': 'Hors ligne',
    'app.syncing': 'Synchronisation…',
    'app.synced': 'Synchronisé',
    'app.minutesPerDay': '{min} min/jour',
    'app.activitiesCount': '{count} activités',

    'onboarding.stepWelcomeTitle': 'Bienvenue sur CogniKids !',
    'onboarding.stepWelcomeSubtitle':
      'Configurons le parcours de votre enfant avec notre mascotte Tico.',
    'onboarding.stepProfileTitle': "Profil de l'Enfant",
    'onboarding.stepProfileSubtitle':
      "Indiquez l'âge en mois pour calibrer les stimuli neurologiques adaptés (0 à 60 mois).",
    'onboarding.childName': "Nom ou prénom de l'enfant",
    'onboarding.childNamePlaceholder': 'Ex : Sophie, Lucas, Théo...',
    'onboarding.birthDate': 'Date de naissance ou âge en mois',
    'onboarding.ageInMonths': 'Âge : {months} mois ({formatted})',
    'onboarding.favoriteColor': 'Couleur préférée (thème du profil)',
    'onboarding.stepLanguagesTitle': "Langues d'Apprentissage",
    'onboarding.stepLanguagesSubtitle':
      'Quelles langues votre enfant apprend-il ou entend-il à la maison ?',
    'onboarding.stepLanguagesHint':
      'Vous pouvez choisir plusieurs langues en même temps. Les jeux vont adapter la voix !',
    'onboarding.stepRecommendationsTitle': 'Programme Recommandé par Tico',
    'onboarding.stepRecommendationsSubtitle':
      "Selon l'âge ({months} mois), nous avons sélectionné les meilleurs jeux :",
    'onboarding.recommendedForAge': 'Recommandé pour {months} mois',
    'onboarding.startDailySession': 'Lancer la Session Quotidienne Initiale 🚀',
    'onboarding.goToDashboard': 'Aller au Tableau de Bord',
    'onboarding.next': 'Continuer',
    'onboarding.previous': 'Retour',
    'onboarding.saving': 'Création du profil…',
    'onboarding.welcomeTicoGreeting':
      'Bonjour ! Je suis Tico ! Je vais guider chaque étape de la parole, mémoire et logique !',
    'onboarding.recommendedActivitiesList': 'Jeux sélectionnés pour cette tranche d’âge :',
    'onboarding.languagesSelectedCount': '{count} langue(s) sélectionnée(s)',

    'status.doingWell': 'Tout va bien ! 🌟',
    'status.needsImprovement': 'À améliorer 🎯',
    'status.doingWellDesc':
      'Assimilation élevée et conforme pour l’âge. Excellente consolidation neuronale !',
    'status.needsImprovementDesc':
      'Assimilation en dessous des attentes pour l’âge. Renforcement ludique conseillé.',
    'status.levelUpGuide': 'Comment progresser :',
    'status.whatToPractice': 'Que pratiquer',
    'status.recommendedGames': 'Jeux recommandés',
    'status.homeReinforcement': 'Renforcement à la maison',
    'status.overallStatus': 'Statut Général de Développement',
    'status.areaStatus': 'Statut par Domaine Cognitif',
    'status.assimilationRate': "Taux d'assimilation",
    'status.priorityFocus': 'Priorité d’Apprentissage',
    'status.goodProgress': 'En Bonne Progression',
    'status.highMastery': 'Excellente Maîtrise',

    'dashboard.brainFlower': 'Cerveau en Fleur',
    'dashboard.brainFlowerDesc':
      'Chaque pétale grandit à mesure que l’enfant assimile nouveaux mots, réflexes et schémas.',
    'dashboard.learningModules': 'Modules d’Apprentissage',
    'dashboard.clickToPlay': 'Cliquer pour jouer',
    'dashboard.dailySession': 'Session Quotidienne',
    'dashboard.dailySessionDesc': 'Routine calibrée avec des jeux courts du jour',
    'dashboard.allGames': 'Tous les Jeux',
    'dashboard.achievements': 'Succès',
    'dashboard.medals': 'Galerie des Médailles',
    'dashboard.medalsCount': '{unlocked} / {total} médailles',
    'dashboard.playInArea': 'Jouer dans ce domaine',
    'dashboard.howToUnlock': 'Comment Débloquer',
    'dashboard.unlockedAt': 'Débloqué le {date}',
    'dashboard.readyToPlay': '{name} est prêt(e) !',
    'dashboard.modulesAdapted': 'Modules adaptés à l’âge.',

    'game.start': 'Commencer',
    'game.listening': 'Je vous écoute...',
    'game.evaluating': 'Évaluation de la prononciation…',
    'game.tapToSpeak': 'Appuyez sur le micro et dites "{word}"',
    'game.tapToFinish': 'Écoute en cours... Appuyez pour terminer',
    'game.listenAgain': 'Réécouter',
    'game.tryAgain': 'Réessayer',
    'game.nextWord': 'Suivant',
    'game.completed': 'Partie Terminée ! 🎉',
    'game.victoryTitle': 'Bravo ! Tu as assuré ! 🏆',
    'game.speechAccuracy': 'Précision Vocale',
    'game.playAgain': 'Rejouer',
    'game.backToProgress': 'Retour au progrès',
    'game.roundOf': 'Manche {current} sur {total}',
    'game.languageSelector': 'Langue de l’Activité :',
    'game.practicingIn': 'Pratique en {lang}',

    'reports.title': 'Rapports d’Évolution & Conseils',
    'reports.subtitle':
      'Suivez le développement cognitif et vocal par période avec un bilan clair de progression',
    'reports.weekly': 'Hebdomadaire (7j)',
    'reports.monthly': 'Mensuel (30j)',
    'reports.exportPdf': 'Exporter le Rapport PDF',
    'reports.exporting': 'Génération du PDF…',
    'reports.averageAssimilation': 'Assimilation Moyenne',
    'reports.totalGames': 'Parties Jouées',
    'reports.starsEarned': 'Étoiles Obtenues',
    'reports.vsPrevious': 'vs période précédente',
    'reports.pediatricianBannerTitle': 'Partager ce rapport avec le Pédiatre ou l’École ?',
    'reports.pediatricianBannerDesc':
      'Générez un PDF formaté avec le Cerveau en Fleur, le bilan par domaine et les conseils de progression.',
    'reports.generatePdfPrint': 'Générer le PDF à Imprimer',
    'reports.assimilationByArea': 'Assimilation par Zone Cérébrale',
    'reports.pedagogicalTips': 'Fiches Conseils & Passage au Niveau Supérieur',
    'reports.pedagogicalTipsDesc':
      'Conseils concrets pour progresser et renforcer à la maison selon les résultats',
    'reports.ticoTipTitle': 'Conseil de Tico :',
    'reports.ticoTipDesc':
      'Les enfants de 0 à 60 mois évoluent par bonds naturels. De courtes sessions quotidiennes de 10 à 15 minutes avec répétition apportent les meilleurs résultats !',

    'settings.title': 'Paramètres & Compte',
    'settings.subtitle':
      'Paramètres du compte, langue de l’interface et synchronisation hors ligne',
    'settings.guardianData': 'Profil du Responsable',
    'settings.guardianName': 'Nom du responsable',
    'settings.loginEmail': 'E-mail de connexion',
    'settings.save': 'Enregistrer',
    'settings.saving': 'Enregistrement…',
    'settings.changeEmail': 'Changer d’e-mail',
    'settings.storageOffline': 'Stockage & Hors Ligne',
    'settings.storageOfflineDesc':
      'CogniKids fonctionne sans connexion. Vos parties sont enregistrées localement et synchronisées automatiquement.',
    'settings.forceSync': 'Forcer la synchronisation manuelle',
    'settings.syncNow': 'Synchroniser maintenant',
    'settings.reminderTitle': 'Rappel de Session Quotidienne',
    'settings.reminderSubtitle':
      'Recevez un rappel au meilleur moment pour jouer avec votre enfant',
    'settings.reminderTime': 'Heure du rappel',
    'settings.interfaceLanguage': 'Langue de l’Application (UI)',
    'settings.interfaceLanguageDesc': 'Choisissez votre langue d’interface parmi les 5 proposées',

    'module.speech': 'Parole & Langage',
    'module.speechSub': 'Communication et Vocabulaire',
    'module.speechDesc': 'Stimule l’articulation, le répertoire de mots et l’association sonore.',
    'module.memory': 'Mémoire & Attention',
    'module.memorySub': 'Concentration et Rétention Visuelle',
    'module.memoryDesc':
      'Renforce la mémoire de travail et l’attention avec des jeux de paires ludiques.',
    'module.logic': 'Logique & Cognition',
    'module.logicSub': 'Formes, Couleurs et Nombres',
    'module.logicDesc': 'Tri par couleurs, formes géométriques, suites logiques et comptage.',
    'module.motor': 'Motricité',
    'module.motorSub': 'Coordination et Toucher',
    'module.motorDesc': 'Motricité fine, suivi visuel et précision du toucher.',
    'module.socioemotional': 'Socio-émotionnel',
    'module.socioemotionalSub': 'Émotions et Autonomie',
    'module.socioemotionalDesc':
      'Reconnaissance des émotions, régulation et autonomie habillage/météo.',
  },
}
