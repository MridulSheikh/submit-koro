import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import VerifyEmailForm from "@/components/auth/VerifyEmailForm";

type SearchParams = PageProps<"/verify-email">["searchParams"];

function VerifyEmailShell({ children }: { children: ReactNode }) {
  return (
    <AuthShell
      title="Verify your email"
      description="Confirm your email address to finish setting up your Submit Koro account."
      footer={
        <>
          Already verified?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-700 hover:text-blue-800"
          >
            Sign in
          </Link>
        </>
      }
    >
      {children}
    </AuthShell>
  );
}

async function VerifyEmailContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { token, email } = await searchParams;
  const verificationToken = Array.isArray(token) ? token[0] : token;
  const verificationEmail = Array.isArray(email) ? email[0] : email;

  return (
    <VerifyEmailShell>
      <VerifyEmailForm token={verificationToken} email={verificationEmail} />
    </VerifyEmailShell>
  );
}

export default function VerifyEmailPage({
  searchParams,
}: PageProps<"/verify-email">) {
  return (
    <Suspense
      fallback={
        <VerifyEmailShell>
          <p className="text-center text-sm text-slate-500">
            Loading verification link...
          </p>
        </VerifyEmailShell>
      }
    >
      <VerifyEmailContent searchParams={searchParams} />
    </Suspense>
  );
}
