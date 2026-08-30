import * as vscode from 'vscode'

import {
  clearUserCredentials,
  generateLoginUrl,
  getAppUrl,
  getUserCredentials,
  pollLoginStatus,
  saveUserCredentials,
} from './auth'
import { FreebuffSessionPoller } from './session/session-poller'
import { ChatRunner, wireWasmPaths } from './run/runner'
import { DiffContentProvider, ToolGate } from './run/tools'
import { getDefaultModelId, getModelsForAccessTier } from './run/models'

import type {
  AuthInfo,
  ChatMessage,
  HostMessage,
  ModelInfo,
  SessionInfo,
  ToolCallInfo,
  WebviewMessage,
} from './shared/protocol'

let currentPanel: FreebuffPanel | null = null

export function activate(context: vscode.ExtensionContext): void {
  wireWasmPaths(context)

  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(
      'freebuff-diff',
      new DiffContentProvider(),
    ),
  )

  currentPanel = new FreebuffPanel(context)
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'freebuff.chat',
      currentPanel,
      {
        webviewOptions: { retainContextWhenHidden: true },
      },
    ),
  )

  const signIn = vscode.commands.registerCommand('freebuff.signIn', () => {
    currentPanel?.reveal()
    currentPanel?.beginSignIn()
  })
  const signOut = vscode.commands.registerCommand('freebuff.signOut', () => {
    currentPanel?.signOut()
  })
  const newChat = vscode.commands.registerCommand('freebuff.newChat', () => {
    currentPanel?.reveal()
    currentPanel?.newChat()
  })
  const selectModel = vscode.commands.registerCommand(
    'freebuff.selectModel',
    () => {
      currentPanel?.reveal()
      currentPanel?.pickModel()
    },
  )
  const stopRun = vscode.commands.registerCommand('freebuff.stopRun', () => {
    currentPanel?.stopRun()
  })

  context.subscriptions.push(signIn, signOut, newChat, selectModel, stopRun)
}

export function deactivate(): void {
  currentPanel?.dispose()
}

class FreebuffPanel implements vscode.WebviewViewProvider {
  private view: vscode.WebviewView | null = null
  private messages: ChatMessage[] = []
  private attachedFiles: Array<{ path: string; content: string }> = []
  private selectedModelId: string | null = null
  private models: ModelInfo[] = []
  private session: SessionInfo = { status: 'signed_out' }
  private running = false
  private runner: ChatRunner | null = null
  private toolGate: ToolGate | null = null
  private poller: FreebuffSessionPoller | null = null
  private loginCancellation = false
  private disposed = false

  public constructor(private readonly context: vscode.ExtensionContext) {}

