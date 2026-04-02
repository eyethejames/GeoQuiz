import { NextResponse } from "next/server";
import pool from "@/lib/db";
import {
    hashPassword, createSessionToken, hashSessionToken,
    getSessionExpiryDate, setAuthCookie
} from "@/lib/auth";

export async function POST(request) {
    const { username, password } = await request.json();

    if (typeof username !== "string" || typeof password !== "string") {
        return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }
    const normalizedUsername = username.trim();

    const passwordHasLetterAndNumber = /[A-Za-z]/.test(password) && /[0-9]/.test(password);

    if (normalizedUsername.length === 0 || password.length === 0) {
        return NextResponse.json({ error: "Username and password cannot be empty" }, { status: 400 });
    } else if (normalizedUsername.length < 3) {
        return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
    } else if (password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    } else if (!passwordHasLetterAndNumber) {
        return NextResponse.json({ error: "Password must contain at least one letter and number" }, { status: 400 });
    } else if (normalizedUsername.length > 20) {
        return NextResponse.json({ error: "Username must be less than 20 characters" }, { status: 400 });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        const userRes = await client.query(
            `INSERT INTO users (username) 
            VALUES ($1) 
            RETURNING user_id, username, created_at`,
            [normalizedUsername]
        );

        const user = userRes.rows[0];
        const passwordHash = await hashPassword(password);

        await client.query(
            `INSERT INTO user_auth (user_id, password_hash) 
            VALUES ($1, $2)`,
            [user.user_id, passwordHash]);

        const rawToken = createSessionToken();
        const sessionTokenHash = hashSessionToken(rawToken);
        const expiresAt = getSessionExpiryDate();

        await client.query(
            `INSERT INTO auth_session (session_token_hash, user_id, expires_at)
            VALUES ($1, $2, $3) 
            ON CONFLICT (user_id)
            DO UPDATE SET session_token_hash = EXCLUDED.session_token_hash,
                          expires_at = EXCLUDED.expires_at,
                          created_at = NOW()`,
            [sessionTokenHash, user.user_id, expiresAt]
        )

        // Commit before NextResponse to ensure data is saved before sending response
        await client.query("COMMIT");

        const response = NextResponse.json({
            userId: user.user_id,
            username: user.username,
            createdAt: user.created_at,
        }, { status: 201 });

        setAuthCookie(response, rawToken);

        return response;

    } catch (error) {
        if (error.code === "23505") { // Unique violation error code in PostgreSQL
            await client.query("ROLLBACK");
            return NextResponse.json({ error: "Username already exists" }, { status: 409 });
        } else {
            await client.query("ROLLBACK");
            return NextResponse.json({ error: "Registration failed" }, { status: 500 });
        }
    } finally {
        client.release();
    }
}