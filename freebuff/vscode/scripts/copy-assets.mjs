#!/usr/bin/env node

/**
 * Copies runtime assets that esbuild cannot inline, sourced from the
 * installed @codebuff/sdk package so the vsix is self-contained:
 * - tree-sitter wasm payloads -> dist/wasm (loaded via the SDK's setWasmDir)
 * - ripgrep binaries for all platforms -> vendor/ripgrep
 *   (picked up via CODEBUFF_RG_PATH set by the extension host)
 */

import { cpSync, existsSync, mkdirSync, readdirSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const SDK_DIST = resolve(root, 'node_modules/@codebuff/sdk/dist')

function copyWasm() {
  const src = resolve(SDK_DIST, 'wasm')
  const dest = resolve(root, 'dist/wasm')
  if (existsSync(src)) {
    mkdirSync(resolve(root, 'dist'), { recursive: true })
    cpSync(src, dest, { recursive: true })
    console.log(
      `[copy-assets] wasm -> dist/wasm (${readdirSync(dest).length} files)`,
    )
  } else {
    console.warn('[copy-assets] @codebuff/sdk/dist/wasm not found — run npm install')
  }
}

function copyRipgrep() {
  const src = resolve(SDK_DIST, 'vendor/ripgrep')
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
