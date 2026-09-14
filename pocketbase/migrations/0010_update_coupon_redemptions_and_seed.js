/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    // 1. Ensure coupon_redemptions has created and updated autodate fields & public create/list rules
    let col
    try {
      col = app.findCollectionByNameOrId('coupon_redemptions')
    } catch (_) {
      // should exist from 0009, but guard
      col = new Collection({
        name: 'coupon_redemptions',
        type: 'base',
        listRule: '',
        viewRule: '',
        createRule: '',
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'invite_code', type: 'text', required: true },
          { name: 'institution_id', type: 'text' },
          { name: 'classroom_id', type: 'text' },
          { name: 'classroom_name', type: 'text' },
          { name: 'guardian_user_id', type: 'text' },
          { name: 'guardian_name', type: 'text' },
          { name: 'guardian_email', type: 'text' },
          { name: 'child_id', type: 'text' },
          { name: 'child_name', type: 'text' },
          { name: 'child_age', type: 'number' },
          { name: 'source', type: 'text' },
          { name: 'welcome_sent', type: 'bool' },
          { name: 'welcome_sent_at', type: 'date' },
          { name: 'metadata', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(col)
    }

    if (col) {
      col.listRule = ''
      col.viewRule = ''
      col.createRule = ''

      if (!col.fields.getByName('created')) {
        col.fields.add(new AutodateField({ name: 'created', onCreate: true, onUpdate: false }))
      }
      if (!col.fields.getByName('updated')) {
        col.fields.add(new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }))
      }
      app.save(col)
    }

    // 2. Seed initial demo redemptions for ESCOLA-DEMO01 / Colégio Futuro Criativo
    // Coupons: MATRIC-BERCARIO, MATRIC-MATERNAL, MATRIC-JUNIOR
    const demoRedemptions = [
      {
        invite_code: 'MATRIC-BERCARIO',
        institution_id: 'ESCOLA-DEMO01',
        classroom_id: 'bercario_2',
        classroom_name: 'Berçário II',
        guardian_user_id: '',
        guardian_name: 'Mariana Duarte',
        guardian_email: 'mariana.duarte@emaildemo.com',
        child_id: 'theo_demo_redemption',
        child_name: 'Theo Duarte',
        child_age: 18,
        source: 'whatsapp_school_link',
        welcome_sent: true,
        welcome_sent_at: '2026-09-10T10:30:00.000Z',
        metadata: { classGroup: 'Berçário II', notes: 'Início no 2º semestre' },
      },
      {
        invite_code: 'MATRIC-BERCARIO',
        institution_id: 'ESCOLA-DEMO01',
        classroom_id: 'bercario_2',
        classroom_name: 'Berçário II',
        guardian_user_id: '',
        guardian_name: 'Carlos Eduardo Lima',
        guardian_email: 'carlos.lima@emaildemo.com',
        child_id: 'enzo_demo_redemption',
        child_name: 'Enzo Lima',
        child_age: 15,
        source: 'portal_convite',
        welcome_sent: true,
        welcome_sent_at: '2026-09-11T14:15:00.000Z',
        metadata: { classGroup: 'Berçário II' },
      },
      {
        invite_code: 'MATRIC-MATERNAL',
        institution_id: 'ESCOLA-DEMO01',
        classroom_id: 'maternal_2',
        classroom_name: 'Maternal II',
        guardian_user_id: '',
        guardian_name: 'Fernanda Albuquerque',
        guardian_email: 'fernanda.alb@emaildemo.com',
        child_id: 'clara_demo_redemption',
        child_name: 'Clara Albuquerque',
        child_age: 48,
        source: 'whatsapp_school_link',
        welcome_sent: true,
        welcome_sent_at: '2026-09-09T09:20:00.000Z',
        metadata: { classGroup: 'Maternal II' },
      },
      {
        invite_code: 'MATRIC-MATERNAL',
        institution_id: 'ESCOLA-DEMO01',
        classroom_id: 'maternal_2',
        classroom_name: 'Maternal II',
        guardian_user_id: '',
        guardian_name: 'Rodrigo Medeiros',
        guardian_email: 'rodrigo.med@emaildemo.com',
        child_id: 'gabriel_demo_redemption',
        child_name: 'Gabriel Medeiros',
        child_age: 42,
        source: 'reuniao_pais',
        welcome_sent: true,
        welcome_sent_at: '2026-09-12T16:45:00.000Z',
        metadata: { classGroup: 'Maternal II' },
      },
      {
        invite_code: 'MATRIC-MATERNAL',
        institution_id: 'ESCOLA-DEMO01',
        classroom_id: 'maternal_2',
        classroom_name: 'Maternal II',
        guardian_user_id: '',
        guardian_name: 'Juliana Castro',
        guardian_email: 'juliana.castro@emaildemo.com',
        child_id: 'alice_demo_redemption',
        child_name: 'Alice Castro',
        child_age: 45,
        source: 'whatsapp_school_link',
        welcome_sent: true,
        welcome_sent_at: '2026-09-13T11:00:00.000Z',
        metadata: { classGroup: 'Maternal II' },
      },
      {
        invite_code: 'MATRIC-JUNIOR',
        institution_id: 'ESCOLA-DEMO01',
        classroom_id: 'jardim_3ano',
        classroom_name: 'Jardim / 3º Ano',
        guardian_user_id: '',
        guardian_name: 'Beatriz Vasconcelos',
        guardian_email: 'beatriz.vasc@emaildemo.com',
        child_id: 'arthur_demo_redemption',
        child_name: 'Arthur Vasconcelos',
        child_age: 96,
        source: 'whatsapp_school_link',
        welcome_sent: true,
        welcome_sent_at: '2026-09-08T08:10:00.000Z',
        metadata: { classGroup: 'Jardim / 3º Ano' },
      },
      {
        invite_code: 'MATRIC-JUNIOR',
        institution_id: 'ESCOLA-DEMO01',
        classroom_id: 'jardim_3ano',
        classroom_name: 'Jardim / 3º Ano',
        guardian_user_id: '',
        guardian_name: 'Marcelo Pires',
        guardian_email: 'marcelo.pires@emaildemo.com',
        child_id: 'lucas_demo_redemption',
        child_name: 'Lucas Pires',
        child_age: 84,
        source: 'portal_convite',
        welcome_sent: true,
        welcome_sent_at: '2026-09-11T18:30:00.000Z',
        metadata: { classGroup: 'Jardim / 3º Ano' },
      },
    ]

    for (const item of demoRedemptions) {
      try {
        const existing = app.findRecordsByFilter(
          'coupon_redemptions',
          `invite_code = '${item.invite_code}' && guardian_email = '${item.guardian_email}'`,
          '',
          1,
          0,
        )
        if (existing && existing.length > 0) {
          continue
        }
      } catch (_) {}

      const record = new Record(col)
      record.set('invite_code', item.invite_code)
      record.set('institution_id', item.institution_id)
      record.set('classroom_id', item.classroom_id)
      record.set('classroom_name', item.classroom_name)
      record.set('guardian_user_id', item.guardian_user_id)
      record.set('guardian_name', item.guardian_name)
      record.set('guardian_email', item.guardian_email)
      record.set('child_id', item.child_id)
      record.set('child_name', item.child_name)
      record.set('child_age', item.child_age)
      record.set('source', item.source)
      record.set('welcome_sent', item.welcome_sent)
      if (item.welcome_sent_at) {
        record.set('welcome_sent_at', item.welcome_sent_at)
      }
      record.set('metadata', item.metadata)
      app.save(record)
    }
  },
  (app) => {
    // down
    try {
      app
        .db()
        .newQuery("DELETE FROM coupon_redemptions WHERE institution_id = 'ESCOLA-DEMO01'")
        .execute()
    } catch (_) {}
  },
)
