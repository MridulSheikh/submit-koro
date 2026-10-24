"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, LoaderCircle, Mail, MailCheck, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { withMutationToast } from "@/lib/mutation-toast";

type VerificationState = "waiting" | "verifying" | "verified" | "error" | "missing";

function getAuthErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return fallback;
}

export default function VerifyEmailForm({
  token,
  email,
}: {
  token?: string;
  email?: string;
}) {
  const [state, setState] = useState<VerificationState>(token ? "verifying" : email ? "waiting" : "missing");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [resent, setResent] = useState(false);
  const startedToken = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState(email ? "waiting" : "missing");
      return;
    }
    if (startedToken.current === token) return;
    startedToken.current = token;
    const verificationToken = token;

    async function verify() {
      setState("verifying");
      setErrorMessage("");
      try {
        await withMutationToast(
          {
            loading: "Verifying email…",
            success: "Email verified.",
            error: "Unable to verify your email.",
          },
          async () => {
            const { error } = await authClient.verifyEmail({ query: { token: verificationToken } });
            if (error) {
              throw new Error(error.message || "This verification link is invalid or expired.");
            }
          },
        );
        setState("verified");
      } catch (error) {
        setErrorMessage(
          getAuthErrorMessage(error, "This verification link is invalid or expired."),
        );
        setState("error");
      }
    }

    void verify();
  }, [email, token]);

  async function resendVerification() {
    if (!email) return;
    setIsSending(true);
    setErrorMessage("");
    setResent(false);
    try {
      await withMutationToast(
        {
          loading: "Sending verification email…",
          success: "Verification email sent.",
          error: "Unable to send verification email.",
        },
        async () => {
          const { error } = await authClient.sendVerificationEmail({
            email,
            callbackURL: "/login",
          });
          if (error) {
            throw new Error(error.message || "Unable to send verification email.");
          }
        },
      );
      setResent(true);
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, "Unable to send verification email."));
    } finally {
      setIsSending(false);
    }
  }

  if (state === "verifying") {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center" role="status" aria-live="polite">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100">
          <LoaderCircle className="size-6 animate-spin" aria-hidden="true" />
        </span>
        <div>
          <p className="font-semibold text-slate-900">Verifying your email</p>
          <p className="mt-1 text-sm text-slate-500">Please keep this page open for a moment.</p>
        </div>
      </div>
    );
  }

  if (state === "verified") {
    return (
      <div className="space-y-5 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </span>
        <div>
          <p className="font-semibold text-slate-900">Email verified</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">Your account is ready. You can continue to Submit Koro.</p>
        </div>
        <Link
          href="/"
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
        >
          Continue to Submit Koro
        </Link>
      </div>
    );
  }

  if (state === "waiting") {
    return (
      <div className="space-y-5 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100">
          {resent ? <MailCheck className="size-7" aria-hidden="true" /> : <Mail className="size-7" aria-hidden="true" />}
        </span>
        <div>
          <p className="font-semibold text-slate-900">Check your inbox</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            We sent a verification link to <span className="font-medium text-slate-700">{email}</span>. Open it to activate your account.
          </p>
        </div>
        {resent && <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800" role="status">A new verification link has been sent.</p>}
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        <Button type="button" variant="outline" onClick={() => void resendVerification()} disabled={isSending} className="h-11 w-full rounded-xl">
          {isSending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <RotateCw aria-hidden="true" />}
          {isSending ? "Sending…" : "Resend verification email"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100">
        <AlertCircle className="size-7" aria-hidden="true" />
      </span>
      <div>
        <p className="font-semibold text-slate-900">{state === "missing" ? "Verification link missing" : "Could not verify email"}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {errorMessage || "This page needs the verification link from your email. Request a new link or return to sign up."}
        </p>
      </div>
      {email && <Button type="button" variant="outline" onClick={() => void resendVerification()} disabled={isSending} className="h-11 w-full rounded-xl">{isSending ? "Sending…" : "Resend verification email"}</Button>}
      <Link href={email ? "/login" : "/signup"} className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200">
        {email ? "Back to sign in" : "Create an account"}
      </Link>
      {errorMessage && email && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </div>
  );
}

function ErrorMessage({ children }: { children: string }) {
  return (
    <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700">
      {children}
    </p>
  );
}
