//lib/ai/tools/api-key-helper.ts
import { getApiKey } from '@/lib/api-keys'
import { getCurrentUserId } from '@/lib/auth-helpers'

/**
 * Get API key for a service, checking user's stored keys first, then environment variables
 * @param serviceName The service name (e.g., 'github', 'slack', 'clickup', 'tavily')
 * @param envVarName The environment variable name (e.g., 'GITHUB_TOKEN')
 * @returns The API key or throws an error if not found
 */
export async function getToolApiKey(serviceName: string, envVarName?: string): Promise<string> {
  // First try environment variable if provided
  let apiKey = envVarName ? process.env[envVarName] : null
  
  if (!apiKey) {
    try {
      const userId = await getCurrentUserId()
      if (userId) {
        // Try with service name first (e.g., 'github')
        apiKey = await getApiKey(userId, serviceName)
        
        // If not found and environment variable name is provided, try with that
        // This handles cases where users save the key with the env var name (e.g., 'GITHUB_TOKEN')
        if (!apiKey && envVarName) {
          apiKey = await getApiKey(userId, envVarName)
        }
      }
    } catch (error) {
      console.error(`Failed to retrieve user API key for ${serviceName}:`, error)
    }
    
    if (!apiKey) {
      throw new Error(`No ${serviceName} API key found. Please add one in your settings under API Keys using either "${serviceName}" or "${envVarName}" as the service name.`)
    }
  }
  
  return apiKey
}

/**
 * Get API key with graceful error handling that returns an error object instead of throwing
 * @param serviceName The service name
 * @param envVarName The environment variable name (optional)
 * @returns Object with either the key or an error
 */
export async function getToolApiKeySafe(serviceName: string, envVarName?: string): Promise<{
  success: boolean
  key?: string
  error?: string
}> {
  try {
    const key = await getToolApiKey(serviceName, envVarName)
    return { success: true, key }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : `Failed to get ${serviceName} API key`
    }
  }
}

// Common service configurations
export const SERVICE_CONFIGS = {
  github: {
    serviceName: 'github',
    envVarName: 'GITHUB_TOKEN',
    displayName: 'GitHub'
  },
  slack: {
    serviceName: 'slack',
    envVarName: 'SLACK_BOT_TOKEN',
    displayName: 'Slack'
  },
  clickup: {
    serviceName: 'clickup',
    envVarName: 'CLICKUP_API_TOKEN',
    displayName: 'ClickUp'
  },
  n8n: {
    serviceName: 'n8n',
    envVarName: 'N8N_API_KEY',
    displayName: 'n8n'
  },
}