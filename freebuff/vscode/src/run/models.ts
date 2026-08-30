/**
 * Model catalog access — sourced directly from the monorepo's shared
 * constants so the extension's picker can never drift from the CLI's.
 */

import { FREEBUFF_CLI_BASE3_AGENT_ID_BY_MODEL } from '@codebuff/common/constants/free-agents'
import { getFreebuffModelsForAccessTier } from '@codebuff/common/constants/freebuff-models'

import type { ModelInfo } from '../shared/protocol'
import type { FreebuffModelOption } from '@codebuff/common/constants/freebuff-models'

export function getModelsForAccessTier(
  accessTier: string | null | undefined,
  hasPaidSubscription = false,
): ModelInfo[] {
  const tier = accessTier === 'limited' ? 'limited' : 'full'
  const models = getFreebuffModelsForAccessTier(tier, hasPaidSubscription)
  return models.map(toModelInfo)
}

function toModelInfo(model: FreebuffModelOption): ModelInfo {
  return {
    id: model.id,
    displayName: model.displayName,
    tagline: model.tagline,
    availability: model.availability,
    premium: model.premium,
    multimodal: model.multimodal,
    warning: model.warning,
  }
}

/** Root agent id that runs the selected model (base3 single-loop harness). */
export function getRootAgentIdForModel(modelId: string): string | null {
  return FREEBUFF_CLI_BASE3_AGENT_ID_BY_MODEL[modelId] ?? null
}

export function getDefaultModelId(
  accessTier: string | null | undefined,
): string {
  const models = getModelsForAccessTier(accessTier ?? 'full')
  return models[0]?.id ?? 'openai/gpt-5.6-luna'
}

export function modelSupportsImages(modelId: string): boolean {
  return (
    getModelsForAccessTier('full').find((m) => m.id === modelId)
      ?.multimodal ?? false
  )
}
