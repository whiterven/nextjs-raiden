"use client"

import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  GitBranchIcon,
  GitCommitIcon,
  GitForkIcon,
  GitPullRequestIcon,
  StarIcon,
  FileIcon,
  FolderIcon,
  UserIcon,
  CalendarIcon,
  CodeIcon,
} from "lucide-react"
import { Github } from '@lobehub/icons'
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Card } from "./ui/card"
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"

interface GitHubResultsProps {
  action: string
  success: boolean
  data?: any
  error?: string
  message?: string
  count?: number
  total_count?: number
  timestamp?: string
}

const getActionIcon = (action: string) => {
  switch (action) {
    case "create_repo":
    case "get_repo":
    case "list_user_repos":
      return <Github size={16} />
    case "search_repositories":
      return <CodeIcon size={16} />
    case "get_file":
    case "create_file":
    case "update_file":
    case "delete_file":
      return <FileIcon size={16} />
    case "get_directory":
      return <FolderIcon size={16} />
    case "list_branches":
    case "get_branch":
    case "create_branch":
      return <GitBranchIcon size={16} />
    case "list_commits":
    case "get_commit":
      return <GitCommitIcon size={16} />
    case "list_pull_requests":
    case "create_pull_request":
      return <GitPullRequestIcon size={16} />
    case "fork_repo":
      return <GitForkIcon size={16} />
    case "get_user":
    case "get_authenticated_user":
      return <UserIcon size={16} />
    default:
      return <CodeIcon size={16} />
  }
}

const getActionLabel = (action: string) => {
  return action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

export function GitHubResults({
  action,
  success,
  data,
  error,
  message,
  count,
  total_count,
  timestamp,
}: GitHubResultsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (error) {
    return (
      <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
          {getActionIcon(action)}
          <h3 className="font-medium">GitHub Error</h3>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </Card>
    )
  }

  const resultCount = count || total_count || (Array.isArray(data) ? data.length : data ? 1 : 0)

  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-border bg-card text-card-foreground shadow-sm w-full max-w-2xl">
      {/* Collapsible Header */}
      <Button
        variant="ghost"
        className="w-full justify-between p-4 h-auto hover:bg-muted/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">{getActionIcon(action)}</div>
          <div className="text-left">
            <h3 className="font-medium text-sm">{getActionLabel(action)}</h3>
            {message && <p className="text-xs text-muted-foreground">{message}</p>}
            {resultCount > 0 && !message && (
              <p className="text-xs text-muted-foreground">
                {resultCount} {resultCount === 1 ? "result" : "results"}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={success ? "default" : "destructive"} className="text-xs">
            {success ? "Success" : "Error"}
          </Badge>
          {resultCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {resultCount} {resultCount === 1 ? "item" : "items"}
            </Badge>
          )}
          {isExpanded ? (
            <ChevronUpIcon size={16} className="text-muted-foreground" />
          ) : (
            <ChevronDownIcon size={16} className="text-muted-foreground" />
          )}
        </div>
      </Button>

      {/* Expandable Content */}
      {isExpanded && data && (
        <div className="border-t border-border">
          <div className="p-4">
            {/* Repository Results */}
            {(action === "get_repo" || action === "create_repo") && (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <Github size={20} className="text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-sm">{data.full_name}</h4>
                      {data.private && (
                        <Badge variant="outline" className="text-xs">
                          Private
                        </Badge>
                      )}
                      {data.fork && (
                        <Badge variant="secondary" className="text-xs">
                          Fork
                        </Badge>
                      )}
                    </div>
                    {data.description && <p className="text-xs text-muted-foreground mb-2">{data.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {data.language && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          {data.language}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <StarIcon size={12} />
                        {data.stargazers_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <GitForkIcon size={12} />
                        {data.forks_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarIcon size={12} />
                        {formatDistanceToNow(new Date(data.updated_at), { addSuffix: true })}
                      </div>
                    </div>
                    <div className="mt-2">
                      <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 px-2" asChild>
                        <a href={data.html_url} target="_blank" rel="noopener noreferrer">
                          View on GitHub <ExternalLinkIcon size={10} />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Repository List Results */}
            {(action === "list_user_repos" || action === "search_repositories") && Array.isArray(data) && (
              <div className="space-y-2">
                {data.slice(0, 5).map((repo: any, index: number) => (
                  <div
                    key={repo.id || index}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Github size={16} className="text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{repo.full_name}</h4>
                        {repo.private && (
                          <Badge variant="outline" className="text-xs">
                            Private
                          </Badge>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">{repo.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {repo.language && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            {repo.language}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <StarIcon size={10} />
                          {repo.stargazers_count}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 px-2" asChild>
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLinkIcon size={10} />
                      </a>
                    </Button>
                  </div>
                ))}
                {data.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    And {data.length - 5} more repositories...
                  </p>
                )}
              </div>
            )}

            {/* File Results */}
            {(action === "get_file" || action === "create_file") && (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <FileIcon size={20} className="text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-1">{data.name}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{data.path}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Size: {formatFileSize(data.size)}</span>
                      <span>Type: {data.type}</span>
                    </div>
                    {data.html_url && (
                      <div className="mt-2">
                        <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 px-2" asChild>
                          <a href={data.html_url} target="_blank" rel="noopener noreferrer">
                            View on GitHub <ExternalLinkIcon size={10} />
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* User Results */}
            {(action === "get_user" || action === "get_authenticated_user") && (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    {data.avatar_url ? (
                      <img
                        src={data.avatar_url || "/placeholder.svg"}
                        alt={data.login}
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      <UserIcon size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-1">{data.name || data.login}</h4>
                    {data.bio && <p className="text-xs text-muted-foreground mb-2">{data.bio}</p>}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Repos: {data.public_repos}</span>
                      <span>Followers: {data.followers}</span>
                      <span>Following: {data.following}</span>
                    </div>
                    {data.html_url && (
                      <div className="mt-2">
                        <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 px-2" asChild>
                          <a href={data.html_url} target="_blank" rel="noopener noreferrer">
                            View Profile <ExternalLinkIcon size={10} />
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Generic JSON Results */}
            {![
              "get_repo",
              "create_repo",
              "list_user_repos",
              "search_repositories",
              "get_file",
              "create_file",
              "get_user",
              "get_authenticated_user",
            ].includes(action) && (
              <div className="bg-muted/30 p-3 rounded-lg">
                <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(data, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Footer */}
          {timestamp && (
            <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-t border-border">
              Completed at {new Date(timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
