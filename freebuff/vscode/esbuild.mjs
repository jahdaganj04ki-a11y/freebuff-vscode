#!/usr/bin/env node

/**
 * Bundles the extension host (Node) and the webview (browser) separately.
 *
 * Host: bundles src/extension.ts with everything except 'vscode' inlined.
 * The SDK's tree-sitter wasm binaries and ripgrep vendors cannot be inlined
 * by esbuild — scripts/copy-assets.mjs copies them from the installed
 * @codebuff/sdk package into dist/wasm and vendor/ripgrep so the vsix is
 * self-contained (node_modules is not shipped).
 *
 * Webview: bundles src/webview/main.tsx as an IIFE for the webview Chromium.
 *
 * Shared constants (model catalog, agent map, session wire types) are aliased
 * to the monorepo's common/src so the extension cannot drift from the CLI.
 */

import { build, context } from 'esbuild'
import { cpSync, mkdirSync, existsSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const production = process.argv.includes('--production')
const watch = process.argv.includes('--watch')

// Bundle the monorepo SDK from source (the published 0.10.7 package cannot
// speak the current free-mode wire protocol). The workspace packages are
// aliased to their src trees so the extension matches the CLI exactly.
const hostAlias = {
  '@codebuff/sdk': resolve(__dirname, '../../sdk/src/index.ts'),
  '@codebuff/common': resolve(__dirname, '../../common/src'),
  '@codebuff/llm-providers': resolve(
    __dirname,
    '../../packages/llm-providers/src',
  ),
  '@codebuff/agent-runtime': resolve(
    __dirname,
    '../../packages/agent-runtime/src',
  ),
  '@codebuff/code-map': resolve(__dirname, '../../packages/code-map/src'),
}

const hostOptions = {
  entryPoints: [resolve(__dirname, 'src/extension.ts')],
  bundle: true,
  outfile: resolve(__dirname, 'dist/extension.js'),
  format: 'cjs',
  platform: 'node',
  target: 'node22',
  external: [
    'vscode',
    '@jitl/quickjs-wasmfile-release-sync',
    '@vscode/tree-sitter-wasm',
  ],
  alias: hostAlias,
  // The monorepo source files live outside this package, so their third-party
  // imports must resolve against the extension's own node_modules.
  nodePaths: [resolve(__dirname, 'node_modules')],
  loader: { '.scm': 'text' },
  sourcemap: !production,
  minify: production,
  logLevel: 'info',
  define: {
    'process.env.NODE_ENV': production ? '"production"' : '"development"',
    'process.env.FREEBUFF_VSCODE': '"true"',
  },
}

const webviewOptions = {
  entryPoints: [resolve(__dirname, 'src/webview/main.tsx')],
  bundle: true,
  outfile: resolve(__dirname, 'dist/webview.js'),
  format: 'iife',
  platform: 'browser',
  target: 'es2022',
  jsx: 'automatic',
  sourcemap: false,
  minify: production,
  logLevel: 'info',
  define: {
    'process.env.NODE_ENV': production ? '"production"' : '"development"',
  },
}

/** Copies the tree-sitter wasm payloads the SDK loads at runtime, so the
 *  extension ships a self-contained wasm dir inside dist/. */
function copyWasmAssets() {
  const wasmSrc = resolve(
    __dirname,
    'node_modules/@codebuff/sdk/dist/wasm',
  )
  const wasmDest = resolve(__dirname, 'dist/wasm')
  if (existsSync(wasmSrc)) {
    mkdirSync(dirname(wasmDest), { recursive: true })
    cpSync(wasmSrc, wasmDest, { recursive: true })
    console.log(`[assets] copied tree-sitter wasm -> ${wasmDest}`)
  } else {
    console.warn(
      '[assets] @codebuff/sdk wasm not found; skipping wasm copy (run npm install)',
    )
  }
}

async function main() {
  if (watch) {
    const hostCtx = await context(hostOptions)
    const webviewCtx = await context(webviewOptions)
    await Promise.all([hostCtx.watch(), webviewCtx.watch()])
    console.log('[esbuild] watching...')
  } else {
    await build(hostOptions)
    await build(webviewOptions)
    copyWasmAssets()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
