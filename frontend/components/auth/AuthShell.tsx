import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthShell({
  children,
  title,
  description,
  footer,
}: {
  children: ReactNode;
  title: string;
  description: string;
  footer: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-900 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(460px,0.9fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-[#103f72] via-[#116b83] to-[#13805e] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="pointer-events-none absolute -right-32 top-20 size-[420px] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-16 top-36 size-[290px] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 size-[380px] rounded-full bg-emerald-400/10 blur-3xl" />
        <Link href="/" className="">
          <Image
            src="/dark_theme_brand_logo.png"
            alt="Submit Koro"
            width={677}
            height={369}
            priority
            className="h-auto w-[150px] object-contain"
          />
        </Link>
        <div className="relative z-10 max-w-xl py-14">
          <span className="mb-6 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium tracking-wide text-white/80">
            LEARN · BUILD · GROW
          </span>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            Turn your learning into work you’re proud to share.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/75">
            Submit projects, get thoughtful feedback, and keep moving forward
            with Submit Koro.
          </p>
          <div className="mt-10 flex items-center gap-3">
            <span className="flex -space-x-2">
              <span className="flex size-9 items-center justify-center rounded-full border-2 border-[#176b78] bg-blue-100 text-xs font-bold text-blue-800">
                S
              </span>
              <span className="flex size-9 items-center justify-center rounded-full border-2 border-[#176b78] bg-emerald-100 text-xs font-bold text-emerald-800">
                M
              </span>
              <span className="flex size-9 items-center justify-center rounded-full border-2 border-[#176b78] bg-sky-100 text-xs font-bold text-sky-800">
                P
              </span>
            </span>
            <p className="text-xs text-white/70">
              A focused space for students and mentors
            </p>
          </div>
        </div>
        <p className="relative z-10 text-xs text-white/55">
          © {new Date().getFullYear()} Submit Koro
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[430px]">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.07)] sm:p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {description}
              </p>
            </div>
            {children}
          </div>
          <div className="mt-6 text-center text-sm text-slate-500">
            {footer}
          </div>
          <p className="mt-8 text-center text-xs text-slate-400">
            Help center <span className="px-2">·</span> Privacy{" "}
            <span className="px-2">·</span> Terms
          </p>
        </div>
      </section>
    </main>
  );
}
