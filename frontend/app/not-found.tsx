import { ArrowRight, Compass, House, SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f8fc] px-5 py-16 text-slate-900">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-[-10rem] size-[28rem] rounded-full bg-blue-100/60 blur-3xl" />
        <div className="absolute -right-32 bottom-[-12rem] size-[32rem] rounded-full bg-emerald-100/50 blur-3xl" />
      </div>

      <section className="relative w-full max-w-xl text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-blue-100 bg-white text-blue-700 shadow-sm shadow-blue-100/70">
          <SearchX aria-hidden="true" className="size-7" />
        </div>

        <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
          Page not found
        </p>
        <h1 className="mt-3 text-7xl font-bold tracking-[-0.07em] text-slate-950 sm:text-8xl">
          404
        </h1>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
          This page wandered off.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
          The link may be outdated, or the page may have moved. Head back to your
          workspace and continue from there.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <House aria-hidden="true" className="size-4" />
            Go to overview
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link
            href="/submission"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <Compass aria-hidden="true" className="size-4 text-slate-400" />
            My submissions
          </Link>
        </div>

        <p className="mt-10 text-xs font-medium text-slate-400">Submit Koro</p>
      </section>
    </main>
  );
}
