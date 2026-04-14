"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Option = { optionId: number; text: string };
type Question = { questionId: number; prompt: string; options: Option[] };

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export default function PlayPage() {
  const searchParams = useSearchParams();
  const sessionIdParam = searchParams.get("sessionId");
  const sessionId = Number(sessionIdParam);
  const hasValidSessionId = Number.isInteger(sessionId) && sessionId > 0;

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);

  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<null | { correct: boolean }>(null);
  const [finalizing, setFinalizing] = useState(false);
  const [finalized, setFinalized] = useState(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [finishedAt, setFinishedAt] = useState<string | null>(null);
  const [finalizeAttempt, setFinalizeAttempt] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSessionQuestions() {

      if (!hasValidSessionId) {
        setLoading(false);
        setError("Could not find a valid quiz session. Please try again.");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setQuestions([]);
        setIndex(0);
        setScore(0);
        setFeedback(null);
        setFinalizing(false);
        setFinalized(false);
        setFinalizeError(null);
        setFinishedAt(null);
        setFinalizeAttempt(0);

        const res = await fetch(`/api/sessions/${sessionId}/questions`);
        if (!res.ok) {
          throw new Error(`Fetching questions failed: ${res.status}`)
        }

        const data = await res.json();
        setQuestions(data.questions ?? []);

      } catch (error: unknown) {
        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    loadSessionQuestions();
  }, [hasValidSessionId, sessionId]);

  useEffect(() => {
    async function finalizeSession() {
      if (!hasValidSessionId) return;
      if (questions.length === 0) return;
      if (index < questions.length) return;
      if (finalized || finalizing) return;

      try {
        setFinalizing(true);
        setFinalizeError(null);

        const res = await fetch(`/api/sessions/${sessionId}/finalize`, {
          method: "POST",
        });

        if (!res.ok) {
          throw new Error(`Finalize failed: ${res.status}`);
        }

        const data = await res.json();

        if (typeof data.score === "number") {
          setScore(data.score);
        }

        setFinishedAt(typeof data.finishedAt === "string" ? data.finishedAt : null);
        setFinalized(true);

      } catch (error: unknown) {
        setFinalizeError(getErrorMessage(error));
      } finally {
        setFinalizing(false);
      }
    }

    finalizeSession();
  }, [hasValidSessionId, sessionId, finalizeAttempt, finalized, finalizing, index, questions.length]);

  async function answer(optionId: number) {

    const q = questions[index];
    if (!q || !hasValidSessionId) return;

    setFeedback(null);
    setError(null);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: q.questionId, selectedOptionId: optionId }),
      });

      if (!res.ok) {
        throw new Error(`Answer failed: ${res.status}`);
      }

      const data = await res.json();
      setFeedback({ correct: !!data.correct });
      setScore((prev) => (typeof data.score === "number" ? data.score : prev));

      // liten delay før neste spørsmål
      setTimeout(() => {
        setFeedback(null);
        setIndex((i) => i + 1);
      }, 650);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    }
  }

  if (loading) {
    return <main style={{ padding: 24 }}>Laster…</main>;
  }

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Play</h1>
        <p style={{ color: "crimson" }}>{error}</p>
        <p style={{ marginTop: 12 }}>
          <Link href="/geoquiz">Back to quiz selection</Link>
        </p>
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Play</h1>
        <p>Ingen spørsmål funnet.</p>
        <p style={{ marginTop: 12 }}>
          <Link href="/geoquiz">Back to quiz selection</Link>
        </p>
      </main>
    );
  }

  if (index >= questions.length) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Ferdig!</h1>
        <p>Score: {score} / {questions.length}</p>
        <p>Session: {sessionId}</p>
        {finalizing && <p>Saving final score...</p>}
        {finalized && <p>Session finalized.</p>}
        {finishedAt && <p>Finished at: {new Date(finishedAt).toLocaleString()}</p>}
        {finalizeError && (
          <>
            <p style={{ color: "crimson" }}>{finalizeError}</p>
            <button
              onClick={() => setFinalizeAttempt((attempt) => attempt + 1)}
              style={{
                marginTop: 8,
                padding: "8px 10px",
                border: "1px solid #ccc",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Retry finalize
            </button>
          </>
        )}
        <p style={{ marginTop: 12 }}>
          <Link href="/geoquiz">Play another quiz</Link>
        </p>
      </main>
    );
  }

  const q = questions[index];

  return (
    <main style={{
      minHeight: "10vh", padding: 24, display: "flex", justifyContent: "center", alignItems: "center",
    }}>
      <div style={{ width: "100%", maxWidth: 820 }}>
        <h1>GeoQuiz</h1>
        <p>Session: {sessionId ?? "?"} · Score: {score}</p>

        <div style={{ marginTop: 16, padding: 16, border: "1px solid #ddd", borderRadius: 10 }}>
          <p style={{ margin: 0, opacity: 0.7 }}>
            Spørsmål {index + 1} / {questions.length}
          </p>
          <h2 style={{ marginTop: 8 }}>{q.prompt}</h2>

          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {q.options.map((opt) => (
              <button
                key={opt.optionId}
                onClick={() => answer(opt.optionId)}
                style={{
                  padding: "10px 12px",
                  textAlign: "left",
                  borderRadius: 10,
                  border: "1px solid #ccc",
                  cursor: "pointer",
                }}
              >
                {opt.text}
              </button>
            ))}
          </div>

          {feedback && (
            <p style={{ marginTop: 12, fontWeight: 600 }}>
              {feedback.correct ? "✅ Riktig!" : "❌ Feil!"}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
