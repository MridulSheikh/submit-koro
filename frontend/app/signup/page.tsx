import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";
import AuthShell from "@/components/auth/AuthShell";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Join Submit Koro to share your work, receive feedback, and grow your skills."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-700 hover:text-blue-800"
          >
            Sign in
          </Link>
        </>
      }
    >
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
