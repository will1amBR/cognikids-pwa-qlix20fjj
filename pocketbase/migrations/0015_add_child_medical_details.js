migrate(
  (app) => {
    const childrenCol = app.findCollectionByNameOrId('children')

    // 1. Tipo sanguíneo (A+, A-, B+, B-, O+, O-, AB+, AB-, "Não sei", etc. como select ou texto livre)
    if (!childrenCol.fields.getByName('blood_type')) {
      childrenCol.fields.add(
        new SelectField({
          name: 'blood_type',
          required: false,
          values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Não sei'],
          maxSelect: 1,
        }),
      )
    }

    // 2. Alergias (alimentos, medicamentos, picadas, outras)
    if (!childrenCol.fields.getByName('allergies')) {
      childrenCol.fields.add(
        new TextField({
          name: 'allergies',
          required: false,
          max: 500,
        }),
      )
    }

    // 3. Medicamentos de uso contínuo
    if (!childrenCol.fields.getByName('continuous_medications')) {
      childrenCol.fields.add(
        new TextField({
          name: 'continuous_medications',
          required: false,
          max: 500,
        }),
      )
    }

    // 4. Condições de saúde / observações médicas (ex: asma, déficit auditivo, convulsões)
    if (!childrenCol.fields.getByName('medical_conditions')) {
      childrenCol.fields.add(
        new TextField({
          name: 'medical_conditions',
          required: false,
          max: 1000,
        }),
      )
    }

    // 5. Pediatra / médico responsável (nome)
    if (!childrenCol.fields.getByName('pediatrician_name')) {
      childrenCol.fields.add(
        new TextField({
          name: 'pediatrician_name',
          required: false,
          max: 150,
        }),
      )
    }

    // Pediatra (telefone)
    if (!childrenCol.fields.getByName('pediatrician_phone')) {
      childrenCol.fields.add(
        new TextField({
          name: 'pediatrician_phone',
          required: false,
          max: 50,
        }),
      )
    }

    // 6. Contato de emergência (nome, além dos pais)
    if (!childrenCol.fields.getByName('emergency_contact_name')) {
      childrenCol.fields.add(
        new TextField({
          name: 'emergency_contact_name',
          required: false,
          max: 150,
        }),
      )
    }

    // Contato de emergência (telefone)
    if (!childrenCol.fields.getByName('emergency_contact_phone')) {
      childrenCol.fields.add(
        new TextField({
          name: 'emergency_contact_phone',
          required: false,
          max: 50,
        }),
      )
    }

    // Contato de emergência (parentesco / relação)
    if (!childrenCol.fields.getByName('emergency_contact_relationship')) {
      childrenCol.fields.add(
        new TextField({
          name: 'emergency_contact_relationship',
          required: false,
          max: 80,
        }),
      )
    }

    // 7. Vacinas em dia (sim / não / não sei)
    if (!childrenCol.fields.getByName('vaccines_up_to_date')) {
      childrenCol.fields.add(
        new SelectField({
          name: 'vaccines_up_to_date',
          required: false,
          values: ['sim', 'nao', 'nao_sei'],
          maxSelect: 1,
        }),
      )
    }

    // 8. Restrições alimentares
    if (!childrenCol.fields.getByName('dietary_restrictions')) {
      childrenCol.fields.add(
        new TextField({
          name: 'dietary_restrictions',
          required: false,
          max: 500,
        }),
      )
    }

    app.save(childrenCol)

    // Atualizar dados de demonstração com detalhes médicos para demonstrar a funcionalidade
    // Clara (Maternal II): 3daks4amyhs7o3j
    try {
      const clara = app.findFirstRecordByData('children', 'id', '3daks4amyhs7o3j')
      clara.set('blood_type', 'O+')
      clara.set('allergies', 'Picada de inseto (abelha); leve intolerância a lactose')
      clara.set('continuous_medications', 'Nenhum no momento')
      clara.set('medical_conditions', 'Rinite alérgica em dias secos')
      clara.set('pediatrician_name', 'Dra. Mariana Costa (Pediatra)')
      clara.set('pediatrician_phone', '(11) 98765-4321')
      clara.set('emergency_contact_name', 'Dona Rosa (Avó materna)')
      clara.set('emergency_contact_phone', '(11) 97123-4567')
      clara.set('emergency_contact_relationship', 'Avó materna')
      clara.set('vaccines_up_to_date', 'sim')
      clara.set(
        'dietary_restrictions',
        'Evitar leite puro de vaca (oferecer alternativa vegetal ou sem lactose)',
      )
      app.save(clara)
    } catch (_) {}

    // Theo (Berçário II): nvlgft7tfx69648
    try {
      const theo = app.findFirstRecordByData('children', 'id', 'nvlgft7tfx69648')
      theo.set('blood_type', 'A+')
      theo.set('allergies', 'Nenhuma alergia conhecida')
      theo.set('continuous_medications', 'Vitamina D (gotas diárias)')
      theo.set('medical_conditions', 'Nenhuma condição crônica')
      theo.set('pediatrician_name', 'Dr. Roberto Silveira')
      theo.set('pediatrician_phone', '(11) 99888-1234')
      theo.set('emergency_contact_name', 'Tio Lucas Silveira')
      theo.set('emergency_contact_phone', '(11) 98222-3344')
      theo.set('emergency_contact_relationship', 'Tio paterno')
      theo.set('vaccines_up_to_date', 'sim')
      theo.set(
        'dietary_restrictions',
        'Introdução alimentar fase 2 (frutas amassadas, papinhas sem sal)',
      )
      app.save(theo)
    } catch (_) {}

    // Arthur (Jardim / 3º Ano): h7cix80bm9zncbd
    try {
      const arthur = app.findFirstRecordByData('children', 'id', 'h7cix80bm9zncbd')
      arthur.set('blood_type', 'O+')
      arthur.set('allergies', 'Amendoim e castanhas')
      arthur.set('continuous_medications', 'Aerolin spray (bombinha) se houver crise de asma')
      arthur.set('medical_conditions', 'Asma leve induzida por esforço físico intenso')
      arthur.set('pediatrician_name', 'Dra. Camila Alencar')
      arthur.set('pediatrician_phone', '(11) 98111-2233')
      arthur.set('emergency_contact_name', 'Carlos Eduardo (Tio)')
      arthur.set('emergency_contact_phone', '(11) 99333-7788')
      arthur.set('emergency_contact_relationship', 'Tio materno')
      arthur.set('vaccines_up_to_date', 'sim')
      arthur.set('dietary_restrictions', 'Restrição severa a amendoim, nozes e castanhas')
      app.save(arthur)
    } catch (_) {}
  },
  (app) => {
    try {
      const childrenCol = app.findCollectionByNameOrId('children')
      const fields = [
        'blood_type',
        'allergies',
        'continuous_medications',
        'medical_conditions',
        'pediatrician_name',
        'pediatrician_phone',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
        'vaccines_up_to_date',
        'dietary_restrictions',
      ]
      fields.forEach((f) => {
        try {
          childrenCol.fields.removeByName(f)
        } catch (_) {}
      })
      app.save(childrenCol)
    } catch (_) {}
  },
)
