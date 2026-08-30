"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// .tmp-agents-entry.ts
var tmp_agents_entry_exports = {};
__export(tmp_agents_entry_exports, {
  FREE_AGENT_DEFINITIONS: () => FREE_AGENT_DEFINITIONS
});
module.exports = __toCommonJS(tmp_agents_entry_exports);

// ../../common/src/constants/model-config.ts
var openaiModels = {
  gpt4_1: "gpt-4.1-2025-04-14",
  gpt4o: "gpt-4o-2024-11-20",
  gpt4omini: "gpt-4o-mini-2024-07-18",
  o3mini: "o3-mini-2025-01-31",
  o3: "o3-2025-04-16",
  o3pro: "o3-pro-2025-06-10",
  o4mini: "o4-mini-2025-04-16",
  generatePatch: "ft:gpt-4o-2024-08-06:manifold-markets:generate-patch-batch2:AKYtDIhk"
};
var openrouterModels = {
  openrouter_claude_sonnet_4_5: "anthropic/claude-sonnet-4.5",
  openrouter_claude_sonnet_4: "anthropic/claude-4-sonnet-20250522",
  openrouter_claude_opus_4: "anthropic/claude-opus-4.1",
  openrouter_claude_3_5_haiku: "anthropic/claude-3.5-haiku-20241022",
  openrouter_claude_3_5_sonnet: "anthropic/claude-3.5-sonnet-20240620",
  openrouter_gpt4o: "openai/gpt-4o-2024-11-20",
  openrouter_gpt5: "openai/gpt-5.1",
  openrouter_gpt5_chat: "openai/gpt-5.1-chat",
  openrouter_gpt4o_mini: "openai/gpt-4o-mini-2024-07-18",
  openrouter_gpt4_1_nano: "openai/gpt-4.1-nano",
  openrouter_o3_mini: "openai/o3-mini-2025-01-31",
  openrouter_gemini2_5_pro_preview: "google/gemini-2.5-pro",
  openrouter_gemini2_5_flash: "google/gemini-2.5-flash",
  openrouter_gemini2_5_flash_thinking: "google/gemini-2.5-flash-preview:thinking",
  openrouter_grok_4: "x-ai/grok-4-07-09"
};
var deepseekModels = {
  deepseekChat: "deepseek-chat",
  deepseekReasoner: "deepseek-reasoner",
  deepseekV4ProDirect: "deepseek-v4-pro",
  deepseekV4Pro: "deepseek/deepseek-v4-pro",
  deepseekV4FlashDirect: "deepseek-v4-flash",
  deepseekV4Flash: "deepseek/deepseek-v4-flash"
};
var mimoModels = {
  mimoV25Direct: "mimo-v2.5",
  mimoV25: "mimo/mimo-v2.5",
  mimoV25ProDirect: "mimo-v2.5-pro",
  mimoV25Pro: "mimo/mimo-v2.5-pro"
};
var minimaxModels = {
  minimaxM3: "minimax/minimax-m3"
};
var moonshotModels = {
  kimiK26: "moonshotai/kimi-k2.6",
  kimiK27Code: "moonshotai/kimi-k2.7-code"
};
var finetunedVertexModels = {
  ft_filepicker_003: "196166068534771712",
  ft_filepicker_005: "8493203957034778624",
  ft_filepicker_007: "2589952415784501248",
  ft_filepicker_topk_001: "3676445825887633408",
  ft_filepicker_008: "2672143108984012800",
  ft_filepicker_topk_002: "1694861989844615168",
  ft_filepicker_010: "3808739064941641728",
  ft_filepicker_010_epoch_2: "6231675664466968576",
  ft_filepicker_topk_003: "1502192368286171136"
};
var finetunedVertexModelNames = {
  [finetunedVertexModels.ft_filepicker_003]: "ft_filepicker_003",
  [finetunedVertexModels.ft_filepicker_005]: "ft_filepicker_005",
  [finetunedVertexModels.ft_filepicker_007]: "ft_filepicker_007",
  [finetunedVertexModels.ft_filepicker_topk_001]: "ft_filepicker_topk_001",
  [finetunedVertexModels.ft_filepicker_008]: "ft_filepicker_008",
  [finetunedVertexModels.ft_filepicker_topk_002]: "ft_filepicker_topk_002",
  [finetunedVertexModels.ft_filepicker_010]: "ft_filepicker_010",
  [finetunedVertexModels.ft_filepicker_010_epoch_2]: "ft_filepicker_010_epoch_2",
  [finetunedVertexModels.ft_filepicker_topk_003]: "ft_filepicker_topk_003"
};
var models = {
  ...openaiModels,
  ...deepseekModels,
  ...mimoModels,
  ...minimaxModels,
  ...openrouterModels,
  ...finetunedVertexModels
};
var shortModelNames = {
  "gemini-2.5-pro": models.openrouter_gemini2_5_pro_preview,
  "flash-2.5": models.openrouter_gemini2_5_flash,
  "opus-4": models.openrouter_claude_opus_4,
  "sonnet-4.5": models.openrouter_claude_sonnet_4_5,
  "sonnet-4": models.openrouter_claude_sonnet_4,
  "sonnet-3.7": models.openrouter_claude_sonnet_4,
  "sonnet-3.6": models.openrouter_claude_3_5_sonnet,
  "sonnet-3.5": models.openrouter_claude_3_5_sonnet,
  "gpt-4.1": models.gpt4_1,
  "o3-mini": models.o3mini,
  o3: models.o3,
  "o4-mini": models.o4mini,
  "o3-pro": models.o3pro
};
var providerModelNames = {
  ...Object.fromEntries(
    Object.entries(openaiModels).map(([name, model]) => [
      model,
      "openai"
    ])
  ),
  ...Object.fromEntries(
    Object.entries(openrouterModels).map(([name, model]) => [
      model,
      "openrouter"
    ])
  )
};
var explicitlyDefinedModels = new Set(Object.values(models));
var nonCacheableModels = [
  models.openrouter_grok_4
];
var SMALL_CONTEXT_MODELS = /* @__PURE__ */ new Set([
  moonshotModels.kimiK27Code
]);

// ../../common/src/constants/freebuff-model-ids.ts
var FREEBUFF_DEEPSEEK_V4_FLASH_MODEL_ID = "deepseek/deepseek-v4-flash";
var FREEBUFF_DEEPSEEK_V4_PRO_MODEL_ID = "deepseek/deepseek-v4-pro";
var FREEBUFF_MINIMAX_M3_MODEL_ID = "minimax/minimax-m3";

