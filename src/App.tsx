import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { SoundProvider } from '@/context/SoundContext'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

// Pages
import IndexPage from '@/pages/Index'
import { LoginPage } from '@/pages/auth/Login'
import { SignupPage } from '@/pages/auth/Signup'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPassword'
import { ResetPasswordPage } from '@/pages/auth/ResetPassword'
import { VerifyEmailPage } from '@/pages/auth/VerifyEmail'
import { ConfirmEmailChangePage } from '@/pages/auth/ConfirmEmailChange'

import { AppShell } from '@/components/layout/AppShell'
import { GuardianHome } from '@/pages/guardian/GuardianHome'
import { ChildrenListPage } from '@/pages/guardian/ChildrenList'
import { ChildFormPage } from '@/pages/guardian/ChildForm'
import { ChildDashboardPage } from '@/pages/guardian/ChildDashboard'
import { SettingsPage } from '@/pages/guardian/SettingsPage'
import { GameRunnerPage } from '@/pages/game/GameRunner'
import NotFound from '@/pages/NotFound'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SoundProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Landing & Public Auth Routes */}
              <Route path="/" element={<IndexPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/confirm-email-change" element={<ConfirmEmailChangePage />} />

              {/* Authenticated Guardian Portal with AppShell */}
              <Route path="/app" element={<AppShell />}>
                <Route index element={<GuardianHome />} />
                <Route path="children" element={<ChildrenListPage />} />
                <Route path="children/new" element={<ChildFormPage />} />
                <Route path="children/:childId/edit" element={<ChildFormPage />} />
                <Route path="child/:childId" element={<ChildDashboardPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Fullscreen Immersive Game Runner */}
              <Route path="/app/game/:childId/:module" element={<GameRunnerPage />} />

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </SoundProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
