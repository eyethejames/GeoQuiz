import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { AUTH_COOKIE_NAME, hashSessionToken } from "@/lib/auth";

export async function GET() {
    // 1 lese session-cookie
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    // 2 cookie mangler -> 401
    if (!sessionToken) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 3 hash token
    const hashedToken = hashSessionToken(sessionToken);

    const client = await pool.connect();

    try {
        // 4 slå opp auth_session + users
        const sessionRes = await client.query(
            `SELECT u.user_id, u.username
            FROM auth_session a JOIN users u
            ON a.user_id = u.user_id
            WHERE a.session_token_hash = $1 AND a.expires_at > NOW()
            LIMIT 1`,
            [hashedToken]
        );
        // 5 ingen treff -> 401
        if (sessionRes.rows.length === 0) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 6 treff -> 200 + user info
        return NextResponse.json({
            userId: sessionRes.rows[0].user_id,
            username: sessionRes.rows[0].username
        }, { status: 200 }
        );
    }
    catch (error) {
        console.error("Authentication check failed:", error);
        return NextResponse.json({ error: "Authentication check failed" }, { status: 500 });
    } finally {
        client.release();
    }

}






// viktig forskjell fra login og register, ingen:
// request body, transaksjon, writes, guest fallback