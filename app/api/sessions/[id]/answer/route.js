import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request, { params }) {
  const { id } = await params;
  const sessionId = Number(id);

  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  const { questionId, selectedOptionId } = await request.json();

  if (!Number.isInteger(questionId) || questionId <= 0 ||
    !Number.isInteger(selectedOptionId) || selectedOptionId <= 0) {
    return NextResponse.json({ error: "questionId and selectedOptionId are required" }, { status: 400 });
  }

  const sessionQuestionRes = await pool.query(
    `SELECT 1
    FROM session_question
    WHERE session_id = $1 AND question_id = $2`,
    [sessionId, questionId]
  );

  if (sessionQuestionRes.rowCount === 0) {
    return NextResponse.json(
      { error: "Question does not belong to this session" },
      { status: 400 }
    );
  }

  const optionRes = await pool.query(
    `SELECT option_id, is_correct
    FROM answer_option
    WHERE question_id = $1 AND option_id = $2`,
    [questionId, selectedOptionId]
  );

  if (optionRes.rowCount === 0) {
    return NextResponse.json(
      { error: "Selected option is invalid for this question" },
      { status: 400 }
    );
  }

  const isCorrect = optionRes.rows[0].is_correct;

  await pool.query(
    `
    INSERT INTO answer_result (session_id, question_id, selected_option_id, is_correct)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (session_id, question_id)
    DO UPDATE SET
      selected_option_id = EXCLUDED.selected_option_id,
      is_correct = EXCLUDED.is_correct
    `,
    [sessionId, questionId, selectedOptionId, isCorrect]
  );

  // score so far
  const scoreRes = await pool.query(
    `SELECT COUNT(*)::int AS score
    FROM answer_result
    WHERE session_id = $1 AND is_correct = true`,
    [sessionId]
  );

  return NextResponse.json({
    sessionId,
    questionId,
    selectedOptionId,
    correct: isCorrect,
    score: scoreRes.rows[0].score,
  });
}
