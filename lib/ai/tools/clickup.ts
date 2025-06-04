import { tool } from "ai"
import { z } from "zod"

// ClickUp API Base URL
const CLICKUP_API_BASE = "https://api.clickup.com/api/v2"

// Common schemas
const TaskStatusSchema = z.object({
  id: z.string(),
  status: z.string(),
  color: z.string(),
  orderindex: z.number(),
  type: z.string()
})

const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  color: z.string(),
  email: z.string().optional(),
  profilePicture: z.string().optional()
})

const TaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: TaskStatusSchema,
  orderindex: z.string(),
  date_created: z.string(),
  date_updated: z.string(),
  date_closed: z.string().optional(),
  assignees: z.array(UserSchema),
  watchers: z.array(UserSchema),
  creator: UserSchema,
  checklists: z.array(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  parent: z.string().optional(),
  priority: z.object({
    id: z.string(),
    priority: z.string(),
    color: z.string()
  }).optional(),
  due_date: z.string().optional(),
  start_date: z.string().optional(),
  points: z.number().optional(),
  time_estimate: z.number().optional(),
  time_spent: z.number().optional(),
  custom_fields: z.array(z.any()).optional(),
  list: z.object({
    id: z.string(),
    name: z.string()
  }),
  folder: z.object({
    id: z.string(),
    name: z.string()
  }),
  space: z.object({
    id: z.string(),
    name: z.string()
  }),
  url: z.string()
})

