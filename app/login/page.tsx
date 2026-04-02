"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 560, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/" style={{ color: "#111", textDecoration: "none", fontWeight: 600 }}>
          ← Back to GeoQuiz
        </Link>
      </div>

      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Log in</h1>
      <p style={{ opacity: 0.75, marginTop: 0, marginBottom: 24 }}>
        Sign in if you want your quiz sessions tied to your account. You can still play as a guest.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: 16,
          padding: 20,
          border: "1px solid #ddd",
          borderRadius: 14,
          background: "#fff",
        }}
      >
        <div style={{ display: "grid", gap: 6 }}>
          <label htmlFor="username" style={{ fontWeight: 600 }}>
            Username
          </label>
          <input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={loading}
            autoComplete="username"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label htmlFor="password" style={{ fontWeight: 600 }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loading}
            autoComplete="current-password"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ccc",
            }}
          />
        </div>

        {error && (
          <p style={{ color: "crimson", margin: 0 }} aria-live="polite">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "11px 14px",
            borderRadius: 10,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            fontWeight: 600,
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p style={{ marginTop: 18 }}>
        No account yet?{" "}
        <Link href="/register" style={{ fontWeight: 600 }}>
          Create one
        </Link>
      </p>
    </main>
  );
}
