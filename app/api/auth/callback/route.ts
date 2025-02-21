import { type NextRequest, NextResponse } from "next/server";
import { getTokens } from "@/lib/gmail";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // Retrieve state parameter

    if (!code) {
        return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    try {
        const tokens = await getTokens(code);

        // Securely store tokens (e.g., cookies, database)
        const response = NextResponse.redirect(new URL(decodeURIComponent(state || "/"), request.url));
        response.cookies.set("gmail_access_token", tokens.access_token ?? "", { httpOnly: true, secure: true });
        response.cookies.set("gmail_refresh_token", tokens.refresh_token ?? "", { httpOnly: true, secure: true });

        return response;
    } catch (error) {
        console.error("Error getting tokens:", error);
        return NextResponse.json({ error: "Failed to get tokens" }, { status: 500 });
    }
}
