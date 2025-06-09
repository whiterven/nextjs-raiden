import { tool } from "ai"
import { z } from "zod"
import { getToolApiKey } from "@/lib/ai/tools/api-key-helper"
import { SERVICE_CONFIGS } from "@/lib/ai/tools/api-key-helper"

// Common Slack API response types
const SlackUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  real_name: z.string().optional(),
  email: z.string().optional(),
  is_bot: z.boolean().optional(),
  is_admin: z.boolean().optional(),
  profile: z.object({
    display_name: z.string().optional(),
    image_24: z.string().optional(),
    image_32: z.string().optional(),
    image_48: z.string().optional(),
    image_72: z.string().optional(),
    status_text: z.string().optional(),
    status_emoji: z.string().optional(),
  }).optional(),
})

const SlackChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  is_channel: z.boolean().optional(),
  is_group: z.boolean().optional(),
  is_im: z.boolean().optional(),
  is_private: z.boolean().optional(),
  is_archived: z.boolean().optional(),
  topic: z.object({
    value: z.string().optional(),
  }).optional(),
  purpose: z.object({
    value: z.string().optional(),
  }).optional(),
  num_members: z.number().optional(),
})

const SlackMessageSchema = z.object({
  ts: z.string(),
  user: z.string().optional(),
  bot_id: z.string().optional(),
  text: z.string(),
  thread_ts: z.string().optional(),
  reply_count: z.number().optional(),
  reactions: z.array(z.object({
    name: z.string(),
    count: z.number(),
    users: z.array(z.string()),
  })).optional(),
})

// Base Slack API helper
class SlackAPI {
  private baseUrl = "https://slack.com/api"
  private token: string

  constructor(token: string) {
    this.token = token
  }

