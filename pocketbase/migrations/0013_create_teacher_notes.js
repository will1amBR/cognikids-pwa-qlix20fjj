migrate(
  (app) => {
    const childrenCol = app.findCollectionByNameOrId('children')

    const collection = new Collection({
      name: 'teacher_notes',
      type: 'base',
      // Regras: leitura pública ou por responsável da criança; criação validada
      listRule: '',
      viewRule: '',
      createRule:
        "@request.body.school_code != '' && @request.body.child_id != '' && @request.body.lesson_activity != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'school_code',
          type: 'text',
          required: true,
        },
        {
          name: 'child_id',
          type: 'relation',
          required: true,
          collectionId: childrenCol.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'class_group',
          type: 'text',
          required: false,
        },
        {
          name: 'lesson_activity',
          type: 'text',
          required: true,
        },
        {
          name: 'author_name',
          type: 'text',
          required: false,
        },
        {
          name: 'note_date',
          type: 'date',
          required: false,
        },
        {
          name: 'observation',
          type: 'text',
          required: false,
        },
        {
          name: 'tags',
          type: 'json',
          required: false,
        },
        {
          name: 'synced',
          type: 'bool',
          required: false,
        },
        {
          name: 'created',
          type: 'autodate',
          onCreate: true,
          onUpdate: false,
        },
        {
          name: 'updated',
          type: 'autodate',
          onCreate: true,
          onUpdate: true,
        },
      ],
      indexes: [
        'CREATE INDEX idx_teacher_notes_school ON teacher_notes (school_code)',
        'CREATE INDEX idx_teacher_notes_child ON teacher_notes (child_id)',
        'CREATE INDEX idx_teacher_notes_date ON teacher_notes (note_date DESC)',
      ],
    })

    app.save(collection)

    // Seed 3 anotações na escola demo ESCOLA-DEMO01
    // Theo: nvlgft7tfx69648 (Berçário II)
    // Clara: 3daks4amyhs7o3j (Maternal II)
    // Arthur: h7cix80bm9zncbd (Jardim / 3º Ano)
    const seedNotes = [
      {
        school_code: 'ESCOLA-DEMO01',
        child_id: 'nvlgft7tfx69648',
        class_group: 'Berçário II',
        lesson_activity: 'Roda Sensorial e Cantigas com Animais da Fazenda',
        author_name: 'Profa. Camila (Berçário II)',
        note_date: '2026-09-08 10:30:00.000Z',
        observation:
          'Theo participou muito bem da atividade com os bichinhos de borracha! Balbuciou sons imitando o pintinho e a vaquinha com sorriso largo. Mostrou ótima curiosidade e coordenação motora ao segurar as peças.',
        tags: ['Sensorial', 'Linguagem', 'Coordenação Motora', 'Música'],
        synced: true,
      },
      {
        school_code: 'ESCOLA-DEMO01',
        child_id: '3daks4amyhs7o3j',
        class_group: 'Maternal II',
        lesson_activity: 'Circuito de Formas Geométricas & Vocabulário em Inglês',
        author_name: 'Prof. Henrique (Maternal II)',
        note_date: '2026-09-08 14:15:00.000Z',
        observation:
          'Clara associou prontamente os blocos de círculo e triângulo. Durante o momento bilíngue repetiu "circle" e "star" com pronúncia nítida! Demonstrou espírito colaborativo ajudando os colegas a organizar a caixa.',
        tags: ['Inglês', 'Raciocínio Lógico', 'Socialização', 'Autonomia'],
        synced: true,
      },
      {
        school_code: 'ESCOLA-DEMO01',
        child_id: 'h7cix80bm9zncbd',
        class_group: 'Jardim / 3º Ano',
        lesson_activity: 'Ditado Digital & Desafio Matemático do Tico',
        author_name: 'Profa. Beatriz (Jardim / 3º Ano)',
        note_date: '2026-09-08 15:45:00.000Z',
        observation:
          'Arthur concluiu o desafio com 95% de precisão no reconhecimento de voz e resolveu as somas rapidamente. Apresentou foco excepcional e demonstrou entusiasmo com o mascote Tico!',
        tags: ['Alfabetização', 'Matemática', 'Foco', 'CogniKids Junior'],
        synced: true,
      },
    ]

    for (const note of seedNotes) {
      try {
        const rec = new Record(collection)
        rec.set('school_code', note.school_code)
        rec.set('child_id', note.child_id)
        rec.set('class_group', note.class_group)
        rec.set('lesson_activity', note.lesson_activity)
        rec.set('author_name', note.author_name)
        rec.set('note_date', note.note_date)
        rec.set('observation', note.observation)
        rec.set('tags', note.tags)
        rec.set('synced', note.synced)
        app.save(rec)
      } catch (err) {
        console.warn('Could not seed teacher note', err)
      }
    }
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('teacher_notes')
      app.delete(collection)
    } catch (_) {}
  },
)
