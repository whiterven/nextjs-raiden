//components/search-results.tsx
"use client"

import { useState } from "react"
import { ExternalLinkIcon, SearchIcon, GlobeIcon, ChevronDownIcon, ChevronUpIcon, Loader2Icon } from "lucide-react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"

interface SearchResult {
  title: string
  snippet: string
  url: string
  source: string
  type: string
  score?: number
  publishedDate?: string
}

interface SearchImage {
  url: string
  description?: string
}

interface SearchResultsProps {
  query: string
  results: SearchResult[]
  images?: SearchImage[]
  totalResults?: number
  timestamp?: string
  searchDepth?: string
  responseTime?: number
  message?: string
  error?: string
  isLoading?: boolean
}

// Function to get favicon URL from domain
const getFaviconUrl = (url: string) => {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`
  } catch {
    return null
  }
}

export function SearchResults({
  query,
  results = [],
  images = [],
  totalResults,
  timestamp,
  searchDepth,
  responseTime,
  message,
  error,
  isLoading = false,
}: SearchResultsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="border rounded-lg shadow-sm">
          <div className="flex items-center gap-3 p-4 text-muted-foreground">
            <Loader2Icon size={16} className="animate-spin" />
            <span className="text-sm">Searching the web...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="border border-destructive/50 rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3 text-destructive">
            <GlobeIcon size={16} />
            <span className="text-sm font-medium">Search Error</span>
          </div>
          <p className="text-sm text-destructive mt-2">{error}</p>
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="border rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <SearchIcon size={16} />
            <span className="text-sm">{message || `No results found for "${query}"`}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        {/* Collapsed Header */}
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between p-0 h-auto rounded-lg shadow-sm hover:bg-accent focus:ring-2 focus:ring-ring"
          >
            <div className="flex items-center gap-3 p-3 flex-1 text-left">
              <SearchIcon size={16} className="text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">
                  {query}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {totalResults} results
                  {responseTime && ` • ${responseTime}ms`}
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-xs">{isExpanded ? 'Collapse' : 'Expand'}</span>
                {isExpanded ? (
                  <ChevronUpIcon size={16} />
                ) : (
                  <ChevronDownIcon size={16} />
                )}
              </div>
            </div>
          </Button>
        </CollapsibleTrigger>

        {/* Expanded Content */}
        <CollapsibleContent>
          <div className="mt-2 border rounded-lg shadow-sm overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {results.map((result, index) => {
                const faviconUrl = getFaviconUrl(result.url)
                
                return (
                  <div key={index} className={cn(
                    "flex items-start gap-3 p-3 hover:bg-accent/50 cursor-pointer border-b last:border-b-0"
                  )}>
                    {/* Favicon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {faviconUrl ? (
                        <img
                          src={faviconUrl}
                          alt=""
                          className="w-4 h-4"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-4 h-4 bg-muted rounded-sm flex items-center justify-center">
                          <div className="w-2 h-2 bg-muted-foreground rounded-sm"></div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-medium leading-tight line-clamp-2">
                          {result.title}
                        </h3>
                        {result.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-6 w-6 text-muted-foreground hover:text-foreground flex-shrink-0"
                            asChild
                          >
                            <a href={result.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLinkIcon size={12} />
                            </a>
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground truncate">
                          {result.source}
                        </span>
                        {result.type === "ai_answer" && (
                          <span className="text-xs bg-accent text-accent-foreground px-1.5 py-0.5 rounded">
                            AI
                          </span>
                        )}
                        {result.score !== undefined && result.score > 0.8 && (
                          <span className="text-xs text-muted-foreground">
                            {(result.score * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>

                      {result.snippet && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {result.snippet}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            {(images.length > 0 || timestamp) && (
              <div className="border-t p-3 bg-muted/50">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    {images.length > 0 && (
                      <span>{images.length} images</span>
                    )}
                    {searchDepth && (
                      <span>{searchDepth} search</span>
                    )}
                  </div>
                  {timestamp && (
                    <span>{new Date(timestamp).toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}