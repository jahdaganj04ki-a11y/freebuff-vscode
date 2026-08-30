/**
 * overrideTools handlers: file edits go through a diff-approval gate,
 * ask_user questions are answered in the webview, and terminal commands
 * can be gated behind an approval card before delegating to the SDK's
 * own runner.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs'
import { isAbsolute, join, relative, resolve } from 'path'
import * as vscode from 'vscode'

import type { ChatMessage, ToolCallInfo } from '../shared/protocol'

export interface AskUserQuestion {
  question: string
  header?: string
  options: Array<{ label: string; description?: string }>
  multiSelect?: boolean
}

type Decision<T> = { approved: true; value: T } | { approved: false }

interface PendingApproval {
  kind: 'edit' | 'terminal'
  toolCallId: string
  label: string
  detail?: string
  resolve: (decision: Decision<void>) => void
}

interface PendingAskUser {
  toolCallId: string
  questions: AskUserQuestion[]
  resolve: (value: { answers: unknown[]; skipped: boolean }) => void
}

let approvalCounter = 0

export class ToolGate {
  private pendingApprovals = new Map<string, PendingApproval>()
  private pendingAskUser = new Map<string, PendingAskUser>()

  constructor(
    private cwd: string,
    private getAutoApproveEdits: () => boolean,
    private getAutoApproveTerminal: () => boolean,
    private onApprovalCard: (card: ChatMessage) => void,
    private onApprovalResolved: (toolCallId: string, approved: boolean, statusText: string) => void,
    private onAskCard: (card: ChatMessage) => void,
    private onAskResolved: (toolCallId: string) => void,
  ) {}

  /** Resolves an edit/terminal approval from the webview. */
  public resolveApproval(toolCallId: string, approved: boolean): void {
    const pending = this.pendingApprovals.get(toolCallId)
    if (!pending) return
    this.pendingApprovals.delete(toolCallId)
    this.onApprovalResolved(toolCallId, approved, approved ? 'done' : 'rejected')
    pending.resolve(approved ? { approved: true, value: undefined } : { approved: false })
  }

  /** Resolves an ask_user card from the webview. */
  public resolveAskUser(
    toolCallId: string,
    answers: Array<{ questionIndex: number; selectedOption?: string; selectedOptions?: string[]; otherText?: string }>,
    skipped: boolean,
  ): void {
    const pending = this.pendingAskUser.get(toolCallId)
    if (!pending) return
    this.pendingAskUser.delete(toolCallId)
    this.onAskResolved(toolCallId)
    pending.resolve({ answers, skipped })
  }

  /** Cancels everything pending (run aborted). */
  public cancelAll(): void {
    for (const pending of this.pendingApprovals.values()) {
      pending.resolve({ approved: false })
    }
    this.pendingApprovals.clear()
    for (const pending of this.pendingAskUser.values()) {
      pending.resolve({ answers: [], skipped: true })
    }
    this.pendingAskUser.clear()
  }

  public buildOverrides(): {
    write_file: (input: { path: string; content: string; instructions?: string }) => Promise<Array<{ type: 'json'; value: Record<string, unknown> }>>
    str_replace: (input: { path: string; replacements: Array<{ oldString: string; newString: string; allowMultiple?: boolean }> }) => Promise<Array<{ type: 'json'; value: Record<string, unknown> }>>
    ask_user: (input: { questions: AskUserQuestion[] }) => Promise<Array<{ type: 'json'; value: Record<string, unknown> }>>
    run_terminal_command: (input: Record<string, unknown> & { command?: string }) => Promise<Array<{ type: 'json'; value: Record<string, unknown> }>>
  } {
    return {
      write_file: async (input) => {
        const absPath = this.resolvePath(input.path)
        const before = existsSync(absPath) ? readFileSync(absPath, 'utf8') : null
        const approved = this.getAutoApproveEdits()
          ? true
          : await this.requestEditApproval(input.path, before, input.content)
        if (!approved) {
          return [
            { type: 'json', value: { file: input.path, errorMessage: 'User rejected this edit.' } },
          ]
        }
        writeFileSync(absPath, input.content)
        this.openInEditor(absPath)
        return [
          { type: 'json', value: { file: input.path, message: `Wrote ${input.path}` } },
        ]
      },

      str_replace: async (input) => {
        const absPath = this.resolvePath(input.path)
        if (!existsSync(absPath)) {
          return [
            { type: 'json', value: { file: input.path, errorMessage: `File not found: ${input.path}` } },
          ]
        }
        const before = readFileSync(absPath, 'utf8')
        let after = before
        for (const replacement of input.replacements ?? []) {
          const count = after.split(replacement.oldString).length - 1
          if (count === 0) {
            return [
              {
                type: 'json',
                value: {
                  file: input.path,
                  errorMessage: `oldString not found in ${input.path}`,
                },
              },
            ]
          }
          if (count > 1 && !replacement.allowMultiple) {
            return [
              {
                type: 'json',
                value: {
                  file: input.path,
                  errorMessage: `oldString found ${count} times in ${input.path}; pass allowMultiple to replace all`,
                },
              },
            ]
          }
          after = replacement.allowMultiple
            ? after.split(replacement.oldString).join(replacement.newString)
            : after.replace(replacement.oldString, replacement.newString)
        }
        const approved = this.getAutoApproveEdits()
          ? true
          : await this.requestEditApproval(input.path, before, after)
        if (!approved) {
          return [
            { type: 'json', value: { file: input.path, errorMessage: 'User rejected this edit.' } },
          ]
        }
        writeFileSync(absPath, after)
        this.openInEditor(absPath)
        return [
          { type: 'json', value: { file: input.path, message: `Edited ${input.path}` } },
        ]
      },

      ask_user: async (input) => {
        const questions = input.questions ?? []
        const toolCallId = `ask-${Date.now()}-${approvalCounter++}`
        const answer = await new Promise<{ answers: unknown[]; skipped: boolean }>((resolve) => {
          this.pendingAskUser.set(toolCallId, { toolCallId, questions, resolve })
          this.onAskCard({
            id: toolCallId,
            role: 'assistant',
            text: '',
            toolCalls: [
              {
                toolCallId,
                toolName: 'ask_user',
                status: 'pending',
                summary: 'Questions for you',
                detail: JSON.stringify(questions),
              },
            ],
            timestamp: Date.now(),
          })
        })
        return [{ type: 'json', value: answer as Record<string, unknown> }]
      },

      run_terminal_command: async (input) => {
        const command = typeof input.command === 'string' ? input.command : String(input.command ?? '')
        if (!this.getAutoApproveTerminal()) {
          const approved = await this.requestTerminalApproval(command)
          if (!approved) {
            return [
              {
                type: 'json',
                value: { command, errorMessage: 'User rejected this command.' },
              },
            ]
          }
        }
        // Delegate to the SDK's own runner — same process model the CLI uses.
        const { runTerminalCommand } = await import('@codebuff/sdk')
        return runTerminalCommand({
          command,
          process_type: (input.process_type as 'SYNC' | 'BACKGROUND') ?? 'SYNC',
          cwd: this.cwd,
          timeout_seconds: (input.timeout_seconds as number) ?? 120,
          env: input.env as NodeJS.ProcessEnv | undefined,
        }) as unknown as Array<{ type: 'json'; value: Record<string, unknown> }>
      },
    }
  }

  private resolvePath(path: string): string {
    if (isAbsolute(path)) return path
    return resolve(this.cwd, path)
  }

  private async requestEditApproval(
    displayPath: string,
    before: string | null,
    after: string,
  ): Promise<boolean> {
    const toolCallId = `edit-${Date.now()}-${approvalCounter++}`
    await this.showDiff(displayPath, before, after)
    return new Promise<boolean>((resolve) => {
      this.pendingApprovals.set(toolCallId, {
        kind: 'edit',
        toolCallId,
        label: `${before === null ? 'Create' : 'Edit'} ${displayPath}`,
        detail: before === null ? 'New file' : 'Existing file',
        resolve: (decision) => resolve(decision.approved),
      })
      this.onApprovalCard({
        id: toolCallId,
        role: 'assistant',
        text: '',
        toolCalls: [
          {
            toolCallId,
            toolName: before === null ? 'write_file' : 'str_replace',
            status: 'pending',
            summary: `${before === null ? 'Create' : 'Edit'} ${displayPath}`,
            approval: { filePath: displayPath, kind: before === null ? 'write_file' : 'str_replace', before, after },
          },
        ],
        timestamp: Date.now(),
      })
    })
  }

  private async requestTerminalApproval(command: string): Promise<boolean> {
    const toolCallId = `term-${Date.now()}-${approvalCounter++}`
    return new Promise<boolean>((resolve) => {
      this.pendingApprovals.set(toolCallId, {
        kind: 'terminal',
        toolCallId,
        label: 'Run command',
        detail: command,
        resolve: (decision) => resolve(decision.approved),
      })
      this.onApprovalCard({
        id: toolCallId,
        role: 'assistant',
        text: '',
        toolCalls: [
          {
            toolCallId,
            toolName: 'run_terminal_command',
            status: 'pending',
            summary: 'Run command',
            detail: command,
          },
        ],
        timestamp: Date.now(),
      })
    })
  }

  private async showDiff(displayPath: string, before: string | null, after: string): Promise<void> {
    const relPath = this.toWorkspaceRelative(displayPath)
    const uri = vscode.Uri.joinPath(vscode.Uri.file(this.cwd), relPath)
    const afterUri = uri.with({ scheme: 'freebuff-diff', query: encodeURIComponent(after) })
    try {
      await vscode.commands.executeCommand(
        'vscode.diff',
        uri,
        afterUri,
        `${relPath} (Freebuff proposed)`,
        { preview: true, preserveFocus: true },
      )
    } catch {
      // Diff preview is best-effort; approval still works from the chat card.
    }
  }

  private toWorkspaceRelative(displayPath: string): string {
    const abs = this.resolvePath(displayPath)
    const rel = relative(this.cwd, abs)
    return rel && !rel.startsWith('..') ? rel : displayPath
  }

  private async openInEditor(absPath: string): Promise<void> {
    try {
      await vscode.window.showTextDocument(vscode.Uri.file(absPath), {
        preserveFocus: true,
        preview: true,
      })
    } catch {
      // Non-text files can't open in the editor; the write still happened.
    }
  }
}

