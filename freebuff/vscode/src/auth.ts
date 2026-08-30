import { execSync } from 'child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

import * as vscode from 'vscode'

export interface FreebuffUser {
  id?: string
  name: string
  email: string
  authToken: string
  fingerprintId?: string
  fingerprintHash?: string
}

const CREDENTIALS_SCHEMA_KEYS = ['id', 'name', 'email', 'authToken'] as const

export function getConfigDir(): string {
  const envSuffix =
    process.env.NEXT_PUBLIC_CB_ENVIRONMENT &&
    process.env.NEXT_PUBLIC_CB_ENVIRONMENT !== 'prod'
      ? `-${process.env.NEXT_PUBLIC_CB_ENVIRONMENT}`
      : ''
  return join(homedir(), '.config', `manicode${envSuffix}`)
}

export function getCredentialsPath(): string {
  return join(getConfigDir(), 'credentials.json')
}

export function getUserCredentials(): FreebuffUser | null {
  const credentialsPath = getCredentialsPath()
  if (!existsSync(credentialsPath)) return null
  try {
    const parsed = JSON.parse(readFileSync(credentialsPath, 'utf8')) as {
      default?: Record<string, unknown>
    }
    const user = parsed.default
    if (!user || typeof user !== 'object') return null
    const hasRequired = CREDENTIALS_SCHEMA_KEYS.every(
      (key) => typeof user[key] === 'string' && user[key],
    )
    if (!hasRequired) return null
    return {
      id: typeof user.id === 'string' ? user.id : undefined,
      name: user.name as string,
      email: user.email as string,
      authToken: user.authToken as string,
      fingerprintId:
        typeof user.fingerprintId === 'string' ? user.fingerprintId : undefined,
      fingerprintHash:
        typeof user.fingerprintHash === 'string'
          ? user.fingerprintHash
          : undefined,
    }
  } catch {
    return null
  }
}

export function saveUserCredentials(user: FreebuffUser): void {
  const configDir = getConfigDir()
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true })
  }
  writeFileSync(getCredentialsPath(), JSON.stringify({ default: user }, null, 2))
}

export function clearUserCredentials(): void {
  const credentialsPath = getCredentialsPath()
  if (!existsSync(credentialsPath)) return
  writeFileSync(credentialsPath, JSON.stringify({}, null, 2))
}

export function getAppUrl(): string {
  return (
    vscode.workspace.getConfiguration('freebuff').get<string>('appUrl') ??
    'https://codebuff.com'
  ).replace(/\/$/, '')
}

/** Stable machine identifier, used by the backend to key login sessions. */
export function getFingerprintId(): string {
  const existing = getUserCredentials()?.fingerprintId
  if (existing) return existing
  try {
    const hostname = execSync('hostname').toString().trim()
    return `freebuff-vscode-${Buffer.from(hostname).toString('hex').slice(0, 16)}`
  } catch {
    return `freebuff-vscode-${Math.random().toString(36).slice(2, 12)}`
  }
}

interface LoginCodeResponse {
  loginUrl: string
  fingerprintHash: string
  expiresAt: string
}

/** Requests a device-login URL from the backend (port of the CLI's login flow). */
export async function generateLoginUrl(): Promise<LoginCodeResponse> {
  const response = await fetch(`${getAppUrl()}/api/auth/cli/code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fingerprintId: getFingerprintId() }),
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) {
    throw new Error(`Login URL request failed: ${response.status}`)
  }
  const data = (await response.json()) as LoginCodeResponse
  if (!data.loginUrl) {
    throw new Error('Login URL response missing loginUrl')
  }
  return data
}

export type LoginPollResult =
  | { status: 'success'; user: FreebuffUser }
  | { status: 'timeout' }

/** Polls the backend until the user finishes the browser login. */
export async function pollLoginStatus(
  fingerprintHash: string,
  expiresAt: string,
  shouldContinue: () => boolean,
): Promise<LoginPollResult> {
  const fingerprintId = getFingerprintId()
  const startedAt = Date.now()
  const timeoutMs = 5 * 60 * 1000

  while (shouldContinue() && Date.now() - startedAt < timeoutMs) {
    try {
      const url = new URL(`${getAppUrl()}/api/auth/cli/status`)
      url.searchParams.set('fingerprintId', fingerprintId)
      url.searchParams.set('fingerprintHash', fingerprintHash)
      url.searchParams.set('expiresAt', expiresAt)
      const response = await fetch(url, {
        signal: AbortSignal.timeout(10_000),
      })
      if (response.ok) {
        const data = (await response.json()) as {
          user?: Record<string, unknown>
        }
        const user = data.user
        if (user && typeof user.authToken === 'string') {
          return {
            status: 'success',
            user: {
              id: typeof user.id === 'string' ? user.id : undefined,
              name: (user.name as string) ?? '',
              email: user.email as string,
              authToken: user.authToken,
              fingerprintId,
              fingerprintHash,
            },
          }
        }
      }
    } catch {
      // Network hiccup — keep polling until the timeout.
    }
    await new Promise((resolve) => setTimeout(resolve, 3000))
  }
  return { status: 'timeout' }
}
