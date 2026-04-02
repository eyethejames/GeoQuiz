import pool from "@/lib/db";

export async function GET(_request, context) {
  const params = await context.params;
  const categoryId = Number(params.id);

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return Response.json({ error: "Invalid category id" }, { status: 400 });
  }

  const result = await pool.query(
    `
    SELECT quiz_id, title
    FROM quiz
    WHERE category_id = $1
    ORDER BY quiz_id
    `,
    [categoryId]
  );

  const quizzes = result.rows.map((row) => ({
    quizId: row.quiz_id,
    title: row.title,
  }));

  return Response.json(quizzes);
}
