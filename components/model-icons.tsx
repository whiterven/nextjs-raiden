import { Claude, Grok, Gemini, Groq, Anthropic, OpenAI } from "@lobehub/icons"

export const ModelIcons = {
  Claude: () => <Claude.Color size={16} />,
  Grok: () => <Grok size={16} />,
  Gemini: () => <Gemini.Color size={16} />,
  Groq: () => <Groq.Avatar size={16} />,
  Anthropic: () => <Anthropic size={16} />,
  OpenAI: () => <OpenAI size={16} />,
}

// Map model IDs to their corresponding icons
export const getModelIcon = (modelId: string) => {
  if (modelId.startsWith("chat-model")) {
    return ModelIcons.Grok // XAI models use Grok icon
  }
  if (modelId.startsWith("groq-")) {
    return ModelIcons.Groq
  }
  if (modelId.startsWith("gemini-")) {
    return ModelIcons.Gemini
  }
  if (modelId.startsWith("claude-")) {
    return ModelIcons.Claude
  }
  if (modelId.startsWith("openai-")) {
    return ModelIcons.OpenAI
  }

  // Default fallback
  return null
}

export default ModelIcons
