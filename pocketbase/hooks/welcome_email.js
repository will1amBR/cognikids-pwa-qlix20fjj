/// <reference path="../pb_data/types.d.ts" />

onRecordAfterCreateSuccess((e) => {
  try {
    const record = e.record
    const recipientEmail = record.getString('guardian_email') || record.get('guardian_email')
    const guardianName =
      record.getString('guardian_name') || record.get('guardian_name') || 'Família CogniKids'
    const childName = record.getString('child_name') || record.get('child_name') || 'sua criança'
    const classroomName = record.getString('classroom_name') || record.get('classroom_name') || ''
    const inviteCode = record.getString('invite_code') || record.get('invite_code') || ''

    if (!recipientEmail || !recipientEmail.includes('@')) {
      return
    }

    // Never hardcode URLs — prioritize env vars / secrets
    let appUrl =
      $os.getenv('SITE_URL') || $os.getenv('PUBLIC_APP_URL') || $os.getenv('APP_URL') || ''
    if (!appUrl) {
      appUrl = 'https://kids.glikholding.com.br'
    }
    if (appUrl.endsWith('/')) {
      appUrl = appUrl.slice(0, -1)
    }

    const subject = classroomName
      ? `Bem-vindo(a) ao CogniKids! Matrícula confirmada na turma ${classroomName} 🎓`
      : `Bem-vindo(a) ao CogniKids PWA! 🦜 Comece a estimular o desenvolvimento bilíngue`

    const htmlBody = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FFF7ED; margin: 0; padding: 24px; color: #1E293B; }
    .card { max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; padding: 32px; box-shadow: 0 10px 25px rgba(255,122,69,0.12); border: 2px solid #FED7AA; }
    .header { text-align: center; margin-bottom: 24px; }
    .brand { font-size: 26px; font-weight: 900; color: #EA580C; }
    .badge { display: inline-block; background-color: #FEF3C7; color: #92400E; font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 9999px; margin-top: 8px; }
    h1 { font-size: 20px; font-weight: 800; color: #1E293B; margin-top: 16px; margin-bottom: 8px; }
    p { font-size: 14px; line-height: 1.6; color: #475569; margin: 8px 0; }
    .pwa-box { background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%); border: 2px dashed #F59E0B; border-radius: 18px; padding: 20px; margin: 24px 0; }
    .pwa-box h2 { font-size: 15px; font-weight: 900; color: #B45309; margin: 0 0 12px 0; }
    .pwa-step { font-size: 13px; color: #78350F; margin: 8px 0; font-weight: 600; line-height: 1.5; }
    .btn { display: inline-block; background: linear-gradient(135deg, #EA580C 0%, #F59E0B 100%); color: #FFFFFF !important; font-size: 15px; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 16px; margin: 18px 0; text-align: center; }
    .footer { font-size: 11px; text-align: center; color: #94A3B8; margin-top: 24px; line-height: 1.5; }
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
    
    ${classroomName ? `<p>A matrícula vinculada pelo cupom <strong>${inviteCode}</strong> na turma <strong>${classroomName}</strong> foi confirmada e vinculada com sucesso ao portal pedagógico da escola.</p>` : ''}

    <p>O <strong>CogniKids</strong> é o ecossistema bilíngue de neurodesenvolvimento infantil que transforma momentos de tela em estímulos estruturados de linguagem, raciocínio lógico, emoções e coordenação motora (alinhados à BNCC):</p>

    <ul style="font-size: 13px; color: #475569; line-height: 1.6; padding-left: 20px;">
      <li>🗣️ <b>Fala & Linguagem:</b> Reconhecimento e síntese de voz em até 5 idiomas.</li>
      <li>🌸 <b>Cérebro em Flor:</b> Mapeamento neurológico nas 5 dimensões com diagnóstico claro.</li>
      <li>🎒 <b>Modo Infantil & Junior:</b> Atividades calibradas dos primeiros meses até 10 anos.</li>
      <li>⚡ <b>Modo Offline Real:</b> Funciona no carro, avião ou sem sinal de internet.</li>
    </ul>

    <div class="pwa-box">
      <h2>📲 Como instalar o CogniKids no seu celular (PWA):</h2>
      <div class="pwa-step">
        <b>Link oficial de instalação:</b> <a href="${appUrl}" style="color:#B45309;font-weight:800;word-break:break-all;">${appUrl}</a>
      </div>
      <div class="pwa-step">
        🤖 <b>No Android (Chrome):</b> Toque nos 3 pontinhos no canto superior direito e selecione <u>"Instalar aplicativo"</u> ou <u>"Adicionar à tela inicial"</u>.
      </div>
      <div class="pwa-step">
        🍏 <b>No iPhone/iPad (Safari):</b> Toque no ícone de <u>Compartilhar</u> (quadrado com seta para cima na barra inferior) e escolha <u>"Adicionar à Tela de Início"</u>.
      </div>
      <div class="pwa-step">
        ✨ <b>Pronto!</b> O app abrirá em tela cheia como um aplicativo nativo instalado na sua tela inicial!
      </div>
    </div>

    <div style="text-align: center;">
      <a href="${appUrl}" class="btn">Abrir o CogniKids Agora</a>
    </div>

    <div class="footer">
      © CogniKids • Neurodesenvolvimento Infantil e Aprendizagem Bilíngue<br>
      Acesso oficial: ${appUrl}
    </div>
  </div>
</body>
</html>`

    try {
      const senderAddress =
        ($app.settings() && $app.settings().meta && $app.settings().meta.senderAddress) ||
        'noreply@kids.glikholding.com.br'
      const senderName =
        ($app.settings() && $app.settings().meta && $app.settings().meta.senderName) || 'CogniKids'

      const message = new MailerMessage({
        from: {
          address: senderAddress,
          name: senderName,
        },
        to: [{ address: recipientEmail, name: guardianName }],
        subject: subject,
        html: htmlBody,
      })

      $app.newMailClient().send(message)

      // Mark record as sent
      record.set('welcome_sent', true)
      record.set('welcome_sent_at', new Date().toISOString())
      $app.save(record)
      console.log('[CogniKids] Welcome email sent successfully to ' + recipientEmail)
    } catch (mailErr) {
      console.warn('[CogniKids] Warning/Error sending welcome email (mailer):', mailErr)
    }
  } catch (err) {
    console.error('[CogniKids] coupon_redemptions hook error:', err)
  }
}, 'coupon_redemptions')
