import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/context/AuthContext'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  School,
  Ticket,
  Sparkles,
} from 'lucide-react'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { lookupInviteCode } from '@/services/children'
import type { InviteRecord } from '@/types/cognikids'

export const SignupPage: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialCode =
    searchParams.get('convite') || searchParams.get('codigo') || searchParams.get('code') || ''

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [inviteCodeInput, setInviteCodeInput] = useState(initialCode.toUpperCase())
  const [resolvedInvite, setResolvedInvite] = useState<InviteRecord | null>(null)
  const [isValidatingCode, setIsValidatingCode] = useState(false)
  const [codeFeedback, setCodeFeedback] = useState<string | null>(null)

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    email?: string
    password?: string
    passwordConfirm?: string
  }>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Validate invite code if provided in query param or typing
  useEffect(() => {
    if (initialCode) {
      validateCode(initialCode)
    }
  }, [initialCode])

  const validateCode = async (codeToTest: string) => {
    if (!codeToTest.trim()) {
      setResolvedInvite(null)
      setCodeFeedback(null)
      return
    }
    setIsValidatingCode(true)
    setCodeFeedback(null)
    const inv = await lookupInviteCode(codeToTest)
    if (inv) {
      setResolvedInvite(inv)
      localStorage.setItem('cognikids_pending_invite_code', inv.invite_code)
      if (inv.class_group) {
        localStorage.setItem('cognikids_pending_class_group', inv.class_group)
      }
      if (inv.school_name) {
        localStorage.setItem('cognikids_pending_school_name', inv.school_name)
      }
      setCodeFeedback(`✓ Convite da turma "${inv.class_group || 'Turma'}" validado!`)
    } else {
      setResolvedInvite(null)
      setCodeFeedback('Código não encontrado. Você ainda pode se cadastrar normalmente.')
    }
    setIsValidatingCode(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError(null)
    setFieldErrors({})

    const errors: typeof fieldErrors = {}
    if (!name.trim()) errors.name = 'Informe seu nome.'
    if (!email.trim()) errors.email = 'Informe seu email.'
    if (password.length < 8) errors.password = 'A senha deve ter pelo menos 8 caracteres.'
    if (password !== passwordConfirm) errors.passwordConfirm = 'As senhas não coincidem.'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)
    try {
      // 1. Create User
      await pb.collection('users').create({
        name: name.trim(),
        email: email.trim(),
        password,
        passwordConfirm,
        emailVisibility: true,
      })

      // 2. Request verification email
      try {
        await pb.collection('users').requestVerification(email.trim())
      } catch (_) {
        // Continue if verification request encounters mail server limits
      }

      // 3. Auto sign-in
      await login(email.trim(), password)
      setIsSuccess(true)
    } catch (err: any) {
      const msg = getErrorMessage(err)
      if (err?.data?.data?.email?.message) {
        setFieldErrors((prev) => ({ ...prev, email: err.data.data.email.message }))
      } else if (err?.data?.data?.password?.message) {
        setFieldErrors((prev) => ({ ...prev, password: err.data.data.password.message }))
      } else {
        setGeneralError(
          msg || 'Não foi possível criar a conta. Verifique os dados e tente novamente.',
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <AuthLayout title="Conta criada! 🎉" subtitle="Seja bem-vindo ao CogniKids">
        <div className="space-y-4 text-center">
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-left text-xs">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Cadastro concluído com sucesso!</p>
              <p className="text-emerald-700 mt-0.5">
                Enviamos um link de confirmação para <b>{email}</b>.
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/app')}
            className="w-full h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold"
          >
            Ir para o app
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Criar sua conta" subtitle="Comece o desenvolvimento do seu filho hoje">
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {generalError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Invite Code / School Classroom Banner */}
        {resolvedInvite ? (
          <div className="p-3.5 bg-indigo-50 border-2 border-indigo-200 rounded-2xl text-left space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-indigo-700 flex items-center gap-1.5">
                <School className="w-4 h-4" />
                <span>Convite da Escola Validado</span>
              </span>
              <span className="text-[10px] font-black bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded-full">
                {resolvedInvite.class_group || 'Turma Vinculada'}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-800">
              {resolvedInvite.school_name || 'Instituição Escolar'}
            </p>
            <p className="text-[11px] text-slate-500">
              Ao criar o perfil do seu filho, ele será automaticamente vinculado à turma{' '}
              <strong>{resolvedInvite.class_group}</strong>.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-1.5">
            <div className="flex justify-between items-center">
              <Label
                htmlFor="inviteCode"
                className="text-xs font-bold text-slate-700 flex items-center gap-1"
              >
                <Ticket className="w-3.5 h-3.5 text-orange-500" />
                <span>Tenho código da escola ou convite (opcional)</span>
              </Label>
              {inviteCodeInput && (
                <button
                  type="button"
                  onClick={() => validateCode(inviteCodeInput)}
                  className="text-[11px] font-black text-orange-600 hover:underline"
                >
                  {isValidatingCode ? 'Verificando…' : 'Validar'}
                </button>
              )}
            </div>
            <Input
              id="inviteCode"
              type="text"
              placeholder="ex: MATRIC-BERCARIO ou TICO-XXXXX"
              value={inviteCodeInput}
              onChange={(e) => {
                const val = e.target.value.toUpperCase()
                setInviteCodeInput(val)
              }}
              onBlur={() => validateCode(inviteCodeInput)}
              className="rounded-xl h-9 uppercase font-mono text-xs font-bold"
            />
            {codeFeedback && (
              <p
                className={`text-[11px] font-semibold ${resolvedInvite ? 'text-emerald-700' : 'text-slate-500'}`}
              >
                {codeFeedback}
              </p>
            )}
          </div>
        )}

        <div className="space-y-1 text-left">
          <Label htmlFor="name" className="text-xs font-bold text-slate-700">
            Nome do responsável
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="ex: Mariana Silva"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            className={`rounded-2xl h-10 ${fieldErrors.name ? 'border-rose-500' : ''}`}
          />
          {fieldErrors.name && (
            <p className="text-xs text-rose-600 font-medium">{fieldErrors.name}</p>
          )}
        </div>

        <div className="space-y-1 text-left">
          <Label htmlFor="email" className="text-xs font-bold text-slate-700">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="ex: mariana@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className={`rounded-2xl h-10 ${fieldErrors.email ? 'border-rose-500' : ''}`}
          />
          {fieldErrors.email && (
            <p className="text-xs text-rose-600 font-medium">{fieldErrors.email}</p>
          )}
        </div>

        <div className="space-y-1 text-left">
          <Label htmlFor="password" className="text-xs font-bold text-slate-700">
            Senha (mínimo 8 caracteres)
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className={`rounded-2xl h-10 ${fieldErrors.password ? 'border-rose-500' : ''}`}
          />
          {fieldErrors.password && (
            <p className="text-xs text-rose-600 font-medium">{fieldErrors.password}</p>
          )}
        </div>

        <div className="space-y-1 text-left">
          <Label htmlFor="passwordConfirm" className="text-xs font-bold text-slate-700">
            Confirmar senha
          </Label>
          <Input
            id="passwordConfirm"
            type="password"
            placeholder="••••••••"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            disabled={isLoading}
            className={`rounded-2xl h-10 ${fieldErrors.passwordConfirm ? 'border-rose-500' : ''}`}
          />
          {fieldErrors.passwordConfirm && (
            <p className="text-xs text-rose-600 font-medium">{fieldErrors.passwordConfirm}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 mt-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>Criando conta…</span>
            </>
          ) : (
            'Criar conta'
          )}
        </Button>

        <div className="pt-2 text-center text-xs text-slate-500">
          Já tem conta?{' '}
          <Link to="/login" className="text-orange-600 hover:text-orange-700 font-bold">
            Entrar
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
