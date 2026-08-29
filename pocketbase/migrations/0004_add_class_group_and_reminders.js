migrate(
  (app) => {
    const children = app.findCollectionByNameOrId('children')
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const schoolAccess = app.findCollectionByNameOrId('school_access_tokens')

    // 1. Add class_group (turma / sala) to children
    if (!children.fields.getByName('class_group')) {
      children.fields.add(new TextField({ name: 'class_group', required: false, max: 100 }))
    }
    app.save(children)

    // 2. Add class_group to school_access_tokens (se o código for emitido para uma turma específica)
    if (!schoolAccess.fields.getByName('class_group')) {
      schoolAccess.fields.add(new TextField({ name: 'class_group', required: false, max: 100 }))
    }
    app.save(schoolAccess)

    // 3. Add reminder settings to users (reminder_enabled, reminder_time)
    if (!users.fields.getByName('reminder_enabled')) {
      users.fields.add(new BoolField({ name: 'reminder_enabled', required: false }))
    }
    if (!users.fields.getByName('reminder_time')) {
      users.fields.add(new TextField({ name: 'reminder_time', required: false, max: 10 }))
    }
    app.save(users)
  },
  (app) => {
    try {
      const children = app.findCollectionByNameOrId('children')
      children.fields.removeByName('class_group')
      app.save(children)
    } catch (_) {}

    try {
      const schoolAccess = app.findCollectionByNameOrId('school_access_tokens')
      schoolAccess.fields.removeByName('class_group')
      app.save(schoolAccess)
    } catch (_) {}

    try {
      const users = app.findCollectionByNameOrId('_pb_users_auth_')
      users.fields.removeByName('reminder_enabled')
      users.fields.removeByName('reminder_time')
      app.save(users)
    } catch (_) {}
  },
)
