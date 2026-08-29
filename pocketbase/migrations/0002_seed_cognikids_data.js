migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const childrenCol = app.findCollectionByNameOrId('children')
    const sessionsCol = app.findCollectionByNameOrId('game_sessions')
    const progressCol = app.findCollectionByNameOrId('module_progress')

    // 1. Seed or retrieve demo user
    let demoUser
    try {
      demoUser = app.findAuthRecordByEmail('_pb_users_auth_', 'william@korenambiental.com')
    } catch (_) {
      demoUser = new Record(users)
      demoUser.setEmail('william@korenambiental.com')
      demoUser.setPassword('Skip@Pass')
      demoUser.setVerified(true)
      demoUser.set('name', 'William Koren')
      app.save(demoUser)
    }

    // 2. Seed demo children for rich first impression
    const seedChildrenData = [
      {
        name: 'Sophia',
        // Approx 3 years and 2 months old
        birth_date: new Date(Date.now() - 38 * 30.5 * 24 * 3600 * 1000).toISOString(),
        favorite_color: '#FF7A45', // Fala & Linguagem
      },
      {
        name: 'Lucas',
        // Approx 1 year and 6 months (18 months)
        birth_date: new Date(Date.now() - 18 * 30.5 * 24 * 3600 * 1000).toISOString(),
        favorite_color: '#4EA8DE', // Memória & Atenção
      },
    ]

    const createdChildren = []

    for (const item of seedChildrenData) {
      try {
        const existing = app.findRecordsByFilter(
          'children',
          `user_id = '${demoUser.id}' && name = '${item.name}'`,
          '',
          1,
          0,
        )
        if (existing && existing.length > 0) {
          createdChildren.push(existing[0])
          continue
        }
      } catch (_) {}

      const childRecord = new Record(childrenCol)
      childRecord.set('user_id', demoUser.id)
      childRecord.set('name', item.name)
      childRecord.set('birth_date', item.birth_date)
      childRecord.set('favorite_color', item.favorite_color)
      app.save(childRecord)
      createdChildren.push(childRecord)
    }

    // 3. Seed module progress for Sophia
    if (createdChildren.length > 0) {
      const sophia = createdChildren[0]
      const modules = [
        { module_id: 'speech', mastery: 85, played: 12 },
        { module_id: 'memory', mastery: 70, played: 8 },
        { module_id: 'logic', mastery: 65, played: 7 },
        { module_id: 'motor', mastery: 90, played: 14 },
        { module_id: 'socioemotional', mastery: 75, played: 9 },
      ]

      for (const m of modules) {
        try {
          const existing = app.findRecordsByFilter(
            'module_progress',
            `child_id = '${sophia.id}' && module_id = '${m.module_id}'`,
            '',
            1,
            0,
          )
          if (existing && existing.length > 0) continue
        } catch (_) {}

        const prog = new Record(progressCol)
        prog.set('user_id', demoUser.id)
        prog.set('child_id', sophia.id)
        prog.set('module_id', m.module_id)
        prog.set('mastery_percentage', m.mastery)
        prog.set('total_played', m.played)
        prog.set('last_played_at', new Date().toISOString())
        app.save(prog)
      }

      // Seed recent game sessions for Sophia
      const sampleSessions = [
        {
          module_id: 'speech',
          game_id: 'fazenda_falante',
          game_title: 'A Fazenda Falante',
          stars: 3,
          score: 95,
          accuracy: 92,
          rounds_completed: 6,
          total_rounds: 6,
          details: { items: ['Leão', 'Vaca', 'Pato', 'Gato', 'Cachorro', 'Ovelha'] },
        },
        {
          module_id: 'memory',
          game_id: 'par_dos_animais',
          game_title: 'Par dos Bichinhos',
          stars: 3,
          score: 88,
          accuracy: 85,
          rounds_completed: 4,
          total_rounds: 4,
          details: { mode: 'pairs' },
        },
        {
          module_id: 'speech',
          game_id: 'cade_o_bichinho',
          game_title: 'Cadê o Bichinho?',
          stars: 2,
          score: 80,
          accuracy: 80,
          rounds_completed: 5,
          total_rounds: 5,
          details: { items: ['Elefante', 'Macaco', 'Pássaro'] },
        },
      ]

      for (const s of sampleSessions) {
        const sess = new Record(sessionsCol)
        sess.set('user_id', demoUser.id)
        sess.set('child_id', sophia.id)
        sess.set('module_id', s.module_id)
        sess.set('game_id', s.game_id)
        sess.set('game_title', s.game_title)
        sess.set('stars', s.stars)
        sess.set('score', s.score)
        sess.set('accuracy', s.accuracy)
        sess.set('rounds_completed', s.rounds_completed)
        sess.set('total_rounds', s.total_rounds)
        sess.set('details', s.details)
        app.save(sess)
      }
    }

    // Seed module progress for Lucas
    if (createdChildren.length > 1) {
      const lucas = createdChildren[1]
      const lucasModules = [
        { module_id: 'speech', mastery: 50, played: 4 },
        { module_id: 'memory', mastery: 40, played: 3 },
        { module_id: 'logic', mastery: 30, played: 2 },
        { module_id: 'motor', mastery: 60, played: 5 },
        { module_id: 'socioemotional', mastery: 45, played: 3 },
      ]

      for (const m of lucasModules) {
        try {
          const existing = app.findRecordsByFilter(
            'module_progress',
            `child_id = '${lucas.id}' && module_id = '${m.module_id}'`,
            '',
            1,
            0,
          )
          if (existing && existing.length > 0) continue
        } catch (_) {}

        const prog = new Record(progressCol)
        prog.set('user_id', demoUser.id)
        prog.set('child_id', lucas.id)
        prog.set('module_id', m.module_id)
        prog.set('mastery_percentage', m.mastery)
        prog.set('total_played', m.played)
        prog.set('last_played_at', new Date().toISOString())
        app.save(prog)
      }
    }
  },
  (app) => {
    // down logic
  },
)
