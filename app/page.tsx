"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CurrentUser = { userId: number; username: string };

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export default function HomePage() {
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        setLoadingUser(true);

        const res = await fetch("/api/auth/me");
        if (res.status === 401) {
          setCurrentUser(null);
          return;
        }
        if (!res.ok) throw new Error(`Auth check failed: ${res.status}`);

        const data = await res.json();
        setCurrentUser(data ?? null);
      } catch (error) {
        console.error("Failed to load current user:", error);
        setCurrentUser(null);
      } finally {
        setLoadingUser(false);
      }
    }

    loadCurrentUser();
  }, []);

  async function handleLogout() {
    try {
      setLoggingOut(true);

      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error(`Logout failed: ${res.status}`);

      setCurrentUser(null);
      setShowProfileMenu(false);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 760, margin: "0 auto" }}>
      <section
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>GeoQuiz</h1>
          <p style={{ opacity: 0.75, marginTop: 0, maxWidth: 560 }}>
            Pick a game mode to begin. More modules can come later, but for now Geography Quiz
            is ready to play.
          </p>
        </div>

        <div style={{ position: "relative" }}>
          {loadingUser ? (
            <div
              style={{
                width: 96,
                height: 42,
                borderRadius: 999,
                border: "1px solid #ddd",
                background: "#f6f6f6",
              }}
            />
          ) : currentUser ? (
            <>
              <button
                onClick={() => setShowProfileMenu((open) => !open)}
                aria-label="Open profile menu"
                title={currentUser.username}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  border: "1px solid #111",
                  background: "#fff",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 8px 20px rgba(17, 24, 39, 0.08)",
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" stroke="#111" strokeWidth="1.8" />
                  <path
                    d="M4.5 19.5C5.9 16.9 8.7 15.5 12 15.5C15.3 15.5 18.1 16.9 19.5 19.5"
                    stroke="#111"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {showProfileMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    right: 0,
                    minWidth: 180,
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid #ddd",
                    background: "#fff",
                    boxShadow: "0 14px 32px rgba(17, 24, 39, 0.12)",
                    display: "grid",
                    gap: 10,
                    zIndex: 10,
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: 13, opacity: 0.65 }}>Signed in as</p>
                    <p style={{ margin: "4px 0 0 0", fontWeight: 700 }}>{currentUser.username}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #111",
                      background: "#fff",
                      cursor: loggingOut ? "default" : "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {loggingOut ? "Logging out..." : "Log out"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link
              href="/login"
              style={{
                display: "inline-block",
                padding: "10px 14px",
                borderRadius: 999,
                border: "1px solid #111",
                textDecoration: "none",
                color: "#111",
                fontWeight: 600,
                background: "#fff",
                boxShadow: "0 8px 20px rgba(17, 24, 39, 0.08)",
              }}
            >
              Logg inn
            </Link>
          )}
        </div>
      </section>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <section style={{ marginTop: 28 }}>
        <h2 style={{ marginBottom: 12 }}>Available gamemodes:</h2>
        <div style={{ display: "grid", gap: 16 }}>
          <Link
            href="/geoquiz"
            style={{
              display: "block",
              padding: 22,
              borderRadius: 18,
              border: "1px solid #d8d8d8",
              textDecoration: "none",
              color: "#111",
              background: "linear-gradient(135deg, #f8fafc 0%, #eef6ff 100%)",
              boxShadow: "0 10px 24px rgba(17, 24, 39, 0.06)",
            }}
          >


            <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700, textAlign: "center" }}><div>Geography Quiz</div></h3>
            <p style={{ marginTop: 10, marginBottom: 18, opacity: 0.8, textAlign: "center" }}>
              Choose a category, pick a quiz, and jump into the current geography game flow.
            </p>


          </Link>
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <p style={{ opacity: 0.7, margin: 0 }}>
          More game types coming...
        </p>
      </section>
    </main>
  );
}
