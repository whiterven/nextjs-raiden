//components/model-selector.tsx
"use client"

import type React from "react"

import { startTransition, useMemo, useOptimistic, useState } from "react"

import { saveChatModelAsCookie } from "@/app/(chat)/actions"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { chatModels } from "@/lib/ai/models"
import { cn } from "@/lib/utils"

import { CheckCircleFillIcon, ChevronDownIcon } from "./icons"
import { entitlementsByUserType } from "@/lib/ai/entitlements"
import type { Session } from "next-auth"
import { getModelIcon } from "@/components/model-icons"

export function ModelSelector({
  session,
  selectedModelId,
  className,
}: {
  session: Session
  selectedModelId: string
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false)
  const [optimisticModelId, setOptimisticModelId] = useOptimistic(selectedModelId)

  const userType = session.user.type
  const { availableChatModelIds } = entitlementsByUserType[userType]

  const availableChatModels = chatModels.filter((chatModel) => availableChatModelIds.includes(chatModel.id))

  const selectedChatModel = useMemo(
    () => availableChatModels.find((chatModel) => chatModel.id === optimisticModelId),
    [optimisticModelId, availableChatModels],
  )
  
  const isCompact = className?.includes('text-xs') || className?.includes('h-7')

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn("w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground", className)}
      >
        <Button 
          data-testid="model-selector" 
          variant="outline" 
          className={cn(
            "md:px-2 md:h-[34px] gap-1 text-xs", 
            isCompact ? "px-1.5 py-1 h-6 text-xs" : "",
            className
          )}
        >
          {(() => {
            const IconComponent = getModelIcon(optimisticModelId)
            return IconComponent ? <IconComponent /> : null
          })()}
          <span className="hidden sm:inline text-xs">{isCompact ? selectedChatModel?.name?.split(" ")[0] : selectedChatModel?.name}</span>
          <span className="sm:hidden text-xs">{selectedChatModel?.name?.split(" ")[0]}</span>
          <ChevronDownIcon size={isCompact ? 12 : 16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[250px] max-h-[400px] overflow-y-auto">
        {availableChatModels.map((chatModel) => {
          const { id } = chatModel

          return (
            <DropdownMenuItem
              data-testid={`model-selector-item-${id}`}
              key={id}
              onSelect={() => {
                setOpen(false)

                startTransition(() => {
                  setOptimisticModelId(id)
                  saveChatModelAsCookie(id)
                })
              }}
              data-active={id === optimisticModelId}
              asChild
            >
              <button type="button" className="gap-3 group/item flex flex-row justify-between items-center w-full">
                <div className="flex flex-row gap-3 items-center">
                  <div className="flex-shrink-0">
                    {(() => {
                      const IconComponent = getModelIcon(id)
                      return IconComponent ? <IconComponent /> : null
                    })()}
                  </div>
                  <div className="flex flex-col gap-1 items-start">
                    <div className="text-xs font-medium">{chatModel.name}</div>
                    <div className="text-xs text-muted-foreground">{chatModel.description}</div>
                  </div>
                </div>

                <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                  <CheckCircleFillIcon size={14} />
                </div>
              </button>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
