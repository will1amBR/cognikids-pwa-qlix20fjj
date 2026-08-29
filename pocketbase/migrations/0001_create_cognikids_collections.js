migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // 1. Create children collection
    const children = new Collection({
      name: 'children',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: users.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'name', type: 'text', required: true, min: 2, max: 100 },
        { name: 'birth_date', type: 'date', required: true },
        { name: 'favorite_color', type: 'text', required: false },
        {
          name: 'avatar',
          type: 'file',
          maxSelect: 1,
          maxSize: 2097152,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_children_user ON children (user_id)',
        'CREATE INDEX idx_children_created ON children (created DESC)',
      ],
    })
    app.save(children)

    // 2. Create game_sessions collection
    const gameSessions = new Collection({
      name: 'game_sessions',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: users.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'child_id',
          type: 'relation',
          required: true,
          collectionId: children.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'module_id', type: 'text', required: true },
        { name: 'game_id', type: 'text', required: true },
        { name: 'game_title', type: 'text', required: true },
        { name: 'stars', type: 'number', required: false, min: 0, max: 3 },
        { name: 'score', type: 'number', required: false, min: 0, max: 100 },
        { name: 'accuracy', type: 'number', required: false, min: 0, max: 100 },
        { name: 'rounds_completed', type: 'number', required: false },
        { name: 'total_rounds', type: 'number', required: false },
        { name: 'details', type: 'json', required: false, maxSize: 50000 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_game_sessions_user_child ON game_sessions (user_id, child_id)',
        'CREATE INDEX idx_game_sessions_created ON game_sessions (created DESC)',
      ],
    })
    app.save(gameSessions)

    // 3. Create module_progress collection
    const moduleProgress = new Collection({
      name: 'module_progress',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: users.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'child_id',
          type: 'relation',
          required: true,
          collectionId: children.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'module_id', type: 'text', required: true },
        { name: 'mastery_percentage', type: 'number', required: false, min: 0, max: 100 },
        { name: 'total_played', type: 'number', required: false },
        { name: 'last_played_at', type: 'date', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_mod_prog_user_child ON module_progress (user_id, child_id)',
        'CREATE UNIQUE INDEX idx_mod_prog_child_module ON module_progress (child_id, module_id)',
      ],
    })
    app.save(moduleProgress)
  },
  (app) => {
    try {
      const moduleProgress = app.findCollectionByNameOrId('module_progress')
      app.delete(moduleProgress)
    } catch (_) {}
    try {
      const gameSessions = app.findCollectionByNameOrId('game_sessions')
      app.delete(gameSessions)
    } catch (_) {}
    try {
      const children = app.findCollectionByNameOrId('children')
      app.delete(children)
    } catch (_) {}
  },
)
