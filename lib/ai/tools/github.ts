import { tool } from "ai"
import { z } from "zod"
import { getToolApiKey } from "@/lib/ai/tools/api-key-helper"
import { SERVICE_CONFIGS } from "@/lib/ai/tools/api-key-helper"

// GitHub API base URL
const GITHUB_API_BASE = "https://api.github.com"

// Common schemas
const GitHubErrorSchema = z.object({
  message: z.string(),
  documentation_url: z.string().optional(),
  errors: z.array(z.any()).optional(),
})

const FileContentSchema = z.object({
  name: z.string(),
  path: z.string(),
  sha: z.string(),
  size: z.number(),
  url: z.string(),
  html_url: z.string(),
  git_url: z.string(),
  download_url: z.string().nullable(),
  type: z.enum(["file", "dir"]),
  content: z.string().optional(),
  encoding: z.string().optional(),
})

const RepositorySchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  private: z.boolean(),
  html_url: z.string(),
  description: z.string().nullable(),
  fork: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  pushed_at: z.string(),
  size: z.number(),
  stargazers_count: z.number(),
  watchers_count: z.number(),
  language: z.string().nullable(),
  forks_count: z.number(),
  default_branch: z.string(),
})

// Helper function to make authenticated GitHub API requests
async function makeGitHubRequest(
  endpoint: string,
  options: RequestInit = {},
  token: string
): Promise<any> {
  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(`GitHub API Error: ${data.message || response.statusText}`)
  }

  return data
}

// Helper function to encode content to base64
function encodeBase64(content: string): string {
  return Buffer.from(content, 'utf-8').toString('base64')
}

// Helper function to decode content from base64
function decodeBase64(content: string): string {
  return Buffer.from(content, 'base64').toString('utf-8')
}

