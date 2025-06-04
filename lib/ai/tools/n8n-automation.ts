import { tool } from "ai"
import { z } from "zod"

// Base configuration schema
const n8nConfigSchema = z.object({
  baseUrl: z.string().describe("The base URL of your n8n instance (e.g., https://your-n8n.com)"),
  apiKey: z.string().describe("Your n8n API key (X-N8N-API-KEY header)"),
})

// Common response schemas
const workflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  nodes: z.array(z.any()).optional(),
  connections: z.any().optional(),
  tags: z.array(z.string()).optional(),
  versionId: z.string().optional(),
})

const executionSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  mode: z.enum(["manual", "trigger", "webhook", "retry", "cli"]),
  status: z.enum(["new", "running", "success", "failed", "waiting", "canceled", "crashed", "unknown"]),
  startedAt: z.string(),
  stoppedAt: z.string().optional(),
  data: z.any().optional(),
  error: z.any().optional(),
})

const credentialSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  nodesAccess: z.array(z.object({
    nodeType: z.string(),
  })).optional(),
  sharedWith: z.array(z.string()).optional(),
})

// Main n8n API tool
export const n8nAPI = tool({
  description: "Comprehensive n8n workflow automation API tool for managing workflows, executions, credentials, users, and more",
  parameters: z.object({
    action: z.enum([
      // Workflow Management
      "getAllWorkflows", "getWorkflow", "createWorkflow", "updateWorkflow", "deleteWorkflow",
      "activateWorkflow", "deactivateWorkflow", "exportWorkflow", "importWorkflow",
      
      // Execution Management  
      "getAllExecutions", "getExecution", "deleteExecution", "retryExecution", "stopExecution",
      "getExecutionsCount", "clearExecutionData",
      
      // Credential Management
      "getAllCredentials", "getCredential", "createCredential", "updateCredential", "deleteCredential",
      "testCredential", "shareCredential",
      
      // User Management (Enterprise)
      "getAllUsers", "getUser", "createUser", "updateUser", "deleteUser", "inviteUser",
      "resetPassword", "changePassword", "updateUserSettings",
      
      // Tag Management
      "getAllTags", "createTag", "updateTag", "deleteTag", "getWorkflowsByTag",
      
      // Source Control (Enterprise)
      "getSourceControlStatus", "pullFromGit", "pushToGit", "createBranch", "switchBranch",
      "getGitBranches", "getGitCommits",
      
      // Variables Management
      "getAllVariables", "getVariable", "createVariable", "updateVariable", "deleteVariable",
      
      // Health & Monitoring
      "getHealthStatus", "getSystemInfo", "getMetrics", "getLogs",
      
      // License & Settings (Enterprise)
      "getLicenseInfo", "updateLicense", "getSettings", "updateSettings",
      
      // Webhook Management
      "getAllWebhooks", "getWebhook", "createWebhook", "updateWebhook", "deleteWebhook",
      "testWebhook", "getWebhookUrls",
      
      // Project Management (Enterprise)
      "getAllProjects", "getProject", "createProject", "updateProject", "deleteProject",
      "getProjectMembers", "addProjectMember", "removeProjectMember",
      
      // Community Nodes
      "getInstalledNodes", "installCommunityNode", "updateCommunityNode", "uninstallCommunityNode",
      
      // Audit Logs (Enterprise)
      "getAuditLogs", "getAuditLogDetails",
      
      // External Secrets
      "getExternalSecrets", "createExternalSecret", "updateExternalSecret", "deleteExternalSecret",
      "testExternalSecret",
      
      // LDAP/SAML (Enterprise)
      "getLDAPConfig", "updateLDAPConfig", "testLDAPConnection", "syncLDAPUsers",
      "getSAMLConfig", "updateSAMLConfig", "testSAMLConnection",
    ]).describe("The API action to perform"),
    
    config: n8nConfigSchema.describe("n8n instance configuration"),
    
    // Workflow-related parameters
    workflowId: z.string().optional().describe("Workflow ID for workflow-specific operations"),
    workflowData: z.object({
      name: z.string(),
      nodes: z.array(z.any()),
      connections: z.any(),
      active: z.boolean().optional().default(false),
      tags: z.array(z.string()).optional(),
      settings: z.any().optional(),
    }).optional().describe("Workflow data for create/update operations"),
    
    // Execution-related parameters
    executionId: z.string().optional().describe("Execution ID for execution-specific operations"),
    executionFilters: z.object({
      status: z.enum(["success", "failed", "running", "waiting"]).optional(),
      workflowId: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      limit: z.number().min(1).max(250).optional().default(20),
      offset: z.number().min(0).optional().default(0),
    }).optional().describe("Filters for execution queries"),
    
    // Credential-related parameters
    credentialId: z.string().optional().describe("Credential ID for credential-specific operations"),
    credentialData: z.object({
      name: z.string(),
      type: z.string(),
      data: z.any(),
      nodesAccess: z.array(z.object({
        nodeType: z.string(),
      })).optional(),
    }).optional().describe("Credential data for create/update operations"),
    
    // User-related parameters  
    userId: z.string().optional().describe("User ID for user-specific operations"),
    userData: z.object({
      email: z.string().email(),
      firstName: z.string(),
      lastName: z.string(),
      role: z.enum(["owner", "admin", "member", "viewer"]).optional(),
      password: z.string().optional(),
      settings: z.any().optional(),
    }).optional().describe("User data for create/update operations"),
    
    // Tag-related parameters
    tagId: z.string().optional().describe("Tag ID for tag-specific operations"),
    tagData: z.object({
      name: z.string(),
      color: z.string().optional(),
    }).optional().describe("Tag data for create/update operations"),
    
    // Variable-related parameters
    variableId: z.string().optional().describe("Variable ID for variable-specific operations"),
    variableData: z.object({
      key: z.string(),
      value: z.string(),
      type: z.enum(["string", "boolean", "number"]).optional().default("string"),
    }).optional().describe("Variable data for create/update operations"),
    
    // Project-related parameters (Enterprise)
    projectId: z.string().optional().describe("Project ID for project-specific operations"),
    projectData: z.object({
      name: z.string(),
      type: z.enum(["personal", "team"]).optional().default("team"),
      settings: z.any().optional(),
    }).optional().describe("Project data for create/update operations"),
    
    // Generic parameters
    includeData: z.boolean().optional().default(false).describe("Include detailed data in response"),
    filter: z.string().optional().describe("Filter criteria for search operations"),
    limit: z.number().min(1).max(250).optional().default(20).describe("Number of items to return"),
    offset: z.number().min(0).optional().default(0).describe("Number of items to skip"),
    
    // Webhook parameters
    webhookData: z.object({
      workflowId: z.string(),
      node: z.string(),
      path: z.string(),
      method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).optional().default("POST"),
      authentication: z.enum(["none", "basicAuth", "headerAuth"]).optional().default("none"),
    }).optional().describe("Webhook configuration data"),
    
    // Community node parameters
    nodePackage: z.string().optional().describe("Community node package name for installation"),
    
    // External secret parameters
    secretData: z.object({
      name: z.string(),
      provider: z.enum(["vault", "aws", "azure"]),
      settings: z.any(),
    }).optional().describe("External secret configuration"),
    
    // Git/Source control parameters
    gitData: z.object({
      branchName: z.string().optional(),
      commitMessage: z.string().optional(),
      files: z.array(z.string()).optional(),
    }).optional().describe("Git operation parameters"),
    
    onProgress: z.function().optional().describe("Callback function to show loading state"),
  }),
  
  execute: async ({ 
    action, 
    config, 
    workflowId, 
    workflowData, 
    executionId, 
    executionFilters,
    credentialId,
    credentialData,
    userId,
    userData,
    tagId,
    tagData,
    variableId,
    variableData,
    projectId,
    projectData,
    includeData = false,
    filter,
    limit = 20,
    offset = 0,
    webhookData,
    nodePackage,
    secretData,
    gitData,
    onProgress 
  }) => {
    // Show loading state if callback is provided
    if (onProgress) {
      onProgress({ isLoading: true, action, workflowId, executionId })
    }

    try {
      // Validate configuration
      if (!config.baseUrl || !config.apiKey) {
        throw new Error("n8n baseUrl and apiKey are required")
      }

      // Normalize base URL
      const baseUrl = config.baseUrl.replace(/\/$/, '')
      const headers = {
        "Content-Type": "application/json",
        "X-N8N-API-KEY": config.apiKey,
      }

      // Helper function to make API requests
      const makeRequest = async (endpoint: string, method: string = "GET", body?: any) => {
        const url = `${baseUrl}/api/v1${endpoint}`
        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`n8n API Error ${response.status}: ${errorText}`)
        }

        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          return await response.json()
        }
        return await response.text()
      }

      // Route actions to appropriate handlers
      switch (action) {
        // === WORKFLOW MANAGEMENT ===
        case "getAllWorkflows":
          const workflowsQuery = new URLSearchParams()
          if (filter) workflowsQuery.append("filter", filter)
          if (limit) workflowsQuery.append("limit", limit.toString())
          if (offset) workflowsQuery.append("offset", offset.toString())
          if (includeData) workflowsQuery.append("includeScopes", "workflow:read")
          
          return await makeRequest(`/workflows?${workflowsQuery}`)

        case "getWorkflow":
          if (!workflowId) throw new Error("workflowId is required")
          return await makeRequest(`/workflows/${workflowId}`)

        case "createWorkflow":
          if (!workflowData) throw new Error("workflowData is required")
          return await makeRequest("/workflows", "POST", workflowData)

        case "updateWorkflow":
          if (!workflowId || !workflowData) throw new Error("workflowId and workflowData are required")
          return await makeRequest(`/workflows/${workflowId}`, "PUT", workflowData)

        case "deleteWorkflow":
          if (!workflowId) throw new Error("workflowId is required")
          return await makeRequest(`/workflows/${workflowId}`, "DELETE")

        case "activateWorkflow":
          if (!workflowId) throw new Error("workflowId is required")
          return await makeRequest(`/workflows/${workflowId}/activate`, "POST")

        case "deactivateWorkflow":
          if (!workflowId) throw new Error("workflowId is required")
          return await makeRequest(`/workflows/${workflowId}/deactivate`, "POST")

        case "exportWorkflow":
          if (!workflowId) throw new Error("workflowId is required")
          return await makeRequest(`/workflows/${workflowId}/export`)

        // === EXECUTION MANAGEMENT ===
        case "getAllExecutions":
          const execQuery = new URLSearchParams()
          if (executionFilters?.status) execQuery.append("status", executionFilters.status)
          if (executionFilters?.workflowId) execQuery.append("workflowId", executionFilters.workflowId)
          if (executionFilters?.startDate) execQuery.append("startDate", executionFilters.startDate)
          if (executionFilters?.endDate) execQuery.append("endDate", executionFilters.endDate)
          execQuery.append("limit", (executionFilters?.limit || limit).toString())
          execQuery.append("offset", (executionFilters?.offset || offset).toString())
          
          return await makeRequest(`/executions?${execQuery}`)

        case "getExecution":
          if (!executionId) throw new Error("executionId is required")
          const execDetailQuery = includeData ? "?includeData=true" : ""
          return await makeRequest(`/executions/${executionId}${execDetailQuery}`)

        case "deleteExecution":
          if (!executionId) throw new Error("executionId is required")
          return await makeRequest(`/executions/${executionId}`, "DELETE")

        case "retryExecution":
          if (!executionId) throw new Error("executionId is required")
          return await makeRequest(`/executions/${executionId}/retry`, "POST")

        case "stopExecution":
          if (!executionId) throw new Error("executionId is required")
          return await makeRequest(`/executions/${executionId}/stop`, "POST")

        case "getExecutionsCount":
          const countQuery = new URLSearchParams()
          if (executionFilters?.status) countQuery.append("status", executionFilters.status)
          if (executionFilters?.workflowId) countQuery.append("workflowId", executionFilters.workflowId)
          return await makeRequest(`/executions/count?${countQuery}`)

        // === CREDENTIAL MANAGEMENT ===
        case "getAllCredentials":
          const credQuery = new URLSearchParams()
          if (filter) credQuery.append("filter", filter)
          credQuery.append("limit", limit.toString())
          credQuery.append("offset", offset.toString())
          return await makeRequest(`/credentials?${credQuery}`)

        case "getCredential":
          if (!credentialId) throw new Error("credentialId is required")
          const credDetailQuery = includeData ? "?includeData=true" : ""
          return await makeRequest(`/credentials/${credentialId}${credDetailQuery}`)

        case "createCredential":
          if (!credentialData) throw new Error("credentialData is required")
          return await makeRequest("/credentials", "POST", credentialData)

        case "updateCredential":
          if (!credentialId || !credentialData) throw new Error("credentialId and credentialData are required")
          return await makeRequest(`/credentials/${credentialId}`, "PUT", credentialData)

        case "deleteCredential":
          if (!credentialId) throw new Error("credentialId is required")
          return await makeRequest(`/credentials/${credentialId}`, "DELETE")

        case "testCredential":
          if (!credentialId) throw new Error("credentialId is required")
          return await makeRequest(`/credentials/${credentialId}/test`, "POST")

        // === USER MANAGEMENT ===
        case "getAllUsers":
          const userQuery = new URLSearchParams()
          if (filter) userQuery.append("filter", filter)
          userQuery.append("limit", limit.toString())
          userQuery.append("offset", offset.toString())
          return await makeRequest(`/users?${userQuery}`)

        case "getUser":
          if (!userId) throw new Error("userId is required")
          return await makeRequest(`/users/${userId}`)

        case "createUser":
          if (!userData) throw new Error("userData is required")
          return await makeRequest("/users", "POST", userData)

        case "updateUser":
          if (!userId || !userData) throw new Error("userId and userData are required")
          return await makeRequest(`/users/${userId}`, "PUT", userData)

        case "deleteUser":
          if (!userId) throw new Error("userId is required")
          return await makeRequest(`/users/${userId}`, "DELETE")

        case "inviteUser":
          if (!userData) throw new Error("userData with email is required")
          return await makeRequest("/users/invite", "POST", { email: userData.email, role: userData.role })

        // === TAG MANAGEMENT ===
        case "getAllTags":
          return await makeRequest("/tags")

        case "createTag":
          if (!tagData) throw new Error("tagData is required")
          return await makeRequest("/tags", "POST", tagData)

        case "updateTag":
          if (!tagId || !tagData) throw new Error("tagId and tagData are required")
          return await makeRequest(`/tags/${tagId}`, "PUT", tagData)

        case "deleteTag":
          if (!tagId) throw new Error("tagId is required")
          return await makeRequest(`/tags/${tagId}`, "DELETE")

        // === VARIABLE MANAGEMENT ===
        case "getAllVariables":
          return await makeRequest("/variables")

        case "getVariable":
          if (!variableId) throw new Error("variableId is required")
          return await makeRequest(`/variables/${variableId}`)

        case "createVariable":
          if (!variableData) throw new Error("variableData is required")
          return await makeRequest("/variables", "POST", variableData)

        case "updateVariable":
          if (!variableId || !variableData) throw new Error("variableId and variableData are required")
          return await makeRequest(`/variables/${variableId}`, "PUT", variableData)

        case "deleteVariable":
          if (!variableId) throw new Error("variableId is required")
          return await makeRequest(`/variables/${variableId}`, "DELETE")

        // === HEALTH & MONITORING ===
        case "getHealthStatus":
          return await makeRequest("/health")

        case "getSystemInfo":
          return await makeRequest("/system/info")

        case "getMetrics":
          return await makeRequest("/metrics")

        case "getLogs":
          const logQuery = new URLSearchParams()
          logQuery.append("limit", limit.toString())
          logQuery.append("offset", offset.toString())
          if (filter) logQuery.append("level", filter)
          return await makeRequest(`/logs?${logQuery}`)

        // === WEBHOOK MANAGEMENT ===
        case "getAllWebhooks":
          if (!workflowId) throw new Error("workflowId is required")
          return await makeRequest(`/workflows/${workflowId}/webhooks`)

        case "createWebhook":
          if (!webhookData) throw new Error("webhookData is required")
          return await makeRequest("/webhooks", "POST", webhookData)

        case "getWebhookUrls":
          if (!workflowId) throw new Error("workflowId is required")
          return await makeRequest(`/workflows/${workflowId}/webhook-urls`)

        // === SOURCE CONTROL (Enterprise) ===
        case "getSourceControlStatus":
          return await makeRequest("/source-control/status")

        case "pullFromGit":
          return await makeRequest("/source-control/pull", "POST", gitData || {})

        case "pushToGit":
          if (!gitData?.commitMessage) throw new Error("commitMessage is required for push")
          return await makeRequest("/source-control/push", "POST", gitData)

        case "getGitBranches":
          return await makeRequest("/source-control/branches")

        case "switchBranch":
          if (!gitData?.branchName) throw new Error("branchName is required")
          return await makeRequest("/source-control/switch-branch", "POST", { branchName: gitData.branchName })

        // === COMMUNITY NODES ===
        case "getInstalledNodes":
          return await makeRequest("/community-packages")

        case "installCommunityNode":
          if (!nodePackage) throw new Error("nodePackage is required")
          return await makeRequest("/community-packages", "POST", { name: nodePackage })

        case "updateCommunityNode":
          if (!nodePackage) throw new Error("nodePackage is required")
          return await makeRequest(`/community-packages/${nodePackage}`, "PATCH")

        case "uninstallCommunityNode":
          if (!nodePackage) throw new Error("nodePackage is required")
          return await makeRequest(`/community-packages/${nodePackage}`, "DELETE")

        // === LICENSE & SETTINGS (Enterprise) ===
        case "getLicenseInfo":
          return await makeRequest("/license")

        case "getSettings":
          return await makeRequest("/settings")

        case "updateSettings":
          if (!secretData) throw new Error("settings data is required")
          return await makeRequest("/settings", "PUT", secretData)

        // === EXTERNAL SECRETS ===
        case "getExternalSecrets":
          return await makeRequest("/external-secrets")

        case "createExternalSecret":
          if (!secretData) throw new Error("secretData is required")
          return await makeRequest("/external-secrets", "POST", secretData)

        case "updateExternalSecret":
          if (!variableId || !secretData) throw new Error("secretId and secretData are required")
          return await makeRequest(`/external-secrets/${variableId}`, "PUT", secretData)

        case "deleteExternalSecret":
          if (!variableId) throw new Error("secretId is required")
          return await makeRequest(`/external-secrets/${variableId}`, "DELETE")

        // === PROJECT MANAGEMENT (Enterprise) ===
        case "getAllProjects":
          return await makeRequest("/projects")

        case "getProject":
          if (!projectId) throw new Error("projectId is required")
          return await makeRequest(`/projects/${projectId}`)

        case "createProject":
          if (!projectData) throw new Error("projectData is required")
          return await makeRequest("/projects", "POST", projectData)

        case "updateProject":
          if (!projectId || !projectData) throw new Error("projectId and projectData are required")
          return await makeRequest(`/projects/${projectId}`, "PUT", projectData)

        case "deleteProject":
          if (!projectId) throw new Error("projectId is required")
          return await makeRequest(`/projects/${projectId}`, "DELETE")

        case "getProjectMembers":
          if (!projectId) throw new Error("projectId is required")
          return await makeRequest(`/projects/${projectId}/members`)

        case "addProjectMember":
          if (!projectId || !userData) throw new Error("projectId and userData are required")
          return await makeRequest(`/projects/${projectId}/members`, "POST", userData)

        case "removeProjectMember":
          if (!projectId || !userId) throw new Error("projectId and userId are required")
          return await makeRequest(`/projects/${projectId}/members/${userId}`, "DELETE")

        // === AUDIT LOGS (Enterprise) ===
        case "getAuditLogs":
          const auditQuery = new URLSearchParams()
          auditQuery.append("limit", limit.toString())
          auditQuery.append("offset", offset.toString())
          if (filter) auditQuery.append("filter", filter)
          return await makeRequest(`/audit-logs?${auditQuery}`)

        // Default case
        default:
          throw new Error(`Unknown action: ${action}`)
      }

    } catch (error) {
      return {
        action,
        error: `n8n API call failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date().toISOString(),
      }
    } finally {
      // Clear loading state if callback is provided
      if (onProgress) {
        onProgress({ isLoading: false, action, workflowId, executionId })
      }
    }
  },
})