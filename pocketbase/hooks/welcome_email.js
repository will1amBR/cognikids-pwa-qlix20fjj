/// <reference path="../pb_data/types.d.ts" />

onRecordCreate((e) => {
  e.next()

  try {
    const record = e.record
    const recipientEmail = record.get('guardian_email')
    const guardianName = record.get('guardian_name') || 'Família CogniKids'
    const childName = record.get('child_name') || 'sua criança'
    const classroomName = record.get('classroom_name') || ''
    const inviteCode = record.get('invite_code') || ''

    if (!recipientEmail || !recipientEmail.includes('@')) {
      return
    }

    const appUrl =
      $os.getenv('PUBLIC_APP_URL') || $os.getenv('APP_URL') || 'https://kids.glikholding.com.br'

    const subject = classroomName
      ? `Bem-vindo(a) ao CogniKids! Matrícula confirmada na turma ${classroomName} 🎓`
      : `Bem-vindo(a) ao CogniKids PWA! 🦜 Comece a estimular o desenvolvimento bilíngue`

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FFF7ED; margin: 0; padding: 24px; color: #1E293B; }
    .card { max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; padding: 32px; box-shadow: 0 10px 25px rgba(255,122,69,0.12); border: 2px solid #FED7AA; }
    .header { text-align: center; margin-bottom: 24px; }
    .brand { font-size: 26px; font-weight: 900; color: #EA580C; }
    .badge { display: inline-block; background-color: #FEF3C7; color: #92400E; font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 9999px; margin-top: 8px; }
    h1 { font-size: 20px; font-weight: 800; color: #1E293B; margin-top: 16px; }
    p { font-size: 14px; line-height: 1.6; color: #475569; }
    .pwa-box { background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%); border: 2px dashed #F59E0B; border-radius: 18px; padding: 20px; margin: 24px 0; }
    .pwa-box h2 { font-size: 15px; font-weight: 900; color: #B45309; margin: 0 0 10px 0; }
    .pwa-step { font-size: 13px; color: #78350F; margin: 6px 0; font-weight: 600; }
    .btn { display: inline-block; background: linear-gradient(135deg, #EA580C 0%, #F59E0B 100%); color: #FFFFFF !important; font-size: 15px; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 16px; margin: 18px 0; text-align: center; }
    .footer { font-size: 11px; text-align: center; color: #94A3B8; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">🦜 CogniKids</div>
      <div class="badge">Acesso Escolar & Familiar Conectado</div>
      <h1>Olá, ${guardianName}!</h1>
    </div>

    <p>Que alegria ter você e <strong>${childName}</strong> conosco no CogniKids!</p>
    
    ${classroomName ? `<p>A matrícula vinculada pelo cupom <strong>${inviteCode}</strong> na turma <strong>${classroomName}</strong> foi ativada com sucesso.</p>` : ''}

    <p>O <strong>CogniKids</strong> é o ecossistema bilíngue de neurodesenvolvimento infantil que transforma os momentos de tela em estímulos estruturados de linguagem, raciocínio lógico, emoções e coordenação motora (alinhados à BNCC).</p>

    <div class="pwa-box">
      <h2>📲 Como instalar o App no seu celular (PWA):</h2>
      <div class="pwa-step">1. Acesse o site no navegador do celular (Chrome ou Safari): <a href="${appUrl}" style="color:#B45309;font-weight:800;">${appUrl}</a></div>
      <div class="pwa-step">2. Toque no botão de opções (três pontinhos no Chrome ou botão Compartilhar no Safari).</div>
      <div class="pwa-step">3. Selecione <strong>"Adicionar à tela inicial"</strong> ou <strong>"Instalar aplicativo"</strong>.</div>
      <div class="pwa-step">4. Pronto! O CogniKids abrirá em tela cheia como um aplicativo nativo.</div>
    </div>

    <div style="text-align: center;">
      <a href="${appUrl}" class="btn">Abrir o CogniKids Agora</a>
    </div>

    <p style="font-size: 12px; color: #64748B;">
      Dica: Você pode acompanhar o progresso em tempo real, gerar relatórios de evolução e explorar o modo Junior (6 a 10 anos) e o modo Infantil (0 a 5 anos).
    </p>

    <div class="footer">
      © CogniKids • Neurodesenvolvimento Infantil e Aprendizagem Bilíngue<br>
      Acesso oficial: ${appUrl}
    </div>
  </div>
</body>
</html>
    `

    try {
      const message = new MailerMessage({
        from: {
          address: $app.settings().meta.senderAddress || 'noreply@kids.glikholding.com.br',
          name: $app.settings().meta.senderName || 'CogniKids',
        },
        to: [{ address: recipientEmail, name: guardianName }],
        subject: subject,
        html: htmlBody,
      })

      $app.newMailClient().send(message)

      record.set('welcome_sent', true)
      record.set('welcome_sent_at', new Date().toISOString())
      $app.save(record)
      console.log('[CogniKids] Welcome email sent successfully to ' + recipientEmail)
    } catch (mailErr) {
      console.error('[CogniKids] Error sending welcome email:', mailErr)
    }
  } catch (err) {
    console.error('[CogniKids] coupon_redemptions hook error:', err)
  }
}, 'coupon_redemptions')
