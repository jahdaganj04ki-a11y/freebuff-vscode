/**
 * Polls the freebuff session API and emits a distilled SessionInfo for the
 * webview. A simplified port of cli/src/hooks/use-freebuff-session.ts: GET
 * while a session is live (claiming with POST only when asked to join), and
 * terminal states stop the loop.
 */

import { callFreebuffSession, classifySessionRequestFailure } from './session-api'

import type { RateLimitInfo, SessionInfo } from '../shared/protocol'
import type { FreebuffSessionServerResponse } from '@codebuff/common/types/freebuff-session'

const POLL_ACTIVE_MS = 30_000
const POLL_IDLE_MS = 60_000
const POLL_RETRY_MS = 10_000

export class FreebuffSessionPoller {
  private timer: ReturnType<typeof setTimeout> | null = null
  private cancelled = false
  private instanceId: string | null = null
  private lastStatus: string | null = null
  private needsFullPoll = false

  constructor(
    private getToken: () => string | null,
    private getModel: () => string | null,
    private onUpdate: (session: SessionInfo) => void,
    private onModelAdopted: (model: string) => void,
  ) {}

  public start(): void {
    this.cancelled = false
    this.schedule(0)
  }

  public stop(): void {
    this.cancelled = true
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  /** Force an immediate claim (POST) — used when the user sends a message. */
  public async join(model: string): Promise<FreebuffSessionServerResponse | null> {
    const token = this.getToken()
    if (!token) return null
    try {
      const response = await callFreebuffSession('POST', token, { model })
      this.apply(response)
      this.schedule(0)
      return response
    } catch (error) {
      this.handleFailure('POST', error)
      return null
    }
  }

  /** Best-effort release of a held slot (on dispose / sign out). */
  public async release(): Promise<void> {
    const token = this.getToken()
    if (!token) return
    if (!this.instanceId && this.lastStatus !== 'active') return
    try {
      await callFreebuffSession('DELETE', token)
    } catch {
      // The server-side sweep is the backstop.
    }
  }

  private schedule(ms: number): void {
    if (this.cancelled) return
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => void this.tick(), ms)
  }

  private async tick(): Promise<void> {
    if (this.cancelled) return
    const token = this.getToken()
    if (!token) {
      this.onUpdate({ status: 'signed_out' })
      this.schedule(POLL_IDLE_MS)
      return
    }
    const model = this.getModel()
    const compact = this.lastStatus === 'active' && !this.needsFullPoll
    try {
      const response = await callFreebuffSession('GET', token, {
        instanceId: this.instanceId ?? undefined,
        compact,
      })
      this.needsFullPoll = false
      this.apply(response)
      const delay =
        response.status === 'active' ? POLL_ACTIVE_MS : POLL_IDLE_MS
      this.schedule(delay)
    } catch (error) {
      this.handleFailure('GET', error)
    }
  }

  private apply(response: FreebuffSessionServerResponse): void {
    this.lastStatus = response.status
    if (response.status === 'active') {
      this.instanceId = response.instanceId
      this.onModelAdopted(response.model)
      this.onUpdate({
        status: 'active',
        model: response.model,
        expiresAt: response.expiresAt,
        accessTier: response.accessTier,
        rateLimits: toRateLimits(response.rateLimitsByModel),
      })
      return
    }

    switch (response.status) {
      case 'none':
        this.instanceId = null
        this.onUpdate({
          status: 'none',
          accessTier: response.accessTier,
          rateLimits: toRateLimits(response.rateLimitsByModel),
        })
        break
      case 'ended':
        if ('instanceId' in response && response.instanceId) {
          this.instanceId = response.instanceId
        } else {
          this.instanceId = null
        }
        this.onUpdate({
          status: 'ended',
          accessTier: response.accessTier,
          rateLimits: toRateLimits(response.rateLimitsByModel),
        })
        break
      case 'rate_limited':
      case 'ip_capped':
      case 'spend_limited':
        this.instanceId = null
        this.onUpdate({
          status: 'rate_limited',
          message:
            'message' in response && response.message
              ? response.message
              : 'Free session quota reached. It resets automatically.',
          retryAfterMs:
            'retryAfterMs' in response ? response.retryAfterMs : undefined,
        })
        break
      case 'country_blocked':
        this.instanceId = null
        this.onUpdate({
          status: 'country_blocked',
          message:
            response.message ??
            'Freebuff is not available from your current location.',
        })
        this.stop()
        return
      case 'banned':
        this.instanceId = null
        this.onUpdate({ status: 'banned', message: 'This account is banned.' })
        this.stop()
        return
      case 'superseded':
        this.instanceId = null
        this.onUpdate({
          status: 'superseded',
          message:
            'Another Freebuff client took over this session. Close it or start a new chat.',
        })
        this.stop()
        return
      case 'model_locked':
        this.onUpdate({
          status: 'error',
          message: `An active session on ${response.currentModel} is still running. End it to switch models.`,
        })
        break
      case 'model_unavailable':
        this.onUpdate({
          status: 'error',
          message: `${response.requestedModel} is not available right now. ${response.availableHours}`,
        })
        break
      default:
        this.onUpdate({ status: 'error', message: 'Unknown session state.' })
    }
  }

  private handleFailure(method: 'POST' | 'GET', error: unknown): void {
    const disposition = classifySessionRequestFailure(method, error)
    if (disposition === 'stop') {
      this.stop()
      this.onUpdate({
        status: 'error',
        message: error instanceof Error ? error.message : 'Session request failed.',
      })
      return
    }
    this.schedule(POLL_RETRY_MS)
  }
}

function toRateLimits(
  byModel: Record<string, { recentCount: number; limit: number; resetAt: string; poolLabel?: string }> | undefined,
): RateLimitInfo[] | undefined {
  if (!byModel) return undefined
  return Object.entries(byModel).map(([model, limit]) => ({
    model,
    used: limit.recentCount,
    limit: limit.limit,
    resetAt: limit.resetAt,
    poolLabel: limit.poolLabel,
  }))
}
