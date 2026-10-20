"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Info } from "lucide-react";

const fieldClass =
  "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
const labelClass = "block text-sm font-medium text-slate-700";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const isSignup = mode === "signup";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(
      "Your form is ready. Connect an authentication provider to enable account access.",
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {isSignup && (
        <label className={labelClass}>
          Full name
          <input
            required
            autoComplete="name"
            placeholder="Enter your name"
            className={fieldClass}
          />
        </label>
      )}
      <label className={labelClass}>
        Email address
        <input
          required
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Password
        <div className="relative">
          <input
            required
            type={showPassword ? "text" : "password"}
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={8}
            placeholder={
              isSignup ? "At least 8 characters" : "Enter your password"
            }
            className={`${fieldClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((shown) => !shown)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition hover:text-slate-700"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </label>
      {isSignup && (
        <label className={labelClass}>
          Confirm password
          <div className="relative">
            <input
              required
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              placeholder="Re-enter your password"
              className={`${fieldClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((shown) => !shown)}
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition hover:text-slate-700"
            >
              {showConfirmPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </label>
      )}
      {!isSignup && (
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              className="size-4 rounded border-slate-300 accent-blue-700"
            />
            Remember me
          </label>
          <button
            type="button"
            onClick={() =>
              setNotice(
                "Password recovery will be available when authentication is connected.",
              )
            }
            className="font-semibold text-blue-700 hover:text-blue-800"
          >
            Forgot password?
          </button>
        </div>
      )}
      {notice && (
        <p
          role="status"
          className="flex gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-3 text-xs leading-5 text-blue-800"
        >
          <Info className="mt-0.5 size-4 shrink-0" />
          {notice}
        </p>
      )}
      <button
        type="submit"
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
      >
        {isSignup ? "Create account" : "Sign in"}
      </button>
      <p className="text-center text-xs leading-5 text-slate-400">
        By continuing, you agree to our{" "}
        <span className="font-medium text-slate-600">Terms</span> and{" "}
        <span className="font-medium text-slate-600">Privacy Policy</span>.
      </p>
    </form>
  );
}