// ../../common/src/constants/freebuff-data-use.ts
var POLICY_EFFECTIVE_DATE = "July 23, 2026";
var FREEBUFF_POLICY_ROLLOUT = {
  version: "2026-07-23",
  effectiveDate: POLICY_EFFECTIVE_DATE,
  lastUpdated: "07/23/2026",
  // Retired early, on 2026-08-20. The notice had run for a month and was
  // still covering the bottom of every marketing page; `policy-update-notice`
  // hides itself once this instant passes, so a past date is the off switch
  // and nothing about the policy copy itself changes.
  noticeEndsAt: "2026-08-20T00:00:00-07:00",
  notice: {
    title: `We\u2019ve updated our Terms and Privacy Policy, effective ${POLICY_EFFECTIVE_DATE}.`,
    summary: "Prompts may be used to personalize ads, AI training applies only to labeled models or features, and usage restrictions were updated."
  }
};
var FREEBUFF_AI_TRAINING_NOTICE = "May use data for AI training";
var FREEBUFF_PUBLIC_DATA_USE_COPY = {
  collectionQuestion: "Does Freebuff collect my data?",
  collectionAnswer: "Freebuff is supported by text ads. We do not collect your traces or files unless the model provider does. Currently, this applies only to DeepSeek models.",
  trainingQuestion: "Is my data used to train AI?",
  trainingAnswer: "Only when a model or feature says data may be used for AI training. Freebuff or the provider may then keep submissions to develop, train, test, evaluate, fine-tune, and improve AI models or products.",
  storageQuestion: "How is my data used and stored?",
  storageAnswer: "We use prompts, messages, code, files, and repository data to provide the service. We may analyze prompts and messages\u2014including pasted content\u2014to personalize ads, using Freebuff systems and service providers acting on our behalf. Separate uploads and connected repositories are not provided to advertising providers. Where required by law, we provide advertising choices and honor recognized opt-out signals; elsewhere, this processing may be required to use the free service. See the Privacy Policy for retention and details.",
  compactTrainingSummary: `Models or features labeled \u201C${FREEBUFF_AI_TRAINING_NOTICE}\u201D may keep submissions to develop, train, test, evaluate, fine-tune, and improve AI models or products.`,
  compactPrivacySummary: `Prompts and messages may be analyzed to personalize ads, using Freebuff systems and service providers acting on our behalf. Separate uploads and connected repositories are not provided to advertising providers. Models or features labeled \u201C${FREEBUFF_AI_TRAINING_NOTICE}\u201D may use submissions for that purpose.`,
  localExecutionSummary: "Freebuff edits files locally but sends relevant prompts, code, files, and repository context to its servers and model providers. See the Privacy Policy for details.",
  compactLocalExecutionSummary: "Edits run locally, but relevant prompts, code, files, and repository context are sent to Freebuff and model providers."
};

