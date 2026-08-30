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

export const FREE_AGENT_DEFINITIONS: AgentDefinition[] = [
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
