//lib/ai/tools/search-web.ts
import { tool } from "ai"
import { z } from "zod"

export const searchWeb = tool({
  description: "Search the web using Tavily for current information, news, or any topic",
  parameters: z.object({
    query: z.string().describe("The search query to look up"),
    maxResults: z.number().optional().default(7).describe("Maximum number of results to return (1-10)"),
    searchDepth: z.enum(["basic", "advanced"]).optional().default("advanced").describe("Search depth level"),
    includeAnswer: z.boolean().optional().default(true).describe("Include AI-generated answer"),
    includeImages: z.boolean().optional().default(true).describe("Include relevant images"),
    onProgress: z.function().optional().describe("Callback function to show loading state"),
  }),
  execute: async ({ query, maxResults = 7, searchDepth = "advanced", includeAnswer = false, includeImages = true, onProgress }) => {
    // Show loading state if callback is provided
    if (onProgress) {
      onProgress({ isLoading: true, query })
    }
    try {
      // Validate maxResults
      const limitedResults = Math.min(Math.max(maxResults, 1), 20)
      
      // Get API key from environment
      const apiKey = process.env.TAVILY_API_KEY
      if (!apiKey) {
        throw new Error("TAVILY_API_KEY not found in environment variables")
      }

      // Prepare Tavily API request
      const tavilyPayload = {
        query,
        search_depth: searchDepth,
        max_results: limitedResults,
        include_answer: includeAnswer,
        include_images: includeImages,
        include_raw_content: false,
        format: "json"
      }

      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify(tavilyPayload),
      })

      if (!response.ok) {
        throw new Error(`Tavily API returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Transform Tavily response to our format
      const results = []

      // Add AI-generated answer if available
      if (data.answer && data.answer.trim()) {
        results.push({
          title: "Search Summary",
          snippet: data.answer,
          url: "",
          source: "BineAI",
          type: "ai_answer",
          score: 1.0,
        })
      }

      // Add search results
      if (data.results && Array.isArray(data.results)) {
        for (const result of data.results) {
          results.push({
            title: result.title || "Untitled",
            snippet: result.content || "No description available",
            url: result.url || "",
            source: result.source || new URL(result.url || "").hostname,
            type: "web_result",
            score: result.score || 0,
            publishedDate: result.published_date,
          })
        }
      }

      // Add images if available
      const images = data.images || []

      // If no results, provide a helpful message
      if (results.length === 0) {
        return {
          query,
          results: [],
          images: [],
          message: `No specific results found for "${query}". You may want to try a different search term.`,
          timestamp: new Date().toISOString(),
        }
      }

      return {
        query,
        results: results.slice(0, limitedResults),
        images: images.slice(0, 5), // Limit images to 5
        totalResults: results.length,
        timestamp: new Date().toISOString(),
        searchDepth,
        responseTime: data.response_time,
      }
    } catch (error) {
      return {
        query,
        error: `Search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date().toISOString(),
      }
    }
  },
})