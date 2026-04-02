import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { AUTH_COOKIE_NAME, hashSessionToken, clearAuthCookie } from "@/lib/auth";

export async function POST() {
    const response = NextResponse.json({ ok: true }, { status: 200 });

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    try {
        if (sessionToken) {
            const hashedToken = hashSessionToken(sessionToken);

            await pool.query(
                `DELETE FROM auth_session
                WHERE session_token_hash = $1`,
                [hashedToken]
            );
        }

        clearAuthCookie(response);
        return response;

    } catch (error) {
        console.error("Logout failed:", error);
        return NextResponse.json({ error: "Logout failed" }, { status: 500 });
    }
}