export const gitHub = tool({
  description: "Comprehensive GitHub tool for repository and file management operations",
  parameters: z.object({
    action: z.enum([
      // Repository operations
      "create_repo",
      "get_repo",
      "list_user_repos",
      "list_org_repos",
      "update_repo",
      "delete_repo",
      "fork_repo",
      
      // File operations
      "get_file",
      "create_file",
      "update_file",
      "delete_file",
      "get_directory",
      
      // Branch operations
      "list_branches",
      "get_branch",
      "create_branch",
      "delete_branch",
      
      // Commit operations
      "list_commits",
      "get_commit",
      "create_commit",
      
      // Pull Request operations
      "list_pull_requests",
      "get_pull_request",
      "create_pull_request",
      "update_pull_request",
      "merge_pull_request",
      "close_pull_request",
      
      // Issue operations
      "list_issues",
      "get_issue",
      "create_issue",
      "update_issue",
      "close_issue",
      
      // Release operations
      "list_releases",
      "get_release",
      "create_release",
      "update_release",
      "delete_release",
      
      // Collaboration operations
      "list_collaborators",
      "add_collaborator",
      "remove_collaborator",
      "check_collaborator",
      
      // Webhook operations
      "list_webhooks",
      "create_webhook",
      "update_webhook",
      "delete_webhook",
      
      // Search operations
      "search_repositories",
      "search_code",
      "search_commits",
      "search_issues",
      
      // User operations
      "get_user",
      "get_authenticated_user",
      "list_user_organizations",
      
      // Gist operations
      "list_gists",
      "get_gist",
      "create_gist",
      "update_gist",
      "delete_gist",
    ]).describe("The GitHub operation to perform"),
    
    // Authentication
    token: z.string().optional().describe("GitHub personal access token (will use GITHUB_TOKEN from env if not provided)"),
    
    // Repository info
    owner: z.string().optional().describe("Repository owner (username or organization)"),
    repo: z.string().optional().describe("Repository name"),
    
    // File operations
    path: z.string().optional().describe("File or directory path"),
    content: z.string().optional().describe("File content for create/update operations"),
    message: z.string().optional().describe("Commit message"),
    branch: z.string().optional().describe("Branch name (defaults to default branch)"),
    sha: z.string().optional().describe("SHA of the file being updated"),
    
    // Repository creation/update
    name: z.string().optional().describe("Repository name"),
    description: z.string().optional().describe("Repository description"),
    private: z.boolean().optional().describe("Whether repository should be private"),
    has_issues: z.boolean().optional().describe("Enable issues"),
    has_projects: z.boolean().optional().describe("Enable projects"),
    has_wiki: z.boolean().optional().describe("Enable wiki"),
    
    // Branch operations
    from_branch: z.string().optional().describe("Source branch for creating new branch"),
    
    // Pull Request operations
    title: z.string().optional().describe("Pull request title"),
    body: z.string().optional().describe("Pull request body"),
    head: z.string().optional().describe("Head branch for pull request"),
    base: z.string().optional().describe("Base branch for pull request"),
    draft: z.boolean().optional().describe("Create as draft pull request"),
    
    // Issue operations
    labels: z.array(z.string()).optional().describe("Issue labels"),
    assignees: z.array(z.string()).optional().describe("Issue assignees"),
    milestone: z.number().optional().describe("Milestone number"),
    
    // Release operations
    tag_name: z.string().optional().describe("Git tag name for release"),
    target_commitish: z.string().optional().describe("Target branch or commit SHA"),
    name_release: z.string().optional().describe("Release name"),
    body_release: z.string().optional().describe("Release body/notes"),
    draft_release: z.boolean().optional().describe("Create as draft release"),
    prerelease: z.boolean().optional().describe("Mark as prerelease"),
    
    // Collaboration
    username: z.string().optional().describe("Username for collaboration operations"),
    permission: z.enum(["pull", "push", "admin", "maintain", "triage"]).optional().describe("Permission level"),
    
    // Webhook operations
    url: z.string().optional().describe("Webhook URL"),
    events: z.array(z.string()).optional().describe("Webhook events"),
    secret: z.string().optional().describe("Webhook secret"),
    
    // Search operations
    query: z.string().optional().describe("Search query"),
    sort: z.string().optional().describe("Sort field"),
    order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
    
    // Pagination
    per_page: z.number().optional().default(30).describe("Results per page (max 100)"),
    page: z.number().optional().default(1).describe("Page number"),
    
    // Gist operations
    gist_id: z.string().optional().describe("Gist ID"),
    files: z.record(z.object({
      content: z.string().optional(),
      filename: z.string().optional(),
    })).optional().describe("Gist files"),
    public: z.boolean().optional().describe("Make gist public"),
    
    // Additional options
    auto_init: z.boolean().optional().describe("Auto-initialize repository with README"),
    gitignore_template: z.string().optional().describe("Gitignore template"),
    license_template: z.string().optional().describe("License template"),
    
    onProgress: z.function().optional().describe("Progress callback function"),
  }),
  
  execute: async ({
    action,
    token,
    owner,
    repo,
    path,
    content,
    message,
    branch,
    sha,
    name,
    description,
    private: isPrivate,
    has_issues,
    has_projects,
    has_wiki,
    from_branch,
    title,
    body,
    head,
    base,
    draft,
    labels,
    assignees,
    milestone,
    tag_name,
    target_commitish,
    name_release,
    body_release,
    draft_release,
    prerelease,
    username,
    permission,
    url,
    events,
    secret,
    query,
    sort,
    order,
    per_page = 30,
    page = 1,
    gist_id,
    files,
    public: isPublic,
    auto_init,
    gitignore_template,
    license_template,
    onProgress,
  }) => {
    try {
      // Get token using API key helper
      let authToken: string;
      
      if (token) {
        // Use provided token if available
        authToken = token;
      } else {
        try {
          // Get token from user's stored API keys or environment variable
          authToken = await getToolApiKey(
            SERVICE_CONFIGS.github.serviceName, 
            SERVICE_CONFIGS.github.envVarName
          );
        } catch (error) {
          throw new Error(
            `GitHub token not found. To add one, go to Settings > API Keys and add a key with ` + 
            `"github" or "GITHUB_TOKEN" as the service name. You can create a GitHub token at ` +
            `https://github.com/settings/tokens with 'repo' scope.`
          )
        }
      }
      
      if (!authToken) {
        throw new Error(
          `GitHub token not found. To add one, go to Settings > API Keys and add a key with ` +
          `"github" or "GITHUB_TOKEN" as the service name. You can create a GitHub token at ` +
          `https://github.com/settings/tokens with 'repo' scope.`
        )
      }

      if (onProgress) {
        onProgress({ isLoading: true, action, message: `Executing ${action}...` })
      }

      switch (action) {
        // Repository operations
        case "create_repo": {
          if (!name) throw new Error("Repository name is required")
          
          const payload: any = {
            name,
            description,
            private: isPrivate,
            has_issues,
            has_projects,
            has_wiki,
            auto_init,
            gitignore_template,
            license_template,
          }
          
          const result = await makeGitHubRequest("/user/repos", {
            method: "POST",
            body: JSON.stringify(payload),
          }, authToken)
          
          return {
            success: true,
            action,
            data: result,
            message: `Repository '${name}' created successfully`,
          }
        }

        case "get_repo": {
          if (!owner || !repo) throw new Error("Owner and repo are required")
          
          const result = await makeGitHubRequest(`/repos/${owner}/${repo}`, {}, authToken)
          
          return {
            success: true,
            action,
            data: result,
          }
        }

        case "list_user_repos": {
          const endpoint = owner ? `/users/${owner}/repos` : "/user/repos"
          const result = await makeGitHubRequest(`${endpoint}?per_page=${per_page}&page=${page}`, {}, authToken)
          
          return {
            success: true,
            action,
            data: result,
            count: result.length,
          }
        }

        case "update_repo": {
          if (!owner || !repo) throw new Error("Owner and repo are required")
          
          const payload: any = {
            name,
            description,
            private: isPrivate,
            has_issues,
            has_projects,
            has_wiki,
          }
          
          const result = await makeGitHubRequest(`/repos/${owner}/${repo}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          }, authToken)
          
          return {
            success: true,
            action,
            data: result,
            message: `Repository '${owner}/${repo}' updated successfully`,
          }
        }

        case "delete_repo": {
          if (!owner || !repo) throw new Error("Owner and repo are required")
          
          await makeGitHubRequest(`/repos/${owner}/${repo}`, {
            method: "DELETE",
          }, authToken)
          
          return {
            success: true,
            action,
            message: `Repository '${owner}/${repo}' deleted successfully`,
          }
        }

        case "fork_repo": {
          if (!owner || !repo) throw new Error("Owner and repo are required")
          
          const result = await makeGitHubRequest(`/repos/${owner}/${repo}/forks`, {
            method: "POST",
          }, authToken)
          
          return {
            success: true,
            action,
            data: result,
            message: `Repository '${owner}/${repo}' forked successfully`,
          }
        }

        // File operations
        case "get_file": {
          if (!owner || !repo || !path) throw new Error("Owner, repo, and path are required")
          
          const endpoint = `/repos/${owner}/${repo}/contents/${path}${branch ? `?ref=${branch}` : ""}`
          const result = await makeGitHubRequest(endpoint, {}, authToken)
          
          // Decode content if it's a file
          if (result.content && result.encoding === "base64") {
            result.decoded_content = decodeBase64(result.content)
          }
          
          return {
            success: true,
            action,
            data: result,
          }
        }

        case "create_file": {
          if (!owner || !repo || !path || !content || !message) {
            throw new Error("Owner, repo, path, content, and message are required")
          }
          
          const payload = {
            message,
            content: encodeBase64(content),
            branch,
          }
          
          const result = await makeGitHubRequest(`/repos/${owner}/${repo}/contents/${path}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          }, authToken)
          
          return {
            success: true,
            action,
            data: result,
            message: `File '${path}' created successfully`,
          }
        }

        case "update_file": {
          if (!owner || !repo || !path || !content || !message || !sha) {
            throw new Error("Owner, repo, path, content, message, and sha are required")
          }
          
          const payload = {
            message,
            content: encodeBase64(content),
            sha,
            branch,
          }
          
          const result = await makeGitHubRequest(`/repos/${owner}/${repo}/contents/${path}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          }, authToken)
          
          return {
            success: true,
            action,
            data: result,
            message: `File '${path}' updated successfully`,
          }
        }

        case "delete_file": {
          if (!owner || !repo || !path || !message || !sha) {
            throw new Error("Owner, repo, path, message, and sha are required")
          }
          
          const payload = {
            message,
            sha,
            branch,
          }
          
          const result = await makeGitHubRequest(`/repos/${owner}/${repo}/contents/${path}`, {
            method: "DELETE",
            body: JSON.stringify(payload),
          }, authToken)
          
          return {
            success: true,
            action,
            data: result,
            message: `File '${path}' deleted successfully`,
          }
        }

        case "get_directory": {
          if (!owner || !repo) throw new Error("Owner and repo are required")
          
          const dirPath = path || ""
          const endpoint = `/repos/${owner}/${repo}/contents/${dirPath}${branch ? `?ref=${branch}` : ""}`
          const result = await makeGitHubRequest(endpoint, {}, authToken)
          
          return {
            success: true,
            action,
            data: result,
            count: Array.isArray(result) ? result.length : 1,
          }
        }

        // Branch operations
        case "list_branches": {
          if (!owner || !repo) throw new Error("Owner and repo are required")
          
          const result = await makeGitHubRequest(`/repos/${owner}/${repo}/branches?per_page=${per_page}&page=${page}`, {}, authToken)
          
          return {
            success: true,
            action,
            data: result,
            count: result.length,
          }
        }

        case "get_branch": {
          if (!owner || !repo || !branch) throw new Error("Owner, repo, and branch are required")
          
          const result = await makeGitHubRequest(`/repos/${owner}/${repo}/branches/${branch}`, {}, authToken)
          
          return {
            success: true,
            action,
            data: result,
          }
        }

        case "create_branch": {
          if (!owner || !repo || !branch) throw new Error("Owner, repo, and branch are required")
          
          // Get the SHA of the source branch (default branch if not specified)
          const sourceBranch = from_branch || "main"
          const branchInfo = await makeGitHubRequest(`/repos/${owner}/${repo}/branches/${sourceBranch}`, {}, authToken)
          
          const payload = {
            ref: `refs/heads/${branch}`,
            sha: branchInfo.commit.sha,
          }
          
          const result = await makeGitHubRequest(`/repos/${owner}/${repo}/git/refs`, {
            method: "POST",
            body: JSON.stringify(payload),
          }, authToken)
          
          return {
            success: true,
            action,
            data: result,
            message: `Branch '${branch}' created successfully`,
          }
        }

        case "delete_branch": {
          if (!owner || !repo || !branch) throw new Error("Owner, repo, and branch are required")
          
          await makeGitHubRequest(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
            method: "DELETE",
          }, authToken)
          
          return {
            success: true,
            action,
            message: `Branch '${branch}' deleted successfully`,
          }
        }

        // Pull Request operations
        case "list_pull_requests": {
          if (!owner || !repo) throw new Error("Owner and repo are required")
          
          const result = await makeGitHubRequest(`/repos/${owner}/${repo}/pulls?per_page=${per_page}&page=${page}`, {}, authToken)
          
          return {
            success: true,
            action,
            data: result,
            count: result.length,
          }
        }

        case "create_pull_request": {
          if (!owner || !repo || !title || !head || !base) {
            throw new Error("Owner, repo, title, head, and base are required")
          }
          
          const payload = {
            title,
            body,
            head,
            base,
            draft,
          }
          
          const result = await makeGitHubRequest(`/repos/${owner}/${repo}/pulls`, {
            method: "POST",
            body: JSON.stringify(payload),
          }, authToken)
          
          return {
            success: true,
            action,
            data: result,
            message: `Pull request '${title}' created successfully`,
          }
        }

        // Issue operations
        case "create_issue": {
          if (!owner || !repo || !title) throw new Error("Owner, repo, and title are required")
          
          const payload = {
            title,
            body,
            labels,
            assignees,
            milestone,
          }
          
          const result = await makeGitHubRequest(`/repos/${owner}/${repo}/issues`, {
            method: "POST",
            body: JSON.stringify(payload),
          }, authToken)
          
          return {
            success: true,
            action,
            data: result,
            message: `Issue '${title}' created successfully`,
          }
        }

        // Search operations
        case "search_repositories": {
          if (!query) throw new Error("Query is required")
          
          const params = new URLSearchParams({
            q: query,
            sort: sort || "stars",
            order: order || "desc",
            per_page: per_page.toString(),
            page: page.toString(),
          })
          
          const result = await makeGitHubRequest(`/search/repositories?${params}`, {}, authToken)
          
          return {
            success: true,
            action,
            data: result,
            total_count: result.total_count,
          }
        }

        case "search_code": {
          if (!query) throw new Error("Query is required")
          
          const params = new URLSearchParams({
            q: query,
            sort: sort || "indexed",
            order: order || "desc",
            per_page: per_page.toString(),
            page: page.toString(),
          })
          
          const result = await makeGitHubRequest(`/search/code?${params}`, {}, authToken)
          
          return {
            success: true,
            action,
            data: result,
            total_count: result.total_count,
          }
        }

        // User operations
        case "get_authenticated_user": {
          const result = await makeGitHubRequest("/user", {}, authToken)
          
          return {
            success: true,
            action,
            data: result,
          }
        }

        case "get_user": {
          if (!username) throw new Error("Username is required")
          
          const result = await makeGitHubRequest(`/users/${username}`, {}, authToken)
          
          return {
            success: true,
            action,
            data: result,
          }
        }

        // Gist operations
        case "create_gist": {
          if (!files) throw new Error("Files are required")
          
          const payload = {
            description,
            public: isPublic,
            files,
          }
          
          const result = await makeGitHubRequest("/gists", {
            method: "POST",
            body: JSON.stringify(payload),
          }, authToken)
          
          return {
            success: true,
            action,
            data: result,
            message: "Gist created successfully",
          }
        }

        case "list_gists": {
          const result = await makeGitHubRequest(`/gists?per_page=${per_page}&page=${page}`, {}, authToken)
          
          return {
            success: true,
            action,
            data: result,
            count: result.length,
          }
        }

        default:
          throw new Error(`Unsupported action: ${action}`)
      }
    } catch (error) {
      return {
        success: false,
        action,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      }
    }
  },
})