// ../../common/src/constants/freebuff-models.ts
var FREEBUFF_MIMO_V25_MODEL_ID = mimoModels.mimoV25;
var FREEBUFF_GLM_V52_MODEL_ID = "z-ai/glm-5.2";
var FREEBUFF_GLM_V53_FLASH_MODEL_ID = "z-ai/glm-5.3-flash";
var FREEBUFF_GPT_5_6_LUNA_MODEL_ID = "openai/gpt-5.6-luna";
var FREEBUFF_GPT_5_6_LUNA_ES_MODEL_ID = "openai/gpt-5.6-luna-es";
var FREEBUFF_GPT_5_6_LUNA_REASONING_EFFORT = "high";
var FREEBUFF_SOLAR_PRO_4_MODEL_ID = "upstage/solar-pro4";
var FREEBUFF_KIMI_K3_ECO_MODEL_ID = "crof/kimi-k3-eco";
var FREEBUFF_FABLE_5_MODEL_ID = "anthropic/claude-fable-5";
var FREEBUFF_MUSE_SPARK_12_CONTRIBUTOR_MODEL_ID = "meta/muse-spark-1.2-contributor";
var FREEBUFF_MUSE_SPARK_REASONING_EFFORT = "xhigh";
var FREEBUFF_OX_ALPHA_MODEL_ID = "stealth/ox-alpha";
var EFFORTS_THROUGH_XHIGH = [
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh"
];
var EFFORTS_THROUGH_MAX = [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
];
var DEEPSEEK_V4_REASONING_EFFORTS = ["low", "high", "max"];
var OX_ALPHA_REASONING_EFFORTS = ["low", "high", "max"];
var MUSE_SPARK_FALLBACK_NOTICE = "Falls back to DeepSeek V4 Flash if the queue is too long.";
var FREEBUFF_ENABLE_MIMO_MODELS_IN_UI = true;
var FREEBUFF_GLM_V52_SESSION_LENGTH_MS = 60 * 60 * 1e3;
var FREEBUFF_MODEL_CONTEXT_WINDOWS = {
  [FREEBUFF_MINIMAX_M3_MODEL_ID]: 524288,
  [FREEBUFF_DEEPSEEK_V4_FLASH_MODEL_ID]: 1048576,
  // Read off the rejection above on 2026-08-12 — the same window as Flash, and
  // the entry Pro had been missing since it shipped. Absent, base-chat gave a
  // million-token model FREEBUFF_DEFAULT_CONTEXT_WINDOW's 131_072 and summarized
  // a Pro chat thread at ~52k estimated tokens, 8x early. Unlike Luna and Muse
  // Spark below this is an observed limit rather than a published one, so it is
  // entered exactly.
  [FREEBUFF_DEEPSEEK_V4_PRO_MODEL_ID]: 1048576,
  // Luna is the one entry not read off a provider rejection. Every Luna
  // endpoint OpenRouter lists (OpenAI, its flex/priority tiers, Azure, Bedrock)
  // declares context_length 1_050_000, verified against the live endpoints API
  // on 2026-08-01; 1_000_000 is deliberately entered instead, which stays on
  // the safe side of the asymmetry above AND makes base-chat's 0.4 budget come
  // out at exactly 400k.
  //
  // Absent, Luna fell to FREEBUFF_DEFAULT_CONTEXT_WINDOW and base-chat budgeted
  // it 131_072 * 0.4 = 52_428 — a 20x under-estimate of a million-token model,
  // which summarizes a chat thread that had plenty of room left. Every
  // summarize rewrites history from the front and throws away the prompt cache
  // with it.
  [FREEBUFF_GPT_5_6_LUNA_MODEL_ID]: 1e6,
  // Novita publishes 372k for the `-es` route (their /v1/models, 2026-08-21),
  // far below Luna's own 1M — it is a Codex session, not the Luna API model.
  // Sized from what the provider states rather than inherited from the name.
  [FREEBUFF_GPT_5_6_LUNA_ES_MODEL_ID]: 372e3,
  // Meta publishes 1,048,576 for every Muse Spark variant. Entered as 1_000_000
  // for the same reason Luna is: it stays on the safe side of the asymmetry
  // above while remaining an honest order of magnitude, where falling through
  // to the 131_072 default would summarize a million-token thread 8x early.
  [FREEBUFF_MUSE_SPARK_12_CONTRIBUTOR_MODEL_ID]: 1e6,
  // OpenRouter publishes 1,048,576 for the single Ox Alpha endpoint. Entered as
  // 1_000_000 for the same reason as the two above: a published number is not
  // an observed rejection, and the asymmetry here punishes guessing high.
  [FREEBUFF_OX_ALPHA_MODEL_ID]: 1e6,
  // OpenRouter publishes 1,310,720 for GLM 5.3 Flash (131,072 max completion
  // tokens). Entered as 1_000_000, again for the reason above: this is a
  // published figure rather than an observed rejection, and guessing high
  // wedges a thread forever while guessing low only prunes early. Correct it
  // upward once a real rejection quotes the number.
  [FREEBUFF_GLM_V53_FLASH_MODEL_ID]: 1e6,
  // Solar Pro 4: 524,288 published, entered low for the same reason.
  [FREEBUFF_SOLAR_PRO_4_MODEL_ID]: 5e5
};
var DEEPSEEK_V4_PRO_MODEL = {
  id: FREEBUFF_DEEPSEEK_V4_PRO_MODEL_ID,
  // Dated for the same reason Flash is: the wire id is undated and auto-updates,
  // so an undated label tells a returning user nothing changed when in fact the
  // GA build is a different model from the preview they formed an opinion about.
  // UNDATED as of 2026-08-19, and that is a correction rather than a style
  // change. The rule here is that a name must identify the build a user
  // actually gets, and Pro stopped having one: the CrofAI lane serves the
  // undated `deepseek-v4-pro` snapshot while the direct lane serves 08/13, and
  // which one answers depends on the hour (see the peak-window gating in
  // deepseek-router.ts). "08/13" was true of only one of those, so it promised
  // a build we may not hand over.
  displayName: "DeepSeek V4 Pro",
  // No longer a superlative. Pro is not the recommendation — it is the
  // expensive row that a user may still choose — so the tagline describes it
  // instead of ranking it. "Smartest" read as a recommendation the rest of the
  // catalog no longer makes.
  tagline: "Deep reasoning",
  // ALWAYS as of 2026-08-22, and this tracks the LANE rather than a change of
  // policy — the third time this row has moved, always for the same reason.
  // Pro is closed at peak only while it is served by a provider that doubles
  // there. It is back on Cheaper Inference, whose card is FLAT, so there is no
  // expensive window to hide from and a ten-hour closure would cost users the
  // model for nothing.
  //
  // THE PAIRING STILL HOLDS: V4 Flash is `always` too, so neither is shut. The
  // rule that matters is that these two are never closed at once, not that one
  // of them always is — if Pro ever returns to DeepSeek direct, close it again
  // and check Flash in the same commit.
  availability: "always",
  warning: FREEBUFF_AI_TRAINING_NOTICE,
  dataUse: "training",
  premium: true,
  multimodal: false,
  // DeepSeek's own documented default (thinking on, effort high,
  // api-docs.deepseek.com/guides/thinking_mode), sent explicitly so a
  // provider-side default change cannot silently move Freebuff.
  reasoningEffort: "high",
  // Low maps to a real low template on these builds, so Pro offers the same
  // three rungs as Flash. See DEEPSEEK_V4_REASONING_EFFORTS.
  efforts: DEEPSEEK_V4_REASONING_EFFORTS,
  defaultEffort: "high"
  // NO `supersededBy` as of 2026-08-21, and its removal is the point rather
  // than housekeeping. This row carried "V4 Flash is what we recommend",
  // steering users off Pro on COST — it read cache at $0.022/M off-peak and
  // $0.044/M at peak, several times Flash, out of the same shared pool.
  //
  // Both halves of that argument inverted on the same day. Pro reads cache at
  // $0.002538/M FLAT on its new lane, and Flash is now the row that closes at
  // peak. Pointing Pro at Flash would send users to a model that is asleep for
  // ten hours precisely when this one is their best option — and because
  // `migrateSupersededFreebuffModelPreference` rewrites a SAVED pick on every
  // load, it would do that silently and repeatedly. That exact failure is
  // documented on MIMO_V25_MODEL; this is the same trap pointing the other way.
  // No `isNew`. The badge exists to pull attention to a row, which is the
  // opposite of what this one should do now.
};
var MIMO_V25_MODEL = {
  id: FREEBUFF_MIMO_V25_MODEL_ID,
  displayName: "MiMo 2.5",
  tagline: "Balanced",
  availability: "always",
  dataUse: "service",
  premium: false,
  multimodal: true
  // Xiaomi exposes only disabled and high (enabled) for MiMo 2.5. Since the
  // product has no separate thinking on/off control, there is no depth ladder
  // to render here; low/medium/max would merely be compatibility aliases.
  // NOT superseded as of 2026-08-18, and the reason is the whole point of the
  // pause. The pointer to Flash rested on "same price, strictly better model,
  // so there is no cost argument to weigh". Flash costing a premium session
  // ended that: MiMo is now the only UNLIMITED row and the target of
  // FALLBACK_FREEBUFF_MODEL_ID, so this row is precisely where a user lands
  // when their premium pool is spent.
  //
  // Two things went wrong while the pointer was still here, and both are worse
  // than a stale nudge:
  //  - `migrateSupersededFreebuffModelPreference` rewrites a SAVED pick on
  //    every load, so a user who deliberately chose the unlimited model was
  //    silently moved onto the premium one at each launch.
  //  - The picker nagged "switch to V4 Flash" on the very row it had just
  //    stepped a spent user down to — advice they cannot take until tomorrow.
  //
  // Restore it together with Flash leaving FREEBUFF_PREMIUM_MODEL_IDS, not
  // before: the argument returns only when Flash is free again.
};
var DEEPSEEK_V4_FLASH_MODEL = {
  id: FREEBUFF_DEEPSEEK_V4_FLASH_MODEL_ID,
  // Dated on purpose: the wire id is undated and auto-updates, so without the
  // date a returning user sees the same name and assumes the same model. The
  // 0731 GA build is a different, re-post-trained model.
  displayName: "DeepSeek V4 Flash 07/31",
  // "Smart & Fast" survived Flash becoming premium on 2026-08-18: it describes
  // the model, and the one word in it that described the TIER ("unlimited") had
  // already gone when Pro took the recommendation on 2026-08-12. The picker
  // renders the premium group heading, so the tagline does not have to.
  tagline: "Smart & Fast",
  // CLOSED AT PEAK again as of 2026-08-24. The 08-22 reopening was correct for
  // its moment and its premise has since expired: it reasoned that Pro was
  // "back on DeepSeek direct and closed at peak, so Flash has to be the row
  // that stays up". Pro is neither of those now — it runs on Cheaper Inference
  // at a flat $0.002538/M cache read and is open at all hours — so a row that
  // can hold the peak window exists again, and Flash is once more the row whose
  // whole cost doubles inside it.
  //
  // Flash is ~46% of fleet spend and DeepSeek doubles it for ten hours a day.
  // Measured 2026-08-24 09:00Z, inside the window:
  //
  //   Flash @ DeepSeek peak    $0.005621/msg
  //   Pro   @ Cheaper Inf.     $0.005731/msg   (1.02x — saves nothing)
  //   Luna  @ Cheaper Inf.     $0.002659/msg   (2.11x CHEAPER)
  //
  // Hence the fallback points at LUNA, not Pro. The old pointer named Pro from
  // when Pro was the flat-priced row; it is now merely the same price as the
  // row being closed, so redirecting there would shut a model for no saving —
  // the worst of both outcomes.
  // REOPENED 2026-08-28. The closure above was correct on its own measurement
  // and was invalidated by its own effect.
  //
  // That 08-24 reading priced Luna at $0.002659/msg -- its WARM price, taken
  // before Flash's traffic was displaced onto it. Closing Flash is what moved
  // ~30k msg/hr of unfamiliar prefixes onto Luna's lane, and a prefix cache is
  // the whole cost of these rows: Luna fell from ~95% cache to 59-68% inside
  // the window and its price went with it. Re-measured 2026-08-28, hourly:
  //
  //   Luna @ Cheaper Inf. (absorbing)  $0.00925/msg   59-68% cache
  //   Flash @ DeepSeek peak            $0.0042-0.0057/msg
  //   Flash @ LUMINAL                  $0.00103/msg   96% cache, NO peak card
  //
  // The ordering inverted: the row we closed to save money is now half the
  // price of the row we sent its traffic to, and Luminal -- which is not
  // DeepSeek and so has no peak surcharge at all -- is cheaper than both by 4x.
  // Measured at 01:00Z, the hour peak pricing begins: DeepSeek $0.00416,
  // Luminal $0.00053, same model, same minute.
  //
  // Cost of the closure, measured over 04:00-12:00Z: ~$1,180/day of excess Luna
  // spend, against a saving premised on a price that no longer exists.
  //
  // A closure justified by a measurement must be rechecked when the thing it
  // measured is downstream of the closure itself. This one was not, for four
  // days.
  //
  // The peak PRICE is untouched and still real -- `deepseekPricingWindow` still
  // bills the 2x card, because DeepSeek still charges it. What is removed is
  // only the decision to stop SERVING inside that window.
  availability: "always",
  unavailableFallback: FREEBUFF_GPT_5_6_LUNA_MODEL_ID,
  warning: FREEBUFF_AI_TRAINING_NOTICE,
  dataUse: "training",
  // UNLIMITED again as of 2026-08-24, reversing the 2026-08-18 metering. Flash
  // went into the daily pool because it was the single largest driver of
  // free-mode spend; what changed is that it now has a cheap lane to spend on.
  // The Luminal lane carries Flash at a fraction of DeepSeek direct, and it is
  // running far under its concurrency ceiling — 43 pins against 80 measured
  // 2026-08-24 21:35Z, with ~90% of Flash sessions refused a slot. Metering
  // Flash by the premium pool throttles the demand that would fill that lane.
  //
  // FULL ACCESS ONLY. The limited tier is a separate catalog
  // (LIMITED_FREEBUFF_MODEL_IDS) and is deliberately untouched: those users
  // still get MiMo 2.5 alone, and Flash's pause there is what keeps those
  // sessions free.
  //
  // What did NOT move with it, on purpose:
  //  - FALLBACK_FREEBUFF_MODEL_ID stays MiMo. The fallback has to be available
  //    at every hour and Flash is `off_peak_only`; non-premium is necessary for
  //    that slot, not sufficient.
  //  - DEFAULT_FREEBUFF_MODEL_ID stays Luna. Which model leads the picker is a
  //    product decision, not a consequence of the quota bucket.
  //  - MIMO_V25_MODEL's supersededBy pointer stays off. Its comment asks for it
  //    back "when Flash is free again", but that was written before Flash
  //    closed for the peak window; restoring it would rewrite saved MiMo picks
  //    onto a model that is shut ten hours a day.
  //
  // Reverting is this flag plus the FREEBUFF_PREMIUM_MODEL_IDS entry, which
  // move together, and the FREEBUFF_TIER_CHANGE_NOTICE copy.
  premium: false,
  multimodal: false,
  reasoningEffort: "high",
  // The 07/31 build has native low/high/max prompt templates. Medium is not a
  // distinct level and is intentionally absent.
  efforts: DEEPSEEK_V4_REASONING_EFFORTS,
  defaultEffort: "high",
  isNew: true
};
var MINIMAX_M3_MODEL = {
  id: FREEBUFF_MINIMAX_M3_MODEL_ID,
  displayName: "MiniMax M3",
  tagline: "Fastest",
  availability: "always",
  dataUse: "service",
  // M3 is served by Fireworks without provider-side training. Its `service`
  // data-use classification keeps it out of FREEBUFF_TRACED_MODEL_IDS.
  // WITHDRAWN 2026-08-20 (FREEBUFF_PAUSED_FREE_MODEL_IDS). The row is kept
  // here, not deleted: a paused model has to stay in SUPPORTED so the server
  // still recognises the id and can coerce it. `premium` is now moot — nothing
  // reaches a pool through a model that never survives admission — but it stays
  // true so that restoring the row is one edit to the paused list rather than
  // two that must agree.
  premium: true,
  multimodal: true
  // MiniMax M3 supports adaptive thinking or disabled thinking, but no effort
  // levels. A depth picker would therefore be cosmetic.
  // NO `supersededBy`. This was the last supersedes notice in the catalog and
  // it went on 2026-08-21 with the rest: the picker no longer nudges anyone
  // anywhere. Its claim had also expired twice over — it pointed at Flash as
  // "free rather than premium-pooled" (Flash became premium on 2026-08-18) and
  // as the better default (Flash now closes for ten hours a day). A nudge that
  // survives the argument it was making is worse than none, because
  // migrateSupersededFreebuffModelPreference acts on it silently.
};
var GPT_5_6_LUNA_MODEL = {
  id: FREEBUFF_GPT_5_6_LUNA_MODEL_ID,
  displayName: "GPT-5.6 Luna",
  // Luna is the general-purpose premium option; its row's own badges (Images,
  // no training notice) distinguish it from the other all-around models.
  tagline: "Strong all-around",
  availability: "always",
  // OpenAI's API does not train on request data, and the route carries
  // data_collection: 'deny', so no AI-training notice and no trace storage
  // (FREEBUFF_TRACED_MODEL_IDS keys off this).
  dataUse: "service",
  premium: true,
  // OpenRouter reports input modalities text + image + file for this model.
  multimodal: true,
  reasoningEffort: FREEBUFF_GPT_5_6_LUNA_REASONING_EFFORT,
  // OpenRouter's model metadata advertises all five enabled effort levels.
  efforts: EFFORTS_THROUGH_MAX,
  defaultEffort: FREEBUFF_GPT_5_6_LUNA_REASONING_EFFORT
  // Luna led the browser surfaces from 2026-08-04 until Pro's 08/13 GA build
  // took the recommendation on 2026-08-12. It stays fully selectable, and stays
  // the one premium row with no AI-training notice and native image input —
  // reasons a user may still deliberately want it — but the picker now says
  // plainly that Pro is the better default.
  //
  // NOT in FREEBUFF_WEB_DEEMPHASIZED_MODEL_IDS — which is now empty, but Luna
  // would not qualify anyway: muting is this product's "materially dearer"
  // signal, and against Pro that does not resolve — Pro is 2.76x cheaper on the cache reads that
  // dominate agent traffic, and dearer on fresh input and output (full table on
  // that constant). Steering on quality is honest; implying a settled price
  // difference in either direction would not be.
};
var SOLAR_PRO_4_MODEL = {
  id: FREEBUFF_SOLAR_PRO_4_MODEL_ID,
  displayName: "Solar Pro 4",
  tagline: "Limited-time trial",
  availability: "always",
  // `upstage/zdr` — zero data retention, so no training notice and no trace
  // storage (FREEBUFF_TRACED_MODEL_IDS keys off this field).
  dataUse: "service",
  premium: true,
  multimodal: false,
  experimental: true
};
var GLM_V52_MODEL = {
  id: FREEBUFF_GLM_V52_MODEL_ID,
  displayName: "GLM 5.2",
  tagline: "Unlock by referring friends",
  availability: "always",
  dataUse: "service",
  // Served by Fireworks without provider-side training; its `service`
  // data-use classification keeps GLM out of FREEBUFF_TRACED_MODEL_IDS.
  // `premium` drives the "Premium" badge styling in the picker; GLM's real
  // gate is its weekly referral-session pool, not the daily premium pool.
  premium: true,
  multimodal: false
  // Our CrofAI route accepts but ignores reasoning_effort (including invalid
  // values), so OpenRouter's GLM ladder does not describe the route users run.
};
var GLM_V53_FLASH_MODEL = {
  id: FREEBUFF_GLM_V53_FLASH_MODEL_ID,
  // Undated. The wire id carries the build ('5.3-flash') and there is no second
  // snapshot to tell apart, so the rule the DeepSeek rows follow — date a name
  // whose wire id auto-updates — has nothing to bite on here.
  displayName: "GLM 5.3 Flash",
  // Describes the row rather than ranking it, like every other tagline since
  // the catalog stopped recommending anything. "Deep reasoning" is the slot V4
  // Pro vacated and the reason a user reaches for this one.
  tagline: "Deep reasoning",
  // OPEN AT EVERY HOUR. Nothing about this lane is time-of-day priced — the
  // peak/off-peak split that closes DeepSeek rows is DeepSeek's card, not
  // OpenRouter's — so there is no expensive window to hide from, and closing it
  // would cost users the model for nothing. If it ever moves to a lane with a
  // peak card, close it and check what else is closed in the same commit.
  availability: "always",
  // Z.ai's terms for this endpoint carry no training grant to pass on and no
  // assurance to repeat, so `service` is the conservative reading: we assert no
  // training warning we cannot substantiate, and no safety we cannot either.
  // Load-bearing beyond the copy — FREEBUFF_TRACED_MODEL_IDS keys off this
  // field, so 'training' here would start storing hour-long agent traces of a
  // model nobody granted us traces on.
  dataUse: "service",
  // UNMETERED, like DeepSeek V4 Flash and MiMo — the two other rows in
  // FREEBUFF_STANDARD_MODEL_IDS. It was premium-pooled while its true cost was
  // unknown; measured production spend has now settled that, and it is the
  // CHEAPEST row we serve:
  //
  //   glm-5.3-flash (Merge, 91.7% cache)   $0.000249/msg   $0.0196/session
  //   deepseek-v4-flash (already unmetered) $0.002223/msg   $0.1752/session
  //   mimo-v2.5         (already unmetered) $0.001151/msg   $0.0907/session
  //
  // So this row is 4.6x cheaper per session than MiMo and 8.9x cheaper than V4
  // Flash, both of which already run with no ceiling at all. Keeping a session
  // cap on the cheapest model while the dearer ones are uncapped inverts the
  // reason caps exist.
  //
  // WHAT THIS ALSO DROPS, deliberately: `premium` gates
  // FREE_MODE_PREMIUM_RATE_LIMITS, the endpoint-level ceiling that catches
  // callers who script /v1/chat/completions and never create an agent_run. That
  // protection goes with the flag. It is the same posture V4 Flash already runs
  // — by volume the largest row in the fleet — and the exposure per request
  // here is 8.9x SMALLER, so if that trade is acceptable there it is acceptable
  // here first. Revisit both together if scripted abuse appears, not this one
  // alone.
  //
  // NOT a limited-tier change. That tier reads the explicit
  // LIMITED_FREEBUFF_MODEL_IDS / FREEBUFF_WEB_GEO_EXEMPT_MODEL_IDS allowlists,
  // not this flag, so limited-region users are unaffected.
  premium: false,
  // OpenRouter reports text + image + video in, text out.
  multimodal: true,
  // NO effort ladder and no `reasoningEffort`. OpenRouter lists no reasoning
  // levels for this model, so a control here would be a compatibility alias
  // rather than a native setting — the same reason MiniMax M3 and both GLM 5.2
  // routes show none. Add one only when the concrete endpoint reports distinct
  // supported levels.
  //
  // No `supersededBy` and no RECOMMENDED badge: nothing in this catalog nudges
  // anyone anywhere, and a notice here would rewrite saved picks on every load
  // (see migrateSupersededFreebuffModelPreference).
  isNew: true
};
var GPT_5_6_LUNA_ES_MODEL = {
  id: FREEBUFF_GPT_5_6_LUNA_ES_MODEL_ID,
  // Named for what it IS. "Luna" appears nowhere: the route answers "Codex" when
  // asked, so a row calling it Luna would be contradicted by the model itself.
  displayName: "Codex (test)",
  tagline: "Novita route \u2014 evaluation only",
  availability: "always",
  // No AI-training claim either way: the supplier has no resale agreement for
  // this route, so we have no data-use terms to pass on. `service` is the
  // conservative reading — we are not asserting a training warning we cannot
  // substantiate, and not asserting safety we cannot either.
  dataUse: "service",
  // TRUE so it cannot fall into FREEBUFF_STANDARD_MODEL_IDS, which is derived
  // as `WEB_ALL.filter(m => !m.premium)` — the UNMETERED pool. God-only is the
  // gate; this flag is what stops the row becoming free inference if the gate
  // is ever widened.
  premium: true,
  multimodal: false,
  reasoningEffort: FREEBUFF_GPT_5_6_LUNA_REASONING_EFFORT
};
var KIMI_K3_ECO_MODEL = {
  id: FREEBUFF_KIMI_K3_ECO_MODEL_ID,
  displayName: "Kimi K3",
  tagline: "Via CrofAI",
  availability: "always",
  dataUse: "service",
  premium: true,
  multimodal: false,
  experimental: true
  // CrofAI likewise ignores reasoning_effort for this build. Do not expose a
  // control until this concrete route reports distinct supported levels.
};
var FABLE_5_MODEL = {
  id: FREEBUFF_FABLE_5_MODEL_ID,
  displayName: "Claude Fable 5",
  tagline: "Anthropic's most intelligent model",
  availability: "always",
  // Load-bearing, not decoration: `dataUse: 'training'` is what puts this model
  // in FREEBUFF_TRACED_MODEL_IDS, which is the entire point of the trial — we
  // are buying hour-long agent traces with the pool. The warning is the
  // disclosure that makes that legitimate, and the catalog invariant test
  // requires the two to agree.
  warning: FREEBUFF_AI_TRAINING_NOTICE,
  dataUse: "training",
  // Not in FREEBUFF_PREMIUM_MODEL_IDS: the daily premium pool is shared across
  // its models and Fable is metered by its OWN global pool instead (see
  // FREEBUFF_LIMITED_OFFER_MODEL_IDS). The flag only marks it as scarce for the
  // pickers' styling and for FREEBUFF_STANDARD_MODEL_IDS, which must not
  // absorb it.
  premium: true,
  multimodal: true,
  // OpenRouter reports low/medium/high/xhigh/max, with high as the default.
  efforts: EFFORTS_THROUGH_MAX,
  defaultEffort: "high",
  isNew: true
};
var MUSE_SPARK_12_CONTRIBUTOR_MODEL = {
  id: FREEBUFF_MUSE_SPARK_12_CONTRIBUTOR_MODEL_ID,
  displayName: "Muse Spark 1.2",
  // The tagline names the thing that actually differentiates this row for a
  // user: it is the one model that can make you wait. Context length is not
  // what they need to know before picking it.
  tagline: "Queue",
  taglineTooltip: MUSE_SPARK_FALLBACK_NOTICE,
  availability: "always",
  // Load-bearing pair (a catalog invariant test enforces it): the Contributor
  // tier's whole discount is Meta training on prompts and completions.
  warning: FREEBUFF_AI_TRAINING_NOTICE,
  dataUse: "training",
  premium: true,
  multimodal: false,
  reasoningEffort: FREEBUFF_MUSE_SPARK_REASONING_EFFORT,
  efforts: EFFORTS_THROUGH_XHIGH,
  defaultEffort: FREEBUFF_MUSE_SPARK_REASONING_EFFORT
};
var OX_ALPHA_MODEL = {
  id: FREEBUFF_OX_ALPHA_MODEL_ID,
  displayName: "Ox Alpha",
  // Names the property a user picks this row FOR. "Free" would not distinguish
  // it — every row in this catalog is free to the user — and naming the host
  // is impossible, which is the whole point of a stealth model.
  tagline: "1M context",
  availability: "always",
  // NOT the AI-training notice, and the gap between the two is the point. The
  // stealth terms say the host keeps prompts and completions and does not train
  // on them, so `dataUse` stays 'service' — that field is what
  // FREEBUFF_TRACED_MODEL_IDS keys off, and claiming a training grant we were
  // not given would be wrong in the direction that changes behavior. The
  // warning still says the thing a user wants before pasting a private repo
  // into a provider whose name nobody will tell them.
  //
  // NOTE this is the one row where a warning does not imply `dataUse:
  // 'training'`. The invariant test asserting they move together scopes itself
  // to SUPPORTED_FREEBUFF_MODELS (the CLI/Desktop catalog), which this is
  // deliberately not in; ox-alpha.test.ts pins the exception so it reads as a
  // decision rather than as drift.
  warning: "Anonymous provider retains prompts",
  dataUse: "service",
  premium: false,
  // text + image + video in, text out.
  multimodal: true,
  // See FREEBUFF_OX_ALPHA_MODEL_ID for the measurement behind this. The
  // provider's own default is `max`, which is 4x the tokens and 4x the latency
  // of `high` for no better answer.
  reasoningEffort: "high",
  efforts: OX_ALPHA_REASONING_EFFORTS,
  defaultEffort: "high",
  experimental: true
  // NOT `isNew` any more: the row is withdrawn, and a NEW badge on a paused
  // model would be the one claim about it that is actively false. It renders
  // nowhere today — the row is in no picker list — but it would be the first
  // thing seen if the pause were ever lifted without re-reading this row.
};
var SUPPORTED_FREEBUFF_MODELS = [
  OX_ALPHA_MODEL,
  DEEPSEEK_V4_PRO_MODEL,
  MINIMAX_M3_MODEL,
  GPT_5_6_LUNA_MODEL,
  SOLAR_PRO_4_MODEL,
  GLM_V52_MODEL,
  GLM_V53_FLASH_MODEL,
  DEEPSEEK_V4_FLASH_MODEL,
  MIMO_V25_MODEL,
  FABLE_5_MODEL
];
var FREEBUFF_MODELS = [
  // LUNA LEADS as of 2026-08-24, and the position is not a preference — a test
  // pins FREEBUFF_MODELS[0] to DEFAULT_FREEBUFF_MODEL_ID, so this moved because
  // the DEFAULT had to move.
  //
  // Flash closes for the ten-hour peak window again (see its `availability`),
  // and the default must be open at every hour: it is what a new user lands on
  // before they know the catalog exists, so a default dark for ten hours a day
  // fails admission for exactly the people least able to diagnose it. That
  // invariant is asserted, not assumed.
  //
  // Luna rather than Pro, on measured cost inside the window (2026-08-24 09:00Z):
  //   Luna @ Cheaper Inference  $0.002659/msg   93.8% cache
  //   Pro  @ Cheaper Inference  $0.005731/msg   87.4% cache
  // Luna is less than half of Pro and less than half of Flash-at-peak, which is
  // the reverse of the ordering rationale that stood on 2026-08-22, when Luna's
  // cost was being read off a card that priced its cache reads 25x too high.
  //
  // Ordering is still the ONLY steer here — no supersedes notices, nothing
  // badged RECOMMENDED — so changing this order is a product decision.
  GPT_5_6_LUNA_MODEL,
  DEEPSEEK_V4_FLASH_MODEL,
  ...FREEBUFF_ENABLE_MIMO_MODELS_IN_UI ? [MIMO_V25_MODEL] : [],
  // OX ALPHA LEFT THIS LIST on 2026-08-27, when its anonymous host ended the
  // free promotion the row existed for. MiMo is the sole UNMETERED row again.
  //
  // Dropping it here is what takes it out of every picker on every surface —
  // FREEBUFF_WEB_MODELS reaches it only by spreading this list — but it is NOT
  // what stops it being served. FREEBUFF_PAUSED_FREE_MODEL_IDS is, and the row
  // stays in SUPPORTED_FREEBUFF_MODELS so the id remains recognisable and
  // coercible for the installed binaries that still hold it.
  SOLAR_PRO_4_MODEL,
  // LAST, in the slot V4 Pro held and for the same reason: capped at two
  // sessions a day, so it is somewhere a user reaches deliberately rather than
  // by scanning from the top. Ordering is still the only steer in this list —
  // nothing here is badged RECOMMENDED and nothing supersedes anything — so
  // moving this row up is a product decision, not housekeeping.
  GLM_V53_FLASH_MODEL
];
var FREEBUFF_PREMIUM_MODEL_IDS = [
  FREEBUFF_GPT_5_6_LUNA_MODEL_ID,
  // GLM 5.3 Flash left on 2026-08-28: measured production spend put it at
  // $0.000249/msg, the cheapest row we serve and 8.9x under the already-
  // unmetered V4 Flash. See GLM_V53_FLASH_MODEL for what leaving here also
  // drops. This list and that entry's `premium` flag must always agree —
  // isFreebuffPremiumModelId reads this one while FREEBUFF_STANDARD_MODEL_IDS
  // is derived from the flag, so a disagreement makes a row premium for the
  // rate limiter and unmetered for the session pool at the same time.
  FREEBUFF_SOLAR_PRO_4_MODEL_ID
];
var FREEBUFF_WEB_MODELS = [
  // Ox Alpha is gone from both browser pickers as of 2026-08-27. It reached
  // this list only by spreading ...FREEBUFF_MODELS, and it left that list when
  // its host ended the free promotion. Naming it here would put a PAUSED row
  // back in the picker without making it admissible — a visible row whose
  // first send is coerced away, which is the offer-without-gate shape
  // common/src/testing/freebuff-offer-invariants.ts exists to catch.
  MUSE_SPARK_12_CONTRIBUTOR_MODEL,
  GLM_V52_MODEL,
  ...FREEBUFF_MODELS
];
var FREEBUFF_WEB_GOD_ONLY_MODELS = [
  KIMI_K3_ECO_MODEL,
  GPT_5_6_LUNA_ES_MODEL
];
var FREEBUFF_WEB_ALL_MODELS = [
  ...FREEBUFF_WEB_GOD_ONLY_MODELS,
  ...FREEBUFF_WEB_MODELS
];
var FREEBUFF_WEB_GOD_ONLY_MODEL_IDS = Object.freeze(
  FREEBUFF_WEB_GOD_ONLY_MODELS.map((model) => model.id)
);
var FREEBUFF_WEB_PREMIUM_MODEL_IDS = [
  ...FREEBUFF_PREMIUM_MODEL_IDS,
  // Metered by the web premium pool like every other god-only row. Being in
  // SOME pool is the point: FREEBUFF_STANDARD_MODEL_IDS is derived by
  // filtering `!premium`, so a premium model left out of here would be metered
  // by no pool at all rather than by a stricter one.
  FREEBUFF_KIMI_K3_ECO_MODEL_ID,
  FREEBUFF_GPT_5_6_LUNA_ES_MODEL_ID,
  // Not here for cost — Muse Spark Contributor is cheaper per token than the
  // Standard pool's models. The premium pool is what bounds how many users sit
  // inside its 60 RPM team-wide ceiling at once, and being in SOME pool is
  // mandatory: FREEBUFF_STANDARD_MODEL_IDS is derived by filtering
  // `!premium`, so a premium model left out of here is metered by no pool.
  FREEBUFF_MUSE_SPARK_12_CONTRIBUTOR_MODEL_ID
];
var FREEBUFF_STANDARD_MODEL_IDS = Object.freeze(
  FREEBUFF_WEB_ALL_MODELS.filter((model) => !model.premium).map(
    (model) => model.id
  )
);
var FREEBUFF_SESSION_GRACE_MS = 30 * 60 * 1e3;
var FREEBUFF_DESKTOP_IDLE_RELEASE_MS = 10 * 60 * 1e3;
var FREEBUFF_MULTIMODAL_MODEL_IDS = Object.freeze(
  SUPPORTED_FREEBUFF_MODELS.filter((model) => model.multimodal).map(
    (model) => model.id
  )
);
var FREEBUFF_WEB_MULTIMODAL_MODEL_IDS = Object.freeze(
  FREEBUFF_WEB_ALL_MODELS.filter((model) => model.multimodal).map(
    (model) => model.id
  )
);
var FREEBUFF_TRACED_MODEL_IDS = SUPPORTED_FREEBUFF_MODELS.filter(
  (model) => model.dataUse === "training"
).map((model) => model.id);
var LIMITED_FREEBUFF_MODEL_IDS = [
  FREEBUFF_MIMO_V25_MODEL_ID
];
var LIMITED_FREEBUFF_MODELS = LIMITED_FREEBUFF_MODEL_IDS.map(
  (modelId) => SUPPORTED_FREEBUFF_MODELS.find((model) => model.id === modelId)
);
var FREEBUFF_WEB_GEO_EXEMPT_MODEL_IDS = [
  FREEBUFF_MIMO_V25_MODEL_ID
];
var FREEBUFF_WEB_LIMITED_MODEL_IDS = [
  .../* @__PURE__ */ new Set([
    ...FREEBUFF_WEB_GEO_EXEMPT_MODEL_IDS,
    ...LIMITED_FREEBUFF_MODEL_IDS
  ])
];