  private async makeRequest(endpoint: string, method: string = "GET", body?: any): Promise<any> {
    const url = `${this.baseUrl}/${endpoint}`
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${this.token}`,
      "Content-Type": "application/json",
    }

    const config: RequestInit = {
      method,
      headers,
    }

    if (body) {
      if (body instanceof FormData) {
        delete headers["Content-Type"] // Let browser set multipart boundary
        config.body = body
      } else {
        config.body = JSON.stringify(body)
      }
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(`Slack API Error: ${data.error || "Unknown error"}`)
      }

      return data
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Network error: Unable to connect to Slack API")
      }
      throw error
    }
  }

  // Authentication & Testing
  async testAuth() {
    return this.makeRequest("auth.test")
  }

  // Messaging
  async postMessage(channel: string, text: string, options: any = {}) {
    return this.makeRequest("chat.postMessage", "POST", {
      channel,
      text,
      ...options,
    })
  }

  async updateMessage(channel: string, ts: string, text: string, options: any = {}) {
    return this.makeRequest("chat.update", "POST", {
      channel,
      ts,
      text,
      ...options,
    })
  }

  async deleteMessage(channel: string, ts: string) {
    return this.makeRequest("chat.delete", "POST", {
      channel,
      ts,
    })
  }

  async scheduleMessage(channel: string, text: string, postAt: number, options: any = {}) {
    return this.makeRequest("chat.scheduleMessage", "POST", {
      channel,
      text,
      post_at: postAt,
      ...options,
    })
  }

  async getPermalink(channel: string, messageTs: string) {
    return this.makeRequest("chat.getPermalink", "GET", {
      channel,
      message_ts: messageTs,
    })
  }

  // Reactions
  async addReaction(channel: string, timestamp: string, name: string) {
    return this.makeRequest("reactions.add", "POST", {
      channel,
      timestamp,
      name,
    })
  }

  async removeReaction(channel: string, timestamp: string, name: string) {
    return this.makeRequest("reactions.remove", "POST", {
      channel,
      timestamp,
      name,
    })
  }

  // Channels
  async listChannels(excludeArchived: boolean = true, limit: number = 100) {
    return this.makeRequest(`conversations.list?exclude_archived=${excludeArchived}&limit=${limit}`)
  }

  async createChannel(name: string, isPrivate: boolean = false) {
    return this.makeRequest("conversations.create", "POST", {
      name,
      is_private: isPrivate,
    })
  }

  async archiveChannel(channel: string) {
    return this.makeRequest("conversations.archive", "POST", {
      channel,
    })
  }

  async unarchiveChannel(channel: string) {
    return this.makeRequest("conversations.unarchive", "POST", {
      channel,
    })
  }

  async renameChannel(channel: string, name: string) {
    return this.makeRequest("conversations.rename", "POST", {
      channel,
      name,
    })
  }

  async setChannelTopic(channel: string, topic: string) {
    return this.makeRequest("conversations.setTopic", "POST", {
      channel,
      topic,
    })
  }

  async setChannelPurpose(channel: string, purpose: string) {
    return this.makeRequest("conversations.setPurpose", "POST", {
      channel,
      purpose,
    })
  }

  async getChannelInfo(channel: string) {
    return this.makeRequest(`conversations.info?channel=${channel}`)
  }

  async getChannelHistory(channel: string, limit: number = 100, oldest?: string, latest?: string) {
    const params = new URLSearchParams({
      channel,
      limit: limit.toString(),
    })
    if (oldest) params.append("oldest", oldest)
    if (latest) params.append("latest", latest)
    
    return this.makeRequest(`conversations.history?${params}`)
  }

  // Channel Members
  async inviteToChannel(channel: string, users: string[]) {
    return this.makeRequest("conversations.invite", "POST", {
      channel,
      users: users.join(","),
    })
  }

  async removeFromChannel(channel: string, user: string) {
    return this.makeRequest("conversations.kick", "POST", {
      channel,
      user,
    })
  }

  async getChannelMembers(channel: string, limit: number = 100) {
    return this.makeRequest(`conversations.members?channel=${channel}&limit=${limit}`)
  }

  async joinChannel(channel: string) {
    return this.makeRequest("conversations.join", "POST", {
      channel,
    })
  }

  async leaveChannel(channel: string) {
    return this.makeRequest("conversations.leave", "POST", {
      channel,
    })
  }

  // Users
  async listUsers(limit: number = 100) {
    return this.makeRequest(`users.list?limit=${limit}`)
  }

  async getUserInfo(user: string) {
    return this.makeRequest(`users.info?user=${user}`)
  }

  async getUserPresence(user: string) {
    return this.makeRequest(`users.getPresence?user=${user}`)
  }

  async setUserPresence(presence: "auto" | "away") {
    return this.makeRequest("users.setPresence", "POST", {
      presence,
    })
  }

  // Files
  async uploadFile(channels: string[], file: File | Buffer, filename?: string, title?: string, initialComment?: string) {
    const formData = new FormData()
    formData.append("channels", channels.join(","))
    
    if (file instanceof File) {
      formData.append("file", file)
      if (filename) formData.append("filename", filename)
    } else {
      formData.append("file", new Blob([file]), filename || "file")
    }
    
    if (title) formData.append("title", title)
    if (initialComment) formData.append("initial_comment", initialComment)

    return this.makeRequest("files.upload", "POST", formData)
  }

  async deleteFile(file: string) {
    return this.makeRequest("files.delete", "POST", {
      file,
    })
  }

  async getFileInfo(file: string) {
    return this.makeRequest(`files.info?file=${file}`)
  }

  async listFiles(channel?: string, user?: string, tsFrom?: string, tsTo?: string, count: number = 100) {
    const params = new URLSearchParams({
      count: count.toString(),
    })
    if (channel) params.append("channel", channel)
    if (user) params.append("user", user)
    if (tsFrom) params.append("ts_from", tsFrom)
    if (tsTo) params.append("ts_to", tsTo)
    
    return this.makeRequest(`files.list?${params}`)
  }

  // Direct Messages
  async openDirectMessage(user: string) {
    return this.makeRequest("conversations.open", "POST", {
      users: user,
    })
  }

  async openGroupMessage(users: string[]) {
    return this.makeRequest("conversations.open", "POST", {
      users: users.join(","),
    })
  }

  // Search
  async searchMessages(query: string, sort: "score" | "timestamp" = "score", count: number = 20) {
    return this.makeRequest(`search.messages?query=${encodeURIComponent(query)}&sort=${sort}&count=${count}`)
  }

  async searchFiles(query: string, sort: "score" | "timestamp" = "score", count: number = 20) {
    return this.makeRequest(`search.files?query=${encodeURIComponent(query)}&sort=${sort}&count=${count}`)
  }

  // Reminders
  async addReminder(text: string, time: string, user?: string) {
    return this.makeRequest("reminders.add", "POST", {
      text,
      time,
      user,
    })
  }

  async listReminders() {
    return this.makeRequest("reminders.list")
  }

  async deleteReminder(reminder: string) {
    return this.makeRequest("reminders.delete", "POST", {
      reminder,
    })
  }

  // Pins
  async pinMessage(channel: string, timestamp: string) {
    return this.makeRequest("pins.add", "POST", {
      channel,
      timestamp,
    })
  }

  async unpinMessage(channel: string, timestamp: string) {
    return this.makeRequest("pins.remove", "POST", {
      channel,
      timestamp,
    })
  }

  async listPins(channel: string) {
    return this.makeRequest(`pins.list?channel=${channel}`)
  }

  // Stars
  async addStar(channel: string, timestamp: string) {
    return this.makeRequest("stars.add", "POST", {
      channel,
      timestamp,
    })
  }

  async removeStar(channel: string, timestamp: string) {
    return this.makeRequest("stars.remove", "POST", {
      channel,
      timestamp,
    })
  }

  async listStars(count: number = 100) {
    return this.makeRequest(`stars.list?count=${count}`)
  }

  // Team Info
  async getTeamInfo() {
    return this.makeRequest("team.info")
  }

  // Emoji
  async listEmoji() {
    return this.makeRequest("emoji.list")
  }
}

export const slackTool = tool({
  description: "Comprehensive Slack integration tool for messaging, channel management, file operations, and team collaboration",
  parameters: z.object({
    operation: z.enum([
      // Authentication
      "test_auth",
      
      // Messaging
      "send_message", "update_message", "delete_message", "schedule_message", "get_permalink",
      
      // Reactions
      "add_reaction", "remove_reaction",
      
      // Channels
      "list_channels", "create_channel", "archive_channel", "unarchive_channel", 
      "rename_channel", "set_channel_topic", "set_channel_purpose", "get_channel_info", 
      "get_channel_history", "join_channel", "leave_channel",
      
      // Channel Members
      "invite_to_channel", "remove_from_channel", "get_channel_members",
      
      // Users
      "list_users", "get_user_info", "get_user_presence", "set_user_presence",
      
      // Files
      "upload_file", "delete_file", "get_file_info", "list_files",
      
      // Direct Messages
      "open_dm", "open_group_dm",
      
      // Search
      "search_messages", "search_files",
      
      // Reminders
      "add_reminder", "list_reminders", "delete_reminder",
      
      // Pins
      "pin_message", "unpin_message", "list_pins",
      
      // Stars
      "add_star", "remove_star", "list_stars",
      
      // Team
      "get_team_info", "list_emoji"
    ]).describe("The Slack operation to perform"),
    
    // Message parameters
    channel: z.string().optional().describe("Channel ID or name (for messaging operations)"),
    text: z.string().optional().describe("Message text content"),
    timestamp: z.string().optional().describe("Message timestamp for updates/deletions"),
    messageTs: z.string().optional().describe("Message timestamp for permalinks"),
    threadTs: z.string().optional().describe("Thread timestamp for threaded replies"),
    
    // Message formatting options
    blocks: z.array(z.any()).optional().describe("Slack Block Kit blocks for rich formatting"),
    attachments: z.array(z.any()).optional().describe("Message attachments"),
    asUser: z.boolean().optional().describe("Post as the authenticated user"),
    iconEmoji: z.string().optional().describe("Emoji to use as the icon"),
    iconUrl: z.string().optional().describe("URL to an image to use as the icon"),
    linkNames: z.boolean().optional().describe("Find and link channel names and usernames"),
    parse: z.enum(["full", "none"]).optional().describe("Change how messages are treated"),
    replyBroadcast: z.boolean().optional().describe("Broadcast thread reply to channel"),
    unfurlLinks: z.boolean().optional().describe("Enable unfurling of primarily text-based content"),
    unfurlMedia: z.boolean().optional().describe("Enable unfurling of media content"),
    username: z.string().optional().describe("Set bot's user name"),
    
    // Scheduling
    postAt: z.number().optional().describe("Unix timestamp for scheduled messages"),
    
    // Channel operations
    name: z.string().optional().describe("Channel name"),
    isPrivate: z.boolean().optional().describe("Create private channel"),
    topic: z.string().optional().describe("Channel topic"),
    purpose: z.string().optional().describe("Channel purpose"),
    
    // User operations
    user: z.string().optional().describe("User ID"),
    users: z.array(z.string()).optional().describe("Array of user IDs"),
    presence: z.enum(["auto", "away"]).optional().describe("User presence status"),
    
    // File operations
    file: z.string().optional().describe("File ID or file data"),
    filename: z.string().optional().describe("Filename"),
    title: z.string().optional().describe("File title"),
    initialComment: z.string().optional().describe("Initial comment for file"),
    channels: z.array(z.string()).optional().describe("Channels to share file to"),
    
    // Search parameters
    query: z.string().optional().describe("Search query"),
    sort: z.enum(["score", "timestamp"]).optional().default("score").describe("Sort order"),
    
    // Pagination and limits
    limit: z.number().optional().default(100).describe("Number of results to return"),
    count: z.number().optional().default(100).describe("Number of items to return"),
    oldest: z.string().optional().describe("Oldest timestamp for history"),
    latest: z.string().optional().describe("Latest timestamp for history"),
    excludeArchived: z.boolean().optional().default(true).describe("Exclude archived channels"),
    
    // Reactions
    reactionName: z.string().optional().describe("Emoji name for reactions"),
    
    // Reminders
    time: z.string().optional().describe("Reminder time (e.g., 'in 30 minutes', '2023-12-25 09:00')"),
    reminder: z.string().optional().describe("Reminder ID"),
    
    // Filters
    tsFrom: z.string().optional().describe("Start timestamp for file filtering"),
    tsTo: z.string().optional().describe("End timestamp for file filtering"),
    
    onProgress: z.function().optional().describe("Progress callback function"),
  }),
  
  execute: async ({ 
    operation, 
    channel, 
    text, 
    timestamp, 
    messageTs,
    threadTs,
    blocks,
    attachments,
    asUser,
    iconEmoji,
    iconUrl,
    linkNames,
    parse,
    replyBroadcast,
    unfurlLinks,
    unfurlMedia,
    username,
    postAt,
    name, 
    isPrivate,
    topic,
    purpose,
    user, 
    users,
    presence,
    file,
    filename,
    title,
    initialComment,
    channels,
    query,
    sort = "score",
    limit = 100,
    count = 100,
    oldest,
    latest,
    excludeArchived = true,
    reactionName,
    time,
    reminder,
    tsFrom,
    tsTo,
    onProgress 
  }) => {
    
    // Show loading state if callback is provided
    if (onProgress) {
      onProgress({ isLoading: true, operation, channel, user })
    }

    try {
      // Get API token from environment or user's stored keys
      let token;
      try {
        token = await getToolApiKey(
          SERVICE_CONFIGS.slack.serviceName,
          SERVICE_CONFIGS.slack.envVarName
        );
      } catch (error) {
        throw new Error(
          "Slack token not found. Please add one in your settings under API Keys with " +
          "service name 'slack' or 'SLACK_BOT_TOKEN'."
        )
      }

      if (!token) {
        throw new Error(
          "Slack token not found. Please add one in your settings under API Keys with " +
          "service name 'slack' or 'SLACK_BOT_TOKEN'."
        )
      }

      const slack = new SlackAPI(token)
      let result: any

      switch (operation) {
        // Authentication
        case "test_auth":
          result = await slack.testAuth()
          break

        // Messaging operations
        case "send_message":
          if (!channel || !text) {
            throw new Error("Channel and text are required for sending messages")
          }
          const messageOptions = {
            thread_ts: threadTs,
            blocks,
            attachments,
            as_user: asUser,
            icon_emoji: iconEmoji,
            icon_url: iconUrl,
            link_names: linkNames,
            parse,
            reply_broadcast: replyBroadcast,
            unfurl_links: unfurlLinks,
            unfurl_media: unfurlMedia,
            username,
          }
          result = await slack.postMessage(channel, text, messageOptions)
          break

        case "update_message":
          if (!channel || !timestamp || !text) {
            throw new Error("Channel, timestamp, and text are required for updating messages")
          }
          result = await slack.updateMessage(channel, timestamp, text, { blocks, attachments })
          break

        case "delete_message":
          if (!channel || !timestamp) {
            throw new Error("Channel and timestamp are required for deleting messages")
          }
          result = await slack.deleteMessage(channel, timestamp)
          break

        case "schedule_message":
          if (!channel || !text || !postAt) {
            throw new Error("Channel, text, and postAt are required for scheduling messages")
          }
          result = await slack.scheduleMessage(channel, text, postAt)
          break

        case "get_permalink":
          if (!channel || !messageTs) {
            throw new Error("Channel and messageTs are required for getting permalinks")
          }
          result = await slack.getPermalink(channel, messageTs)
          break

        // Reaction operations
        case "add_reaction":
          if (!channel || !timestamp || !reactionName) {
            throw new Error("Channel, timestamp, and reactionName are required for adding reactions")
          }
          result = await slack.addReaction(channel, timestamp, reactionName)
          break

        case "remove_reaction":
          if (!channel || !timestamp || !reactionName) {
            throw new Error("Channel, timestamp, and reactionName are required for removing reactions")
          }
          result = await slack.removeReaction(channel, timestamp, reactionName)
          break

        // Channel operations
        case "list_channels":
          result = await slack.listChannels(excludeArchived, limit)
          break

        case "create_channel":
          if (!name) {
            throw new Error("Name is required for creating channels")
          }
          result = await slack.createChannel(name, isPrivate)
          break

        case "archive_channel":
          if (!channel) {
            throw new Error("Channel is required for archiving")
          }
          result = await slack.archiveChannel(channel)
          break

        case "unarchive_channel":
          if (!channel) {
            throw new Error("Channel is required for unarchiving")
          }
          result = await slack.unarchiveChannel(channel)
          break

        case "rename_channel":
          if (!channel || !name) {
            throw new Error("Channel and name are required for renaming")
          }
          result = await slack.renameChannel(channel, name)
          break

        case "set_channel_topic":
          if (!channel || !topic) {
            throw new Error("Channel and topic are required for setting topic")
          }
          result = await slack.setChannelTopic(channel, topic)
          break

        case "set_channel_purpose":
          if (!channel || !purpose) {
            throw new Error("Channel and purpose are required for setting purpose")
          }
          result = await slack.setChannelPurpose(channel, purpose)
          break

        case "get_channel_info":
          if (!channel) {
            throw new Error("Channel is required for getting channel info")
          }
          result = await slack.getChannelInfo(channel)
          break

        case "get_channel_history":
          if (!channel) {
            throw new Error("Channel is required for getting channel history")
          }
          result = await slack.getChannelHistory(channel, limit, oldest, latest)
          break

        case "join_channel":
          if (!channel) {
            throw new Error("Channel is required for joining")
          }
          result = await slack.joinChannel(channel)
          break

        case "leave_channel":
          if (!channel) {
            throw new Error("Channel is required for leaving")
          }
          result = await slack.leaveChannel(channel)
          break

        // Channel member operations
        case "invite_to_channel":
          if (!channel || !users || users.length === 0) {
            throw new Error("Channel and users are required for inviting to channel")
          }
          result = await slack.inviteToChannel(channel, users)
          break

        case "remove_from_channel":
          if (!channel || !user) {
            throw new Error("Channel and user are required for removing from channel")
          }
          result = await slack.removeFromChannel(channel, user)
          break

        case "get_channel_members":
          if (!channel) {
            throw new Error("Channel is required for getting channel members")
          }
          result = await slack.getChannelMembers(channel, limit)
          break

        // User operations
        case "list_users":
          result = await slack.listUsers(limit)
          break

        case "get_user_info":
          if (!user) {
            throw new Error("User is required for getting user info")
          }
          result = await slack.getUserInfo(user)
          break

        case "get_user_presence":
          if (!user) {
            throw new Error("User is required for getting user presence")
          }
          result = await slack.getUserPresence(user)
          break

        case "set_user_presence":
          if (!presence) {
            throw new Error("Presence is required for setting user presence")
          }
          result = await slack.setUserPresence(presence)
          break

        // File operations
        case "upload_file":
          if (!channels || channels.length === 0 || !file) {
            throw new Error("Channels and file are required for uploading files")
          }
          // Note: This is a simplified version - in practice, you'd need to handle File objects properly
          result = await slack.uploadFile(channels, file as any, filename, title, initialComment)
          break

        case "delete_file":
          if (!file) {
            throw new Error("File is required for deleting files")
          }
          result = await slack.deleteFile(file)
          break

        case "get_file_info":
          if (!file) {
            throw new Error("File is required for getting file info")
          }
          result = await slack.getFileInfo(file)
          break

        case "list_files":
          result = await slack.listFiles(channel, user, tsFrom, tsTo, count)
          break

        // Direct message operations
        case "open_dm":
          if (!user) {
            throw new Error("User is required for opening DM")
          }
          result = await slack.openDirectMessage(user)
          break

        case "open_group_dm":
          if (!users || users.length === 0) {
            throw new Error("Users are required for opening group DM")
          }
          result = await slack.openGroupMessage(users)
          break

        // Search operations
        case "search_messages":
          if (!query) {
            throw new Error("Query is required for searching messages")
          }
          result = await slack.searchMessages(query, sort, count)
          break

        case "search_files":
          if (!query) {
            throw new Error("Query is required for searching files")
          }
          result = await slack.searchFiles(query, sort, count)
          break

        // Reminder operations
        case "add_reminder":
          if (!text || !time) {
            throw new Error("Text and time are required for adding reminders")
          }
          result = await slack.addReminder(text, time, user)
          break

        case "list_reminders":
          result = await slack.listReminders()
          break

        case "delete_reminder":
          if (!reminder) {
            throw new Error("Reminder is required for deleting reminders")
          }
          result = await slack.deleteReminder(reminder)
          break

        // Pin operations
        case "pin_message":
          if (!channel || !timestamp) {
            throw new Error("Channel and timestamp are required for pinning messages")
          }
          result = await slack.pinMessage(channel, timestamp)
          break

        case "unpin_message":
          if (!channel || !timestamp) {
            throw new Error("Channel and timestamp are required for unpinning messages")
          }
          result = await slack.unpinMessage(channel, timestamp)
          break

        case "list_pins":
          if (!channel) {
            throw new Error("Channel is required for listing pins")
          }
          result = await slack.listPins(channel)
          break

        // Star operations
        case "add_star":
          if (!channel || !timestamp) {
            throw new Error("Channel and timestamp are required for adding stars")
          }
          result = await slack.addStar(channel, timestamp)
          break

        case "remove_star":
          if (!channel || !timestamp) {
            throw new Error("Channel and timestamp are required for removing stars")
          }
          result = await slack.removeStar(channel, timestamp)
          break

        case "list_stars":
          result = await slack.listStars(count)
          break

        // Team operations
        case "get_team_info":
          result = await slack.getTeamInfo()
          break

        case "list_emoji":
          result = await slack.listEmoji()
          break

        default:
          throw new Error(`Unsupported operation: ${operation}`)
      }

      // Show completion if callback is provided
      if (onProgress) {
        onProgress({ isLoading: false, operation, success: true })
      }

      return {
        success: true,
        operation,
        data: result,
        timestamp: new Date().toISOString(),
      }

    } catch (error) {
      // Show error if callback is provided
      if (onProgress) {
        onProgress({ 
          isLoading: false, 
          operation, 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown error" 
        })
      }

      // Enhanced error handling with specific error types
      let errorMessage = "Unknown error occurred"
      let errorType = "unknown"

      if (error instanceof Error) {
        errorMessage = error.message
        
        // Categorize common Slack API errors
        if (errorMessage.includes("channel_not_found")) {
          errorType = "channel_not_found"
          errorMessage = "Channel not found. Please check the channel ID or name."
        } else if (errorMessage.includes("user_not_found")) {
          errorType = "user_not_found"
          errorMessage = "User not found. Please check the user ID."
        } else if (errorMessage.includes("not_in_channel")) {
          errorType = "not_in_channel"
          errorMessage = "Bot is not a member of this channel."
        } else if (errorMessage.includes("invalid_auth")) {
          errorType = "invalid_auth"
          errorMessage = "Invalid authentication token. Please check your Slack token."
        } else if (errorMessage.includes("missing_scope")) {
          errorType = "missing_scope"
          errorMessage = "Missing required OAuth scope. Please check your bot permissions."
        } else if (errorMessage.includes("rate_limited")) {
          errorType = "rate_limited"
          errorMessage = "Rate limited by Slack API. Please try again later."
        } else if (errorMessage.includes("Network error")) {
          errorType = "network_error"
          errorMessage = "Network error. Please check your internet connection."
        } else if (errorMessage.includes("file_not_found")) {
          errorType = "file_not_found"
          errorMessage = "File not found. Please check the file ID."
        } else if (errorMessage.includes("message_not_found")) {
          errorType = "message_not_found"
          errorMessage = "Message not found. Please check the timestamp."
        }
      }

      return {
        success: false,
        operation,
        error: errorMessage,
        errorType,
        timestamp: new Date().toISOString(),
        suggestions: getSuggestions(errorType, operation),
      }
    }
  },
})

// Helper function to provide suggestions based on error type
function getSuggestions(errorType: string, operation: string): string[] {
  const suggestions: string[] = []

  switch (errorType) {
    case "invalid_auth":
      suggestions.push("Verify your SLACK_BOT_TOKEN environment variable is set correctly")
      suggestions.push("Check that your token hasn't expired")
      suggestions.push("Ensure you're using a bot token (starts with 'xoxb-')")
      break

    case "missing_scope":
      suggestions.push("Review your app's OAuth scopes in the Slack App settings")
      suggestions.push("Reinstall the app to your workspace after adding required scopes")
      suggestions.push("Check the Slack API documentation for required scopes for this operation")
      break

    case "channel_not_found":
      suggestions.push("Use the channel ID (e.g., 'C1234567890') instead of channel name")
      suggestions.push("Ensure the channel exists and hasn't been deleted")
      suggestions.push("Check if the channel is archived")
      break

    case "user_not_found":
      suggestions.push("Use the user ID (e.g., 'U1234567890') instead of username")
      suggestions.push("Ensure the user is a member of your workspace")
      suggestions.push("Check if the user account is deactivated")
      break

    case "not_in_channel":
      suggestions.push("Invite the bot to the channel first")
      suggestions.push("Use the 'join_channel' operation to join public channels")
      suggestions.push("For private channels, a member must invite the bot")
      break

    case "rate_limited":
      suggestions.push("Implement exponential backoff retry logic")
      suggestions.push("Reduce the frequency of API calls")
      suggestions.push("Consider caching responses when possible")
      break

    case "network_error":
      suggestions.push("Check your internet connection")
      suggestions.push("Verify Slack's API status at status.slack.com")
      suggestions.push("Try again after a short delay")
      break

    case "file_not_found":
      suggestions.push("Verify the file ID is correct")
      suggestions.push("Check if the file was deleted")
      suggestions.push("Ensure you have permission to access the file")
      break

    case "message_not_found":
      suggestions.push("Verify the message timestamp is correct")
      suggestions.push("Check if the message was deleted")
      suggestions.push("Ensure the message exists in the specified channel")
      break

    default:
      if (operation.includes("message")) {
        suggestions.push("Check channel permissions and bot access")
        suggestions.push("Verify message content meets Slack's requirements")
      } else if (operation.includes("channel")) {
        suggestions.push("Ensure bot has appropriate channel permissions")
        suggestions.push("Check if channel name follows Slack naming conventions")
      } else if (operation.includes("user")) {
        suggestions.push("Verify user exists in the workspace")
        suggestions.push("Check bot permissions for user operations")
      }
      break
  }

  return suggestions
}

// Usage examples and documentation
export const slackToolExamples = {
  // Send a simple message
  sendMessage: {
    operation: "send_message",
    channel: "C1234567890", // or "#general"
    text: "Hello, World! 👋",
  },

  // Send a rich message with blocks
  sendRichMessage: {
    operation: "send_message",
    channel: "C1234567890",
    text: "Fallback text for notifications",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Hello!* This is a rich message with formatting."
        }
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Click Me"
            },
            action_id: "click_me_123"
          }
        ]
      }
    ]
  },

  // Create a private channel
  createPrivateChannel: {
    operation: "create_channel",
    name: "secret-project",
    isPrivate: true,
  },

  // Upload a file to multiple channels
  uploadFile: {
    operation: "upload_file",
    channels: ["C1234567890", "C0987654321"],
    filename: "report.pdf",
    title: "Monthly Report",
    initialComment: "Here's the monthly report for review.",
  },

  // Search for messages
  searchMessages: {
    operation: "search_messages",
    query: "project deadline",
    sort: "timestamp",
    count: 50,
  },

  // Schedule a message
  scheduleMessage: {
    operation: "schedule_message",
    channel: "C1234567890",
    text: "Don't forget about the meeting at 3 PM!",
    postAt: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  },

  // Get channel history
  getChannelHistory: {
    operation: "get_channel_history",
    channel: "C1234567890",
    limit: 50,
    oldest: "1609459200.000000", // Jan 1, 2021
  },

  // Add a reminder
  addReminder: {
    operation: "add_reminder",
    text: "Review the quarterly budget",
    time: "tomorrow at 9am",
  },

  // React to a message
  addReaction: {
    operation: "add_reaction",
    channel: "C1234567890",
    timestamp: "1234567890.123456",
    reactionName: "thumbsup",
  },

  // Open a direct message
  openDM: {
    operation: "open_dm",
    user: "U1234567890",
  },

  // Set user presence
  setPresence: {
    operation: "set_user_presence",
    presence: "away",
  },

  // List all channels
  listChannels: {
    operation: "list_channels",
    excludeArchived: true,
    limit: 200,
  },

  // Get team information
  getTeamInfo: {
    operation: "get_team_info",
  },
}

// Required environment variables and setup instructions
export const slackToolSetup = {
  requiredEnvVars: [
    "SLACK_BOT_TOKEN", // Primary token variable
    "SLACK_TOKEN",     // Alternative token variable
  ],
  
  requiredScopes: [
    // Channels
    "channels:read", "channels:write", "channels:history", "channels:join",
    // Groups (private channels)
    "groups:read", "groups:write", "groups:history",
    // IM (direct messages)
    "im:read", "im:write", "im:history",
    // MPIM (group direct messages)
    "mpim:read", "mpim:write", "mpim:history",
    // Chat
    "chat:write", "chat:write.public", "chat:write.customize",
    // Files
    "files:read", "files:write",
    // Users
    "users:read", "users:read.email", "users:write",
    // Reactions
    "reactions:read", "reactions:write",
    // Pins
    "pins:read", "pins:write",
    // Stars
    "stars:read", "stars:write",
    // Search
    "search:read",
    // Reminders
    "reminders:read", "reminders:write",
    // Team
    "team:read",
    // Emoji
    "emoji:read",
  ],

  setupInstructions: [
    "1. Create a Slack App at https://api.slack.com/apps",
    "2. Add the required OAuth scopes to your bot token",
    "3. Install the app to your workspace",
    "4. Copy the Bot User OAuth Token (starts with 'xoxb-')",
    "5. Set the token as SLACK_BOT_TOKEN environment variable",
    "6. Invite the bot to channels where you want to use it",
  ],

  commonIssues: [
    {
      issue: "Bot not responding in channels",
      solution: "Invite the bot to the channel or use /invite @botname"
    },
    {
      issue: "Permission denied errors",
      solution: "Check if all required OAuth scopes are added to your app"
    },
    {
      issue: "Rate limiting",
      solution: "Implement delays between API calls or use webhooks for real-time events"
    },
    {
      issue: "File upload failures",
      solution: "Ensure files are under 1GB and bot has files:write scope"
    }
  ]
}