migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const children = app.findCollectionByNameOrId('children')

    // 1. Add daily session configuration fields to children collection
    if (!children.fields.getByName('daily_minutes')) {
      children.fields.add(
        new NumberField({ name: 'daily_minutes', min: 3, max: 60, required: false }),
      )
    }
    if (!children.fields.getByName('daily_activity_count')) {
      children.fields.add(
        new NumberField({ name: 'daily_activity_count', min: 1, max: 10, required: false }),
      )
    }
    app.save(children)

    // 2. Create child_achievements (Medals / Conquistas por área)
    const childAchievements = new Collection({
      name: 'child_achievements',
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
        { name: 'badge_key', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text', required: false },
        { name: 'icon', type: 'text', required: false },
        { name: 'tier', type: 'text', required: false }, // 'bronze', 'silver', 'gold', 'special'
        { name: 'unlocked_at', type: 'date', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_achievements_user_child ON child_achievements (user_id, child_id)',
        'CREATE UNIQUE INDEX idx_achievements_child_badge ON child_achievements (child_id, badge_key)',
      ],
    })
    app.save(childAchievements)

    // 3. Create invites collection (Incentivo para chamar colegas via código de convite)
    const invites = new Collection({
      name: 'invites',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
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
          required: false,
          collectionId: children.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'invite_code', type: 'text', required: true, min: 4, max: 20 },
        { name: 'sender_child_name', type: 'text', required: false },
        { name: 'status', type: 'text', required: false }, // 'active', 'used', 'expired'
        {
          name: 'accepted_by_user_id',
          type: 'relation',
          required: false,
          collectionId: users.id,
          maxSelect: 1,
        },
        { name: 'accepted_child_name', type: 'text', required: false },
        { name: 'accepted_at', type: 'date', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_invites_code ON invites (invite_code)',
        'CREATE INDEX idx_invites_user ON invites (user_id)',
      ],
    })
    app.save(invites)

    // 4. Create school_access_tokens collection (Compartilhamento com a equipe pedagógica da escola via código de acesso)
    // listRule and viewRule allow public reading if token code matches (or authenticated guardian)
    const schoolAccess = new Collection({
      name: 'school_access_tokens',
      type: 'base',
      listRule: '',
      viewRule: '',
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
          required: false,
          collectionId: children.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'access_code', type: 'text', required: true, min: 6, max: 20 },
        { name: 'school_name', type: 'text', required: false },
        { name: 'teacher_name', type: 'text', required: false },
        { name: 'note', type: 'text', required: false },
        { name: 'is_active', type: 'bool', required: false },
        { name: 'last_accessed_at', type: 'date', required: false },
        { name: 'expires_at', type: 'date', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_school_access_code ON school_access_tokens (access_code)',
        'CREATE INDEX idx_school_access_user_child ON school_access_tokens (user_id, child_id)',
      ],
    })
    app.save(schoolAccess)
  },
  (app) => {
    try {
      const schoolAccess = app.findCollectionByNameOrId('school_access_tokens')
      app.delete(schoolAccess)
    } catch (_) {}
    try {
      const invites = app.findCollectionByNameOrId('invites')
      app.delete(invites)
    } catch (_) {}
    try {
      const childAchievements = app.findCollectionByNameOrId('child_achievements')
      app.delete(childAchievements)
    } catch (_) {}
  },
)