// ../../agents/constants.ts
var publisher = "codebuff";
var FOLLOWUP_STYLE_GUIDANCE = "Keep each one short and goal-oriented: name the outcome, not the steps to reach it, so whoever picks it up is free to choose the approach. Each suggestion is clicked out of context, so name its target.";
var SKILL_DISCOVERY_GUIDANCE = "- **Discover and install skills:** Skills are reusable, self-contained instructions for accomplishing a task. Beyond the skills already listed for the `skill` tool, you can find and install community skills from the command line: `npx skills find <query>` to search, `npx skills add <owner/repo> --list` to preview a repo's skills, and `npx skills add <owner/repo> --skill <name> --yes` to install one into `.agents/skills/`. After installing, load it by name with the `skill` tool. These community skills are not vetted, so confirm with the user which skill(s) to install before running `npx skills add`.";
var gravityIndexGuidance = (deeperResearch = "") => `- **Research services before recommending them:** Whenever the user needs to choose or integrate a third-party developer service (database, auth, payments, hosting, email, cache, monitoring, analytics, AI, storage, CMS, search, etc.), use the gravity_index tool to discover, compare, and get install guidance for options${deeperResearch}. Don't recommend or integrate a service from memory alone.`;
var OPUS_MODEL = "anthropic/claude-opus-5";

