import { tool } from "ai"
import { z } from "zod"

export const searchWeb = tool({
  description: "Search the web using DuckDuckGo for current information, news, or any topic",
  parameters: z.object({
    query: z.string().describe("The search query to look up"),
    maxResults: z.number().optional().default(5).describe("Maximum number of results to return (1-10)"),
    region: z.string().optional().describe('Region for search results (e.g., "us-en", "uk-en", "de-de")'),
  }),
  execute: async ({ query, maxResults = 5, region = "us-en" }) => {
    try {
      // Validate maxResults
      const limitedResults = Math.min(Math.max(maxResults, 1), 10)

      // DuckDuckGo Instant Answer API
      const searchUrl = new URL("https://api.duckduckgo.com/")
      searchUrl.searchParams.set("q", query)
      searchUrl.searchParams.set("format", "json")
      searchUrl.searchParams.set("no_html", "1")
      searchUrl.searchParams.set("skip_disambig", "1")
      searchUrl.searchParams.set("no_redirect", "1")
      searchUrl.searchParams.set("safe_search", "moderate")

      const response = await fetch(searchUrl.toString(), {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; AI Assistant/1.0)",
        },
      })

      if (!response.ok) {
        throw new Error(`Search API returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Extract relevant information from DuckDuckGo response
      const results = []

      // Add instant answer if available
      if (data.Abstract && data.Abstract.trim()) {
        results.push({
          title: data.Heading || "Instant Answer",
          snippet: data.Abstract,
          url: data.AbstractURL || "",
          source: data.AbstractSource || "DuckDuckGo",
          type: "instant_answer",
        })
      }

      // Add definition if available
      if (data.Definition && data.Definition.trim()) {
        results.push({
          title: "Definition",
          snippet: data.Definition,
          url: data.DefinitionURL || "",
          source: data.DefinitionSource || "Dictionary",
          type: "definition",
        })
      }

      // Add related topics
      if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
        for (const topic of data.RelatedTopics.slice(0, limitedResults - results.length)) {
          if (topic.Text && topic.Text.trim()) {
            results.push({
              title: topic.Text.split(" - ")[0] || "Related Topic",
              snippet: topic.Text,
              url: topic.FirstURL || "",
              source: "DuckDuckGo",
              type: "related_topic",
            })
          }
        }
      }

      // If no results from instant answers, try to get web results
      if (results.length === 0) {
        // Fallback: Use DuckDuckGo HTML search (note: this is less reliable)
        const htmlSearchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`

        try {
          const htmlResponse = await fetch(htmlSearchUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; AI Assistant/1.0)",
            },
          })

          if (htmlResponse.ok) {
            const htmlText = await htmlResponse.text()

            // Basic HTML parsing for search results (simplified)
            const titleMatches = htmlText.match(/<a[^>]*class="result__a"[^>]*>([^<]+)<\/a>/g) || []
            const snippetMatches = htmlText.match(/<a[^>]*class="result__snippet"[^>]*>([^<]+)<\/a>/g) || []

            for (let i = 0; i < Math.min(titleMatches.length, limitedResults); i++) {
              const title = titleMatches[i]?.replace(/<[^>]*>/g, "").trim() || `Result ${i + 1}`
              const snippet = snippetMatches[i]?.replace(/<[^>]*>/g, "").trim() || "No description available"

              results.push({
                title,
                snippet,
                url: "",
                source: "DuckDuckGo Search",
                type: "web_result",
              })
            }
          }
        } catch (htmlError) {
          console.warn("HTML search fallback failed:", htmlError)
        }
      }

      // If still no results, provide a helpful message
      if (results.length === 0) {
        return {
          query,
          results: [],
          message: `No specific results found for "${query}". You may want to try a different search term or check the spelling.`,
          timestamp: new Date().toISOString(),
        }
      }

      return {
        query,
        results: results.slice(0, limitedResults),
        totalResults: results.length,
        timestamp: new Date().toISOString(),
        region,
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
