import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";
import AuthShell from "@/components/auth/AuthShell";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue your projects and see the latest feedback from your mentor."
      footer={<>New to Submit Koro? <Link href="/signup" className="font-semibold text-blue-700 hover:text-blue-800">Create an account</Link></>}
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}
