"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Category = { categoryId: number; name: string };
type Quiz = { quizId: number; title: string };

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export default function GeoQuizPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoadingCategories(true);
        setError(null);

        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error(`Categories fetch failed: ${res.status}`);

        const data = await res.json();
        setCategories(data ?? []);
      } catch (error: unknown) {
        setError(getErrorMessage(error));
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    async function loadQuizzes(categoryId: number) {
      try {
        setLoadingQuizzes(true);
        setError(null);
        setSelectedQuizId(null);

        const res = await fetch(`/api/categories/${categoryId}/quizzes`);
        if (!res.ok) throw new Error(`Quizzes fetch failed: ${res.status}`);

        const data = await res.json();
        setQuizzes(data ?? []);
      } catch (error: unknown) {
        setError(getErrorMessage(error));
      } finally {
        setLoadingQuizzes(false);
      }
    }

    if (!selectedCategoryId) {
      setQuizzes([]);
      setSelectedQuizId(null);
      return;
    }

    loadQuizzes(selectedCategoryId);
  }, [selectedCategoryId]);

  return (
    <main style={{ padding: 24, maxWidth: 760, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/" style={{ color: "#111", textDecoration: "none", fontWeight: 600 }}>
          ← Back to start
        </Link>
      </div>

      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Geography Quiz</h1>
      <p style={{ opacity: 0.75, marginTop: 0 }}>
        Pick a category and a quiz to begin.
      </p>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <section style={{ marginTop: 20 }}>
        <h2 style={{ marginBottom: 8 }}>1. Category</h2>
        {loadingCategories ? (
          <p>Loading categories...</p>
        ) : categories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {categories.map((category) => {
              const selected = selectedCategoryId === category.categoryId;
              return (
                <button
                  key={category.categoryId}
                  onClick={() => setSelectedCategoryId(category.categoryId)}
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    borderRadius: 10,
                    border: selected ? "2px solid #111" : "1px solid #ccc",
                    cursor: "pointer",
                    background: selected ? "#f4f4f5" : "#fff",
                  }}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 8 }}>2. Quiz</h2>
        {!selectedCategoryId ? (
          <p>Select a category first.</p>
        ) : loadingQuizzes ? (
          <p>Loading quizzes...</p>
        ) : quizzes.length === 0 ? (
          <p>No quizzes found for this category.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {quizzes.map((quiz) => {
              const selected = selectedQuizId === quiz.quizId;
              return (
                <button
                  key={quiz.quizId}
                  onClick={() => setSelectedQuizId(quiz.quizId)}
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    borderRadius: 10,
                    border: selected ? "2px solid #111" : "1px solid #ccc",
                    cursor: "pointer",
                    background: selected ? "#f4f4f5" : "#fff",
                  }}
                >
                  {quiz.title}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        {selectedQuizId ? (
          <Link
            href={`/play?quizId=${selectedQuizId}`}
            style={{
              display: "inline-block",
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid #111",
              textDecoration: "none",
              color: "#111",
              fontWeight: 600,
            }}
          >
            Start quiz
          </Link>
        ) : (
          <p>Select a quiz to continue.</p>
        )}
      </section>
    </main>
  );
}
