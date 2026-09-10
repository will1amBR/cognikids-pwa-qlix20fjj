migrate(
  (app) => {
    const invites = app.findCollectionByNameOrId('invites')

    // Public list/view rule for invites so unregistered/registered parents can resolve invite/coupon code
    invites.listRule = ''
    invites.viewRule = ''

    // Add school_name, class_group and invite_type if not present
    if (!invites.fields.getByName('school_name')) {
      invites.fields.add(
        new TextField({
          name: 'school_name',
          required: false,
        }),
      )
    }

    if (!invites.fields.getByName('class_group')) {
      invites.fields.add(
        new TextField({
          name: 'class_group',
          required: false,
        }),
      )
    }

    if (!invites.fields.getByName('invite_type')) {
      invites.fields.add(
        new TextField({
          name: 'invite_type',
          required: false,
        }),
      )
    }

    app.save(invites)

    // Seed default classroom coupon codes for Colégio Futuro Criativo Demo
    // - MATRIC-BERCARIO -> Berçário II
    // - MATRIC-MATERNAL -> Maternal II
    // - MATRIC-JUNIOR   -> Jardim / 3º Ano
    let demoUser
    try {
      demoUser = app.findAuthRecordByEmail('_pb_users_auth_', 'demo@cognikids.app')
    } catch (_) {}

    if (demoUser) {
      const demoCoupons = [
        {
          code: 'MATRIC-BERCARIO',
          school_name: 'Colégio Futuro Criativo (Demo Oficial)',
          class_group: 'Berçário II',
          sender_name: 'Coordenação Berçário',
        },
        {
          code: 'MATRIC-MATERNAL',
          school_name: 'Colégio Futuro Criativo (Demo Oficial)',
          class_group: 'Maternal II',
          sender_name: 'Coordenação Maternal',
        },
        {
          code: 'MATRIC-JUNIOR',
          school_name: 'Colégio Futuro Criativo (Demo Oficial)',
          class_group: 'Jardim / 3º Ano',
          sender_name: 'Coordenação Ensino Fundamental',
        },
      ]

      for (const coup of demoCoupons) {
        try {
          const existing = app.findRecordsByFilter(
            'invites',
            `invite_code = '${coup.code}'`,
            '',
            1,
            0,
          )
          if (existing && existing.length > 0) continue
        } catch (_) {}

        const rec = new Record(invites)
        rec.set('user_id', demoUser.id)
        rec.set('invite_code', coup.code)
        rec.set('sender_child_name', coup.sender_name)
        rec.set('school_name', coup.school_name)
        rec.set('class_group', coup.class_group)
        rec.set('invite_type', 'school_classroom')
        rec.set('status', 'active')
        app.save(rec)
      }
    }
  },
  (app) => {
    // down logic
    const invites = app.findCollectionByNameOrId('invites')
    invites.listRule = "@request.auth.id != ''"
    invites.viewRule = "@request.auth.id != ''"
    app.save(invites)
  },
)
