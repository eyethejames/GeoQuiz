import pool from "@/lib/db";
import { AUTH_COOKIE_NAME, hashSessionToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request) {
  const { quizId } = await request.json();
  if (!Number.isInteger(quizId) || quizId <= 0) {
    return Response.json({ error: "No quiz found" }, { status: 400 });
  }

  const client = await pool.connect();

  try {
    let userId = null;

    const cookieStore = await cookies();
    const rawToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (rawToken) {

      const authRes = await client.query(
        `SELECT user_id FROM auth_session
          WHERE session_token_hash = $1
          AND expires_at > CURRENT_TIMESTAMP
          LIMIT 1`,
        [hashSessionToken(rawToken)]
      )
      userId = authRes.rows[0]?.user_id ?? null;
    }

    if (!userId) {
      const guestRes = await client.query(
        `SELECT user_id FROM users
            WHERE is_guest = true
            LIMIT 1`,
      )
      userId = guestRes.rows[0]?.user_id ?? null;
    }

    if (!userId) {
      return Response.json({ error: "Session could not be created" }, { status: 500 });
    }

    const sessionRes = await client.query(
      `
      INSERT INTO game_session (user_id, quiz_id, started_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING session_id, started_at
      `,
      [userId, quizId]
    );

    return Response.json({
      sessionId: sessionRes.rows[0].session_id,
      startedAt: sessionRes.rows[0].started_at,
    });

  } catch (error) {
    console.error("Error creating game session:", error);
    return Response.json({ error: "Failed to create game session" }, { status: 500 });

  } finally {
    client.release();
  }
}