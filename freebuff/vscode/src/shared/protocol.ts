/**
 * Message protocol between the extension host and the webview.
 * Every message is one of these discriminated unions.
 */

export interface ModelInfo {
  id: string
  displayName: string
  tagline: string
  availability: string
  premium: boolean
  multimodal: boolean
  warning?: string
}

export interface RateLimitInfo {
  model: string
  used: number
  limit: number
  resetAt: string
  poolLabel?: string
}

export interface SessionInfo {
  status:
    | 'signed_out'
    | 'none'
    | 'active'
    | 'ended'
    | 'rate_limited'
    | 'country_blocked'
    | 'banned'
    | 'superseded'
    | 'error'
  model?: string
  expiresAt?: string
  accessTier?: string
  rateLimits?: RateLimitInfo[]
  message?: string
  retryAfterMs?: number
}

export interface ToolCallInfo {
  toolCallId: string
  toolName: string
  status: 'pending' | 'running' | 'done' | 'error'
  summary: string
  detail?: string
  /** For file edits awaiting approval. */
  approval?: {
    filePath: string
    kind: 'write_file' | 'str_replace'
    /** Old content, null when creating a file. */
    before: string | null
    after: string
  }
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  text: string
  images?: string[]
  toolCalls?: ToolCallInfo[]
  streaming?: boolean
  error?: boolean
  timestamp: number
}

export interface AuthInfo {
  signedIn: boolean
  email?: string
  name?: string
}

/** Host -> webview messages. */
export type HostMessage =
  | { type: 'state'; messages: ChatMessage[]; running: boolean }
  | { type: 'auth'; auth: AuthInfo }
  | { type: 'models'; models: ModelInfo[]; selectedModelId: string | null }
  | { type: 'session'; session: SessionInfo }
  | { type: 'loginUrl'; url: string }
  | { type: 'loginResult'; success: boolean; email?: string; error?: string }
  | { type: 'settings'; autoApproveEdits: boolean; autoApproveTerminal: boolean }

/** Webview -> host messages. */
export type WebviewMessage =
  | { type: 'send'; text: string; images?: string[] }
  | { type: 'stop' }
  | { type: 'newChat' }
  | { type: 'selectModel'; modelId: string }
  | { type: 'signIn' }
  | { type: 'signOut' }
  | { type: 'approveTool'; toolCallId: string }
  | { type: 'rejectTool'; toolCallId: string }
  | {
      type: 'answerAskUser'
      toolCallId: string
      answers: Array<{
        questionIndex: number
        selectedOption?: string
        selectedOptions?: string[]
        otherText?: string
      }>
      skipped?: boolean
    }
  | { type: 'mentionFiles' }
  | { type: 'openDiff'; filePath: string }
  | { type: 'ready' }
