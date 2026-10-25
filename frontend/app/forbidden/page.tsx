import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-5">
      <section className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-blue-700">Access restricted</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          You don’t have access to this page
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Your assigned role does not include permission for this workspace
          area.
        </p>
        <Link
          href="/profile"
          className="mt-6 inline-flex rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Go to profile
        </Link>
      </section>
    </main>
  );
}
