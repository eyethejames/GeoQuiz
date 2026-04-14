import pool from "@/lib/db";
import { AUTH_COOKIE_NAME, hashSessionToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  const { regionId, categoryIds, questionCount } = body;

  let normalizedCategoryIds = [];

  if (Array.isArray(categoryIds)) {
    const validCategoryIds = categoryIds.filter((id) => Number.isInteger(id) && id > 0);
    normalizedCategoryIds = [...new Set(validCategoryIds)];
  }

  if (!Number.isInteger(regionId) ||
    regionId <= 0 ||
    normalizedCategoryIds.length === 0 ||
    !Number.isInteger(questionCount) ||
    questionCount <= 0) {
    return NextResponse.json({ error: "Invalid session filters" }, { status: 400 });
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
      return NextResponse.json({ error: "Session could not be created" }, { status: 500 });
    }

    const regionRes = await client.query(
      `SELECT region_id FROM region
      WHERE region_id = $1`,
      [regionId]
    )
    if (regionRes.rowCount === 0) {
      return NextResponse.json({ error: "No region selected for session" }, { status: 400 });
    }

    const categoryRes = await client.query(
      `SELECT category_id FROM category
      WHERE category_id = ANY($1::int[])`,
      [normalizedCategoryIds]
    );

    if (categoryRes.rowCount !== normalizedCategoryIds.length) {
      return NextResponse.json({ error: "One or more invalid category" }, { status: 400 })
    }

    const questionRes = await client.query(
      `WITH RECURSIVE region_scope AS (
      SELECT region_id
      FROM region
      WHERE region_id = $1

      UNION ALL

      SELECT r.region_id
      FROM region r
      JOIN region_scope rs
        ON r.parent_region_id = rs.region_id
      ),
      eligible_questions AS (
        SELECT q.question_id
        FROM question q
        JOIN answer_option ao
          ON ao.question_id = q.question_id
        WHERE q.region_id IN (SELECT region_id FROM region_scope)
          AND q.category_id = ANY($2::int[])
        GROUP BY q.question_id
        HAVING COUNT(ao.option_id) = 4
          AND COUNT(*) FILTER (WHERE ao.is_correct = true) = 1
      )
      SELECT question_id
      FROM eligible_questions
      ORDER BY random()
      LIMIT $3`,
      [regionId, normalizedCategoryIds, questionCount]
    );

    const actualQuestionCount = questionRes.rows.length;

    if (actualQuestionCount === 0) {
      return NextResponse.json(
        { error: "No questions available for the selected filters" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    const sessionRes = await client.query(
      `INSERT INTO game_session (user_id, quiz_id, region_id, question_count, started_at)
      VALUES ($1, NULL, $2, $3, CURRENT_TIMESTAMP)
      RETURNING session_id, started_at
      `,
      [userId, regionId, actualQuestionCount]
    );

    const sessionId = sessionRes.rows[0].session_id;

    await client.query(
      `INSERT INTO session_category (session_id, category_id)
      SELECT $1, UNNEST($2::int[])
      ON CONFLICT DO NOTHING`,
      [sessionId, normalizedCategoryIds]
    );

    for (let index = 0; index < questionRes.rows.length; index++) {
      const questionId = questionRes.rows[index].question_id;

      await client.query(
        `INSERT INTO session_question (session_id, question_id, position)
        VALUES ($1, $2, $3)`,
        [sessionId, questionId, index + 1]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({
      sessionId: sessionId,
      startedAt: sessionRes.rows[0].started_at,
      regionId: regionId,
      categoryIds: normalizedCategoryIds,
      requestedQuestionCount: questionCount,
      questionCount: actualQuestionCount
    }, { status: 201 });

  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Error creating game session:", error);
    return NextResponse.json({
      error: "Failed to create game session"
    }, { status: 500 });
  } finally {
    client.release();
  }
}