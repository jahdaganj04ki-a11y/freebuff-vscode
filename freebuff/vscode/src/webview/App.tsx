import { useEffect, useMemo, useRef, useState } from 'react'
import { marked } from 'marked'

import type {
  AuthInfo,
  ChatMessage,
  HostMessage,
  ModelInfo,
  SessionInfo,
  WebviewMessage,
} from '../shared/protocol'

declare function acquireVsCodeApi(): {
  postMessage: (message: WebviewMessage) => void
  getState: () => unknown
  setState: (state: unknown) => void
}

const vscode = acquireVsCodeApi()

interface AskUserQuestion {
  question: string
  header?: string
  options: Array<{ label: string; description?: string }>
  multiSelect?: boolean
}

function post(message: WebviewMessage): void {
  vscode.postMessage(message)
}

function renderMarkdown(text: string): string {
  const html = marked.parse(text, { async: false, breaks: true, gfm: true }) as string
  return html.replace(/<script[\s\S]*?<\/script>/gi, '')
}

export function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [running, setRunning] = useState(false)
  const [auth, setAuth] = useState<AuthInfo>({ signedIn: false })
  const [models, setModels] = useState<ModelInfo[]>([])
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
  const [session, setSession] = useState<SessionInfo>({ status: 'signed_out' })
  const [input, setInput] = useState('')
  const [pendingImages, setPendingImages] = useState<string[]>([])
  const [modelMenuOpen, setModelMenuOpen] = useState(false)
  const [loginUrl, setLoginUrl] = useState<string | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      const message = event.data as HostMessage
      switch (message.type) {
        case 'state':
          setMessages(message.messages)
          setRunning(message.running)
          break
        case 'auth':
          setAuth(message.auth)
          break
        case 'models':
          setModels(message.models)
          setSelectedModelId(message.selectedModelId)
          break
        case 'session':
          setSession(message.session)
          break
        case 'loginUrl':
          setLoginUrl(message.url)
          setLoginError(null)
          break
        case 'loginResult':
          if (message.success) {
            setLoginUrl(null)
            setLoginError(null)
          } else if (message.error && message.error !== '__files_attached__') {
            setLoginError(message.error)
          }
          break
        case 'settings':
          break
      }
    }
    window.addEventListener('message', listener)
    post({ type: 'ready' })
    return () => window.removeEventListener('message', listener)
  }, [])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  const selectedModel = useMemo(
    () => models.find((model) => model.id === selectedModelId) ?? null,
    [models, selectedModelId],
  )

  const canSend =
    auth.signedIn && !running && (input.trim().length > 0 || pendingImages.length > 0)

  function handleSend(): void {
    if (!canSend) return
    post({ type: 'send', text: input, images: pendingImages })
    setInput('')
    setPendingImages([])
  }

  function handlePaste(event: React.ClipboardEvent): void {
    const items = event.clipboardData?.items
    if (!items) return
    const images: string[] = []
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (!file) continue
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setPendingImages((prev) => [...prev, reader.result as string])
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }

  function handleImageFiles(files: FileList | null): void {
    if (!files) return
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPendingImages((prev) => [...prev, reader.result as string])
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <span className="brand">Freebuff</span>
        {auth.signedIn ? (
          <span className="auth-chip" title={auth.email}>
            {auth.email ?? auth.name}
          </span>
        ) : (
          <span className="auth-chip signed-out">signed out</span>
        )}
        <button
          className="icon-button"
          title="New chat"
          onClick={() => post({ type: 'newChat' })}
        >
          +
        </button>
      </header>

      {!auth.signedIn ? (
        <LoginScreen loginUrl={loginUrl} loginError={loginError} />
      ) : (
        <>
          <SessionBanner session={session} />
          <div className="message-list" ref={listRef}>
            {messages.length === 0 && <EmptyState />}
            {messages.map((message) =>
              message.toolCalls?.some((toolCall) => toolCall.approval) ? (
                message.toolCalls!
                  .filter((toolCall) => toolCall.approval)
                  .map((toolCall) => (
                    <ApprovalCard
                      key={toolCall.toolCallId}
                      message={message}
                      toolCallId={toolCall.toolCallId}
                    />
                  ))
              ) : message.toolCalls?.some((toolCall) => toolCall.toolName === 'ask_user') ? (
                <AskUserCard key={message.id} message={message} />
              ) : (
                <MessageBubble key={message.id} message={message} />
              ),
            )}
            {running && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="thinking">Freebuff is working…</div>
            )}
          </div>
          <Composer
            input={input}
            setInput={setInput}
            pendingImages={pendingImages}
            setPendingImages={setPendingImages}
            running={running}
            canSend={canSend}
            onSend={handleSend}
            onPaste={handlePaste}
            onImageFiles={handleImageFiles}
            models={models}
            selectedModel={selectedModel}
            modelMenuOpen={modelMenuOpen}
            setModelMenuOpen={setModelMenuOpen}
            onSelectModel={(modelId) => {
              setSelectedModelId(modelId)
              setModelMenuOpen(false)
              post({ type: 'selectModel', modelId })
            }}
          />
        </>
      )}
    </div>
  )
}

