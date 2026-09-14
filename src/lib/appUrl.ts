/**
 * Central helper for application production & shareable URLs.
 *
 * Ensures that all invite, coupon, registration and shared links point to the
 * official production domain (https://kids.glikholding.com.br) instead of preview
 * domains (e.g. goskip.app or window.location.origin).
 */

export const OFFICIAL_PRODUCTION_URL = 'https://kids.glikholding.com.br'

/**
 * Returns the base URL of the application.
 * Prioritizes VITE_APP_URL or VITE_PUBLIC_APP_URL, falling back to the official
 * production domain https://kids.glikholding.com.br.
 *
 * Never falls back to preview domains (goskip.app) or untrusted window.location.origin.
 */
export function getAppBaseUrl(): string {
  const envUrl =
    (typeof import.meta !== 'undefined' &&
      (import.meta.env?.VITE_APP_URL || import.meta.env?.VITE_PUBLIC_APP_URL)) ||
    ''

  const trimmed = envUrl.trim().replace(/\/+$/, '')
  if (trimmed) {
    return trimmed
  }

  return OFFICIAL_PRODUCTION_URL
}

/**
 * Builds an official signup URL with an invite/coupon code.
 * Example: https://kids.glikholding.com.br/signup?convite=MATRIC-BERCARIO
 */
export function getSignupInviteUrl(inviteCode: string): string {
  const base = getAppBaseUrl()
  const cleanCode = encodeURIComponent(inviteCode.trim())
  return `${base}/signup?convite=${cleanCode}`
}

/**
 * Builds an official school pedagogical access portal URL with a school access code.
 * Example: https://kids.glikholding.com.br/escola?code=ESCOLA-DEMO01
 */
export function getSchoolAccessUrl(accessCode: string): string {
  const base = getAppBaseUrl()
  const cleanCode = encodeURIComponent(accessCode.trim())
  return `${base}/escola?code=${cleanCode}`
}

/**
 * Builds an official community / invites page URL.
 * Example: https://kids.glikholding.com.br/app/community
 */
export function getCommunityUrl(): string {
  const base = getAppBaseUrl()
  return `${base}/app/community`
}
