import pool from "@/lib/db";

export async function POST(request, context) {
  const params = await context.params;
  const sessionId = Number(params.id);
  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    return Response.json({ error: "Invalid session id" }, { status: 400 });
  }

  const body = await request.json();
  const { questionId, selectedOptionId } = body;

  if (
    !Number.isInteger(questionId) ||
    questionId <= 0 ||
    !Number.isInteger(selectedOptionId) ||
    selectedOptionId <= 0
  ) {
    return Response.json(
      { error: "questionId and selectedOptionId are required" },
      { status: 400 }
    );
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const sessionRes = await client.query(
      `
      SELECT finished_at
      FROM game_session
      WHERE session_id = $1
      FOR UPDATE
      `,
      [sessionId]
    );

    if (sessionRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    if (sessionRes.rows[0].finished_at !== null) {
      await client.query("ROLLBACK");
      return Response.json({ error: "Session is already finalized" }, { status: 409 });
    }

    // check correct
    const correctRes = await client.query(
      `
      SELECT is_correct
      FROM answer_option
      WHERE option_id = $1 AND question_id = $2
      `,
      [selectedOptionId, questionId]
    );

    if (correctRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return Response.json(
        { error: "Option does not match question (or does not exist)" },
        { status: 400 }
      );
    }

    const isCorrect = correctRes.rows[0].is_correct;

    // store answer once per question/session
    try {
      await client.query(
        `
        INSERT INTO answer_result (session_id, question_id, selected_option_id, is_correct)
        VALUES ($1, $2, $3, $4)
        `,
        [sessionId, questionId, selectedOptionId, isCorrect]
      );
    } catch (error) {
      if (error?.code === "23505") {
        await client.query("ROLLBACK");
        return Response.json(
          { error: "Question already answered in this session" },
          { status: 409 }
        );
      }
      throw error;
    }

    // score so far
    const scoreRes = await client.query(
      `
      SELECT COUNT(*)::int AS score
      FROM answer_result
      WHERE session_id = $1 AND is_correct = true
      `,
      [sessionId]
    );

    await client.query("COMMIT");

    return Response.json({
      sessionId,
      questionId,
      selectedOptionId,
      correct: isCorrect,
      score: scoreRes.rows[0].score,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    const message = error instanceof Error ? error.message : "Answer submission failed";
    return Response.json({ error: message }, { status: 500 });
  } finally {
    client.release();
  }
}