// ../../agents/types/secret-agent-definition.ts
var placeholderNames = [
  "AGENT_NAME",
  "AGENTS_PROMPT",
  "CURRENT_DATE",
  "FILE_TREE_PROMPT_SMALL",
  "FILE_TREE_PROMPT",
  "FILE_TREE_PROMPT_LARGE",
  "GIT_CHANGES_PROMPT",
  "INITIAL_AGENT_PROMPT",
  "KNOWLEDGE_FILES_CONTENTS",
  "PROJECT_ROOT",
  "REMAINING_STEPS",
  "SYSTEM_INFO_PROMPT",
  "TOOLS_PROMPT",
  "USER_CWD",
  "USER_INPUT_PROMPT"
];
var PLACEHOLDER = Object.fromEntries(
  placeholderNames.map((name) => [name, `{CODEBUFF_${name}}`])
);
var placeholderValues = Object.values(PLACEHOLDER);
var AgentTemplateTypeList = [
  // Base agents
  "base",
  "base_lite",
  "base_max",
  "base_experimental",
  "claude4_gemini_thinking",
  "superagent",
  "base_agent_builder",
  // Ask mode
  "ask",
  // Planning / Thinking
  "dry_run",
  "thinker",
  // Other agents
  "file_picker",
  "file_explorer",
  "researcher",
  "reviewer",
  "agent_builder",
  "example_programmatic"
];
var AgentTemplateTypes = Object.fromEntries(
  AgentTemplateTypeList.map((name) => [name, name.replaceAll("_", "-")])
);

