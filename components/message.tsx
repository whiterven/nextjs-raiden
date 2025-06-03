"use client"

import type { UIMessage } from "ai"
import cx from "classnames"
import { AnimatePresence, motion } from "framer-motion"
import { memo, useState } from "react"
import type { Vote } from "@/lib/db/schema"
import { DocumentToolCall, DocumentToolResult } from "./document"
import { PencilEditIcon } from "./icons"
import { Markdown } from "./markdown"
import { MessageActions } from "./message-actions"
import { PreviewAttachment } from "./preview-attachment"
import { Weather } from "./weather"
import { SearchResults } from "./search-results"
import { GitHubResults } from "./github-results"
import equal from "fast-deep-equal"
import { cn, sanitizeText } from "@/lib/utils"
import { Button } from "./ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { MessageEditor } from "./message-editor"
import { DocumentPreview } from "./document-preview"
import { MessageReasoning } from "./message-reasoning"
import type { UseChatHelpers } from "@ai-sdk/react"

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
  requiresScrollPadding,
}: {
  chatId: string
  message: UIMessage
  vote: Vote | undefined
  isLoading: boolean
  setMessages: UseChatHelpers["setMessages"]
  reload: UseChatHelpers["reload"]
  isReadonly: boolean
  requiresScrollPadding: boolean
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view")

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            {
              "w-full": mode === "edit",
              "group-data-[role=user]/message:w-fit": mode !== "edit",
            },
          )}
        >
          {message.role === "assistant" && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background" />
          )}

          <div
            className={cn("flex flex-col gap-4 w-full", {
              "min-h-96": message.role === "assistant" && requiresScrollPadding,
            })}
          >
            {message.experimental_attachments && message.experimental_attachments.length > 0 && (
              <div data-testid={`message-attachments`} className="flex flex-row justify-end gap-2">
                {message.experimental_attachments.map((attachment) => (
                  <PreviewAttachment key={attachment.url} attachment={attachment} />
                ))}
              </div>
            )}

            {message.parts?.map((part, index) => {
              const { type } = part
              const key = `message-${message.id}-part-${index}`

              if (type === "reasoning") {
                return <MessageReasoning key={key} isLoading={isLoading} reasoning={part.reasoning} />
              }

              if (type === "text") {
                if (mode === "view") {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      {message.role === "user" && !isReadonly && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              data-testid="message-edit-button"
                              variant="ghost"
                              className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                              onClick={() => {
                                setMode("edit")
                              }}
                            >
                              <PencilEditIcon />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit message</TooltipContent>
                        </Tooltip>
                      )}

                      <div
                        data-testid="message-content"
                        className={cn("flex flex-col gap-4", {
                          "bg-primary text-primary-foreground px-3 py-2 rounded-xl": message.role === "user",
                        })}
                      >
                        <Markdown>{sanitizeText(part.text)}</Markdown>
                      </div>
                    </div>
                  )
                }

                if (mode === "edit") {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      <div className="size-8" />

                      <MessageEditor
                        key={message.id}
                        message={message}
                        setMode={setMode}
                        setMessages={setMessages}
                        reload={reload}
                      />
                    </div>
                  )
                }
              }

              if (type === "tool-invocation") {
                const { toolInvocation } = part
                const { toolName, toolCallId, state } = toolInvocation

                if (state === "call") {
                  const { args } = toolInvocation

                  return (
                    <div
                      key={toolCallId}
                      className={cx({
                        skeleton: ["getWeather", "searchWeb", "getDateTime", "gitHub"].includes(toolName),
                      })}
                    >
                      {toolName === "getWeather" ? (
                        <Weather />
                      ) : toolName === "createDocument" ? (
                        <DocumentPreview isReadonly={isReadonly} args={args} />
                      ) : toolName === "updateDocument" ? (
                        <DocumentToolCall type="update" args={args} isReadonly={isReadonly} />
                      ) : toolName === "requestSuggestions" ? (
                        <DocumentToolCall type="request-suggestions" args={args} isReadonly={isReadonly} />
                      ) : toolName === "searchWeb" ? (
                        <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
                          <div className="bg-primary/10 p-2 rounded-full" />
                          <div>
                            <p className="text-sm font-medium">Searching the web</p>
                            <p className="text-xs text-muted-foreground">
                              {args.query ? `"${args.query}"` : "Please wait..."}
                            </p>
                          </div>
                        </div>
                      ) : toolName === "getDateTime" ? (
                        <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
                          <div className="bg-primary/10 p-2 rounded-full" />
                          <div>
                            <p className="text-sm font-medium">Getting date and time</p>
                            <p className="text-xs text-muted-foreground">Please wait...</p>
                          </div>
                        </div>
                      ) : toolName === "gitHub" ? (
                        <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
                          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full" />
                          <div>
                            <p className="text-sm font-medium">GitHub Operation</p>
                            <p className="text-xs text-muted-foreground">
                              {args.action ? args.action.replace(/_/g, " ") : "Processing..."}
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )
                }

                if (state === "result") {
                  const { result } = toolInvocation

                  return (
                    <div key={toolCallId}>
                      {toolName === "getWeather" ? (
                        <Weather weatherAtLocation={result} />
                      ) : toolName === "createDocument" ? (
                        <DocumentPreview isReadonly={isReadonly} result={result} />
                      ) : toolName === "updateDocument" ? (
                        <DocumentToolResult type="update" result={result} isReadonly={isReadonly} />
                      ) : toolName === "requestSuggestions" ? (
                        <DocumentToolResult type="request-suggestions" result={result} isReadonly={isReadonly} />
                      ) : toolName === "searchWeb" ? (
                        <SearchResults {...result} />
                      ) : toolName === "gitHub" ? (
                        <GitHubResults {...result} />
                      ) : (
                        <pre>{JSON.stringify(result, null, 2)}</pre>
                      )}
                    </div>
                  )
                }
              }
            })}

            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export const PreviewMessage = memo(PurePreviewMessage, (prevProps, nextProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) return false
  if (prevProps.message.id !== nextProps.message.id) return false
  if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding) return false
  if (!equal(prevProps.message.parts, nextProps.message.parts)) return false
  if (!equal(prevProps.vote, nextProps.vote)) return false

  return true
})

export const ThinkingMessage = () => {
  return (
    <div className="flex items-center gap-4 px-4 py-2">
      <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background" />
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
      </div>
    </div>
  )
}
