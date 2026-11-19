# CogniKids PWA — Mapa de Rotas e Acessos

Referência de auditoria (roteador em `src/App.tsx`). Legenda de acesso:

- 🌐 **Público** — acessível deslogado.
- 🔐 **Protegido** — exige login; se a URL contiver `demo`/`clara_demo_id`/`arthur_demo_id`/`theo_demo_id`, o `ProtectedRoute` faz **auto-login demo** (`demo@cognikids.app`); caso contrário redireciona para `/login` com `state.from` (volta após login).
- 🏫 **Escola** — painel público por código (`?code=ESCOLA-DEMO01`), sem senha.

## Diagrama (mermaid)

```mermaid
flowchart TD
  Index["/ — IndexPage (público)"]
  Demo["/demo — Kit de Apresentação (público)"]
  Login["/login — Login"]
  Signup["/signup — Cadastro"]
  Forgot["/forgot-password"]
  Reset["/reset-password"]
  Verify["/verify-email"]
  ConfirmChange["/confirm-email-change"]
  Escola["/escola e /school-view — Portal da Escola (código)"]
  Shell["AppShell (topbar + sidebar + bottom tabs + Menu)"]
  GuardHome["/app — GuardianHome"]
  Children["/app/children — lista"]
  ChildNew["/app/children/new — formulário"]
  ChildDash["/app/children/:id e /app/child/:id — painel da criança"]
  ChildEdit["/app/children/:id/edit"]
  Daily["/app/daily/:id — sessão diária"]
  Games["/app/game/:childId/:moduleId — jogos infantis (tela cheia)"]
  GameDirect["/game/:childId/:moduleId — mesma tela, fora do AppShell"]
  History["/app/history e /app/history/:id"]
  Reports["/app/reports e /app/reports/:id"]
  Wardrobe["/app/wardrobe — Guarda-Roupa do Tico"]
  Community["/app/community e /app/invites — Convites & Escola"]
  Themes["/app/themes-guide — Guia Temático"]
  Health["/app/health-guide e /app/dicas-saude — Dicas & Bem-estar"]
  Settings["/app/settings — Configurações"]
  Junior["/junior — JuniorHome"]
  JuniorGame["/junior/game/:childId/:module — jogos Junior"]
  JuniorProgress["/junior/progress"]
  NotFound["* — NotFound"]

  Index -->|Kit escolar / hero| Demo
  Index -->|CTA login| Login
  Index -->|CTA cadastro| Signup
  Index -->|Portal da escola| Escola
  Demo -->|1 clique: auto-login demo| GuardHome
  Demo -->|sem senha| Escola
  Demo -->|Ver Área Junior| Junior
  Demo -->|Sessão diária Clara| Daily
  Demo -->|Fazenda Falante| Games
  Demo -->|Relatório| Reports
  Demo -->|Voltar| Index
  Login -->|sucesso| Shell
  Shell --> GuardHome
  Shell -->|aba Junior| Junior
  Shell --> Children
  Shell -->|progresso| ChildDash
  Shell -->|Guarda-Roupa (moedas)| Wardrobe
  Shell --> History
  Shell --> Reports
  Shell --> Themes
  Shell --> Health
  Shell -->|Menu| Community
  Shell -->|Menu| Settings
  Shell -->|Menu| Escola
  GuardHome --> Daily
  GuardHome --> Games
  Children --> ChildNew
  Children --> ChildDash
  ChildDash -->|"corrigido nesta rodada"| ChildEdit
  ChildDash --> Daily
  ChildDash --> Games
  Junior -->|snake, goal, runner, vocab, math, logic, dictation| JuniorGame
  Junior -->|moedas| Wardrobe
  Junior -->|infantil| GuardHome
  Games -->|vitória| History
  Games -->|saída| GuardHome
```

## Tabela de rotas

