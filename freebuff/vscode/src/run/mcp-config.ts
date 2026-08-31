/**
 * Load MCP server configurations from the user's ~/.agents/mcp.json file,
 * matching the CLI's loadMCPConfigSync behaviour.
 */

import os from 'os'
import path from 'path'
import fs from 'fs'

import { loadMCPConfigSync } from '@codebuff/sdk'

export interface LoadedMCPConfig {
  mcpServers: Record<string, { command?: string; args?: string[]; env?: Record<string, string>; url?: string }>
}

/**
 * Synchronously load MCP servers from ~/.agents/mcp.json.
 * Returns an empty record if the file doesn't exist or is invalid.
 */
export function loadUserMCPConfig(): LoadedMCPConfig {
  try {
    const result = loadMCPConfigSync({ verbose: false })
    return { mcpServers: result.mcpServers }
  } catch {
    return { mcpServers: {} }
  }
}
