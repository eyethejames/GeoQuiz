"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CATEGORY_STATUS } from "@/lib/categoryStatus";

type Category = { categoryId: number; name: string };
type Region = { regionId: number; name: string; parentRegionId: number | null; type: string };

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export default function GeoQuizPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);

  const [step, setStep] = useState(1);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);

  const [availableQuestionCount, setAvailableQuestionCount] = useState<number | null>(null);
  const [manualQuestionCount, setManualQuestionCount] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [categoriesRes, regionsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/regions"),
        ]);

        if (!categoriesRes.ok) throw new Error(`Categories fetch failed: ${categoriesRes.status}`);

        if (!regionsRes.ok) throw new Error(`Region fetch failed: ${regionsRes.status}`);

        const categoriesData = await categoriesRes.json();
        const regionsData = await regionsRes.json();

        setCategories(categoriesData ?? []);
        setRegions(regionsData ?? []);

      } catch (error: unknown) {
        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadAvailableQuestionCount() {
      if (!selectedCategoryId || !selectedRegionId) {
        setAvailableQuestionCount(null);
        setManualQuestionCount(null);
        return;
      }

      try {
        setError(null);

        const res = await fetch("/api/questions/available-count", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            regionId: selectedRegionId,
            categoryIds: [selectedCategoryId],
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? `Question count fetch failed: ${res.status}`);
        }

        const nextAvailableCount =
          typeof data.availableQuestionCount === "number" ? data.availableQuestionCount : 0;

        setAvailableQuestionCount(nextAvailableCount);
        setManualQuestionCount(null);

      } catch (error: unknown) {
        setAvailableQuestionCount(null);
        setManualQuestionCount(null);
        setError(getErrorMessage(error));
      }
    }
    loadAvailableQuestionCount();
  }, [selectedCategoryId, selectedRegionId]);

  function nextStep() {
    setError(null);

    if (step == 1) {
      if (!Number.isInteger(selectedCategoryId) || !selectedCategoryId) {
        setError("Select a category first.");
        return;
      }
      setStep(2);
      return;
    }

    if (step == 2) {
      if (!Number.isInteger(selectedRegionId) || !selectedRegionId) {
        setError("Select a region first.");
        return;
      }
      setStep(3);
      return;
    }
  }

  async function startSession() {
    if (!Number.isInteger(selectedCategoryId) || !selectedCategoryId) {
      setError("Select a category and a region first.");
      return;
    } if (!Number.isInteger(selectedRegionId) || !selectedRegionId) {
      setError("Select a category and a region first.");
      return;
    }

    try {
      setStarting(true);
      setError(null);

      const sessionRes = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regionId: selectedRegionId,
          categoryIds: [selectedCategoryId],
          questionCount: effectiveQuestionCount,
        }),
      });

      const sessionData = await sessionRes.json();

      if (!sessionRes.ok) {
        throw new Error(sessionData.error ?? `Session create failed: ${sessionRes.status}`);
      }

      router.push(`/play?sessionId=${sessionData.sessionId}`);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setStarting(false);
    }
  }

  const selectedCategory =
    categories.find((category) => category.categoryId === selectedCategoryId) ?? null;

  const selectedRegion =
    regions.find((region) => region.regionId === selectedRegionId) ?? null;

  const effectiveQuestionCount = manualQuestionCount ?? availableQuestionCount ?? 0;

  const questionOptions = [10, 15, 20].filter(
    (count) =>
      availableQuestionCount !== null &&
      count < availableQuestionCount
  );

  return (
    <main style={{ padding: 24, maxWidth: 760, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/" style={{ color: "#111", textDecoration: "none", fontWeight: 600 }}>
          ← Back to start
        </Link>
      </div>

      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Geography Quiz</h1>
      <p style={{ opacity: 0.75, marginTop: 0 }}>
        Choose category, region, and how many questions you want.
      </p>
      {(selectedCategory || selectedRegion || step === 3) && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            background: "#fafafa",
          }}
        >
          {selectedCategory && (
            <p style={{ margin: 0 }}>
              Category: <strong>{selectedCategory.name}</strong>
            </p>
          )}

          {selectedRegion && (
            <p style={{ margin: selectedCategory ? "6px 0 0 0" : 0 }}>
              Region: <strong>{selectedRegion.name}</strong>
            </p>
          )}

          {step === 3 && availableQuestionCount !== null && (
            <p style={{ margin: selectedCategory || selectedRegion ? "6px 0 0 0" : 0 }}>
              Questions: <strong>{effectiveQuestionCount}</strong>
            </p>
          )}
        </div>
      )}

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {step === 1 && (
        <section style={{ marginTop: 20 }}>
          <h2 style={{ marginBottom: 8 }}>1. Category</h2>
          {loading ? (
            <p>Loading categories...</p>
          ) : categories.length === 0 ? (
            <p>No categories found.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {categories.map((category) => {
                const selected = selectedCategoryId === category.categoryId;
                const status = CATEGORY_STATUS[category.name] ?? { live: false, label: "Coming soon" };
                const disabled = !status.live;

                return (
                  <button
                    key={category.categoryId}
                    onClick={() => {
                      setSelectedCategoryId(category.categoryId);
                      setSelectedRegionId(null);
                      setAvailableQuestionCount(null);
                      setManualQuestionCount(null);
                      setStep(2);
                    }}
                    disabled={disabled}
                    style={{
                      padding: "10px 12px",
                      textAlign: "left",
                      borderRadius: 10,
                      border: selected ? "2px solid #111" : "1px solid #ccc",
                      cursor: disabled ? "not-allowed" : "pointer",
                      background: disabled ? "#f5f5f5" : selected ? "#f4f4f5" : "#fff",
                      opacity: disabled ? 0.6 : 1,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                      <span style={{ fontWeight: 600 }}>{category.name}</span>

                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: "4px 8px",
                          borderRadius: 999,
                          background: status.live ? "#dcfce7" : "#e5e7eb",
                          color: status.live ? "#166534" : "#374151",
                          whiteSpace: "nowrap",
                        }}>
                        {status.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )
      }

      {
        step === 2 && (
          <section style={{ marginTop: 24 }}>
            <h2 style={{ marginBottom: 8 }}>2. Region</h2>
            {loading ? (
              <p>Loading regions...</p>
            ) : regions.length === 0 ? (
              <p>No regions found.</p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {regions.map((region) => {
                  const selected = selectedRegionId === region.regionId;

                  return (
                    <button
                      key={region.regionId}
                      onClick={() => {
                        setSelectedRegionId(region.regionId);
                        setAvailableQuestionCount(null);
                        setManualQuestionCount(null);
                      }}
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        borderRadius: 10,
                        border: selected ? "2px solid #111" : "1px solid #ccc",
                        cursor: "pointer",
                        background: selected ? "#f4f4f5" : "#fff",
                      }}
                    >
                      {region.name}
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )
      }

      {
        step === 3 && (
          <section style={{ marginTop: 24 }}>
            <h2 style={{ marginBottom: 8 }}>3. Number of questions</h2>

            {availableQuestionCount === null ? (
              <p>Loading available questions...</p>
            ) : availableQuestionCount === 0 ? (
              <p style={{ color: "crimson" }}>
                No questions available for the selected filters
              </p>
            ) : (
              <>
                <p style={{ marginTop: 0, opacity: 0.8 }}>
                  Default: all available questions for this selection.
                </p>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={() => setManualQuestionCount(null)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: manualQuestionCount === null ? "2px solid #111" : "1px solid #ccc",
                      cursor: "pointer",
                      background: manualQuestionCount === null ? "#f4f4f5" : "#fff",
                    }}
                  >
                    All available ({availableQuestionCount})
                  </button>

                  {questionOptions.map((count) => {
                    const selected = manualQuestionCount === count;

                    return (
                      <button
                        key={count}
                        onClick={() => setManualQuestionCount(count)}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 10,
                          border: selected ? "2px solid #111" : "1px solid #ccc",
                          cursor: "pointer",
                          background: selected ? "#f4f4f5" : "#fff",
                        }}
                      >
                        {count} questions
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        )
      }

      {
        (step === 1 || step === 2) && (
          <section style={{ marginTop: 24, display: "flex", gap: 12 }}>
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "1px solid #111",
                  cursor: starting ? "default" : "pointer",
                  background: "#fff",
                  color: "#111",
                  fontWeight: 600,
                }}
              >
                Back
              </button>
            )}

            <button onClick={nextStep}
              disabled={starting || (step == 1 && !selectedCategoryId) || (step == 2 && !selectedRegionId)}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: "1px solid #111",
                cursor: starting ? "default" : "pointer",
                background: "#fff",
                color: "#111",
                fontWeight: 600,
                opacity: starting || !selectedCategoryId || !selectedRegionId ? 0.6 : 1,
              }}
            >
              {starting ? "Loading..." : "Next"}
            </button>
          </section>
        )
      }

      {
        step === 3 && (
          <section style={{ marginTop: 24, display: "flex", gap: 12 }}>
            {step === 3 && (
              <button onClick={() => setStep(2)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "1px solid #111",
                  cursor: starting ? "default" : "pointer",
                  background: "#fff",
                  color: "#111",
                  fontWeight: 600,
                }}
              >
                Back
              </button>
            )}

            <button
              onClick={startSession}
              disabled={starting || !selectedCategoryId || !selectedRegionId ||
                availableQuestionCount === null || availableQuestionCount === 0}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: "1px solid #111",
                cursor: starting ? "default" : "pointer",
                background: "#fff",
                color: "#111",
                fontWeight: 600,
                opacity:
                  starting || !selectedCategoryId || !selectedRegionId ||
                    availableQuestionCount === null || availableQuestionCount === 0
                    ? 0.6 : 1,
              }}
            >
              {starting ? "Starting..." : "Start quiz"}
            </button>
          </section>
        )
      }
    </main >
  )
}