| Rota                                                                                    | Tela                                                                        | Quem acessa                                               | Pontos de entrada                                             | Status                                                              |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| `/`                                                                                     | IndexPage                                                                   | 🌐                                                        | demo kit, QR code, logout                                     | funcional                                                           |
| `/login`, `/auth/login`                                                                 | Login                                                                       | 🌐 (`/auth/login` redireciona p/ `/login`)                | topbar (Sair), ProtectedRoute, DemoKit fallback               | funcional                                                           |
| `/signup`                                                                               | Cadastro                                                                    | 🌐                                                        | IndexPage, Login                                              | funcional                                                           |
| `/forgot-password` → `/reset-password`                                                  | Recuperação de senha                                                        | 🌐                                                        | Login                                                         | funcional                                                           |
| `/verify-email`, `/confirm-email-change`                                                | Confirmação de e-mail                                                       | 🌐 (link de e-mail)                                       | e-mails transacionais                                         | funcional                                                           |
| `/demo`                                                                                 | Kit de apresentação                                                         | 🌐                                                        | IndexPage                                                     | funcional                                                           |
| `/escola`, `/school-view`                                                               | Portal da Escola (abas: turmas, alunos, desenvolvimento, matrículas/cupons) | 🏫 código (`?code=ESCOLA-DEMO01`, `&section=enrollments`) | IndexPage, /demo, Menu do AppShell, links de convite          | funcional                                                           |
| `/app` (index)                                                                          | GuardianHome                                                                | 🔐                                                        | AppShell (Início), JuniorHome ("Infantil"), GameShell (saída) | funcional                                                           |
| `/app/children`                                                                         | ChildrenList                                                                | 🔐                                                        | AppShell (Menu), abas Junior                                  | funcional                                                           |
| `/app/children/new`                                                                     | ChildForm                                                                   | 🔐                                                        | AppShell (topbar), JuniorHome, ChildrenList                   | funcional                                                           |
| `/app/children/:childId` e `/app/child/:childId`                                        | ChildDashboard                                                              | 🔐                                                        | AppShell (Progresso), botão "Ver Diário" do toast             | funcional                                                           |
| `/app/children/:childId/edit`                                                           | ChildForm (edição)                                                          | 🔐                                                        | ChildDashboard ("Editar perfil")                              | **corrigido nesta rodada** (apontava para `/app/children/edit/:id`) |
| `/app/daily/:childId`, `/app/daily-session/:childId`                                    | DailySessionPage                                                            | 🔐                                                        | GuardianHome, toast de lembrete, /demo                        | funcional                                                           |
| `/app/game/:childId/:moduleId(/:activityId)` e `/game/:childId/:moduleId(/:activityId)` | GameRunner (jogos infantis, tela cheia)                                     | 🔐 (auto-login demo p/ ids demo)                          | GuardianHome, ChildDashboard, DailySession, /demo             | funcional                                                           |
| `/app/history`, `/app/history/:childId`                                                 | GameHistory                                                                 | 🔐                                                        | AppShell (Menu), toast "Ver Fila", vitória de jogo            | funcional                                                           |
| `/app/reports`, `/app/reports/:childId`                                                 | EvolutionReports                                                            | 🔐                                                        | AppShell (Menu), /demo                                        | funcional                                                           |
| `/app/wardrobe`, `/app/loja`                                                            | TicoWardrobe                                                                | 🔐                                                        | AppShell (moedas/aba), JuniorHome, /demo                      | funcional                                                           |
| `/app/community`, `/app/invites`                                                        | InvitesAndSchool                                                            | 🔐                                                        | AppShell (Menu)                                               | funcional                                                           |
| `/app/themes-guide`                                                                     | Guia Temático                                                               | 🔐                                                        | AppShell (Menu)                                               | funcional                                                           |
| `/app/health-guide`, `/app/dicas-saude`                                                 | Dicas & Bem-estar                                                           | 🔐                                                        | AppShell (Menu)                                               | funcional                                                           |
| `/app/settings`                                                                         | Settings                                                                    | 🔐                                                        | AppShell (Menu + avatar), toast de lembretes                  | funcional                                                           |
| `/junior`, `/junior/home`                                                               | JuniorHome                                                                  | 🔐                                                        | AppShell (aba Junior), /demo                                  | funcional                                                           |
| `/junior/progress`                                                                      | JuniorProgress                                                              | 🔐                                                        | AppShell (aba Progresso no modo Junior)                       | funcional                                                           |
| `/junior/game/:childId/:module`                                                         | JuniorGameRunner (snake, goal, runner, vocab, math, logic, dictation)       | 🔐 (auto-login demo p/ arthur_demo_id)                    | JuniorHome, ranking de palavras                               | funcional                                                           |
| `*`                                                                                     | NotFound                                                                    | 🌐                                                        | qualquer rota inexistente                                     | funcional                                                           |

## Verificações desta auditoria

- Todos os `navigate()` / `<Link>` / `to=` do app foram conferidos contra as rotas acima: **nenhum botão aponta para rota inexistente**, exceto o caso corrigido (`ChildDashboard` → editar criança).
- Rotas sem entrada: nenhuma — todas as telas registradas têm ao menos um ponto de entrada navegável.
- Guards: `ProtectedRoute` redireciona deslogado para `/login` guardando a origem (`state.from`) e faz auto-login demo quando a rota contém ids de demonstração — testado nos fluxos `/app/game/clara_demo_id/...` e `/junior/game/arthur_demo_id/...`.
- Overflow de texto em 360px: correções aplicadas em `GameShell` (título do jogo, botões "Próxima Rodada"/"Concluir Jogo"), `AppShell` (sidebar, Menu gaveta) e `JuniorHome` (pills de crianças, título de progresso).
