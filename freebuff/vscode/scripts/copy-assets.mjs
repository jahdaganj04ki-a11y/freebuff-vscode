#!/usr/bin/env node

/**
 * Copies runtime assets that esbuild cannot inline so the vsix is
 * self-contained:
 * - tree-sitter wasm payloads -> dist/wasm (loaded via the SDK's setWasmDir),
 *   sourced from the @vscode/tree-sitter-wasm package.
 * - ripgrep binaries -> vendor/ripgrep (picked up via CODEBUFF_RG_PATH),
 *   mirrored from the monorepo's sdk/vendor/ripgrep when present; otherwise
 *   the extension host falls back to VS Code's bundled ripgrep.
 */

import { cpSync, existsSync, mkdirSync, readdirSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function copyWasm() {
  const src = resolve(root, 'node_modules/@vscode/tree-sitter-wasm/wasm')
  const dest = resolve(root, 'dist/wasm')
  if (existsSync(src)) {
    mkdirSync(resolve(root, 'dist'), { recursive: true })
    cpSync(src, dest, { recursive: true })
    console.log(
      `[copy-assets] wasm -> dist/wasm (${readdirSync(dest).length} files)`,
    )
  } else {
    console.warn('[copy-assets] @vscode/tree-sitter-wasm/wasm not found — run npm install')
  }
}

function copyRipgrep() {
  const src = resolve(root, '../../sdk/vendor/ripgrep')
  if (existsSync(src)) {
    const dest = resolve(root, 'vendor/ripgrep')
    mkdirSync(dest, { recursive: true })
    cpSync(src, dest, { recursive: true })
    const platforms = readdirSync(dest).join(', ')
    console.log(`[copy-assets] ripgrep -> vendor/ripgrep (${platforms})`)
  } else {
    console.warn(
      "[copy-assets] no bundled ripgrep found; the extension falls back to VS Code's own ripgrep.",
    )
  }
}

copyWasm()
copyRipgrep()
