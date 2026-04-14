import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request) {
    const body = await request.json();
    const { regionId, categoryIds } = body;

    let normalizedCategoryIds = [];

    if (Array.isArray(categoryIds)) {
        const validCategoryIds = categoryIds.filter((id) => Number.isInteger(id) && id > 0);
        normalizedCategoryIds = [...new Set(validCategoryIds)];
    }

    if (!Number.isInteger(regionId) || regionId <= 0 || normalizedCategoryIds.length <= 0) {
        return NextResponse.json(
            { error: "Invalid filters" }, { status: 400 },
        );
    }

    const countRes = await pool.query(
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
    SELECT COUNT(*)::int AS available_question_count
    FROM eligible_questions`,
        [regionId, normalizedCategoryIds]
    );

    return NextResponse.json({
        availableQuestionCount: countRes.rows[0].available_question_count,
    });
}