  public reveal(): void {
    this.view?.show?.(true)
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void {
    this.view = webviewView
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, 'dist'),
      ],
    }
    webviewView.webview.html = this.buildHtml(webviewView.webview)
    webviewView.webview.onDidReceiveMessage((message: WebviewMessage) => {
      void this.handleMessage(message)
    })
    webviewView.onDidDispose(() => {
      this.view = null
    })

    this.initializeState()
    this.startPoller()
  }

  public dispose(): void {
    this.disposed = true
    this.loginCancellation = true
    this.runner?.abort()
    this.toolGate?.cancelAll()
    void this.poller?.release()
    this.poller?.stop()
  }

  private get cwd(): string {
    return (
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ??
      process.cwd()
    )
  }

  private initializeState(): void {
    const auth = this.readAuth()
    if (!this.selectedModelId) {
      this.selectedModelId = getDefaultModelId(null)
    }
    this.models = getModelsForAccessTier(null)
    this.post({ type: 'auth', auth })
    this.post({ type: 'models', models: this.models, selectedModelId: this.selectedModelId })
    this.post({ type: 'session', session: this.session })
    this.post({ type: 'settings', ...this.readSettings() })
    this.pushState()
  }

  private readAuth(): AuthInfo {
    const user = getUserCredentials()
    if (!user) return { signedIn: false }
    return { signedIn: true, email: user.email, name: user.name }
  }

  private readSettings(): { autoApproveEdits: boolean; autoApproveTerminal: boolean } {
    const config = vscode.workspace.getConfiguration('freebuff')
    return {
      autoApproveEdits: config.get<boolean>('autoApproveEdits') ?? false,
      autoApproveTerminal: config.get<boolean>('autoApproveTerminal') ?? false,
    }
  }

  private startPoller(): void {
    if (this.poller) return
    this.poller = new FreebuffSessionPoller(
      () => getUserCredentials()?.authToken ?? null,
      () => this.selectedModelId,
      (session) => {
        this.session = session
        this.post({ type: 'session', session })
        if (session.status === 'active' && session.accessTier) {
          this.models = getModelsForAccessTier(session.accessTier)
          this.post({ type: 'models', models: this.models, selectedModelId: this.selectedModelId })
        }
      },
      (model) => {
        if (this.selectedModelId !== model) {
          this.selectedModelId = model
          this.post({
            type: 'models',
            models: this.models,
            selectedModelId: this.selectedModelId,
          })
        }
      },
    )
    this.poller.start()
  }

  private ensureRunner(): ChatRunner {
    if (this.runner) return this.runner

    this.toolGate = new ToolGate(
      this.cwd,
      () => this.readSettings().autoApproveEdits,
      () => this.readSettings().autoApproveTerminal,
      (card) => {
        this.messages = [...this.messages, card]
        this.pushState()
      },
      (toolCallId, approved, statusText) => {
        this.updateToolCall(toolCallId, (toolCall) => ({
          ...toolCall,
          status: statusText === 'done' ? 'done' : 'error',
          summary: approved ? toolCall.summary : `${toolCall.summary} — rejected`,
        }))
      },
      (card) => {
        this.messages = [...this.messages, card]
        this.pushState()
      },
      (toolCallId) => {
        this.updateToolCall(toolCallId, (toolCall) => ({
          ...toolCall,
          status: 'done',
        }))
      },
    )

    this.runner = new ChatRunner(
      this.cwd,
      () => getUserCredentials()?.authToken ?? null,
      () => this.toolGate?.buildOverrides(),
      {
        onStarted: () => {
          this.running = true
          this.pushState()
        },
        onText: (text) => this.appendAssistantText(text),
        onReasoning: (text) => this.appendReasoning(text),
        onSubagent: (line) => {
          this.messages = [
            ...this.messages,
            {
              id: `subagent-${Date.now()}-${this.messages.length}`,
              role: 'system',
              text: line,
              timestamp: Date.now(),
            },
          ]
          this.pushState()
        },
        onToolCall: (toolCallId, toolName, summary) => {
          const lastMessage = this.messages[this.messages.length - 1]
          const toolCall = {
            toolCallId,
            toolName,
            status: 'running' as const,
            summary,
          }
          if (
            lastMessage &&
            lastMessage.role === 'assistant' &&
            lastMessage.streaming
          ) {
            this.messages = [
              ...this.messages.slice(0, -1),
              {
                ...lastMessage,
                toolCalls: [...(lastMessage.toolCalls ?? []), toolCall],
              },
            ]
          } else {
            this.messages = [
              ...this.messages,
              {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                text: '',
                toolCalls: [toolCall],
                streaming: true,
                timestamp: Date.now(),
              },
            ]
          }
          this.pushState()
        },
        onToolResult: (toolCallId, _toolName, detail, isError) => {
          this.updateToolCall(toolCallId, (toolCall) => ({
            ...toolCall,
            status: isError ? 'error' : 'done',
            detail: detail.slice(0, 4000),
          }))
        },
        onError: (message) => {
          this.messages = [
            ...this.messages,
            {
              id: `error-${Date.now()}`,
              role: 'system',
              text: message,
              error: true,
              timestamp: Date.now(),
            },
          ]
          this.pushState()
        },
        onFinish: () => {
          this.running = false
          this.messages = this.messages.map((message) =>
            message.streaming ? { ...message, streaming: false } : message,
          )
          this.pushState()
        },
      },
    )
    return this.runner
  }

  private appendAssistantText(text: string): void {
    const lastMessage = this.messages[this.messages.length - 1]
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.streaming) {
      this.messages = [
        ...this.messages.slice(0, -1),
        { ...lastMessage, text: lastMessage.text + text },
      ]
    } else {
      this.messages = [
        ...this.messages,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text,
          streaming: true,
          timestamp: Date.now(),
        },
      ]
    }
    this.pushState()
  }

  private appendReasoning(text: string): void {
    const lastMessage = this.messages[this.messages.length - 1]
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.streaming) {
      this.messages = [
        ...this.messages.slice(0, -1),
        { ...lastMessage, reasoning: (lastMessage.reasoning ?? '') + text },
      ]
    } else {
      this.messages = [
        ...this.messages,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: '',
          reasoning: text,
          streaming: true,
          timestamp: Date.now(),
        },
      ]
    }
    this.pushState()
  }

  private updateToolCall(
    toolCallId: string,
    update: (toolCall: ToolCallInfo) => ToolCallInfo,
  ): void {
    this.messages = this.messages.map((message) => {
      if (!message.toolCalls?.some((tc) => tc.toolCallId === toolCallId)) {
        return message
      }
      return {
        ...message,
        toolCalls: message.toolCalls.map((toolCall) =>
          toolCall.toolCallId === toolCallId ? update(toolCall) : toolCall,
        ),
      }
    })
    this.pushState()
  }

  private async handleMessage(message: WebviewMessage): Promise<void> {
    switch (message.type) {
      case 'ready':
        this.initializeState()
        break
      case 'send':
        await this.handleSend(message.text, message.images ?? [])
        break
      case 'stop':
        this.stopRun()
        break
      case 'newChat':
        this.newChat()
        break
      case 'selectModel':
        this.selectedModelId = message.modelId
        this.post({
          type: 'models',
          models: this.models,
          selectedModelId: this.selectedModelId,
        })
        void this.poller?.join(message.modelId)
        break
      case 'signIn':
        await this.beginSignIn()
        break
      case 'signOut':
        this.signOut()
        break
      case 'approveTool':
        this.toolGate?.resolveApproval(message.toolCallId, true)
        break
      case 'rejectTool':
        this.toolGate?.resolveApproval(message.toolCallId, false)
        break
      case 'answerAskUser':
        this.toolGate?.resolveAskUser(
          message.toolCallId,
          message.answers,
          message.skipped ?? false,
        )
        break
      case 'mentionFiles':
        await this.handleMentionFiles()
        break
      case 'openDiff': {
        const approval = this.messages
          .flatMap((message2) => message2.toolCalls ?? [])
          .find((toolCall) => toolCall.approval?.filePath === message.filePath)
          ?.approval
        if (approval) {
          await this.showApprovalDiff(approval.filePath, approval.before, approval.after)
        }
        break
      }
    }
  }

  private async handleSend(text: string, images: string[]): Promise<void> {
    if (this.running) return
    const auth = this.readAuth()
    if (!auth.signedIn) {
      this.messages = [
        ...this.messages,
        {
          id: `sys-${Date.now()}`,
          role: 'system',
          text: 'Please sign in first (Freebuff: Sign In).',
          timestamp: Date.now(),
        },
      ]
      this.pushState()
      return
    }

    let prompt = text
    if (this.attachedFiles.length > 0) {
      const fileBlocks = this.attachedFiles
        .map((file) => `<file path="${file.path}">\n${file.content}\n</file>`)
        .join('\n')
      prompt = `${text}\n\n${fileBlocks}`
      this.attachedFiles = []
    }

    this.messages = [
      ...this.messages,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        text,
        images: images.length > 0 ? images : undefined,
        timestamp: Date.now(),
      },
    ]
    this.pushState()

    // Free-mode admission: claim a session slot for the selected model.
    const modelId = this.selectedModelId ?? getDefaultModelId(null)
    const admission = await this.poller?.join(modelId)
    if (admission) {
      const blocked = this.admissionBlocked(admission.status)
      if (blocked) {
        this.messages = [
          ...this.messages,
          {
            id: `sys-${Date.now()}`,
            role: 'system',
            text: blocked,
            error: true,
            timestamp: Date.now(),
          },
        ]
        this.pushState()
        return
      }
    }

    const parsedImages = images.map((dataUrl) => {
      const match = /^data:(image\/[a-z+]+);base64,(.*)$/i.exec(dataUrl)
      return match ? { mediaType: match[1], data: match[2] } : { mediaType: 'image/png', data: dataUrl }
    })

    const runner = this.ensureRunner()
    await runner.send(
      prompt,
      parsedImages.map((image) => image.data),
      modelId,
    )
  }

  private admissionBlocked(status: string): string | null {
    switch (status) {
      case 'rate_limited':
        return 'Free session quota reached. It resets automatically — try again later.'
      case 'country_blocked':
        return 'Freebuff is not available from your current location.'
      case 'banned':
        return 'This account is banned.'
      case 'spend_limited':
      case 'ip_capped':
        return 'Free capacity is currently exhausted for your network. Try again shortly.'
      default:
        return null
    }
  }

  private async handleMentionFiles(): Promise<void> {
    const files = await vscode.window.showQuickPick(
      this.listWorkspaceFiles(),
      {
        placeHolder: 'Attach files to the next message',
        canPickMany: true,
        matchOnDescription: true,
      },
    )
    if (!files || files.length === 0) return
    for (const file of files) {
      try {
        const document = await vscode.workspace.openTextDocument(file.uri)
        this.attachedFiles.push({
          path: vscode.workspace.asRelativePath(file.uri),
          content: document.getText(),
        })
      } catch {
        // Skip binary/unreadable files.
      }
    }
    this.post({ type: 'loginResult', success: false, error: '__files_attached__' })
    // Files are attached silently; the webview shows the count via state push.
    this.pushState()
  }

  private async listWorkspaceFiles(): Promise<Array<vscode.QuickPickItem & { uri: vscode.Uri }>> {
    const uris = await vscode.workspace.findFiles(
      '**/*',
      '**/node_modules/**,**/.git/**,**/dist/**,**/build/**',
      1000,
    )
    return uris
      .map((uri) => ({
        label: vscode.workspace.asRelativePath(uri),
        uri,
        description: undefined as string | undefined,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }

  private async showApprovalDiff(
    displayPath: string,
    before: string | null,
    after: string,
  ): Promise<void> {
    const uri = vscode.Uri.joinPath(vscode.Uri.file(this.cwd), displayPath)
    const afterUri = uri.with({
      scheme: 'freebuff-diff',
      query: encodeURIComponent(after),
    })
    await vscode.commands.executeCommand(
      'vscode.diff',
      uri,
      afterUri,
      `${displayPath} (Freebuff proposed)`,
      { preview: true },
    )
  }

  public async beginSignIn(): Promise<void> {
    if (this.readAuth().signedIn) {
      vscode.window.showInformationMessage('Freebuff: already signed in.')
      return
    }
    this.loginCancellation = false
    try {
      const loginData = await generateLoginUrl()
      this.post({ type: 'loginUrl', url: loginData.loginUrl })
      await vscode.env.openExternal(vscode.Uri.parse(loginData.loginUrl))
      const result = await pollLoginStatus(
        loginData.fingerprintHash,
        loginData.expiresAt,
        () => !this.loginCancellation && !this.disposed,
      )
      if (result.status === 'success') {
        saveUserCredentials(result.user)
        this.runner?.resetClient()
        this.post({ type: 'auth', auth: this.readAuth() })
        this.post({
          type: 'loginResult',
          success: true,
          email: result.user.email,
        })
        this.startPoller()
      } else {
        this.post({
          type: 'loginResult',
          success: false,
          error: 'Login timed out. Please try again.',
        })
      }
    } catch (error) {
      this.post({
        type: 'loginResult',
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  public signOut(): void {
    this.loginCancellation = true
    void this.poller?.release()
    this.runner?.resetClient()
    clearUserCredentials()
    this.post({ type: 'auth', auth: { signedIn: false } })
  }

  public newChat(): void {
    this.runner?.newChat()
    this.toolGate?.cancelAll()
    this.messages = []
    this.attachedFiles = []
    this.pushState()
  }

  public stopRun(): void {
    this.runner?.abort()
    this.toolGate?.cancelAll()
    this.running = false
    this.messages = this.messages.map((message) =>
      message.streaming ? { ...message, streaming: false } : message,
    )
    this.pushState()
  }

  public async pickModel(): Promise<void> {
    const models = this.models.length > 0 ? this.models : getModelsForAccessTier(null)
    const picked = await vscode.window.showQuickPick(
      models.map((model) => ({
        label: model.displayName,
        description: model.premium ? 'premium' : undefined,
        detail: `${model.tagline}${model.warning ? ` — ${model.warning}` : ''}`,
        model,
      })),
      { placeHolder: 'Select a free model' },
    )
    if (picked) {
      this.selectedModelId = picked.model.id
      this.post({
        type: 'models',
        models: this.models,
        selectedModelId: this.selectedModelId,
      })
      void this.poller?.join(picked.model.id)
    }
  }

  private pushState(): void {
    this.post({
      type: 'state',
      messages: this.messages,
      running: this.running,
    })
  }

  private post(message: HostMessage): void {
    void this.view?.webview.postMessage(message)
  }

  private buildHtml(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview.js'),
    )
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview.css'),
    )
    const nonce = getNonce()
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} data:; script-src 'nonce-${nonce}'; font-src ${webview.cspSource};">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="${styleUri}">
<style>
  html, body { height: 100%; margin: 0; padding: 0; }
  body { font-family: var(--vscode-font-family); font-size: var(--vscode-font-size); }
  #root { height: 100%; }
</style>
</head>
<body>
<div id="root"></div>
<script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`
  }
}

function getNonce(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let nonce = ''
  for (let i = 0; i < 32; i++) {
    nonce += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return nonce
}
