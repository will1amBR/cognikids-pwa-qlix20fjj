migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const childrenCol = app.findCollectionByNameOrId('children')
    const sessionsCol = app.findCollectionByNameOrId('game_sessions')
    const progressCol = app.findCollectionByNameOrId('module_progress')
    const achievementsCol = app.findCollectionByNameOrId('child_achievements')
    const schoolAccessCol = app.findCollectionByNameOrId('school_access_tokens')

    // 1. Seed or retrieve public demo user: demo@cognikids.app / demo1234
    let demoUser
    try {
      demoUser = app.findAuthRecordByEmail('_pb_users_auth_', 'demo@cognikids.app')
    } catch (_) {
      demoUser = new Record(users)
      demoUser.setEmail('demo@cognikids.app')
      demoUser.setPassword('demo1234')
      demoUser.setVerified(true)
      demoUser.set('name', 'Mariana Ramos (Família Demo)')
      demoUser.set('preferred_language', 'pt-BR')
      demoUser.set('reminder_enabled', true)
      demoUser.set('reminder_time', '18:30')
      demoUser.set('vocab_reminder_enabled', true)
      demoUser.set('vocab_reminder_time', '19:00')
      demoUser.set('vocab_reminder_language', 'en')
      app.save(demoUser)
    }

    // 2. Seed 3 demo children:
    // - Theo: 18 meses (Berçário / Primeiras Palavras & Motricidade)
    // - Clara: 4 anos (48 meses, Maternal II / Fala, Memória e Lógica)
    // - Arthur: 8 anos (96 meses, Junior / Ditado, Matemática Quest, Matriz Lógica e Vocab Pro)
    const now = Date.now()
    const demoKidsData = [
      {
        name: 'Theo',
        birth_date: new Date(now - 18 * 30.5 * 24 * 3600 * 1000).toISOString(), // 18m
        favorite_color: '#34D399', // Emerald
        class_group: 'Berçário II',
        daily_minutes: 10,
        daily_activity_count: 2,
        primary_language: 'pt-BR',
        learning_languages: ['pt-BR', 'en'],
      },
      {
        name: 'Clara',
        birth_date: new Date(now - 48 * 30.5 * 24 * 3600 * 1000).toISOString(), // 4 anos
        favorite_color: '#FF7A45', // Laranja CogniKids
        class_group: 'Maternal II',
        daily_minutes: 15,
        daily_activity_count: 3,
        primary_language: 'pt-BR',
        learning_languages: ['pt-BR', 'en', 'es'],
      },
      {
        name: 'Arthur',
        birth_date: new Date(now - 96 * 30.5 * 24 * 3600 * 1000).toISOString(), // 8 anos (Junior)
        favorite_color: '#6366F1', // Indigo Junior
        class_group: 'Jardim / 3º Ano',
        daily_minutes: 25,
        daily_activity_count: 4,
        primary_language: 'pt-BR',
        learning_languages: ['pt-BR', 'en', 'es', 'de', 'fr'],
      },
    ]

    const seededKids = []

    for (const kidInfo of demoKidsData) {
      let kidRecord
      try {
        const found = app.findRecordsByFilter(
          'children',
          `user_id = '${demoUser.id}' && name = '${kidInfo.name}'`,
          '',
          1,
          0,
        )
        if (found && found.length > 0) {
          kidRecord = found[0]
        }
      } catch (_) {}

      if (!kidRecord) {
        kidRecord = new Record(childrenCol)
        kidRecord.set('user_id', demoUser.id)
        kidRecord.set('name', kidInfo.name)
        kidRecord.set('birth_date', kidInfo.birth_date)
        kidRecord.set('favorite_color', kidInfo.favorite_color)
        kidRecord.set('class_group', kidInfo.class_group)
        kidRecord.set('daily_minutes', kidInfo.daily_minutes)
        kidRecord.set('daily_activity_count', kidInfo.daily_activity_count)
        kidRecord.set('primary_language', kidInfo.primary_language)
        kidRecord.set('learning_languages', kidInfo.learning_languages)
        app.save(kidRecord)
      }

      seededKids.push({ record: kidRecord, info: kidInfo })
    }

    const theo = seededKids.find((k) => k.info.name === 'Theo').record
    const clara = seededKids.find((k) => k.info.name === 'Clara').record
    const arthur = seededKids.find((k) => k.info.name === 'Arthur').record

    // 3. Seed Module Progress for each demo child
    const modulesConfig = {
      Theo: [
        { module_id: 'speech', mastery: 68, played: 9 },
        { module_id: 'motor', mastery: 82, played: 14 },
        { module_id: 'memory', mastery: 60, played: 7 },
        { module_id: 'logic', mastery: 55, played: 6 },
        { module_id: 'socioemotional', mastery: 70, played: 8 },
      ],
      Clara: [
        { module_id: 'speech', mastery: 92, played: 24 },
        { module_id: 'memory', mastery: 88, played: 18 },
        { module_id: 'logic', mastery: 84, played: 16 },
        { module_id: 'motor', mastery: 95, played: 22 },
        { module_id: 'socioemotional', mastery: 90, played: 19 },
      ],
      Arthur: [
        { module_id: 'junior_vocab', mastery: 94, played: 30 },
        { module_id: 'junior_math', mastery: 89, played: 26 },
        { module_id: 'junior_logic', mastery: 92, played: 28 },
        { module_id: 'junior_dictation', mastery: 86, played: 22 },
        { module_id: 'speech', mastery: 96, played: 20 },
        { module_id: 'memory', mastery: 90, played: 18 },
        { module_id: 'logic', mastery: 91, played: 17 },
        { module_id: 'motor', mastery: 93, played: 15 },
        { module_id: 'socioemotional', mastery: 88, played: 14 },
      ],
    }

    for (const [kidName, mods] of Object.entries(modulesConfig)) {
      const kid = seededKids.find((k) => k.info.name === kidName).record
      for (const m of mods) {
        try {
          const existing = app.findRecordsByFilter(
            'module_progress',
            `child_id = '${kid.id}' && module_id = '${m.module_id}'`,
            '',
            1,
            0,
          )
          if (existing && existing.length > 0) continue
        } catch (_) {}

        const prog = new Record(progressCol)
        prog.set('user_id', demoUser.id)
        prog.set('child_id', kid.id)
        prog.set('module_id', m.module_id)
        prog.set('mastery_percentage', m.mastery)
        prog.set('total_played', m.played)
        prog.set('last_played_at', new Date(now - Math.random() * 86400000 * 2).toISOString())
        app.save(prog)
      }
    }

    // 4. Seed Rich Game Sessions across languages (PT, EN, ES, DE, FR) for rich dashboards,
    // timeline, words ranking, PDF report and radar charts
    const demoSessions = [
      // Clara (Infantil - PT, EN, ES)
      {
        child: clara,
        module_id: 'speech',
        game_id: 'fazenda_falante',
        game_title: 'A Fazenda Falante (Animais)',
        stars: 3,
        score: 96,
        accuracy: 96,
        rounds_completed: 6,
        total_rounds: 6,
        language: 'pt-BR',
        daysAgo: 0.2,
        details: {
          category: 'farm_animals',
          language: 'pt-BR',
          items: ['Leão', 'Vaca', 'Pato', 'Gato', 'Cachorro', 'Ovelha'],
          wordResults: [
            { word: 'Leão', score: 98, stars: 3, isRecognized: true },
            { word: 'Vaca', score: 95, stars: 3, isRecognized: true },
            { word: 'Pato', score: 96, stars: 3, isRecognized: true },
            { word: 'Gato', score: 99, stars: 3, isRecognized: true },
            { word: 'Cachorro', score: 92, stars: 3, isRecognized: true },
            { word: 'Ovelha', score: 94, stars: 3, isRecognized: true },
          ],
        },
      },
      {
        child: clara,
        module_id: 'speech',
        game_id: 'fazenda_falante',
        game_title: 'Talking Farm: First Animals (EN)',
        stars: 3,
        score: 91,
        accuracy: 91,
        rounds_completed: 6,
        total_rounds: 6,
        language: 'en',
        daysAgo: 1,
        details: {
          category: 'farm_animals',
          language: 'en',
          items: ['Lion', 'Cow', 'Duck', 'Cat', 'Dog', 'Sheep'],
          wordResults: [
            { word: 'Lion', score: 92, stars: 3, isRecognized: true },
            { word: 'Cow', score: 95, stars: 3, isRecognized: true },
            { word: 'Duck', score: 88, stars: 3, isRecognized: true },
            { word: 'Cat', score: 96, stars: 3, isRecognized: true },
            { word: 'Dog', score: 90, stars: 3, isRecognized: true },
            { word: 'Sheep', score: 85, stars: 2, isRecognized: true },
          ],
        },
      },
      {
        child: clara,
        module_id: 'memory',
        game_id: 'par_dos_animais',
        game_title: 'Par dos Bichinhos & Memória',
        stars: 3,
        score: 94,
        accuracy: 90,
        rounds_completed: 6,
        total_rounds: 6,
        language: 'pt-BR',
        daysAgo: 1.5,
        details: { mode: 'pairs', completedCards: 12 },
      },
      {
        child: clara,
        module_id: 'logic',
        game_id: 'caixa_das_formas',
        game_title: 'Caixa das Formas Geométricas',
        stars: 3,
        score: 90,
        accuracy: 88,
        rounds_completed: 5,
        total_rounds: 5,
        language: 'pt-BR',
        daysAgo: 2,
        details: { shapesMatched: ['círculo', 'quadrado', 'triângulo', 'estrela', 'coração'] },
      },
      {
        child: clara,
        module_id: 'speech',
        game_id: 'fazenda_falante',
        game_title: 'Granja Parlante (ES)',
        stars: 3,
        score: 87,
        accuracy: 87,
        rounds_completed: 5,
        total_rounds: 5,
        language: 'es',
        daysAgo: 3,
        details: {
          category: 'farm_animals',
          language: 'es',
          items: ['León', 'Vaca', 'Pato', 'Gato', 'Perro'],
          wordResults: [
            { word: 'León', score: 88, stars: 3, isRecognized: true },
            { word: 'Vaca', score: 92, stars: 3, isRecognized: true },
            { word: 'Pato', score: 86, stars: 3, isRecognized: true },
            { word: 'Gato', score: 90, stars: 3, isRecognized: true },
            { word: 'Perro', score: 80, stars: 2, isRecognized: true },
          ],
        },
      },
      {
        child: clara,
        module_id: 'motor',
        game_id: 'estoura_bolhas',
        game_title: 'Estoura Bolhas Coloridas',
        stars: 3,
        score: 100,
        accuracy: 98,
        rounds_completed: 10,
        total_rounds: 10,
        language: 'pt-BR',
        daysAgo: 4,
        details: { poppedCount: 28, reactionTimeAvgMs: 420 },
      },

      // Theo (Infantil - Primeiras Palavras & Sons)
      {
        child: theo,
        module_id: 'speech',
        game_id: 'som_do_bicho',
        game_title: 'Som dos Bichinhos (Onomatopeias)',
        stars: 3,
        score: 88,
        accuracy: 85,
        rounds_completed: 4,
        total_rounds: 4,
        language: 'pt-BR',
        daysAgo: 0.5,
        details: { items: ['Au-au', 'Miau', 'Muu', 'Quá-quá'] },
      },
      {
        child: theo,
        module_id: 'motor',
        game_id: 'estoura_bolhas',
        game_title: 'Toque nas Bolhinhas Rápidas',
        stars: 3,
        score: 85,
        accuracy: 80,
        rounds_completed: 6,
        total_rounds: 6,
        language: 'pt-BR',
        daysAgo: 1.2,
        details: { poppedCount: 16 },
      },
      {
        child: theo,
        module_id: 'speech',
        game_id: 'fazenda_falante',
        game_title: 'Primeiras Palavras & Sílabas',
        stars: 2,
        score: 78,
        accuracy: 75,
        rounds_completed: 4,
        total_rounds: 4,
        language: 'pt-BR',
        daysAgo: 2.5,
        details: {
          isFirstWordsMode: true,
          items: ['Mamãe', 'Papai', 'Água', 'Neném'],
          wordResults: [
            { word: 'Mamãe', score: 85, stars: 3, isRecognized: true },
            { word: 'Papai', score: 80, stars: 2, isRecognized: true },
            { word: 'Água', score: 72, stars: 2, isRecognized: true },
            { word: 'Neném', score: 76, stars: 2, isRecognized: true },
          ],
        },
      },

      // Arthur (CogniKids Junior - Leitura, Ditado, Matemática, Matriz Lógica)
      {
        child: arthur,
        module_id: 'junior_vocab',
        game_id: 'junior_vocab_builder',
        game_title: 'Mestre do Vocabulário Junior Pro (EN)',
        stars: 3,
        score: 95,
        accuracy: 95,
        rounds_completed: 5,
        total_rounds: 5,
        language: 'en',
        daysAgo: 0.1,
        details: {
          language: 'en',
          isJunior: true,
          items: ['Science', 'Planet', 'Curiosity', 'Adventure', 'Knowledge'],
          wordResults: [
            { word: 'Science', score: 98, stars: 3, isRecognized: true },
            { word: 'Planet', score: 96, stars: 3, isRecognized: true },
            { word: 'Curiosity', score: 92, stars: 3, isRecognized: true },
            { word: 'Adventure', score: 95, stars: 3, isRecognized: true },
            { word: 'Knowledge', score: 94, stars: 3, isRecognized: true },
          ],
        },
      },
      {
        child: arthur,
        module_id: 'junior_math',
        game_id: 'junior_math_quest',
        game_title: 'Missão Matemática & Raciocínio Veloz',
        stars: 3,
        score: 90,
        accuracy: 90,
        rounds_completed: 6,
        total_rounds: 6,
        language: 'pt-BR',
        daysAgo: 0.8,
        details: {
          operations: ['multiplicação', 'adição rápida', 'frações visuais'],
          isJunior: true,
        },
      },
      {
        child: arthur,
        module_id: 'junior_logic',
        game_id: 'junior_logic_matrix',
        game_title: 'Matriz Lógica & Padrões Complexos',
        stars: 3,
        score: 100,
        accuracy: 100,
        rounds_completed: 5,
        total_rounds: 5,
        language: 'pt-BR',
        daysAgo: 1.8,
        details: { patternsSolved: 5, avgTimeSeconds: 8, isJunior: true },
      },
      {
        child: arthur,
        module_id: 'junior_dictation',
        game_id: 'junior_dictation',
        game_title: 'Ditado de Voz & Ortografia Multilíngue (ES)',
        stars: 3,
        score: 88,
        accuracy: 88,
        rounds_completed: 5,
        total_rounds: 5,
        language: 'es',
        daysAgo: 2.2,
        details: {
          language: 'es',
          items: ['Amistad', 'Estrella', 'Biblioteca', 'Hermano'],
          isJunior: true,
        },
      },
      {
        child: arthur,
        module_id: 'junior_vocab',
        game_id: 'junior_vocab_builder',
        game_title: 'Wortmeister Junior (DE)',
        stars: 3,
        score: 84,
        accuracy: 84,
        rounds_completed: 4,
        total_rounds: 4,
        language: 'de',
        daysAgo: 4.5,
        details: {
          language: 'de',
          items: ['Wissenschaft', 'Freundschaft', 'Abenteuer'],
          isJunior: true,
        },
      },
      {
        child: arthur,
        module_id: 'junior_vocab',
        game_id: 'junior_vocab_builder',
        game_title: 'Maître du Vocabulaire (FR)',
        stars: 3,
        score: 86,
        accuracy: 86,
        rounds_completed: 4,
        total_rounds: 4,
        language: 'fr',
        daysAgo: 5.5,
        details: { language: 'fr', items: ['Aventure', 'Curiosité', 'Étoile'], isJunior: true },
      },
    ]

    for (const s of demoSessions) {
      try {
        const existing = app.findRecordsByFilter(
          'game_sessions',
          `child_id = '${s.child.id}' && game_title = '${s.game_title.replace(/'/g, "\\'")}'`,
          '',
          1,
          0,
        )
        if (existing && existing.length > 0) continue
      } catch (_) {}

      const sess = new Record(sessionsCol)
      sess.set('user_id', demoUser.id)
      sess.set('child_id', s.child.id)
      sess.set('module_id', s.module_id)
      sess.set('game_id', s.game_id)
      sess.set('game_title', s.game_title)
      sess.set('stars', s.stars)
      sess.set('score', s.score)
      sess.set('accuracy', s.accuracy)
      sess.set('rounds_completed', s.rounds_completed)
      sess.set('total_rounds', s.total_rounds)
      sess.set('language', s.language)
      sess.set('details', s.details)
      app.save(sess)
    }

    // 5. Seed Child Achievements (Medalhas de honra)
    const achievementsSeed = [
      {
        child: clara,
        module_id: 'speech',
        badge_key: 'speech_first_words',
        title: 'Voz Afinada',
        description:
          'Pronunciou mais de 25 palavras com reconhecimento de voz com mais de 90% de precisão.',
        icon: '🗣️',
        tier: 'gold',
      },
      {
        child: clara,
        module_id: 'memory',
        badge_key: 'memory_master',
        title: 'Mestre da Memória',
        description: 'Completou sequências sem errar nenhuma carta no par de bichinhos.',
        icon: '🧠',
        tier: 'gold',
      },
      {
        child: clara,
        module_id: 'speech',
        badge_key: 'polyglot_starter',
        title: 'Pequena Poliglota',
        description: 'Praticou palavras em Português, Inglês e Espanhol na mesma semana!',
        icon: '🌍',
        tier: 'special',
      },
      {
        child: theo,
        module_id: 'motor',
        badge_key: 'bubble_popper',
        title: 'Dedo Mágico',
        description: 'Estourou todas as bolhas no tempo recorde com excelente coordenação visual.',
        icon: '🎈',
        tier: 'silver',
      },
      {
        child: arthur,
        module_id: 'junior_vocab',
        badge_key: 'vocab_master_pro',
        title: 'Enciclopédia Humana',
        description: 'Dominou vocabulários complexos em 5 idiomas diferentes no CogniKids Junior.',
        icon: '🏆',
        tier: 'special',
      },
      {
        child: arthur,
        module_id: 'junior_logic',
        badge_key: 'logic_detective',
        title: 'Detetive da Lógica',
        description:
          'Acertou 100% dos enigmas da Matriz Lógica em menos de 10 segundos por rodada.',
        icon: '🧩',
        tier: 'gold',
      },
    ]

    for (const ach of achievementsSeed) {
      try {
        const existing = app.findRecordsByFilter(
          'child_achievements',
          `child_id = '${ach.child.id}' && badge_key = '${ach.badge_key}'`,
          '',
          1,
          0,
        )
        if (existing && existing.length > 0) continue
      } catch (_) {}

      const record = new Record(achievementsCol)
      record.set('user_id', demoUser.id)
      record.set('child_id', ach.child.id)
      record.set('module_id', ach.module_id)
      record.set('badge_key', ach.badge_key)
      record.set('title', ach.title)
      record.set('description', ach.description)
      record.set('icon', ach.icon)
      record.set('tier', ach.tier)
      record.set('unlocked_at', new Date(now - Math.random() * 86400000 * 3).toISOString())
      app.save(record)
    }

    // 6. Seed School Access Tokens for Public Demo Presentation:
    // Institution: "Colégio Futuro Criativo (Demo Oficial)"
    // Codes:
    // - ESCOLA-DEMO01 (código global da instituição englobando Berçário, Maternal e Jardim)
    // - ESCOLA-BERCARIO (código específico do Berçário II para Theo)
    // - ESCOLA-MATERNAL (código específico do Maternal II para Clara)
    // - ESCOLA-JUNIOR (código específico de Arthur)
    const schoolTokensSeed = [
      {
        access_code: 'ESCOLA-DEMO01',
        school_name: 'Colégio Futuro Criativo (Demo Oficial)',
        teacher_name: 'Coordenação Pedagógica CogniKids',
        class_group: 'Todas as Turmas',
        child_id: null, // null binds to all children belonging to this guardian institution!
        note: 'Acesso demonstrativo completo para apresentação à coordenação e corpo docente.',
        is_active: true,
      },
      {
        access_code: 'ESCOLA-BERCARIO',
        school_name: 'Colégio Futuro Criativo (Demo Oficial)',
        teacher_name: 'Profa. Camila (Berçário II)',
        class_group: 'Berçário II',
        child_id: theo.id,
        note: 'Turma de estímulo sensorial, primeiras palavras e motricidade fina.',
        is_active: true,
      },
      {
        access_code: 'ESCOLA-MATERNAL',
        school_name: 'Colégio Futuro Criativo (Demo Oficial)',
        teacher_name: 'Prof. Henrique (Maternal II)',
        class_group: 'Maternal II',
        child_id: clara.id,
        note: 'Turma de ampliação de vocabulário, percepção lógica e raciocínio.',
        is_active: true,
      },
      {
        access_code: 'ESCOLA-JUNIOR',
        school_name: 'Colégio Futuro Criativo (Demo Oficial)',
        teacher_name: 'Profa. Beatriz (Jardim / 3º Ano)',
        class_group: 'Jardim / 3º Ano',
        child_id: arthur.id,
        note: 'Turma avançada CogniKids Junior de alfabetização, ortografia e matemática.',
        is_active: true,
      },
    ]

    for (const tok of schoolTokensSeed) {
      try {
        const existing = app.findRecordsByFilter(
          'school_access_tokens',
          `access_code = '${tok.access_code}'`,
          '',
          1,
          0,
        )
        if (existing && existing.length > 0) continue
      } catch (_) {}

      const tokRecord = new Record(schoolAccessCol)
      tokRecord.set('user_id', demoUser.id)
      if (tok.child_id) {
        tokRecord.set('child_id', tok.child_id)
      }
      tokRecord.set('access_code', tok.access_code)
      tokRecord.set('school_name', tok.school_name)
      tokRecord.set('teacher_name', tok.teacher_name)
      tokRecord.set('class_group', tok.class_group)
      tokRecord.set('note', tok.note)
      tokRecord.set('is_active', tok.is_active)
      tokRecord.set('last_accessed_at', new Date().toISOString())
      app.save(tokRecord)
    }
  },
  (app) => {
    // down logic: delete seeded records if reverted
    try {
      const demoUser = app.findAuthRecordByEmail('_pb_users_auth_', 'demo@cognikids.app')
      app.delete(demoUser)
    } catch (_) {}
  },
)
