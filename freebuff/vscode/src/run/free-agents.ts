/**
 * The base3 free-mode root agents. The SDK validates the requested root agent
 * against `agentDefinitions`, and the registry does not know these ids — so
 * the extension ships the same definitions the CLI bundles.
 *
 * Loaded via static `require` so esbuild inlines them into the bundle while
 * `tsc` keeps type-checking against the published SDK types instead of pulling
 * the whole monorepo source graph into the extension's type check.
 */

import type { AgentDefinition } from '@codebuff/sdk'
import type { MCPConfig } from '@codebuff/common/types/mcp'
import { loadUserMCPConfig } from './mcp-config'

const BASE_AGENTS: AgentDefinition[] = [
  require('../../../../agents/base3-free-deepseek').default,
  require('../../../../agents/base3-free-deepseek-flash').default,
  require('../../../../agents/base3-free-fable').default,
  require('../../../../agents/base3-free-glm').default,
  require('../../../../agents/base3-free-glm-5-3-flash').default,
  require('../../../../agents/base3-free-luna').default,
  require('../../../../agents/base3-free-mimo').default,
  require('../../../../agents/base3-free-minimax-m3').default,
  require('../../../../agents/base3-free-ox-alpha').default,
  require('../../../../agents/base3-free-solar-pro4').default,
] as AgentDefinition[]

/**
 * Agent definitions with MCP servers loaded from ~/.agents/mcp.json.
 * Call this once at startup to get agents with MCP config merged in.
 */
export async function loadFreeAgentDefinitions(): Promise<AgentDefinition[]> {
  const mcpConfig = loadUserMCPConfig()
  if (Object.keys(mcpConfig.mcpServers).length === 0) {
    return BASE_AGENTS
  }

  // Merge MCP servers into each agent definition so the SDK can route
  // tool calls through the MCP client when an agent references them.
  // Filter out invalid configs (those without required 'command' field)
  const validMcpServers: Record<string, MCPConfig> = {}
  for (const [name, config] of Object.entries(mcpConfig.mcpServers)) {
    if ('command' in config && config.command) {
      validMcpServers[name] = config as MCPConfig
    }
  }

  if (Object.keys(validMcpServers).length === 0) {
    return BASE_AGENTS
  }

  return BASE_AGENTS.map((agent) => ({
    ...agent,
    mcpServers: {
      ...agent.mcpServers,
      ...validMcpServers,
    },
  }))
}

/**
 * Synchronous fallback for when async loading isn't possible.
 * Returns base agents without MCP config.
 */
export const FREE_AGENT_DEFINITIONS: AgentDefinition[] = BASE_AGENTS
