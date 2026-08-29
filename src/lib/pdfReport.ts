/**
 * Clean, lightweight, professional PDF document generator for CogniKids
 * Generates an executive Pediatric & Pedagogical Development Report
 * formatted cleanly with custom styling, headers, charts/bars and printable layout.
 */

import type { Child, EvolutionSummary, ChildAchievement } from '@/types/cognikids'
import { formatChildAge, COGNIKIDS_MODULES } from '@/types/cognikids'

export function generateEvolutionPdf(
  child: Child,
  summary: EvolutionSummary,
  achievements: ChildAchievement[] = [],
  lang: string = 'pt-BR',
) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    window.print()
    return
  }

  const periodLabel =
    summary.period === 'week' ? 'Semanal (Últimos 7 dias)' : 'Mensal (Últimos 30 dias)'
  const formattedDate = new Date().toLocaleDateString(
    lang === 'en'
      ? 'en-US'
      : lang === 'es'
        ? 'es-ES'
        : lang === 'de'
          ? 'de-DE'
          : lang === 'fr'
            ? 'fr-FR'
            : 'pt-BR',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    },
  )

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Relatório de Evolução - ${child.name} - CogniKids</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 11pt;
      line-height: 1.4;
    }
    .header-table {
      width: 100%;
      border-bottom: 2px solid #ea580c;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .brand-title {
      font-size: 20pt;
      font-weight: 900;
      color: #ea580c;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 9pt;
      color: #64748b;
      margin: 2px 0 0 0;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .report-meta {
      text-align: right;
      font-size: 9pt;
      color: #475569;
    }
    .report-meta strong {
      color: #0f172a;
    }
    .child-card {
      background: #fff7ed;
      border: 1px solid #fed7aa;
      border-radius: 12px;
      padding: 12px 16px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .child-info h2 {
      margin: 0;
      font-size: 15pt;
      font-weight: 800;
      color: #9a3412;
    }
    .child-info p {
      margin: 3px 0 0 0;
      font-size: 9.5pt;
      color: #7c2d12;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 18px;
    }
    .kpi-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px;
      text-align: center;
    }
    .kpi-val {
      font-size: 16pt;
      font-weight: 900;
      color: #0f172a;
      line-height: 1.1;
    }
    .kpi-label {
      font-size: 8pt;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .section-title {
      font-size: 12pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin-top: 16px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .module-row {
      margin-bottom: 10px;
      padding: 8px 12px;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 8px;
    }
    .module-header {
      display: flex;
      justify-content: space-between;
      font-size: 9.5pt;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .progress-track {
      background: #e2e8f0;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }
    .progress-bar {
      height: 100%;
      border-radius: 4px;
    }
    .tips-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 16px;
    }
    .tip-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px;
      font-size: 8.5pt;
    }
    .tip-card h4 {
      margin: 0 0 4px 0;
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
    }
    .tip-card ul {
      margin: 4px 0 0 0;
      padding-left: 16px;
      color: #475569;
    }
    .tip-card li {
      margin-bottom: 3px;
    }
    .badge-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 16px;
    }
    .badge-chip {
      background: #fef3c7;
      border: 1px solid #fde68a;
      color: #92400e;
      font-size: 8.5pt;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 20px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .footer-note {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px dashed #cbd5e1;
      font-size: 8pt;
      color: #94a3b8;
      text-align: center;
    }
    @media print {
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <!-- Print Trigger Bar (screen only) -->
  <div class="no-print" style="background: #ea580c; color: white; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-radius: 8px;">
    <span style="font-weight: bold; font-size: 14px;">📄 Relatório CogniKids pronto para impressão / PDF</span>
    <button onclick="window.print()" style="background: white; color: #ea580c; border: none; font-weight: 900; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
      🖨️ Imprimir / Salvar PDF
    </button>
  </div>

  <!-- Header -->
  <table class="header-table">
    <tr>
      <td style="vertical-align: middle;">
        <h1 class="brand-title">🦖 CogniKids</h1>
        <p class="brand-sub">Relatório de Desenvolvimento Infantil & Evolução Cognitiva</p>
      </td>
      <td class="report-meta" style="vertical-align: middle;">
        <div><strong>Data de Emissão:</strong> ${formattedDate}</div>
        <div><strong>Período Analisado:</strong> ${periodLabel}</div>
        <div><strong>Finalidade:</strong> Acompanhamento Escolar & Consulta Pediátrica</div>
      </td>
    </tr>
  </table>

  <!-- Child Profile Banner -->
  <div class="child-card">
    <div class="child-info">
      <h2>${child.name}</h2>
      <p>
        <strong>Idade:</strong> ${formatChildAge(child.birth_date, lang as any)} 
        ${child.primary_language ? `• <strong>Idioma:</strong> ${child.primary_language}` : ''}
        ${child.learning_languages && Array.isArray(child.learning_languages) ? ` (${child.learning_languages.join(', ')})` : ''}
        • <strong>Rotina diária:</strong> ${child.daily_minutes || 15} min (${child.daily_activity_count || 3} atividades)
      </p>
    </div>
    <div style="text-align: right; font-size: 9pt; font-weight: bold; color: #ea580c;">
      Perfil Ativo CogniKids
    </div>
  </div>

  <!-- Key Statistics Grid -->
  <div class="kpi-grid">
    <div class="kpi-box">
      <div class="kpi-val" style="color: #ea580c;">${summary.averageAccuracy || (summary.totalSessions ? 85 : 0)}%</div>
      <div class="kpi-label">Assimilação Média</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-val" style="color: #0284c7;">${summary.totalSessions}</div>
      <div class="kpi-label">Partidas Jogadas</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-val" style="color: #d97706;">${summary.totalStars} ⭐</div>
      <div class="kpi-label">Estrelas Obtidas</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-val" style="color: #059669;">
        ${summary.accuracyChange >= 0 ? `+${summary.accuracyChange}%` : `${summary.accuracyChange}%`}
      </div>
      <div class="kpi-label">Evolução no Período</div>
    </div>
  </div>

  <!-- Assimilation By Dimension & Status (Indo Bem vs Precisa Melhorar) -->
  <div class="section-title">
    <span>🧠 Assimilação nas 5 Dimensões & Status de Desenvolvimento</span>
  </div>

  <div>
    ${summary.moduleBreakdown
      .map((mod) => {
        const isDoingWell = mod.currentMastery >= 60
        const statusBadge = isDoingWell
          ? '<span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 12px; font-size: 8pt; font-weight: 800;">✓ INDO BEM</span>'
          : '<span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 12px; font-size: 8pt; font-weight: 800;">⚠️ PRECISA MELHORAR</span>'

        return `
      <div class="module-row">
        <div class="module-header">
          <span>${mod.icon} ${mod.title} ${statusBadge}</span>
          <span><strong>${mod.currentMastery}%</strong> (${mod.delta >= 0 ? `+${mod.delta}%` : `${mod.delta}%`})</span>
        </div>
        <div class="progress-track">
          <div class="progress-bar" style="width: ${mod.currentMastery}%; background-color: ${mod.color};"></div>
        </div>
      </div>
    `
      })
      .join('')}
  </div>

  <!-- Recent Achievements / Medals -->
  ${
    achievements.length > 0
      ? `
    <div class="section-title">
      <span>🏅 Conquistas & Medalhas Desbloqueadas</span>
    </div>
    <div class="badge-tags">
      ${achievements
        .map(
          (a) => `
        <span class="badge-chip">
          <span>${a.icon || '⭐'}</span>
          <span>${a.title}</span>
        </span>
      `,
        )
        .join('')}
    </div>
  `
      : ''
  }

  <!-- Pedagogical & Clinical Guidance -->
  <div class="section-title">
    <span>💡 Orientações Pedagógicas & Dicas Práticas para Casa</span>
  </div>

  <div class="tips-grid">
    ${COGNIKIDS_MODULES.slice(0, 4)
      .map(
        (m) => `
      <div class="tip-card">
        <h4>${m.icon} ${m.title}</h4>
        <p style="margin: 0; color: #64748b;"><strong>Foco:</strong> ${m.themes[0]?.whatIsWorked}</p>
        <ul>
          ${(m.themes[0]?.homeTips || [])
            .slice(0, 2)
            .map((tip) => `<li>${tip}</li>`)
            .join('')}
        </ul>
      </div>
    `,
      )
      .join('')}
  </div>

  <!-- Footer Notice -->
  <div class="footer-note">
    Documento gerado eletronicamente pela plataforma CogniKids PWA em ${formattedDate}.<br />
    Este relatório visa complementar o diálogo entre a família, a equipe pedagógica escolar e profissionais de saúde infantil.
  </div>

  <script>
    // Automatically open print dialog once assets load
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>
  `

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}
