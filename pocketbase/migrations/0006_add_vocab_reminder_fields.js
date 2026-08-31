migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    // Add vocab_reminder_enabled (bool), vocab_reminder_time (text), vocab_reminder_language (text)
    if (!usersCol.fields.getByName('vocab_reminder_enabled')) {
      usersCol.fields.add(
        new BoolField({
          name: 'vocab_reminder_enabled',
          required: false,
        }),
      )
    }

    if (!usersCol.fields.getByName('vocab_reminder_time')) {
      usersCol.fields.add(
        new TextField({
          name: 'vocab_reminder_time',
          required: false,
        }),
      )
    }

    if (!usersCol.fields.getByName('vocab_reminder_language')) {
      usersCol.fields.add(
        new TextField({
          name: 'vocab_reminder_language',
          required: false,
        }),
      )
    }

    app.save(usersCol)
  },
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    if (usersCol.fields.getByName('vocab_reminder_enabled')) {
      usersCol.fields.removeByName('vocab_reminder_enabled')
    }
    if (usersCol.fields.getByName('vocab_reminder_time')) {
      usersCol.fields.removeByName('vocab_reminder_time')
    }
    if (usersCol.fields.getByName('vocab_reminder_language')) {
      usersCol.fields.removeByName('vocab_reminder_language')
    }
    app.save(usersCol)
  },
)
