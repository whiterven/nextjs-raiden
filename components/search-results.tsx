"use client"

import { ExternalLinkIcon, SearchIcon } from "lucide-react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { Badge } from "./ui/badge"
import { Card } from "./ui/card"

interface SearchResult {
  title: string
  snippet: string
  url: string
  source: string
  type: string
}

interface SearchResultsProps {
  query: string
  results: SearchResult[]
  totalResults?: number
  timestamp?: string
  region?: string
  message?: string
  error?: string
}

export function SearchResults({
  query,
  results = [],
  totalResults,
  timestamp,
  region,
  message,
  error,
}: SearchResultsProps) {
  if (error) {
    return (
      <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
          <SearchIcon size={18} />
          <h3 className="font-medium">Search Error</h3>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl overflow-hidden border border-border bg-card text-card-foreground shadow-sm w-full max-w-2xl">
      {/* Header */}
      <div className="bg-muted/50 p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <SearchIcon size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Search Results</h3>
              <p className="text-xs text-muted-foreground">{query ? `"${query}"` : "No query provided"}</p>
            </div>
          </div>
          {timestamp && <div className="text-xs text-muted-foreground">{new Date(timestamp).toLocaleTimeString()}</div>}
        </div>
      </div>

      {/* Results */}
      <div className="px-4 pb-4">
        {message && results.length === 0 && <div className="text-sm text-muted-foreground py-2">{message}</div>}

        {results.length > 0 ? (
          <div className="flex flex-col gap-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={cn("flex flex-col gap-1 pb-3", index < results.length - 1 && "border-b border-border")}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{result.title}</h4>
                  <Badge
                    variant={
                      result.type === "instant_answer"
                        ? "default"
                        : result.type === "definition"
                          ? "secondary"
                          : "outline"
                    }
                    className="text-[10px] h-5"
                  >
                    {result.type.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">{result.snippet}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">Source: {result.source}</span>
                  {result.url && (
                    <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 px-2" asChild>
                      <a href={result.url} target="_blank" rel="noopener noreferrer">
                        Visit <ExternalLinkIcon size={12} />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-muted/50 p-3 rounded-full mb-3">
              <SearchIcon size={24} className="text-muted-foreground" />
            </div>
            <h4 className="font-medium">No results found</h4>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Try adjusting your search terms or ask a different question.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {(totalResults !== undefined || region) && (
        <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-t border-border flex justify-between items-center">
          <div>{totalResults !== undefined && <span>Found {totalResults} results</span>}</div>
          {region && <div>Region: {region}</div>}
        </div>
      )}
    </div>
  )
}
