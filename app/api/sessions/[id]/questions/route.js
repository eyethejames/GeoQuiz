import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(_request, { params }) {
    const { id } = await params;
    const sessionId = Number(id);

    if (!Number.isInteger(sessionId) || sessionId <= 0) {
        return NextResponse.json({ error: "Invalid session" }, { status: 400 })
    }

    const questionRes = await pool.query(
        `SELECT s.position, q.question_id, q.prompt, a.option_id, a.text
        FROM session_question s
        JOIN question q ON s.question_id = q.question_id
        JOIN answer_option a ON a.question_id = q.question_id
        WHERE s.session_id = $1
        ORDER BY s.position, a.option_id `,
        [sessionId]
    );

    if (questionRes.rows.length === 0) {
        return NextResponse.json({ error: "No questions found for session" }, { status: 404 });
    }

    const questionsMap = new Map();

    function shuffle(array) {
        const copy = [...array];

        for (let i = copy.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    for (const row of questionRes.rows) {
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

    const questions = Array.from(questionsMap.values()).map((question) => ({
        ...question,
        options: shuffle(question.options),
    }));

    return NextResponse.json({
        sessionId,
        questions,
    });
}
