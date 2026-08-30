/**
 * Injects the free-mode session header into the SDK's chat-completions calls.
 *
 * The backend answers `/api/v1/chat/completions` with 412 Precondition Required
 * unless the request carries the active free-session instance id. The SDK does
 * not know about the admission protocol, but its language model resolves
 * `globalThis.fetch` at request time, so wrapping fetch here is sufficient.
 *
 * Import after `./env-bootstrap` and before any `@codebuff/sdk` module.
 */

type InstanceProvider = () => string | null

let provider: InstanceProvider = () => null

export function setFreebuffInstanceProvider(p: InstanceProvider): void {
  provider = p
}

const CHAT_COMPLETIONS = '/api/v1/chat/completions'

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.toString()
  return input.url
}

const realFetch = globalThis.fetch

globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
  try {
    const instanceId = provider()
    if (instanceId && requestUrl(input).includes(CHAT_COMPLETIONS)) {
      init = init ?? {}
      const headers = new Headers(init.headers)
      headers.set('x-freebuff-instance-id', instanceId)
      init = { ...init, headers }
    }
  } catch {
    // Header injection is best-effort; never break the request path.
  }
  return realFetch(input, init)
}) as typeof fetch

export {}
