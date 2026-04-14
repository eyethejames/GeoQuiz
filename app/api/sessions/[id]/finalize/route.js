import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(_request, { params }) {
  const { id } = await params;
  const sessionId = Number(id);

  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const sessionRes = await client.query(
      `SELECT session_id
      FROM session_question
      WHERE session_id = $1
      FOR UPDATE`
      ,
      [sessionId]
    );

    if (sessionRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const alreadyFinalized = sessionRes.rows[0].finished_at !== null;

    const scoreRes = await client.query(
      `SELECT COUNT(*)::int AS score
      FROM answer_result
      WHERE session_id = $1 AND is_correct = true`
      ,
      [sessionId]
    );

    const answeredRes = await client.query(
      `SELECT COUNT(*)::int AS answered_count
      FROM answer_result
      WHERE session_id = $1`,
      [sessionId]
    );

    const totalRes = await client.query(
      `SELECT COUNT(*)::int AS total_questions
      FROM session_question 
      WHERE session_id = $1`,
      [sessionId]
    );

    const score = scoreRes.rows[0].score;
    const answeredCount = answeredRes.rows[0].answered_count;
    const totalQuestions = totalRes.rows[0].total_questions;

    const updateRes = await client.query(
      `UPDATE game_session
      SET finished_at = COALESCE(finished_at, CURRENT_TIMESTAMP), 
          score = $2
      WHERE session_id = $1
      RETURNING session_id, finished_at, score`,
      [sessionId, score]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      sessionId: updateRes.rows[0].session_id,
      score: updateRes.rows[0].score,
      finishedAt: updateRes.rows[0].finished_at,
      answeredCount,
      totalQuestions,
      alreadyFinalized,
    });

  } catch (error) {
    await client.query("ROLLBACK");
    const message = error instanceof Error ? error.message : "Finalize failed";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    client.release();
  }
}
