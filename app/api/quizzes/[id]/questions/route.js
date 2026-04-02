import pool from "@/lib/db";

export async function GET(request, context) {
  const params = await context.params;
  const quizId = params.id;

  const result = await pool.query(
    `
    SELECT
      qq.position,
      q.question_id,
      q.prompt,
      ao.option_id,
      ao.text
    FROM quiz_question qq
    JOIN question q
      ON q.question_id = qq.question_id
    JOIN answer_option ao
      ON ao.question_id = q.question_id
    WHERE qq.quiz_id = $1
    ORDER BY qq.position, q.question_id, ao.option_id
    `,
    [quizId]
  );

  const questionsMap = new Map();

  for (const row of result.rows) {
    if (!questionsMap.has(row.question_id)) {
      questionsMap.set(row.question_id, {
        questionId: row.question_id,
        prompt: row.prompt,
        options: [],
      });
    }
    questionsMap.get(row.question_id).options.push({
      optionId: row.option_id,
      text: row.text,
    });
  }

  return Response.json({
    quizId: Number(quizId),
    questions: Array.from(questionsMap.values()),
  });
}