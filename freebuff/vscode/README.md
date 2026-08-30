# Freebuff for VS Code / VSCodium

A free AI coding agent inside your editor — the full Freebuff experience
(chat, file edits with diff approval, terminal commands, free model catalog)
as a VS Code / VSCodium extension, comparable to Cline, Continue, and
GitHub Copilot Chat.

## Features

- **Agent chat sidebar** — streaming responses, live tool-call display,
  multi-turn conversations.
- **Free model catalog** — pick between Freebuff's included models
  (GPT-5.6 Luna, DeepSeek V4 Flash, MiMo 2.5, GLM 5.3 Flash, Solar Pro 4,
  …). No API key, no subscription.
- **Diff-approved edits** — every file edit opens a diff and waits for your
  Accept/Reject, like Cline.
- **Terminal execution** — commands run with an approval gate; output
  streams into the chat.
- **Session & quota status** — live session state, daily session usage,
  rate-limit resets.
- **Shared sign-in with the Freebuff CLI** — an existing CLI login works
  instantly; the extension stores the token in the same credentials file
  (`~/.config/manicode/credentials.json`).
- **Images** — paste or attach screenshots for multimodal models.
- **@-file mentions** — attach workspace files to your prompt.

## Getting started

1. Open the Freebuff icon in the activity bar.
2. Sign in with your Freebuff account (browser login; the token is shared
   with the CLI).
3. Pick a model and start chatting.

## Commands

| Command | Description |
| --- | --- |
| `Freebuff: Sign In` | Start the browser login flow |
| `Freebuff: Sign Out` | Clear the shared token |
| `Freebuff: New Chat` | Reset the conversation |
| `Freebuff: Select Model` | QuickPick over the free catalog |
| `Freebuff: Stop Current Run` | Abort the running agent |

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `freebuff.autoApproveEdits` | `false` | Apply file edits without diff approval |
| `freebuff.autoApproveTerminal` | `false` | Run terminal commands without approval |
| `freebuff.appUrl` | `https://www.codebuff.com` | Backend base URL — keep the `www` origin |

## Build from source

Requires Node 22+ (VS Code stable already ships Node 22).

```bash
cd freebuff/vscode
npm install
npm run build          # bundles host + webview
npm run copy-assets    # wasm + ripgrep runtime assets
npm run package        # -> freebuff-vscode-0.1.0.vsix
```

Install the VSIX:

```bash
code --install-extension freebuff-vscode-0.1.0.vsix
# VSCodium:
codium --install-extension freebuff-vscode-0.1.0.vsix
```

For development, open `freebuff/vscode` in VS Code and press F5
(Extension Development Host).

## Architecture

```
src/
├── extension.ts      # activation, webview provider, command wiring
├── auth.ts           # shared credentials + browser login flow
├── session/          # free-mode session admission API + poller
├── run/              # CodebuffClient wrapper, model catalog, tool gates
└── webview/          # React chat UI (bundled for the webview)
```

The model catalog, agent mapping, and session wire types are imported
directly from the monorepo's `common/src` (aliased at build time), so the
extension can never drift from the Freebuff CLI. The agent runtime itself
comes from [`@codebuff/sdk`](https://www.npmjs.com/package/@codebuff/sdk)
and runs in the extension host with `costMode: 'free'`.

## License

Apache-2.0