function LoginScreen(props: {
  loginUrl: string | null
  loginError: string | null
}) {
  return (
    <div className="login-screen">
      <div className="login-card">
        <h2>Sign in to Freebuff</h2>
        <p>
          Freebuff gives you free access to leading AI models for coding. Sign in
          with your Freebuff account (shared with the Freebuff CLI).
        </p>
        {props.loginUrl && (
          <div className="login-url">
            Waiting for you to complete login in your browser…
            <a href={props.loginUrl}>Open login page again</a>
          </div>
        )}
        {props.loginError && <div className="login-error">{props.loginError}</div>}
        <button className="primary-button" onClick={() => post({ type: 'signIn' })}>
          Sign in with browser
        </button>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-title">Ask Freebuff anything</div>
      <div className="empty-hints">
        <div>&quot;Explain the architecture of this project&quot;</div>
        <div>&quot;Fix the failing test in src/utils&quot;</div>
        <div>&quot;Add a dark-mode toggle to the settings page&quot;</div>
      </div>
    </div>
  )
}

function SessionBanner(props: { session: SessionInfo }) {
  const session = props.session
  if (session.status === 'signed_out') return null
  if (session.status === 'active') {
    const expires = session.expiresAt
      ? new Date(session.expiresAt).toLocaleTimeString()
      : null
    return (
      <div className="session-banner ok">
        <span className="dot" />
        Session active{expires ? ` until ${expires}` : ''}
        {session.rateLimits && session.rateLimits.length > 0 && (
          <span className="quota">
            {session.rateLimits[0].used}/{session.rateLimits[0].limit} sessions today
          </span>
        )}
      </div>
    )
  }
  if (session.status === 'ended') {
    return (
      <div className="session-banner info">
        Session ended — send a message to start a new one.
      </div>
    )
  }
  if (session.status === 'rate_limited') {
    return <div className="session-banner warn">{session.message}</div>
  }
  if (session.status === 'country_blocked' || session.status === 'banned' || session.status === 'superseded') {
    return <div className="session-banner warn">{session.message}</div>
  }
  if (session.status === 'error') {
    return <div className="session-banner warn">{session.message}</div>
  }
  return null
}

function MessageBubble(props: { message: ChatMessage }) {
  const message = props.message
  if (message.role === 'system') {
    return <div className={`system-message ${message.error ? 'error' : ''}`}>{message.text}</div>
  }
  if (message.role === 'user') {
    return (
      <div className="user-message">
        <div className="message-text">{message.text}</div>
        {message.images?.map((image, index) => (
          <img key={index} src={image} className="message-image" alt="attachment" />
        ))}
      </div>
    )
  }
  return (
    <div className="assistant-message">
      {message.text && (
        <div
          className="markdown"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }}
        />
      )}
      {message.streaming && <span className="cursor" />}
      {message.toolCalls
        ?.filter((toolCall) => !toolCall.approval && toolCall.toolName !== 'ask_user')
        .map((toolCall) => (
          <ToolCallRow key={toolCall.toolCallId} toolCall={toolCall} />
        ))}
    </div>
  )
}

