import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SoundProvider } from './context/SoundContext'
import { LanguageProvider } from './context/LanguageContext'
import { Toaster } from './components/ui/toaster'
import { AppShell } from './components/layout/AppShell'

// Pages
import { IndexPage } from './pages/Index'
import { LoginPage } from './pages/auth/Login'
import { SignupPage } from './pages/auth/Signup'
import { ForgotPasswordPage } from './pages/auth/ForgotPassword'
import { ResetPasswordPage } from './pages/auth/ResetPassword'
import { VerifyEmailPage } from './pages/auth/VerifyEmail'
import { ConfirmEmailChangePage } from './pages/auth/ConfirmEmailChange'

import { GuardianHome } from './pages/guardian/GuardianHome'
import { ChildrenListPage } from './pages/guardian/ChildrenList'
import { ChildFormPage } from './pages/guardian/ChildForm'
import { ChildDashboardPage } from './pages/guardian/ChildDashboard'
import { DailySessionPage } from './pages/guardian/DailySessionPage'
import { GameHistoryPage } from './pages/guardian/GameHistoryPage'
import { EvolutionReportsPage } from './pages/guardian/EvolutionReportsPage'
import { InvitesAndSchoolPage } from './pages/guardian/InvitesAndSchoolPage'
import { SchoolViewPortalPage } from './pages/guardian/SchoolViewPortalPage'
import { SettingsPage } from './pages/guardian/SettingsPage'
import { GuardianThemesGuidePage } from './pages/guardian/GuardianThemesGuidePage'

import { JuniorHome } from './pages/junior/JuniorHome'
import { JuniorGameRunnerPage } from './pages/junior/JuniorGameRunner'
import { JuniorProgressPage } from './pages/junior/JuniorProgressPage'

import { GameRunnerPage } from './pages/game/GameRunner'
import { NotFound } from './pages/NotFound'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading: loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <SoundProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<IndexPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/confirm-email-change" element={<ConfirmEmailChangePage />} />

              {/* Public/Token-Protected School Portal Route */}
              <Route path="/school-view" element={<SchoolViewPortalPage />} />

              {/* Direct Game Runner Routes (Full Screen Game Experience) */}
              <Route
                path="/game/:childId/:moduleId"
                element={
                  <ProtectedRoute>
                    <GameRunnerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/game/:childId/:moduleId/:activityId"
                element={
                  <ProtectedRoute>
                    <GameRunnerPage />
                  </ProtectedRoute>
                }
              />

              {/* Junior Direct Game Runner Routes */}
              <Route
                path="/junior/game/:childId/:module"
                element={
                  <ProtectedRoute>
                    <JuniorGameRunnerPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes inside AppShell */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<GuardianHome />} />
                <Route path="children" element={<ChildrenListPage />} />
                <Route path="children/new" element={<ChildFormPage />} />
                <Route path="children/:id" element={<ChildDashboardPage />} />
                <Route path="children/:id/edit" element={<ChildFormPage />} />
                <Route path="child/:id" element={<ChildDashboardPage />} />
                <Route path="daily/:id" element={<DailySessionPage />} />
                <Route path="daily-session/:id" element={<DailySessionPage />} />
                <Route path="history" element={<GameHistoryPage />} />
                <Route path="history/:childId" element={<GameHistoryPage />} />
                <Route path="reports" element={<EvolutionReportsPage />} />
                <Route path="reports/:childId" element={<EvolutionReportsPage />} />
                <Route path="invites" element={<InvitesAndSchoolPage />} />
                <Route path="themes-guide" element={<GuardianThemesGuidePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="game/:childId/:moduleId" element={<GameRunnerPage />} />
                <Route path="game/:childId/:moduleId/:activityId" element={<GameRunnerPage />} />
              </Route>

              {/* CogniKids Junior (6 a 10 anos) inside AppShell */}
              <Route
                path="/junior"
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<JuniorHome />} />
                <Route path="home" element={<JuniorHome />} />
                <Route path="progress" element={<JuniorProgressPage />} />
              </Route>

              {/* Fallback & Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </SoundProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}
export default App
