migrate(
  (app) => {
    const sessionsCol = app.findCollectionByNameOrId('game_sessions')
    const claraRecord = app.findCollectionByNameOrId('children')
    const claraId = '3daks4amyhs7o3j' // Seeded Clara
    const demoUserId = 'hxvsetb7o76qs18' // Seeded Demo User

    // Create a verified demo session for Clara to prove end-to-end functionality
    const record = new Record(sessionsCol)
    record.set('user_id', demoUserId)
    record.set('child_id', claraId)
    record.set('module_id', 'speech')
    record.set('game_id', 'fazenda_falante')
    record.set('game_title', 'Fala & Voz: Animais da Fazenda')
    record.set('stars', 3)
    record.set('score', 98)
    record.set('accuracy', 98)
    record.set('rounds_completed', 5)
    record.set('total_rounds', 5)
    record.set('language', 'pt-BR')
    record.set('details', {
      category: 'farm_animals',
      language: 'pt-BR',
      isFirstWordsMode: false,
      items: ['Leão', 'Vaca', 'Pato', 'Gato', 'Cachorro'],
      wordResults: [
        { word: 'Leão', score: 100, stars: 3, isRecognized: true },
        { word: 'Vaca', score: 98, stars: 3, isRecognized: true },
        { word: 'Pato', score: 96, stars: 3, isRecognized: true },
        { word: 'Gato', score: 100, stars: 3, isRecognized: true },
        { word: 'Cachorro', score: 96, stars: 3, isRecognized: true },
      ],
    })
    app.save(record)
  },
  (app) => {
    try {
      app
        .db()
        .newQuery(
          "DELETE FROM game_sessions WHERE score = 98 AND game_title = 'Fala & Voz: Animais da Fazenda'",
        )
        .execute()
    } catch (_) {}
  },
)
