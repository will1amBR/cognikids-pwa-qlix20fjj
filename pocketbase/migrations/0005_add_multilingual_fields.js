migrate(
  (app) => {
    // Add preferred_language to users collection if not present
    try {
      const usersCol = app.findCollectionByNameOrId('users')
      if (!usersCol.fields.getByName('preferred_language')) {
        usersCol.fields.add(
          new TextField({
            name: 'preferred_language',
            max: 10,
            required: false,
          }),
        )
        app.save(usersCol)
      }
    } catch (err) {
      console.warn('Could not update users collection', err)
    }

    // Add learning_languages (JSON or text) and primary_language to children collection
    try {
      const childrenCol = app.findCollectionByNameOrId('children')
      if (!childrenCol.fields.getByName('learning_languages')) {
        childrenCol.fields.add(
          new JSONField({
            name: 'learning_languages',
            maxSize: 10000,
            required: false,
          }),
        )
      }
      if (!childrenCol.fields.getByName('primary_language')) {
        childrenCol.fields.add(
          new TextField({
            name: 'primary_language',
            max: 10,
            required: false,
          }),
        )
      }
      app.save(childrenCol)
    } catch (err) {
      console.warn('Could not update children collection', err)
    }

    // Add language field to game_sessions collection
    try {
      const sessionsCol = app.findCollectionByNameOrId('game_sessions')
      if (!sessionsCol.fields.getByName('language')) {
        sessionsCol.fields.add(
          new TextField({
            name: 'language',
            max: 10,
            required: false,
          }),
        )
        app.save(sessionsCol)
      }
    } catch (err) {
      console.warn('Could not update game_sessions collection', err)
    }
  },
  (app) => {
    try {
      const usersCol = app.findCollectionByNameOrId('users')
      if (usersCol.fields.getByName('preferred_language')) {
        usersCol.fields.removeByName('preferred_language')
        app.save(usersCol)
      }
    } catch (_) {}

    try {
      const childrenCol = app.findCollectionByNameOrId('children')
      if (childrenCol.fields.getByName('learning_languages')) {
        childrenCol.fields.removeByName('learning_languages')
      }
      if (childrenCol.fields.getByName('primary_language')) {
        childrenCol.fields.removeByName('primary_language')
      }
      app.save(childrenCol)
    } catch (_) {}

    try {
      const sessionsCol = app.findCollectionByNameOrId('game_sessions')
      if (sessionsCol.fields.getByName('language')) {
        sessionsCol.fields.removeByName('language')
        app.save(sessionsCol)
      }
    } catch (_) {}
  },
)
