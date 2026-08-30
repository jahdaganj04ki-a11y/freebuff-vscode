# Freebuff for VS Code / VSCodium — Design

**Date:** 2026-08-30
**Status:** Approved (architecture: SDK in extension host; full Cline-like UI; shared CLI credentials; VSIX + CI packaging)

## Goal

A VS Code / VSCodium extension ("Freebuff") that exposes the full Freebuff
agent experience inside the editor, comparable to Cline, Continue, and
GitHub Copilot Chat: a sidebar chat with streaming agent responses, live
tool-call display, editable diff approval, terminal execution, model
picker over Freebuff's free model catalog, session/queue status, and
shared authentication with the Freebuff CLI.

## Location & Packaging

`freebuff/vscode/` — follows the product-directory pattern (`freebuff/cli/`,
future `freebuff/web/`). Standalone npm package (not added to the Bun
workspaces list) so the extension keeps its own dependency tree (npm, not
bun) and its build (esbuild + @vscode/vsce).

```
freebuff/vscode/
├── package.json        # extension manifest + npm metadata
├── tsconfig.json
├── esbuild.mjs         # bundles host (external: 'vscode') and webview
├── .vscodeignore
├── src/
│   ├── extension.ts    # activation, commands, view container
│   ├── auth.ts         # shared credentials file + browser login flow
│   ├── session/
│   │   ├── session-api.ts     # port of cli/src/utils/freebuff-session-api.ts
│   │   └── session-poller.ts  # queue/rate-limit/end state → webview
│   ├── run/
│   │   ├── runner.ts   # CodebuffClient wrapper: run(), costMode 'free'
│   │   ├── tools.ts    # overrideTools: file edits → diff approval, ask_user
│   │   └── models.ts   # model catalog + model→root-agent mapping
│   └── webview/        # React chat UI (bundled separately, VS Code CSS vars)
└── media/              # activity-bar icon
```

## Dependency Strategy

- `@codebuff/sdk` (npm, pinned to the repo's SDK version) provides
  `CodebuffClient`, `RunState`, `loadLocalAgents`, `loadSkills`,
  `runTerminalCommand`, `setWasmDir`, `setTreeSitterWasmPath`, error utils.
- Shared constants (`FREEBUFF_MODELS`,
  `getFreebuffModelsForAccessTier`, `FREEBUFF_CLI_BASE3_AGENT_ID_BY_MODEL`,
  `FREEBUFF_MODEL_HEADER`, …) are aliased at build time via esbuild/tsconfig
  paths to `common/src/…` so the extension can never drift from the
  monorepo catalog.

## Core Flows

1. **Chat send** — webview → host `send` → freebuff session admission
   (`POST {app}/api/v1/freebuff/session`, Bearer token,
   `FREEBUFF_MODEL_HEADER`) → `client.run({ agent: rootAgentForModel,
   prompt, content, previousRun, costMode: 'free', handleEvent,
   handleStreamChunk, signal })`. Events stream back to the webview;
   `previousRun` (RunState) continues the conversation.
2. **File edits** — `overrideTools` intercepts `write_file` / `str_replace`:
   show a diff (provisional tab via `vscode.diff`), user approves/rejects;
   on approval the edit is applied to the real file. Setting
   `freebuff.autoApproveEdits` skips approval.
3. **Terminal** — `run_terminal_command` executes in the VS Code integrated
   terminal; output streams back through the SDK terminal command broker.
4. **Model picker** — composer dropdown fed by
   `getFreebuffModelsForAccessTier(accessTier, hasPaidSubscription)`;
   selection stored in workspaceState; drives root-agent id and session
   admission header. Availability/premium/data-use metadata shown.
5. **Auth** — reads `~/.config/manicode/credentials.json` (shared with the
   CLI, so an existing CLI login works instantly). `Freebuff: Sign In`
   opens the browser login flow (port of `generateLoginUrl` /
   `pollLoginStatus`) and writes the token to the same file.
   `Freebuff: Sign Out` clears it.
6. **Session/queue** — poller port of `use-freebuff-session.ts`: GET
   polling while active (compact mode), queue position, rate limits,
   `ended` / `country_blocked` / `model_locked` / `superseded` states →
   banner + status bar. DELETE on chat dispose/extension deactivate.

## Webview UI

Activity-bar icon → sidebar webview:

- Header: login state, active model, session status chip.
- Message list: user/assistant messages (markdown, streaming), tool-call
  cards (read/edit/terminal with expandable output), error states.
- Composer: textarea, @-file mentions (VS Code QuickPick over workspace
  files), image paste/attach, model picker, New Chat button, Stop button.
- Native theming via VS Code CSS variables; no external UI framework
  beyond React.

## Commands & Configuration

- Commands: `freebuff.signIn`, `freebuff.signOut`, `freebuff.newChat`,
  `freebuff.openSettings`, `freebuff.selectModel`.
- Settings: `freebuff.autoApproveEdits` (default false),
  `freebuff.autoApproveTerminal` (default false), `freebuff.appUrl`
  (default `https://codebuff.com`).

## Packaging & CI

- `npm run package` → esbuild → `vsce package` → `freebuff-vscode-<ver>.vsix`.
- Tree-sitter/wasm and ripgrep assets from `@codebuff/sdk` dependencies are
  copied into `dist/` and wired via `setWasmDir` / `setTreeSitterWasmPath`.
- GitHub workflow `freebuff-vscode-release.yml`: install → build →
  package vsix → upload artifact (publish step manual-only).

## Risks & Mitigations

- **Node version in extension host** — SDK requires Node ≥ 22; current
  VS Code stable ships Node 22. Declared via `engines.vscode`.
- **Wasm/native assets in the vsix** — wired explicitly through the SDK's
  loader hooks; `vsce ls` audited in CI.
- **Session protocol subtleties** — the session API port keeps the CLI's
  failure classification (POST is not idempotent; only 408/429/503 retried).

## Out of Scope (v1)

- Marketplace / Open VSX publishing (VSIX artifact only).
- Ad rendering (server-side freebuff ad slots are not part of the
  extension UI; free access still governed by session admission).
- Parallel multi-root sessions beyond one active chat per window.
