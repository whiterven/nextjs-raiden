//components/chat-header.tsx

"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useWindowSize } from "usehooks-ts"

import { ModelSelector } from "@/components/model-selector"
import { SidebarToggle } from "@/components/sidebar-toggle"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "./icons"
import { useSidebar } from "./ui/sidebar"
import { memo } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { type VisibilityType, VisibilitySelector } from "./visibility-selector"
import type { Session } from "next-auth"

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  session,
  hideModelSelector = false,
}: {
  chatId: string
  selectedModelId: string
  selectedVisibilityType: VisibilityType
  isReadonly: boolean
  session: Session
  hideModelSelector?: boolean
}) {
  const router = useRouter()
  const { open } = useSidebar()

  const { width: windowWidth } = useWindowSize()
  const isMobile = windowWidth < 768

  return (
    <header className="flex sticky top-0 z-10 bg-background py-1.5 items-center px-2 md:px-4 gap-2 border-b shadow-sm">
      <SidebarToggle />

      {(!open || isMobile) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-2 md:order-1 min-w-0 md:px-2 px-2 h-9 md:h-9 ml-auto md:ml-0 flex-shrink-0"
              onClick={() => {
                router.push("/")
                router.refresh()
              }}
            >
              <PlusIcon />
              <span className="md:inline hidden ml-1">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      )}

      <div className="flex items-center gap-2 flex-grow flex-shrink min-w-0 justify-end md:justify-start">
        {!isReadonly && !hideModelSelector && (
          <ModelSelector 
            session={session} 
            selectedModelId={selectedModelId} 
            className="order-1 md:order-2 max-w-[130px] md:max-w-none flex-shrink-0" 
          />
        )}

        {!isReadonly && (
          <VisibilitySelector
            chatId={chatId}
            selectedVisibilityType={selectedVisibilityType}
            className="order-1 md:order-3 flex-shrink-0"
          />
        )}
      </div>
    </header>
  )
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId
})
