/**
 * Chat runner: owns the CodebuffClient, streams runs with costMode 'free'
 * against the root agent for the selected free model, and forwards
 * SDK events to the panel.
 */

import * as vscode from 'vscode'
import * as fs from 'fs'

import {
  CodebuffClient,
  setWasmDir,
  type RunState,
} from '@codebuff/sdk'
import type { PrintModeEvent } from '@codebuff/common/types/print-mode'

import { formatToolOutput, summarizeToolCall } from './tools'
import { getRootAgentIdForModel } from './models'
import { FREE_AGENT_DEFINITIONS } from './free-agents'

export interface RunnerEvents {
  onText: (text: string) => void
  onReasoning: (text: string) => void
  onSubagent: (line: string) => void
  onToolCall: (toolCallId: string, toolName: string, summary: string) => void
  onToolResult: (toolCallId: string, toolName: string, detail: string, isError: boolean) => void
  onError: (message: string) => void
  onFinish: () => void
  onStarted: () => void
}

/** Token-level stream chunk from the SDK. */
type StreamChunk =
  | string
  | { type: 'subagent_chunk'; agentId: string; agentType: string; chunk: string }
  | { type: 'reasoning_chunk'; agentId: string; ancestorRunIds: string[]; chunk: string }

let wasmWired = false

/** Points the SDK at the wasm assets shipped inside dist/wasm. Safe to call once. */
export function wireWasmPaths(context: vscode.ExtensionContext): void {
  if (wasmWired) return
  wasmWired = true
  try {
    const wasmDir = vscode.Uri.joinPath(context.extensionUri, 'dist', 'wasm').fsPath
    setWasmDir(wasmDir)
  } catch {
    // Tree-sitter is an optimization for context gathering; the run still works.
  }
  try {
    const rg = findRipgrep()
    if (rg) process.env.CODEBUFF_RG_PATH = rg
  } catch {
    // The SDK falls back to its own vendor lookup.
  }
}

/** Chains: CODEBUFF_RG_PATH -> extension vendor -> VS Code's bundled rg. */
function findRipgrep(): string | null {
  const platformDir =
    process.platform === 'win32'
      ? process.arch === 'arm64'
        ? 'arm64-win32'
        : 'x64-win32'
      : process.platform === 'darwin'
        ? process.arch === 'arm64'
          ? 'arm64-darwin'
          : 'x64-darwin'
        : process.arch === 'arm64'
          ? 'arm64-linux'
          : 'x64-linux'
  const binary = process.platform === 'win32' ? 'rg.exe' : 'rg'
  const extensionRoot =
    vscode.extensions.getExtension('freebuff.freebuff')?.extensionUri ??
    vscode.Uri.file('.')
  const candidates = [
    vscode.Uri.joinPath(
      extensionRoot,
      'vendor',
      'ripgrep',
      platformDir,
      binary,
    ).fsPath,
    `${vscode.env.appRoot}/node_modules/@vscode/ripgrep/bin/${binary}`,
  ]
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

export class ChatRunner {
  private client: CodebuffClient | null = null
  private abortController: AbortController | null = null
  private previousRun: RunState | null = null
  private _running = false

  public constructor(
    private cwd: string,
    private getApiKey: () => string | null,
    private buildOverrides: () => Parameters<CodebuffClient['run']>[0]['overrideTools'],
    private events: RunnerEvents,
  ) {}

  public get running(): boolean {
    return this._running
  }

  public resetClient(): void {
    this.client = null
  }

  public newChat(): void {
    this.abort()
    this.previousRun = null
  }

  public abort(): void {
    this.abortController?.abort()
    this.abortController = null
    this._running = false
  }

  public async send(
    prompt: string,
    images: string[],
    modelId: string,
  ): Promise<RunState | null> {
    const apiKey = this.getApiKey()
    if (!apiKey) {
      this.events.onError('Not signed in. Use Freebuff: Sign In first.')
      return null
    }

    const rootAgent = getRootAgentIdForModel(modelId)
    if (!rootAgent) {
      this.events.onError(`No free-mode agent is registered for model ${modelId}.`)
      return null
    }

    if (!this.client) {
      this.client = new CodebuffClient({
        apiKey,
        cwd: this.cwd,
        agentDefinitions: FREE_AGENT_DEFINITIONS,
        overrideTools: this.buildOverrides(),
        handleEvent: (event) => this.handleEvent(event),
        handleStreamChunk: (chunk: StreamChunk) => {
          if (typeof chunk === 'string') {
            this.events.onText(chunk)
          } else if (chunk.type === 'reasoning_chunk') {
            this.events.onReasoning(chunk.chunk)
          } else if (chunk.type === 'subagent_chunk') {
            // Sub-agent chunks are surfaced as reasoning so they appear in the UI.
            this.events.onReasoning(chunk.chunk)
          }
        },
      })
    }

    this.abortController = new AbortController()
    this._running = true
    this.events.onStarted()

    const content: Array<{ type: 'text'; text: string } | { type: 'image'; image: string; mediaType: string }> = [
      { type: 'text', text: prompt },
      ...images.map((image) => ({
        type: 'image' as const,
        image,
        mediaType: 'image/png',
      })),
    ]

    try {
      const runState = await this.client.run({
        agent: rootAgent,
        prompt,
        content,
        previousRun: this.previousRun ?? undefined,
        costMode: 'free',
        signal: this.abortController.signal,
      })
      // The SDK reports a failed agent loop as a resolved RunState whose
      // output is an error object (it emits start/finish but no text), so
      // surface it here — otherwise the chat would silently do nothing.
      const output = (runState as { output?: { type?: string; message?: string } })
        ?.output
      if (output && output.type === 'error' && output.message) {
        this.events.onError(describeRunError(output.message))
      }
      this.previousRun = runState
      return runState
    } catch (error) {
      if (this.abortController?.signal.aborted) {
        // User pressed stop — not an error.
      } else {
        this.events.onError(error instanceof Error ? error.message : String(error))
      }
      return null
    } finally {
      this._running = false
      this.events.onFinish()
    }
  }

  private handleEvent(event: PrintModeEvent): void {
    switch (event.type) {
      case 'text':
        if (event.text) this.events.onText(event.text)
        break
      case 'tool_call':
        this.events.onToolCall(
          event.toolCallId,
          event.toolName,
          summarizeToolCall(event.toolName, event.input ?? {}),
        )
        break
      case 'tool_result': {
        const detail = formatToolOutput(event.output)
        const isError = /error/i.test(detail.slice(0, 200))
        this.events.onToolResult(event.toolCallId, event.toolName, detail, isError)
        break
      }
      case 'error':
        if (!event.source) {
          this.events.onError(event.message)
        }
        break
      case 'reasoning_delta':
        if (event.text) this.events.onReasoning(event.text)
        break
      case 'subagent_start':
        this.events.onSubagent(`↳ Subagent "${event.displayName}" started`)
        break
      case 'subagent_finish':
        this.events.onSubagent(`↳ Subagent "${event.displayName}" finished`)
        break
      case 'finish':
        break
      default:
        break
    }
  }
}

/**
 * Turn the SDK's raw run-error text into an actionable line. The free-mode
 * backend sheds a session with a 428 "waiting_room_required" whose text says
 * to send the message again; surface that instruction instead of the raw
 * Precondition-Required stack.
 */
function describeRunError(message: string): string {
  if (/waiting_room_required|free session has ended|send your message again/i.test(message)) {
    return 'Your free session ended before the reply started. Send your message again to start a fresh one. (If it repeats, another Freebuff client — the CLI or a second window — may be holding the single free-session slot.)'
  }
  return message
}
