"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Clock, Sparkles } from "lucide-react"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { guestRegex } from "@/lib/constants"
import { CrossIcon } from "./icons"

interface MessageLimitWarningProps {
  className?: string
}

export function MessageLimitWarning({ className }: MessageLimitWarningProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [messageCount, setMessageCount] = useState<number | null>(null)
  const [timeUntilReset, setTimeUntilReset] = useState<string>("")
  const [isVisible, setIsVisible] = useState(true)

  const isGuest = guestRegex.test(session?.user?.email ?? "")
  const userType = session?.user?.type || "guest"

  // Message limits based on user type
  const limits = {
    guest: 1,
    regular: 5, // Free plan
    pro: 50,
    expert: 500,
  }

  const maxMessages = limits[userType as keyof typeof limits] || 10
  const messagesLeft = messageCount !== null ? Math.max(0, maxMessages - messageCount) : null
  const shouldShowWarning = messagesLeft !== null && messagesLeft <= 2
  const isOutOfMessages = messagesLeft === 0

  useEffect(() => {
    const fetchMessageCount = async () => {
      if (!session?.user?.id) return

      try {
        const response = await fetch("/api/usage")
        if (response.ok) {
          const data = await response.json()
          setMessageCount(data.messageCount)
        }
      } catch (error) {
        console.error("Failed to fetch message count:", error)
      }
    }

    fetchMessageCount()
    // Refresh every minute
    const interval = setInterval(fetchMessageCount, 60000)
    return () => clearInterval(interval)
  }, [session?.user?.id])

  useEffect(() => {
    const updateTimeUntilReset = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const diff = tomorrow.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setTimeUntilReset(`${hours}h ${minutes}m`)
    }

    updateTimeUntilReset()
    const interval = setInterval(updateTimeUntilReset, 60000)
    return () => clearInterval(interval)
  }, [])

  if (!isVisible || messageCount === null || !session?.user) return null

  if (isGuest) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`w-full ${className}`}
        >
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-800 rounded-xl p-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
                  <Sparkles className="size-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-xs leading-tight truncate">
                    Sign up for more messages
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300 truncate">
                    Login/Signup to get more messages per day
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/login");
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 text-xs py-0.5 px-2 h-6"
                >
                  Sign in
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => setIsVisible(false)}
                >
                  <CrossIcon size={12} />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  if (!shouldShowWarning) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`w-full ${className}`}
      >
        {isOutOfMessages ? (
          // Out of messages
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-200 dark:border-red-800 rounded-xl p-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="p-1 bg-red-100 dark:bg-red-900/30 rounded-lg shrink-0">
                  <AlertTriangle className="size-3.5 text-red-600 dark:text-red-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-red-900 dark:text-red-100 text-xs leading-tight truncate">
                    You&apos;re out of free messages
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-red-700 dark:text-red-300">
                    <Clock className="size-3" />
                    <span className="truncate">Reset in {timeUntilReset}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  onClick={() => router.push("/pricing")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 text-xs py-0.5 px-2 h-6"
                >
                  <Sparkles className="size-3 mr-1" />
                  Upgrade
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => setIsVisible(false)}
                >
                  <CrossIcon size={12} />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Low messages warning for logged in users
          <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-200 dark:border-orange-800 rounded-xl p-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="p-1 bg-orange-100 dark:bg-orange-900/30 rounded-lg shrink-0">
                  <AlertTriangle className="size-3.5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 text-xs leading-tight truncate">
                    {messagesLeft} message{messagesLeft !== 1 ? "s" : ""} left today
                  </h3>
                  <p className="text-xs text-orange-700 dark:text-orange-300 truncate">
                    Upgrade your plan for 10x more messages
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  onClick={() => router.push("/pricing")}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/20 text-xs py-0.5 px-2 h-6"
                >
                  Upgrade
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => setIsVisible(false)}
                >
                  <CrossIcon size={12} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
