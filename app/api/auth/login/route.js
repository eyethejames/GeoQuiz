import { NextResponse } from "next/server";
import pool from "@/lib/db";
import {
    verifyPassword, createSessionToken, hashSessionToken,
    getSessionExpiryDate, setAuthCookie
} from "@/lib/auth";

export async function POST(request) {
    // 1. les brukernavn og passord
    const { username, password } = await request.json();

    const plainPassword = password ?? "";

    if (typeof username !== "string" || typeof plainPassword !== "string") {
        return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const normalizedUsername = username.trim();

    // 2. valider input
    if (normalizedUsername.length === 0) {
        return NextResponse.json({ error: "Username cannot be empty" }, { status: 400 });
    } else if (plainPassword.length === 0) {
        return NextResponse.json({ error: "Password cannot be empty" }, { status: 400 });
    }

    const client = await pool.connect();

    try {

        // 3. sjekk om brukernavn finnes og hent bruker
        const userRes = await client.query(
            `SELECT username, user_id FROM users
            WHERE username = $1`,
            [normalizedUsername]
        );

        const user = userRes.rows[0];

        // 4. bruker eller brukernavn finnes ikke
        if (!user || !user.username) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // 5. sjekk passord til brukernavn
        const storedHash = await client.query(
            `SELECT password_hash FROM user_auth
            WHERE user_id = $1`,
            [user.user_id]
        );

        if (storedHash.rows.length === 0) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // 6. verifiser at passord er riktig
        const isValid = await verifyPassword(plainPassword, storedHash.rows[0].password_hash);
        if (!isValid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        await client.query("BEGIN");

        // 7. opprett sesjon
        const rawToken = createSessionToken();
        const sessionTokenHash = hashSessionToken(rawToken);
        const expiresAt = getSessionExpiryDate();

        await client.query(
            `INSERT INTO auth_session (session_token_hash, user_id, expires_at)
            VALUES ($1, $2, $3) 
            ON CONFLICT (user_id)
            DO UPDATE SET session_token_hash = EXCLUDED.session_token_hash,
                          expires_at = EXCLUDED.expires_at, created_at = NOW()`,
            [sessionTokenHash, user.user_id, expiresAt]
        );

        // Commit before NextResponse to ensure data is saved before sending response
        await client.query("COMMIT");

        const response = NextResponse.json({
            userId: user.user_id,
            username: user.username,
            expiresAt: expiresAt,
        }, { status: 200 });

        // 8. sett cookie
        setAuthCookie(response, rawToken);

        // 9. returner trygg respons
        return response;

    } catch (error) {
        console.error("Login failed:", error);
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
    } finally {
        client.release();
    }
}