export const clickUpTool = tool({
  description: "Comprehensive ClickUp tool for managing tasks, projects, teams, and workspaces with full CRUD operations",
  parameters: z.object({
    action: z.enum([
      // Task operations
      "getTasks", "getTask", "createTask", "updateTask", "deleteTask",
      // List operations
      "getLists", "getList", "createList", "updateList", "deleteList",
      // Space operations
      "getSpaces", "getSpace", "createSpace", "updateSpace", "deleteSpace",
      // Team operations
      "getTeams", "getTeam", "createTeam",
      // Folder operations
      "getFolders", "getFolder", "createFolder", "updateFolder", "deleteFolder",
      // Comment operations
      "getComments", "createComment", "updateComment", "deleteComment",
      // Time tracking
      "getTimeEntries", "createTimeEntry", "updateTimeEntry", "deleteTimeEntry",
      // Goal operations
      "getGoals", "getGoal", "createGoal", "updateGoal", "deleteGoal",
      // Custom field operations
      "getCustomFields", "setCustomFieldValue",
      // Webhook operations
      "getWebhooks", "createWebhook", "updateWebhook", "deleteWebhook",
      // User operations
      "getUser", "getTeamMembers",
      // Search
      "searchTasks", "searchTeams"
    ]).describe("The action to perform"),
    
    // Authentication
    apiKey: z.string().describe("ClickUp API key (required for all operations)"),
    
    // Common parameters
    teamId: z.string().optional().describe("Team ID for team-specific operations"),
    spaceId: z.string().optional().describe("Space ID for space-specific operations"),
    folderId: z.string().optional().describe("Folder ID for folder-specific operations"),
    listId: z.string().optional().describe("List ID for list-specific operations"),
    taskId: z.string().optional().describe("Task ID for task-specific operations"),
    
    // Task-specific parameters
    taskData: z.object({
      name: z.string(),
      description: z.string().optional(),
      assignees: z.array(z.number()).optional(),
      tags: z.array(z.string()).optional(),
      status: z.string().optional(),
      priority: z.number().optional().describe("1=urgent, 2=high, 3=normal, 4=low"),
      due_date: z.number().optional().describe("Unix timestamp in milliseconds"),
      due_date_time: z.boolean().optional(),
      time_estimate: z.number().optional().describe("Time estimate in milliseconds"),
      start_date: z.number().optional().describe("Unix timestamp in milliseconds"),
      start_date_time: z.boolean().optional(),
      notify_all: z.boolean().optional(),
      parent: z.string().optional(),
      links_to: z.string().optional(),
      check_required_custom_fields: z.boolean().optional(),
      custom_fields: z.array(z.object({
        id: z.string(),
        value: z.any()
      })).optional()
    }).optional(),
    
    // List-specific parameters
    listData: z.object({
      name: z.string(),
      content: z.string().optional(),
      due_date: z.number().optional(),
      due_date_time: z.boolean().optional(),
      priority: z.number().optional(),
      assignee: z.number().optional(),
      status: z.string().optional()
    }).optional(),
    
    // Space-specific parameters
    spaceData: z.object({
      name: z.string(),
      multiple_assignees: z.boolean().optional(),
      features: z.object({
        due_dates: z.object({ enabled: z.boolean(), start_date: z.boolean(), remap_due_dates: z.boolean(), remap_closed_due_date: z.boolean() }).optional(),
        time_tracking: z.object({ enabled: z.boolean() }).optional(),
        tags: z.object({ enabled: z.boolean() }).optional(),
        time_estimates: z.object({ enabled: z.boolean() }).optional(),
        checklists: z.object({ enabled: z.boolean() }).optional(),
        custom_fields: z.object({ enabled: z.boolean() }).optional(),
        remap_dependencies: z.object({ enabled: z.boolean() }).optional(),
        dependency_warning: z.object({ enabled: z.boolean() }).optional(),
        portfolios: z.object({ enabled: z.boolean() }).optional()
      }).optional()
    }).optional(),
    
    // Folder-specific parameters
    folderData: z.object({
      name: z.string()
    }).optional(),
    
    // Comment-specific parameters
    commentData: z.object({
      comment_text: z.string(),
      assignee: z.number().optional(),
      notify_all: z.boolean().optional()
    }).optional(),
    commentId: z.string().optional(),
    
    // Time tracking parameters
    timeEntryData: z.object({
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
      start: z.number().describe("Unix timestamp in milliseconds"),
      billable: z.boolean().optional(),
      duration: z.number().describe("Duration in milliseconds"),
      assignee: z.number().optional(),
      tid: z.string().optional().describe("Task ID to track time for")
    }).optional(),
    timerEntryId: z.string().optional(),
    
    // Goal parameters
    goalData: z.object({
      name: z.string(),
      due_date: z.number().optional(),
      description: z.string().optional(),
      multiple_owners: z.boolean().optional(),
      owners: z.array(z.number()).optional(),
      color: z.string().optional()
    }).optional(),
    goalId: z.string().optional(),
    
    // Custom field parameters
    customFieldId: z.string().optional(),
    customFieldValue: z.any().optional(),
    
    // Webhook parameters
    webhookData: z.object({
      endpoint: z.string(),
      events: z.array(z.string())
    }).optional(),
    webhookId: z.string().optional(),
    
    // Search parameters
    query: z.string().optional().describe("Search query"),
    
    // Filtering and pagination
    page: z.number().optional().default(0),
    orderBy: z.string().optional(),
    reverse: z.boolean().optional(),
    subtasks: z.boolean().optional(),
    statuses: z.array(z.string()).optional(),
    includeClosed: z.boolean().optional(),
    assignees: z.array(z.number()).optional(),
    tags: z.array(z.string()).optional(),
    dueDateGt: z.number().optional(),
    dueDateLt: z.number().optional(),
    dateCreatedGt: z.number().optional(),
    dateCreatedLt: z.number().optional(),
    dateUpdatedGt: z.number().optional(),
    dateUpdatedLt: z.number().optional(),
    
    // Progress callback
    onProgress: z.function().optional().describe("Callback function to show loading state")
  }),
  
  execute: async (params) => {
    const { action, apiKey, onProgress } = params
    
    // Show loading state
    if (onProgress) {
      onProgress({ isLoading: true, action })
    }
    
    try {
      // Validate API key
      if (!apiKey) {
        throw new Error("ClickUp API key is required")
      }
      
      const headers = {
        "Authorization": apiKey,
        "Content-Type": "application/json"
      }
      
      let url = ""
      let method = "GET"
      let body: any = null
      
      switch (action) {
        // Task operations
        case "getTasks":
          if (!params.listId) throw new Error("listId is required for getTasks")
          url = `${CLICKUP_API_BASE}/list/${params.listId}/task`
          const taskParams = new URLSearchParams()
          if (params.page !== undefined) taskParams.append("page", params.page.toString())
          if (params.orderBy) taskParams.append("order_by", params.orderBy)
          if (params.reverse) taskParams.append("reverse", "true")
          if (params.subtasks) taskParams.append("subtasks", "true")
          if (params.statuses) params.statuses.forEach(s => taskParams.append("statuses[]", s))
          if (params.includeClosed) taskParams.append("include_closed", "true")
          if (params.assignees) params.assignees.forEach(a => taskParams.append("assignees[]", a.toString()))
          if (params.tags) params.tags.forEach(t => taskParams.append("tags[]", t))
          if (params.dueDateGt) taskParams.append("due_date_gt", params.dueDateGt.toString())
          if (params.dueDateLt) taskParams.append("due_date_lt", params.dueDateLt.toString())
          if (params.dateCreatedGt) taskParams.append("date_created_gt", params.dateCreatedGt.toString())
          if (params.dateCreatedLt) taskParams.append("date_created_lt", params.dateCreatedLt.toString())
          if (params.dateUpdatedGt) taskParams.append("date_updated_gt", params.dateUpdatedGt.toString())
          if (params.dateUpdatedLt) taskParams.append("date_updated_lt", params.dateUpdatedLt.toString())
          if (taskParams.toString()) url += `?${taskParams.toString()}`
          break
          
        case "getTask":
          if (!params.taskId) throw new Error("taskId is required for getTask")
          url = `${CLICKUP_API_BASE}/task/${params.taskId}`
          break
          
        case "createTask":
          if (!params.listId || !params.taskData) throw new Error("listId and taskData are required for createTask")
          url = `${CLICKUP_API_BASE}/list/${params.listId}/task`
          method = "POST"
          body = JSON.stringify(params.taskData)
          break
          
        case "updateTask":
          if (!params.taskId || !params.taskData) throw new Error("taskId and taskData are required for updateTask")
          url = `${CLICKUP_API_BASE}/task/${params.taskId}`
          method = "PUT"
          body = JSON.stringify(params.taskData)
          break
          
        case "deleteTask":
          if (!params.taskId) throw new Error("taskId is required for deleteTask")
          url = `${CLICKUP_API_BASE}/task/${params.taskId}`
          method = "DELETE"
          break
          
        // List operations
        case "getLists":
          if (!params.folderId) throw new Error("folderId is required for getLists")
          url = `${CLICKUP_API_BASE}/folder/${params.folderId}/list`
          break
          
        case "getList":
          if (!params.listId) throw new Error("listId is required for getList")
          url = `${CLICKUP_API_BASE}/list/${params.listId}`
          break
          
        case "createList":
          if (!params.folderId || !params.listData) throw new Error("folderId and listData are required for createList")
          url = `${CLICKUP_API_BASE}/folder/${params.folderId}/list`
          method = "POST"
          body = JSON.stringify(params.listData)
          break
          
        case "updateList":
          if (!params.listId || !params.listData) throw new Error("listId and listData are required for updateList")
          url = `${CLICKUP_API_BASE}/list/${params.listId}`
          method = "PUT"
          body = JSON.stringify(params.listData)
          break
          
        case "deleteList":
          if (!params.listId) throw new Error("listId is required for deleteList")
          url = `${CLICKUP_API_BASE}/list/${params.listId}`
          method = "DELETE"
          break
          
        // Space operations
        case "getSpaces":
          if (!params.teamId) throw new Error("teamId is required for getSpaces")
          url = `${CLICKUP_API_BASE}/team/${params.teamId}/space`
          break
          
        case "getSpace":
          if (!params.spaceId) throw new Error("spaceId is required for getSpace")
          url = `${CLICKUP_API_BASE}/space/${params.spaceId}`
          break
          
        case "createSpace":
          if (!params.teamId || !params.spaceData) throw new Error("teamId and spaceData are required for createSpace")
          url = `${CLICKUP_API_BASE}/team/${params.teamId}/space`
          method = "POST"
          body = JSON.stringify(params.spaceData)
          break
          
        case "updateSpace":
          if (!params.spaceId || !params.spaceData) throw new Error("spaceId and spaceData are required for updateSpace")
          url = `${CLICKUP_API_BASE}/space/${params.spaceId}`
          method = "PUT"
          body = JSON.stringify(params.spaceData)
          break
          
        case "deleteSpace":
          if (!params.spaceId) throw new Error("spaceId is required for deleteSpace")
          url = `${CLICKUP_API_BASE}/space/${params.spaceId}`
          method = "DELETE"
          break
          
        // Team operations
        case "getTeams":
          url = `${CLICKUP_API_BASE}/team`
          break
          
        case "getTeam":
          if (!params.teamId) throw new Error("teamId is required for getTeam")
          url = `${CLICKUP_API_BASE}/team/${params.teamId}`
          break
          
        // Folder operations
        case "getFolders":
          if (!params.spaceId) throw new Error("spaceId is required for getFolders")
          url = `${CLICKUP_API_BASE}/space/${params.spaceId}/folder`
          break
          
        case "getFolder":
          if (!params.folderId) throw new Error("folderId is required for getFolder")
          url = `${CLICKUP_API_BASE}/folder/${params.folderId}`
          break
          
        case "createFolder":
          if (!params.spaceId || !params.folderData) throw new Error("spaceId and folderData are required for createFolder")
          url = `${CLICKUP_API_BASE}/space/${params.spaceId}/folder`
          method = "POST"
          body = JSON.stringify(params.folderData)
          break
          
        case "updateFolder":
          if (!params.folderId || !params.folderData) throw new Error("folderId and folderData are required for updateFolder")
          url = `${CLICKUP_API_BASE}/folder/${params.folderId}`
          method = "PUT"
          body = JSON.stringify(params.folderData)
          break
          
        case "deleteFolder":
          if (!params.folderId) throw new Error("folderId is required for deleteFolder")
          url = `${CLICKUP_API_BASE}/folder/${params.folderId}`
          method = "DELETE"
          break
          
        // Comment operations
        case "getComments":
          if (!params.taskId) throw new Error("taskId is required for getComments")
          url = `${CLICKUP_API_BASE}/task/${params.taskId}/comment`
          break
          
        case "createComment":
          if (!params.taskId || !params.commentData) throw new Error("taskId and commentData are required for createComment")
          url = `${CLICKUP_API_BASE}/task/${params.taskId}/comment`
          method = "POST"
          body = JSON.stringify(params.commentData)
          break
          
        case "updateComment":
          if (!params.commentId || !params.commentData) throw new Error("commentId and commentData are required for updateComment")
          url = `${CLICKUP_API_BASE}/comment/${params.commentId}`
          method = "PUT"
          body = JSON.stringify(params.commentData)
          break
          
        case "deleteComment":
          if (!params.commentId) throw new Error("commentId is required for deleteComment")
          url = `${CLICKUP_API_BASE}/comment/${params.commentId}`
          method = "DELETE"
          break
          
        // Time tracking operations
        case "getTimeEntries":
          if (!params.teamId) throw new Error("teamId is required for getTimeEntries")
          url = `${CLICKUP_API_BASE}/team/${params.teamId}/time_entries`
          break
          
        case "createTimeEntry":
          if (!params.teamId || !params.timeEntryData) throw new Error("teamId and timeEntryData are required for createTimeEntry")
          url = `${CLICKUP_API_BASE}/team/${params.teamId}/time_entries`
          method = "POST"
          body = JSON.stringify(params.timeEntryData)
          break
          
        case "updateTimeEntry":
          if (!params.teamId || !params.timerEntryId || !params.timeEntryData) throw new Error("teamId, timerEntryId and timeEntryData are required for updateTimeEntry")
          url = `${CLICKUP_API_BASE}/team/${params.teamId}/time_entries/${params.timerEntryId}`
          method = "PUT"
          body = JSON.stringify(params.timeEntryData)
          break
          
        case "deleteTimeEntry":
          if (!params.teamId || !params.timerEntryId) throw new Error("teamId and timerEntryId are required for deleteTimeEntry")
          url = `${CLICKUP_API_BASE}/team/${params.teamId}/time_entries/${params.timerEntryId}`
          method = "DELETE"
          break
          
        // Goal operations
        case "getGoals":
          if (!params.teamId) throw new Error("teamId is required for getGoals")
          url = `${CLICKUP_API_BASE}/team/${params.teamId}/goal`
          break
          
        case "getGoal":
          if (!params.goalId) throw new Error("goalId is required for getGoal")
          url = `${CLICKUP_API_BASE}/goal/${params.goalId}`
          break
          
        case "createGoal":
          if (!params.teamId || !params.goalData) throw new Error("teamId and goalData are required for createGoal")
          url = `${CLICKUP_API_BASE}/team/${params.teamId}/goal`
          method = "POST"
          body = JSON.stringify(params.goalData)
          break
          
        case "updateGoal":
          if (!params.goalId || !params.goalData) throw new Error("goalId and goalData are required for updateGoal")
          url = `${CLICKUP_API_BASE}/goal/${params.goalId}`
          method = "PUT"
          body = JSON.stringify(params.goalData)
          break
          
        case "deleteGoal":
          if (!params.goalId) throw new Error("goalId is required for deleteGoal")
          url = `${CLICKUP_API_BASE}/goal/${params.goalId}`
          method = "DELETE"
          break
          
        // Custom field operations
        case "getCustomFields":
          if (!params.listId) throw new Error("listId is required for getCustomFields")
          url = `${CLICKUP_API_BASE}/list/${params.listId}/field`
          break
          
        case "setCustomFieldValue":
          if (!params.taskId || !params.customFieldId || params.customFieldValue === undefined) {
            throw new Error("taskId, customFieldId and customFieldValue are required for setCustomFieldValue")
          }
          url = `${CLICKUP_API_BASE}/task/${params.taskId}/field/${params.customFieldId}`
          method = "POST"
          body = JSON.stringify({ value: params.customFieldValue })
          break
          
        // Webhook operations
        case "getWebhooks":
          if (!params.teamId) throw new Error("teamId is required for getWebhooks")
          url = `${CLICKUP_API_BASE}/team/${params.teamId}/webhook`
          break
          
        case "createWebhook":
          if (!params.teamId || !params.webhookData) throw new Error("teamId and webhookData are required for createWebhook")
          url = `${CLICKUP_API_BASE}/team/${params.teamId}/webhook`
          method = "POST"
          body = JSON.stringify(params.webhookData)
          break
          
        case "updateWebhook":
          if (!params.webhookId || !params.webhookData) throw new Error("webhookId and webhookData are required for updateWebhook")
          url = `${CLICKUP_API_BASE}/webhook/${params.webhookId}`
          method = "PUT"
          body = JSON.stringify(params.webhookData)
          break
          
        case "deleteWebhook":
          if (!params.webhookId) throw new Error("webhookId is required for deleteWebhook")
          url = `${CLICKUP_API_BASE}/webhook/${params.webhookId}`
          method = "DELETE"
          break
          
        // User operations
        case "getUser":
          url = `${CLICKUP_API_BASE}/user`
          break
          
        case "getTeamMembers":
          if (!params.teamId) throw new Error("teamId is required for getTeamMembers")
          url = `${CLICKUP_API_BASE}/team/${params.teamId}`
          break
          
        // Search operations
        case "searchTasks":
          if (!params.teamId || !params.query) throw new Error("teamId and query are required for searchTasks")
          url = `${CLICKUP_API_BASE}/team/${params.teamId}/task`
          const searchParams = new URLSearchParams({ search: params.query })
          url += `?${searchParams.toString()}`
          break
          
        case "searchTeams":
          if (!params.query) throw new Error("query is required for searchTeams")
          url = `${CLICKUP_API_BASE}/team`
          break
          
        default:
          throw new Error(`Unknown action: ${action}`)
      }
      
      // Make the API request
      const requestOptions: RequestInit = {
        method,
        headers
      }
      
      if (body) {
        requestOptions.body = body
      }
      
      const response = await fetch(url, requestOptions)
      
      // Handle different response types
      let data: any
      const contentType = response.headers.get("content-type")
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        data = await response.text()
      }
      
      // Handle API errors
      if (!response.ok) {
        const errorMessage = data?.err || data?.error || data || `HTTP ${response.status}: ${response.statusText}`
        throw new Error(`ClickUp API Error: ${errorMessage}`)
      }
      
      // Handle empty responses for DELETE operations
      if (method === "DELETE" && !data) {
        data = { success: true, message: `${action} completed successfully` }
      }
      
      return {
        success: true,
        action,
        data,
        timestamp: new Date().toISOString(),
        status: response.status,
        url: url.replace(apiKey, "[REDACTED]") // Hide API key in logs
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      
      return {
        success: false,
        action,
        error: errorMessage,
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? {
          name: error.name,
          stack: error.stack
        } : undefined
      }
    } finally {
      // Clear loading state
      if (onProgress) {
        onProgress({ isLoading: false, action })
      }
    }
  }
})