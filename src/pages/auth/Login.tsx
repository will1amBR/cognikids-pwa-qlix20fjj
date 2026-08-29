import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle } from 'lucide-react'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError(null)
    setFieldErrors({})

    const errors: { email?: string; password?: string } = {}
    if (!email.trim()) errors.email = 'Informe o seu email.'
    if (!password) errors.password = 'Informe a sua senha.'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)
    try {
      await login(email.trim(), password)
      navigate('/app', { replace: true })
    } catch (err: any) {
      const msg = getErrorMessage(err)
      if (err?.data?.data?.email?.message) {
        setFieldErrors((prev) => ({ ...prev, email: err.data.data.email.message }))
      } else if (err?.data?.data?.password?.message) {
        setFieldErrors((prev) => ({ ...prev, password: err.data.data.password.message }))
      } else {
        setGeneralError(msg || 'Email ou senha inválidos. Tente novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="Entrar no CogniKids" subtitle="Acesse o progresso da sua família">
      <form onSubmit={handleSubmit} className="space-y-4">
        {generalError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{generalError}</span>
          </div>
        )}

        <div className="space-y-1.5 text-left">
          <Label htmlFor="email" className="text-xs font-bold text-slate-700">
            Email do responsável
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="ex: responsavel@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className={`rounded-2xl h-11 ${fieldErrors.email ? 'border-rose-500 focus-visible:ring-rose-500' : ''}`}
          />
          {fieldErrors.email && (
            <p className="text-xs text-rose-600 font-medium">{fieldErrors.email}</p>
          )}
        </div>

        <div className="space-y-1.5 text-left">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-xs font-bold text-slate-700">
              Senha
            </Label>
            <Link
              to="/forgot-password"
              className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
            >
              Esqueci a senha
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className={`rounded-2xl h-11 ${fieldErrors.password ? 'border-rose-500 focus-visible:ring-rose-500' : ''}`}
          />
          {fieldErrors.password && (
            <p className="text-xs text-rose-600 font-medium">{fieldErrors.password}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>Entrando…</span>
            </>
          ) : (
            'Entrar'
          )}
        </Button>

        <div className="pt-2 text-center text-xs text-slate-500">
          Ainda não tem conta?{' '}
          <Link to="/signup" className="text-orange-600 hover:text-orange-700 font-bold">
            Criar conta grátis
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