/** Registers the virtual-document provider backing freebuff-diff:// views. */
export class DiffContentProvider implements vscode.TextDocumentContentProvider {
  public provideTextDocumentContent(uri: vscode.Uri): string {
    return decodeURIComponent(uri.query)
  }
}

export function summarizeToolCall(toolName: string, input: Record<string, unknown>): string {
  switch (toolName) {
    case 'read_files':
      return `Read ${(input.filePaths as string[])?.length ?? 0} file(s)`
    case 'write_file':
      return `Write ${input.path}`
    case 'str_replace':
      return `Edit ${input.path}`
    case 'run_terminal_command':
      return `$ ${(input.command as string) ?? ''}`.slice(0, 120)
    case 'find_files':
      return `Find files: ${input.pattern ?? ''}`
    case 'list_directory':
      return `List ${input.path ?? '.'}`
    case 'code_search':
      return `Search: ${input.query ?? ''}`
    case 'read_url':
      return `Read URL: ${input.url ?? ''}`
    case 'web_search':
      return `Web search: ${input.query ?? ''}`
    case 'skill':
      return `Skill: ${input.skillName ?? input.path ?? ''}`
    default:
      return toolName.replace(/_/g, ' ')
  }
}

export function formatToolOutput(output: unknown): string {
  if (Array.isArray(output)) {
    return output
      .map((item) => {
        if (item && typeof item === 'object' && 'type' in item) {
          if (item.type === 'json' && 'value' in item) {
            const value = item.value as Record<string, unknown>
            if (typeof value.errorMessage === 'string') return value.errorMessage
            return JSON.stringify(value, null, 2).slice(0, 2000)
          }
          if (item.type === 'text' && 'text' in item) {
            return String(item.text).slice(0, 2000)
          }
        }
        return String(item).slice(0, 500)
      })
      .join('\n')
      .slice(0, 4000)
  }
  if (typeof output === 'string') return output.slice(0, 4000)
  try {
    return JSON.stringify(output, null, 2)?.slice(0, 2000) ?? ''
  } catch {
    return ''
  }
}
