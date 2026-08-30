/**
 * Port of cli/src/utils/freebuff-session-api.ts — the free-mode session
 * admission API. POST claims/rotates a session slot, GET polls state,
 * DELETE releases the slot.
 */

import { getAppUrl } from '../auth'

import {
  FREEBUFF_COMPACT_SESSION_HEADER,
  FREEBUFF_INSTANCE_HEADER,
  FREEBUFF_MODEL_HEADER,
} from '@codebuff/common/constants/freebuff-models'

import type { FreebuffSessionServerResponse } from '@codebuff/common/types/freebuff-session'

const SESSION_FETCH_TIMEOUT_MS = 20_000

export type FreebuffSessionMethod = 'POST' | 'GET' | 'DELETE'

export class FreebuffSessionRequestError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly retryAfterMs?: number,
    readonly errorCode?: string,
  ) {
    super(message)
    this.name = 'FreebuffSessionRequestError'
  }
}

export function parseRetryAfterMs(
  value: string | null,
  nowMs = Date.now(),
): number | undefined {
  if (!value) return undefined
  const seconds = Number(value)
  if (Number.isFinite(seconds) && seconds >= 0) {
    const milliseconds = seconds * 1000
    return Number.isFinite(milliseconds) ? Math.ceil(milliseconds) : undefined
  }
  const dateMs = Date.parse(value)
  return Number.isFinite(dateMs) ? Math.max(0, dateMs - nowMs) : undefined
}

function sessionEndpoint(): string {
  return `${getAppUrl()}/api/v1/freebuff/session`
}

/** Combines the caller's abort signal with a per-request timeout. */
export function sessionFetchSignal(
  signal: AbortSignal | undefined,
  timeoutMs: number = SESSION_FETCH_TIMEOUT_MS,
): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs)
  return signal ? AbortSignal.any([signal, timeout]) : timeout
}

/** Fetch that keeps its Authorization header across redirects: the platform
 *  drops authorisation headers when following a cross-origin redirect (the
 *  bare codebuff.com origin 301s to www), so each hop is re-issued here. */
async function authedSessionFetch(
  url: string,
  method: FreebuffSessionMethod,
  headers: Record<string, string>,
  signal: AbortSignal,
): Promise<Response> {
  let target = url
  for (let hop = 0; hop < 3; hop++) {
    const response = await fetch(target, {
      method,
      headers,
      redirect: 'manual',
      signal,
    })
    const location = response.headers.get('location')
    if (!location || ![301, 302, 303, 307, 308].includes(response.status)) {
      return response
    }
    target = new URL(location, target).toString()
  }
  throw new FreebuffSessionRequestError(
    `freebuff session ${method} redirected too many times`,
    500,
  )
}

export async function callFreebuffSession(
  method: FreebuffSessionMethod,
  token: string,
  opts: {
    instanceId?: string
    model?: string
    signal?: AbortSignal
    compact?: boolean
  } = {},
): Promise<FreebuffSessionServerResponse> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  }
  if (method === 'GET' && opts.instanceId) {
    headers[FREEBUFF_INSTANCE_HEADER] = opts.instanceId
  }
  if (method === 'GET' && opts.compact) {
    headers[FREEBUFF_COMPACT_SESSION_HEADER] = '1'
  }
  if (method === 'POST' && opts.model) {
    headers[FREEBUFF_MODEL_HEADER] = opts.model
  }

  const response = await authedSessionFetch(
    sessionEndpoint(),
    method,
    headers,
    sessionFetchSignal(opts.signal),
  )

  if (response.status === 404) {
    return { status: 'none' }
  }

  if (response.status === 403) {
    const body = (await response
      .json()
      .catch(() => null)) as FreebuffSessionServerResponse | null
    if (body && (body.status === 'country_blocked' || body.status === 'banned')) {
      return body
    }
  }

  if (response.status === 409 && method === 'POST') {
    const body = (await response
      .json()
      .catch(() => null)) as FreebuffSessionServerResponse | null
    if (
      body &&
      (body.status === 'model_locked' || body.status === 'model_unavailable')
    ) {
      return body
    }
  }

  if (response.status === 429 && method === 'POST') {
    const body = (await response
      .json()
      .catch(() => null)) as FreebuffSessionServerResponse | null
    if (
      body &&
      (body.status === 'rate_limited' ||
        body.status === 'spend_limited' ||
        body.status === 'ip_capped')
    ) {
      return body
    }
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    let errorCode: string | undefined
    try {
      const body = JSON.parse(text) as { error?: unknown }
      if (typeof body.error === 'string') errorCode = body.error
    } catch {
      // Non-JSON error bodies have no machine-readable code.
    }
    throw new FreebuffSessionRequestError(
      `freebuff session ${method} failed: ${response.status} ${text.slice(0, 200)}`,
      response.status,
      parseRetryAfterMs(response.headers.get('retry-after')),
      errorCode,
    )
  }

  return (await response.json()) as FreebuffSessionServerResponse
}

/** How the poll loop should treat a failed request — POST is not idempotent
 *  (a lost response may still have rotated the instance), so only responses
 *  produced before the session mutation commits are safe to retry. */
export function classifySessionRequestFailure(
  method: 'POST' | 'GET',
  error: unknown,
): 'retry' | 'stop' | 'unknown' {
  if (method === 'POST') {
    if (!(error instanceof FreebuffSessionRequestError)) return 'unknown'
    if ([408, 429, 503].includes(error.statusCode)) return 'retry'
    return error.statusCode >= 400 && error.statusCode < 500
      ? 'stop'
      : 'unknown'
  }
  if (!(error instanceof FreebuffSessionRequestError)) return 'retry'
  return error.statusCode === 408 ||
    error.statusCode === 429 ||
    error.statusCode >= 500
    ? 'retry'
    : 'stop'
}
