/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    // Check if coupon_redemptions already exists
    try {
      app.findCollectionByNameOrId('coupon_redemptions')
      return
    } catch (e) {
      // collection doesn't exist yet, proceed
    }

    const collection = new Collection({
      name: 'coupon_redemptions',
      type: 'base',
      listRule: '', // allow read for school portal & guardian verification
      viewRule: '',
      createRule: '', // allow public / authenticated redemptions during signup/onboarding
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'id',
          type: 'text',
          required: true,
          primaryKey: true,
          autogeneratePattern: '[a-z0-9]{15}',
        },
        {
          name: 'invite_code',
          type: 'text',
          required: true,
        },
        {
          name: 'institution_id',
          type: 'text',
          required: false,
        },
        {
          name: 'classroom_id',
          type: 'text',
          required: false,
        },
        {
          name: 'classroom_name',
          type: 'text',
          required: false,
        },
        {
          name: 'guardian_user_id',
          type: 'text',
          required: false,
        },
        {
          name: 'guardian_name',
          type: 'text',
          required: false,
        },
        {
          name: 'guardian_email',
          type: 'text',
          required: false,
        },
        {
          name: 'child_id',
          type: 'text',
          required: false,
        },
        {
          name: 'child_name',
          type: 'text',
          required: false,
        },
        {
          name: 'child_age',
          type: 'number',
          required: false,
        },
        {
          name: 'source',
          type: 'text',
          required: false,
        },
        {
          name: 'welcome_sent',
          type: 'bool',
          required: false,
        },
        {
          name: 'welcome_sent_at',
          type: 'date',
          required: false,
        },
        {
          name: 'metadata',
          type: 'json',
          required: false,
        },
      ],
    })

    app.save(collection)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('coupon_redemptions')
      app.delete(col)
    } catch (e) {
      // ignore
    }
  },
)
