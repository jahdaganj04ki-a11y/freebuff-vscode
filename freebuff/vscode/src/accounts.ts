/**
 * Multi-account store for the extension.
 *
 * Known accounts live in VS Code globalState; the ACTIVE account is mirrored
 * into the shared CLI credentials file so the `freebuff`/`codebuff` CLI and the
 * extension stay in sync (the design decision for this extension). Switching
 * accounts rewrites the shared file, which is how a fresh free-session quota is
 * reached without touching the CLI directly.
 *
 * Note: globalState stores the auth token as plaintext on disk, matching the
 * CLI's own credentials.json.
 */

import { clearUserCredentials, getUserCredentials, saveUserCredentials } from './auth'

import type { FreebuffUser } from './auth'
import type * as vscode from 'vscode'

const ACCOUNTS_KEY = 'freebuff.accounts'
const ACTIVE_KEY = 'freebuff.activeAccountEmail'

export function listAccounts(context: vscode.ExtensionContext): FreebuffUser[] {
  return context.globalState.get<FreebuffUser[]>(ACCOUNTS_KEY) ?? []
}

export function getActiveEmail(context: vscode.ExtensionContext): string | null {
  return context.globalState.get<string>(ACTIVE_KEY) ?? null
}

export function upsertAccount(
  context: vscode.ExtensionContext,
  account: FreebuffUser,
): void {
  const list = listAccounts(context).filter((a) => a.email !== account.email)
  list.push(account)
  void context.globalState.update(ACCOUNTS_KEY, list)
}

/** Make an account active: mirror it into the shared CLI file + remember it. */
export function setActiveAccount(
  context: vscode.ExtensionContext,
  account: FreebuffUser,
): void {
  saveUserCredentials(account)
  void context.globalState.update(ACTIVE_KEY, account.email)
}

export function activateAccountByEmail(
  context: vscode.ExtensionContext,
  email: string,
): boolean {
  const account = listAccounts(context).find((a) => a.email === email)
  if (!account) return false
  setActiveAccount(context, account)
  return true
}

/** Forget an account from the list (does not sign it out unless it is active). */
export function removeAccount(
  context: vscode.ExtensionContext,
  email: string,
): void {
  const list = listAccounts(context).filter((a) => a.email !== email)
  void context.globalState.update(ACCOUNTS_KEY, list)
  if (getActiveEmail(context) === email) {
    void context.globalState.update(ACTIVE_KEY, null)
    clearUserCredentials()
  }
}

/**
 * Adopt whatever account the shared CLI file currently holds into the list, so
 * an account created by the CLI (or a previous extension run) is switchable.
 */
export function syncActiveFromSharedFile(
  context: vscode.ExtensionContext,
): void {
  const current = getUserCredentials()
  if (!current) return
  if (!listAccounts(context).some((a) => a.email === current.email)) {
    upsertAccount(context, current)
  }
  void context.globalState.update(ACTIVE_KEY, current.email)
}
