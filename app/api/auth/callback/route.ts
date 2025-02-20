import { type NextRequest, NextResponse } from "next/server"
import { getTokens } from "@/lib/gmail"
import { redirect } from "next/navigation"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")

    if (!code) {
        return NextResponse.json({ error: "No code provided" }, { status: 400 })
    }

    try {
        const tokens = await getTokens(code)
        // Here you should securely store the tokens, e.g., in a database
        // For this example, we'll store them in cookies (not recommended for production)
        const response = NextResponse.redirect(new URL("/", request.url))
        response.cookies.set("gmail_access_token", tokens.access_token ? tokens.access_token : "", { httpOnly: true, secure: true })
        response.cookies.set("gmail_refresh_token", tokens.refresh_token ? tokens.refresh_token : "", { httpOnly: true, secure: true })
        // redirect(process.env.NEXT_PUBLIC_BASE_URL ? process.env.NEXT_PUBLIC_BASE_URL : "/")
        return response
    } catch (error) {
        console.error("Error getting tokens:", error)
        return NextResponse.json({ error: "Failed to get tokens" }, { status: 500 })
    }
}