// ../../agents/base3.ts
function createBase3(model = OPUS_MODEL) {
  return {
    publisher,
    model,
    providerOptions: model.startsWith("anthropic/") ? { only: ["amazon-bedrock"], data_collection: "deny" } : { data_collection: "deny" },
    displayName: "Buffy",
    spawnerPrompt: "Single-loop coding agent that explores, edits, and verifies directly with its own tools",
    inputSchema: {
      prompt: {
        type: "string",
        description: "A coding task to complete"
      }
    },
    outputMode: "last_message",
    includeMessageHistory: true,
    windowedFileReads: true,
    compactContext: true,
    toolNames: [
      "read_files",
      "str_replace",
      "write_file",
      "run_terminal_command",
      "code_search",
      "glob",
      "list_directory",
      "write_todos"
    ],
    systemPrompt: `You are Buffy, the coding agent behind Codebuff. You help users with software engineering tasks: fixing bugs, adding functionality, refactoring, and explaining code.

Current date: ${PLACEHOLDER.CURRENT_DATE}.

- Match the project's existing conventions. Verify a library is already used in the project before employing it.
- Prefer editing existing files over creating new ones. Make the fewest changes that address the request.
- Verify non-trivial changes by running the project's typecheck and relevant tests.
- Use write_todos to plan and track multi-step tasks.
- Your responses are displayed in a terminal. Keep them short and concise.
- Don't run destructive or hard-to-undo commands (git push, resets, deploys) unless the user asks for them.

${PLACEHOLDER.KNOWLEDGE_FILES_CONTENTS}

${PLACEHOLDER.GIT_CHANGES_PROMPT}
`
  };
}
function createBase3CliRoot(options = {}) {
  const { model = OPUS_MODEL, isFreebuff = false, noAskUser = false } = options;
  const base3 = createBase3(model);
  const root = {
    ...base3,
    // Written out rather than spread from `base3.toolNames`, because
    // `foreign-client-shipped-agents.test.ts` scans source for literal
    // toolNames arrays and asserts none of ours reads as a third-party
    // harness — a toolset assembled at runtime is invisible to that scan,
    // which is how `freebuff-desktop-autorun` shipped flagged.
    //
    // The first eight are base3's own. `web_search`/`read_url` replace the
    // researcher subagents base2 spawned. The last five are CLI product
    // surface, not harness: they drive the ask-user panel, the followup
    // cards, service discovery, rendered UI, and skills.
    toolNames: [
      "read_files",
      "str_replace",
      "write_file",
      "run_terminal_command",
      "code_search",
      "glob",
      "list_directory",
      "write_todos",
      "web_search",
      "read_url",
      "ask_user",
      "suggest_followups",
      "gravity_index",
      "render_ui",
      "skill"
    ],
    systemPrompt: `${base3.systemPrompt}
${buildCliAppendix({ isFreebuff, model, noAskUser })}`
  };
  if (!noAskUser) return root;
  return {
    ...root,
    toolNames: root.toolNames?.filter((name) => !HUMAN_TOOL_NAMES.has(name))
  };
}
var HUMAN_TOOL_NAMES = /* @__PURE__ */ new Set([
  "ask_user",
  "suggest_followups"
]);
function buildCliAppendix({
  isFreebuff,
  model,
  noAskUser = false
}) {
  return `
# Working with the user
${noAskUser ? "" : `
- **Ask about important decisions:** Use the ask_user tool to collaborate with the user on non-obvious choices \u2014 alternate implementation strategies, ambiguous requirements. Gather context first, and skip it when the answer is obvious or the detail can be changed later.
- **Suggest next steps:** At the end of your turn, use the suggest_followups tool to suggest ~3 next steps the user might want to take. ${FOLLOWUP_STYLE_GUIDANCE}`}
${gravityIndexGuidance()}
${SKILL_DISCOVERY_GUIDANCE}

# ${isFreebuff ? "Freebuff" : "Codebuff"} Meta-information

You are running on the ${model} model.

${isFreebuff ? "You are the AI agent behind Freebuff, a tool where users can chat with you to code with AI for free. See freebuff.com for more information about the product." : [
    "Users send prompts to you in one of a few user-selected modes, like DEFAULT, LITE, MAX, or PLAN.",
    "Every prompt sent consumes the user's credits, which is calculated based on the API cost of the models used.",
    'The user can use the "/usage" command to see how many credits they have used and have left, so you can tell them to check their usage this way.',
    "For other questions, you can direct them to codebuff.com, or especially codebuff.com/docs for detailed information about the product."
  ].join("\n")}

${PLACEHOLDER.SYSTEM_INFO_PROMPT}
`;
}
var definition = {
  ...createBase3CliRoot(),
  id: "base3"
};

