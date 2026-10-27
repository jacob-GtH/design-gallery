// src/app/admin/login/page.tsx
"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";

/** يسمح فقط بمسارات /admin الداخلية (يمنع open redirect). */
function getSafeNext(next: string | null): string {
  if (
    next &&
    (next === "/admin" || next.startsWith("/admin/")) &&
    !next.startsWith("//") &&
    !next.includes("\\")
  ) {
    return next;
  }
  return "/admin";
}

function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.replace(getSafeNext(searchParams.get("next")));
        router.refresh();
        return;
      }
      setError(
        res.status === 429 ? t("admin.loginTooMany") : t("admin.loginError")
      );
    } catch {
      setError(t("admin.loginError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#050505] text-black dark:text-white px-4 transition-colors duration-500">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-xl"
      >
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">{t("admin.loginTitle")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("admin.loginDescription")}
          </p>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("admin.passwordPlaceholder")}
          autoComplete="current-password"
          autoFocus
          required
          maxLength={256}
          className="w-full rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {error && (
          <p role="alert" className="text-sm text-red-500 text-center">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl disabled:opacity-60 transition-opacity"
        >
          {loading ? t("admin.loggingIn") : t("admin.loginButton")}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  // useSearchParams يتطلب Suspense في Next 15 أثناء البناء
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
