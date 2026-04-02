import pool from "@/lib/db";

export async function GET() {
  const result = await pool.query(
    `
    SELECT category_id, name
    FROM category
    ORDER BY category_id
    `
  );

  const categories = result.rows.map((row) => ({
    categoryId: row.category_id,
    name: row.name,
  }));

  return Response.json(categories);
}
