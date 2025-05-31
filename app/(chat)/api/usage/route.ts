import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/(auth)/auth"
import { getMessageCountByUserId } from "@/lib/db/queries"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    })

    return NextResponse.json({ messageCount })
  } catch (error) {
    console.error("Error fetching usage:", error)
    return NextResponse.json({ error: "Failed to fetch usage data" }, { status: 500 })
  }
}