// ../../agents/base3-free-deepseek.ts
var definition2 = {
  ...createBase3CliRoot({
    model: FREEBUFF_DEEPSEEK_V4_PRO_MODEL_ID,
    isFreebuff: true
  }),
  id: "base3-free-deepseek",
  displayName: "Buffy on DeepSeek"
};
var base3_free_deepseek_default = definition2;

// ../../agents/base3-free-deepseek-flash.ts
var definition3 = {
  ...createBase3CliRoot({
    model: FREEBUFF_DEEPSEEK_V4_FLASH_MODEL_ID,
    isFreebuff: true
  }),
  id: "base3-free-deepseek-flash",
  displayName: "Buffy on DeepSeek Flash"
};
var base3_free_deepseek_flash_default = definition3;

// ../../agents/base3-free-glm.ts
var definition4 = {
  ...createBase3CliRoot({
    model: FREEBUFF_GLM_V52_MODEL_ID,
    isFreebuff: true
  }),
  id: "base3-free-glm",
  displayName: "Buffy on GLM 5.2"
};
var base3_free_glm_default = definition4;

// ../../agents/base3-free-glm-5-3-flash.ts
var definition5 = {
  ...createBase3CliRoot({
    model: FREEBUFF_GLM_V53_FLASH_MODEL_ID,
    isFreebuff: true
  }),
  id: "base3-free-glm-5-3-flash",
  displayName: "Buffy on GLM 5.3 Flash"
};
var base3_free_glm_5_3_flash_default = definition5;

// ../../agents/base3-free-luna.ts
var definition6 = {
  ...createBase3CliRoot({
    model: FREEBUFF_GPT_5_6_LUNA_MODEL_ID,
    isFreebuff: true
  }),
  id: "base3-free-luna",
  displayName: "Buffy on GPT-5.6 Luna"
};
var base3_free_luna_default = definition6;

// .tmp-agents-entry.ts
var FREE_AGENT_DEFINITIONS = [base3_free_deepseek_default, base3_free_deepseek_flash_default, base3_free_glm_default, base3_free_glm_5_3_flash_default, base3_free_luna_default];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FREE_AGENT_DEFINITIONS
});