function ToolCallRow(props: {
  toolCall: NonNullable<ChatMessage['toolCalls']>[number]
}) {
  const [expanded, setExpanded] = useState(false)
  const toolCall = props.toolCall
  const statusIcon =
    toolCall.status === 'done' ? '✓' : toolCall.status === 'error' ? '✗' : '⋯'
  return (
    <div className="tool-call">
      <button className="tool-row" onClick={() => setExpanded(!expanded)}>
        <span className={`tool-status ${toolCall.status}`}>{statusIcon}</span>
        <span className="tool-summary">{toolCall.summary}</span>
      </button>
      {expanded && toolCall.detail && (
        <pre className="tool-detail">{toolCall.detail}</pre>
      )}
    </div>
  )
}

function ApprovalCard(props: { message: ChatMessage; toolCallId: string }) {
  const toolCall = props.message.toolCalls?.find(
    (tc) => tc.toolCallId === props.toolCallId,
  )
  if (!toolCall?.approval) return null
  const resolved = toolCall.status !== 'pending'
  return (
    <div className="approval-card">
      <div className="approval-title">
        {toolCall.approval.kind === 'write_file' ? 'Create' : 'Edit'}{' '}
        <code>{toolCall.approval.filePath}</code>
      </div>
      {!resolved ? (
        <>
          <div className="approval-actions">
            <button
              className="primary-button"
              onClick={() => post({ type: 'approveTool', toolCallId: props.toolCallId })}
            >
              Accept
            </button>
            <button
              className="secondary-button"
              onClick={() => post({ type: 'rejectTool', toolCallId: props.toolCallId })}
            >
              Reject
            </button>
            <button
              className="secondary-button"
              onClick={() => post({ type: 'openDiff', filePath: toolCall.approval!.filePath })}
            >
              View diff
            </button>
          </div>
        </>
      ) : (
        <div className={`approval-result ${toolCall.status === 'done' ? 'accepted' : 'rejected'}`}>
          {toolCall.status === 'done' ? 'Accepted' : 'Rejected'}
        </div>
      )}
    </div>
  )
}

