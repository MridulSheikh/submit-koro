"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Eye, EyeOff, Info } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { withMutationToast } from "@/lib/mutation-toast";
import {
  loginSchema,
  signupSchema,
  type LoginFormValues,
  type SignupFormValues,
} from "@/lib/schemas/auth.schema";

const fieldClass =
  "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
const labelClass = "block text-sm font-medium text-slate-700";
const showDemoCredentials = true;

function FieldError({
  children,
  id,
}: {
  children?: ReactNode;
  id: string;
}) {
  if (!children) return null;

  return (
    <p id={id} className="mt-1 text-xs text-red-600" role="alert">
      {children}
    </p>
  );
}

function getAuthErrorMessage(data: unknown) {
  if (typeof data !== "object" || data === null) {
    return "Unable to complete authentication. Please try again.";
  }

  const result = data as Record<string, unknown>;
  if (typeof result.message === "string") return result.message;

  if (typeof result.error === "object" && result.error !== null) {
    const error = result.error as Record<string, unknown>;
    if (typeof error.message === "string") return error.message;
  }

  return "Unable to complete authentication. Please try again.";
}

function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: showDemoCredentials ? "super@gmail.com" : "",
      password: showDemoCredentials ? "super12345" : "",
      rememberMe: false,
    },
    mode: "onTouched",
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setNotice("");
    setSubmitError("");

    try {
      await withMutationToast({ loading: "Signing in…", success: "Signed in successfully.", error: "Unable to sign in." }, async () => {
        const { error } = await authClient.signIn.email({
          email: values.email,
          password: values.password,
          rememberMe: values.rememberMe,
        });
        if (error) throw new Error(getAuthErrorMessage(error));
      });

      router.replace("/");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <label className={labelClass} htmlFor="login-email">
        Email address
        <input
          {...register("email")}
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={fieldClass}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={[
            errors.email ? "login-email-error" : null,
            showDemoCredentials ? "login-email-demo" : null,
          ].filter(Boolean).join(" ") || undefined}
        />
        <FieldError id="login-email-error">{errors.email?.message}</FieldError>
        {showDemoCredentials && (
          <p id="login-email-demo" className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
            Demo email
            <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 font-mono font-semibold tracking-wide text-blue-900 shadow-sm">
              super@gmail.com
            </span>
          </p>
        )}
      </label>
      <label className={labelClass} htmlFor="login-password">
        Password
        <div className="relative">
          <input
            {...register("password")}
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            className={`${fieldClass} pr-11`}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              [
                errors.password ? "login-password-error" : null,
                showDemoCredentials ? "login-password-demo" : null,
              ].filter(Boolean).join(" ") || undefined
            }
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
        <FieldError id="login-password-error">
          {errors.password?.message}
        </FieldError>
        {showDemoCredentials && (
          <p id="login-password-demo" className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
            Demo password
            <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 font-mono font-semibold tracking-wide text-amber-950 shadow-sm">
              super12345
            </span>
          </p>
        )}
      </label>
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-slate-600">
          <input
            {...register("rememberMe")}
            type="checkbox"
            className="size-4 rounded border-slate-300 accent-blue-700"
          />
          Remember me
        </label>
        <button
          type="button"
          onClick={() =>
            setNotice(
              "Password recovery will be available when password reset is enabled.",
            )
          }
          className="font-semibold text-blue-700 hover:text-blue-800"
        >
          Forgot password?
        </button>
      </div>
      {notice && (
        <p
          role="status"
          className="flex gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-3 text-xs leading-5 text-blue-800"
        >
          <Info className="mt-0.5 size-4 shrink-0" />
          {notice}
        </p>
      )}
      {submitError && (
        <p
          role="alert"
          className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700"
        >
          {submitError}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-center text-xs leading-5 text-slate-400">
        By continuing, you agree to our{" "}
        <span className="font-medium text-slate-600">Terms</span> and{" "}
        <span className="font-medium text-slate-600">Privacy Policy</span>.
      </p>
    </form>
  );
}

function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const onSubmit: SubmitHandler<SignupFormValues> = async (values) => {
    setSubmitError("");

    try {
      await withMutationToast({ loading: "Creating account…", success: "Account created. Check your email to verify it.", error: "Unable to create your account." }, async () => {
        const { error } = await authClient.signUp.email({
          name: values.name,
          email: values.email,
          password: values.password,
        });
        if (error) throw new Error(getAuthErrorMessage(error));
      });

      router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to create your account. Please try again.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <label className={labelClass} htmlFor="signup-name">
        Full name
        <input
          {...register("name")}
          id="signup-name"
          autoComplete="name"
          placeholder="Enter your name"
          className={fieldClass}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "signup-name-error" : undefined}
        />
        <FieldError id="signup-name-error">{errors.name?.message}</FieldError>
      </label>
      <label className={labelClass} htmlFor="signup-email">
        Email address
        <input
          {...register("email")}
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={fieldClass}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "signup-email-error" : undefined}
        />
        <FieldError id="signup-email-error">{errors.email?.message}</FieldError>
      </label>
      <label className={labelClass} htmlFor="signup-password">
        Password
        <div className="relative">
          <input
            {...register("password")}
            id="signup-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className={`${fieldClass} pr-11`}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "signup-password-error" : undefined
            }
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
        <FieldError id="signup-password-error">
          {errors.password?.message}
        </FieldError>
      </label>
      <label className={labelClass} htmlFor="signup-confirm-password">
        Confirm password
        <div className="relative">
          <input
            {...register("confirmPassword")}
            id="signup-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            className={`${fieldClass} pr-11`}
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={
              errors.confirmPassword
                ? "signup-confirm-password-error"
                : undefined
            }
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
        <FieldError id="signup-confirm-password-error">
          {errors.confirmPassword?.message}
        </FieldError>
      </label>
      {submitError && (
        <p
          role="alert"
          className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700"
        >
          {submitError}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
      <p className="text-center text-xs leading-5 text-slate-400">
        By continuing, you agree to our{" "}
        <span className="font-medium text-slate-600">Terms</span> and{" "}
        <span className="font-medium text-slate-600">Privacy Policy</span>.
      </p>
    </form>
  );
}

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  return mode === "login" ? <LoginForm /> : <SignupForm />;
}
