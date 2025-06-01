import { tool } from "ai"
import { z } from "zod"

export const getDateTime = tool({
  description: "Get the current date and time information",
  parameters: z.object({
    timezone: z
      .string()
      .optional()
      .describe('Timezone to get the time for (e.g., "America/New_York", "Europe/London"). Defaults to UTC.'),
    format: z
      .enum(["full", "date", "time", "iso"])
      .optional()
      .describe("Format of the output: full (date and time), date only, time only, or ISO format"),
  }),
  execute: async ({ timezone = "UTC", format = "full" }) => {
    try {
      const now = new Date()

      const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      }

      let formattedDate: string

      switch (format) {
        case "date":
          formattedDate = now.toLocaleDateString("en-US", {
            timeZone: timezone,
            year: "numeric",
            month: "long",
            day: "numeric",
          })
          break
        case "time":
          formattedDate = now.toLocaleTimeString("en-US", {
            timeZone: timezone,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZoneName: "short",
          })
          break
        case "iso":
          formattedDate = now.toISOString()
          break
        case "full":
        default:
          formattedDate = now.toLocaleString("en-US", options)
          break
      }

      return {
        timestamp: now.toISOString(),
        formatted: formattedDate,
        timezone: timezone,
        unix: Math.floor(now.getTime() / 1000),
        dayOfWeek: now.toLocaleDateString("en-US", {
          timeZone: timezone,
          weekday: "long",
        }),
      }
    } catch (error) {
      return {
        error: `Failed to get date/time: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  },
})