function AskUserCard(props: { message: ChatMessage }) {
  const toolCall = props.message.toolCalls?.find(
    (tc) => tc.toolName === 'ask_user',
  )
  const [selections, setSelections] = useState<Record<number, string[]>>({})
  const [otherText, setOtherText] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)

  if (!toolCall) return null
  let questions: AskUserQuestion[] = []
  try {
    questions = JSON.parse(toolCall.detail ?? '[]') as AskUserQuestion[]
  } catch {
    questions = []
  }
  if (questions.length === 0) return null

  const resolved = submitted || toolCall.status === 'done'

  function toggle(questionIndex: number, label: string, multiSelect?: boolean): void {
    setSelections((prev) => {
      const current = prev[questionIndex] ?? []
      if (multiSelect) {
        return {
          ...prev,
          [questionIndex]: current.includes(label)
            ? current.filter((item) => item !== label)
            : [...current, label],
        }
      }
      return { ...prev, [questionIndex]: [label] }
    })
  }

  function submit(skipped: boolean): void {
    const answers = questions.map((question, index) => {
      const selected = selections[index] ?? []
      const text = otherText[index]
      if (text && text.trim()) {
        return { questionIndex: index, otherText: text.trim() }
      }
      if (selected.length === 1) {
        return { questionIndex: index, selectedOption: selected[0] }
      }
      if (selected.length > 1) {
        return { questionIndex: index, selectedOptions: selected }
      }
      return { questionIndex: index }
    })
    post({ type: 'answerAskUser', toolCallId: toolCall!.toolCallId, answers, skipped })
    setSubmitted(true)
  }

  return (
    <div className="ask-card">
      {questions.map((question, questionIndex) => (
        <div key={questionIndex} className="ask-question">
          <div className="ask-label">
            {question.header && <span className="ask-chip">{question.header}</span>}
            {question.question}
          </div>
          <div className={`ask-options ${question.multiSelect ? 'multi' : 'single'}`}>
            {question.options.map((option) => {
              const selected = (selections[questionIndex] ?? []).includes(option.label)
              return (
                <button
                  key={option.label}
                  className={`ask-option ${selected ? 'selected' : ''}`}
                  disabled={resolved}
                  title={option.description}
                  onClick={() => toggle(questionIndex, option.label, question.multiSelect)}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
          <input
            className="ask-other"
            type="text"
            placeholder="Or type your own answer…"
            disabled={resolved}
            value={otherText[questionIndex] ?? ''}
            onChange={(event) =>
              setOtherText((prev) => ({ ...prev, [questionIndex]: event.target.value }))
            }
          />
        </div>
      ))}
      {!resolved ? (
        <div className="approval-actions">
          <button className="primary-button" onClick={() => submit(false)}>
            Submit
          </button>
          <button className="secondary-button" onClick={() => submit(true)}>
            Skip
          </button>
        </div>
      ) : (
        <div className="approval-result accepted">Answered</div>
      )}
    </div>
  )
}

function Composer(props: {
  input: string
  setInput: (value: string) => void
  pendingImages: string[]
  setPendingImages: (value: string[]) => void
  running: boolean
  canSend: boolean
  onSend: () => void
  onPaste: (event: React.ClipboardEvent) => void
  onImageFiles: (files: FileList | null) => void
  models: ModelInfo[]
  selectedModel: ModelInfo | null
  modelMenuOpen: boolean
  setModelMenuOpen: (open: boolean) => void
  onSelectModel: (modelId: string) => void
}) {
  return (
    <div className="composer">
      {props.pendingImages.length > 0 && (
        <div className="pending-images">
          {props.pendingImages.map((image, index) => (
            <div key={index} className="pending-image">
              <img src={image} alt="attachment" />
              <button
                className="remove-image"
                onClick={() =>
                  props.setPendingImages(
                    props.pendingImages.filter((_, i) => i !== index),
                  )
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="composer-input">
        <textarea
          value={props.input}
          placeholder="Ask Freebuff… (@ for files)"
          onChange={(event) => props.setInput(event.target.value)}
          onPaste={props.onPaste}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              props.onSend()
            }
          }}
        />
      </div>
      <div className="composer-actions">
        <button
          className="icon-button"
          title="Attach files"
          onClick={() => post({ type: 'mentionFiles' })}
        >
          @
        </button>
        <label className="icon-button" title="Attach image">
          📎
          <input
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(event) => props.onImageFiles(event.target.files)}
          />
        </label>
        <div className="model-picker">
          <button
            className="model-button"
            onClick={() => props.setModelMenuOpen(!props.modelMenuOpen)}
            title={props.selectedModel?.tagline ?? 'Select model'}
          >
            {props.selectedModel?.displayName ?? 'Select model'} ▾
          </button>
          {props.modelMenuOpen && (
            <div className="model-menu">
              {props.models.map((model) => (
                <button
                  key={model.id}
                  className={`model-menu-item ${model.id === props.selectedModel?.id ? 'selected' : ''}`}
                  onClick={() => props.onSelectModel(model.id)}
                >
                  <span className="model-name">
                    {model.displayName}
                    {model.premium && <span className="model-badge">limited/day</span>}
                    {model.id === props.selectedModel?.id && <span className="check">✓</span>}
                  </span>
                  <span className="model-tagline">{model.tagline}</span>
                  {model.warning && <span className="model-warning">{model.warning}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        {props.running ? (
          <button
            className="secondary-button stop"
            onClick={() => post({ type: 'stop' })}
          >
            Stop
          </button>
        ) : (
          <button
            className="primary-button send"
            disabled={!props.canSend}
            onClick={props.onSend}
          >
            Send
          </button>
        )}
      </div>
    </div>
  )
}
