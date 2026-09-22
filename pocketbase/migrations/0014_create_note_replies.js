migrate(
  (app) => {
    // 1. Atualizar teacher_notes com author_role e is_family se ainda não existirem
    try {
      const teacherNotesCol = app.findCollectionByNameOrId('teacher_notes')
      if (!teacherNotesCol.fields.getByName('author_role')) {
        teacherNotesCol.fields.add(
          new TextField({
            name: 'author_role',
            required: false,
          }),
        )
      }
      if (!teacherNotesCol.fields.getByName('is_family')) {
        teacherNotesCol.fields.add(
          new BoolField({
            name: 'is_family',
            required: false,
          }),
        )
      }
      app.save(teacherNotesCol)
    } catch (e) {
      console.warn('Could not update teacher_notes fields:', e)
    }

    // 2. Criar coleção note_replies para a conversa bidirecional escola <-> casa
    const teacherNotesCol = app.findCollectionByNameOrId('teacher_notes')

    const collection = new Collection({
      name: 'note_replies',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.body.note_id != '' && @request.body.message != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'note_id',
          type: 'relation',
          required: true,
          collectionId: teacherNotesCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'author_role',
          type: 'select',
          required: true,
          values: ['parent', 'teacher'],
          maxSelect: 1,
        },
        {
          name: 'author_name',
          type: 'text',
          required: false,
        },
        {
          name: 'message',
          type: 'text',
          required: true,
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
        'CREATE INDEX idx_note_replies_note ON note_replies (note_id)',
        'CREATE INDEX idx_note_replies_created ON note_replies (created ASC)',
      ],
    })

    app.save(collection)
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('note_replies')
      app.delete(collection)
    } catch (_) {}
  },
)
