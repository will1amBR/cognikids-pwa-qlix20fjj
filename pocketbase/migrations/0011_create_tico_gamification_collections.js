/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    const childrenCol = app.findCollectionByNameOrId('children')

    // 1. Create child_coins_balance collection to store coins and equipped items per child
    let coinsCol
    try {
      coinsCol = app.findCollectionByNameOrId('child_coins_balance')
    } catch (_) {
      coinsCol = new Collection({
        name: 'child_coins_balance',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          {
            name: 'user_id',
            type: 'relation',
            collectionId: usersCol.id,
            required: true,
            maxSelect: 1,
            cascadeDelete: true,
          },
          {
            name: 'child_id',
            type: 'relation',
            collectionId: childrenCol.id,
            required: true,
            maxSelect: 1,
            cascadeDelete: true,
          },
          { name: 'coins', type: 'number', min: 0 },
          { name: 'total_earned', type: 'number', min: 0 },
          { name: 'equipped_hat', type: 'text' },
          { name: 'equipped_glasses', type: 'text' },
          { name: 'equipped_shoes', type: 'text' },
          { name: 'equipped_accessory', type: 'text' },
          { name: 'equipped_outfit', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_coins_child ON child_coins_balance (child_id)',
          'CREATE INDEX idx_coins_user ON child_coins_balance (user_id)',
        ],
      })
      app.save(coinsCol)
    }

    // 2. Create child_tico_inventory collection to store items purchased per child
    let invCol
    try {
      invCol = app.findCollectionByNameOrId('child_tico_inventory')
    } catch (_) {
      invCol = new Collection({
        name: 'child_tico_inventory',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          {
            name: 'user_id',
            type: 'relation',
            collectionId: usersCol.id,
            required: true,
            maxSelect: 1,
            cascadeDelete: true,
          },
          {
            name: 'child_id',
            type: 'relation',
            collectionId: childrenCol.id,
            required: true,
            maxSelect: 1,
            cascadeDelete: true,
          },
          { name: 'item_id', type: 'text', required: true },
          { name: 'item_category', type: 'text', required: true }, // 'hat' | 'glasses' | 'shoes' | 'accessory' | 'outfit'
          { name: 'item_name', type: 'text', required: true },
          { name: 'price_paid', type: 'number', min: 0 },
          { name: 'purchased_at', type: 'date' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_inv_child_item ON child_tico_inventory (child_id, item_id)',
          'CREATE INDEX idx_inv_user_child ON child_tico_inventory (user_id, child_id)',
        ],
      })
      app.save(invCol)
    }

    // 3. Seed starter coins and a starter hat for existing demo children if present
    try {
      const allKids = app.findRecordsByFilter('children', '', '-created', 10, 0)
      for (const kid of allKids) {
        try {
          const existingBal = app.findRecordsByFilter(
            'child_coins_balance',
            `child_id = '${kid.id}'`,
            '',
            1,
            0,
          )
          if (!existingBal || existingBal.length === 0) {
            const balRec = new Record(coinsCol)
            balRec.set('user_id', kid.getString('user_id'))
            balRec.set('child_id', kid.id)
            balRec.set('coins', 150)
            balRec.set('total_earned', 150)
            balRec.set('equipped_hat', 'hat_cap_orange')
            balRec.set('equipped_glasses', 'glasses_star')
            balRec.set('equipped_shoes', 'shoes_sneakers_blue')
            balRec.set('equipped_accessory', '')
            balRec.set('equipped_outfit', '')
            app.save(balRec)

            // Seed starter items in inventory
            const starterItems = [
              { id: 'hat_cap_orange', cat: 'hat', name: 'Boné Laranja Estiloso', price: 0 },
              { id: 'glasses_star', cat: 'glasses', name: 'Óculos Estrelinha', price: 0 },
              { id: 'shoes_sneakers_blue', cat: 'shoes', name: 'Tênis Veloz Azul', price: 0 },
            ]
            for (const item of starterItems) {
              const itemRec = new Record(invCol)
              itemRec.set('user_id', kid.getString('user_id'))
              itemRec.set('child_id', kid.id)
              itemRec.set('item_id', item.id)
              itemRec.set('item_category', item.cat)
              itemRec.set('item_name', item.name)
              itemRec.set('price_paid', item.price)
              itemRec.set('purchased_at', new Date().toISOString())
              app.save(itemRec)
            }
          }
        } catch (_) {}
      }
    } catch (_) {}
  },
  (app) => {
    try {
      const invCol = app.findCollectionByNameOrId('child_tico_inventory')
      app.delete(invCol)
    } catch (_) {}
    try {
      const coinsCol = app.findCollectionByNameOrId('child_coins_balance')
      app.delete(coinsCol)
    } catch (_) {}
  },
)
