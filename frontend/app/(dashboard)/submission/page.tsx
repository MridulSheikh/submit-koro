"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Link2,
  Plus,
  Trash2,
  X,
} from "lucide-react";

type ExtraLink = { label: string; url: string };
type Submission = {
  id: number;
  title: string;
  course: string;
  submitted: string;
  status: "Pending" | "Approved" | "Rejected";
  repoUrl: string;
  liveUrl: string;
  description: string;
  links: ExtraLink[];
};

const initialSubmissions: Submission[] = [
  {
    id: 1,
    title: "E-commerce dashboard",
    course: "Frontend Development",
    submitted: "Today, 10:42 AM",
    status: "Pending",
    repoUrl: "https://github.com/example/e-commerce-dashboard",
    liveUrl: "https://example.com",
    description:
      "A responsive storefront dashboard with product summaries and a shopping cart flow.",
    links: [],
  },
  {
    id: 2,
    title: "Weather app with API",
    course: "Web Fundamentals",
    submitted: "October 18, 2026",
    status: "Approved",
    repoUrl: "https://github.com/example/weather-app",
    liveUrl: "https://example.com/weather",
    description:
      "A city weather experience showing current conditions and a short forecast.",
    links: [],
  },
  {
    id: 3,
    title: "Personal portfolio",
    course: "Frontend Development",
    submitted: "October 12, 2026",
    status: "Rejected",
    repoUrl: "https://github.com/example/portfolio",
    liveUrl: "",
    description:
      "A portfolio showcasing selected projects and contact information.",
    links: [],
  },
];

export default function SubmissionPage() {
  const isMentor = process.env.NEXT_PUBLIC_USER_ROLE !== "STUDENT";
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [showForm, setShowForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [description, setDescription] = useState("");
  const [links, setLinks] = useState<ExtraLink[]>([]);

  const pending = useMemo(
    () =>
      submissions.filter((submission) => submission.status === "Pending")
        .length,
    [submissions],
  );
  const approved = useMemo(
    () =>
      submissions.filter((submission) => submission.status === "Approved")
        .length,
    [submissions],
  );

  function resetForm() {
    setProjectName("");
    setRepoUrl("");
    setLiveUrl("");
    setDescription("");
    setLinks([]);
  }

  function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const extraLinks = links
      .filter((link) => link.label.trim() && link.url.trim())
      .map((link) => ({ label: link.label.trim(), url: link.url.trim() }));
    setSubmissions((current) => [
      {
        id: Date.now(),
        title: projectName.trim(),
        course: "Project submission",
        submitted: "Just now",
        status: "Pending",
        repoUrl: repoUrl.trim(),
        liveUrl: liveUrl.trim(),
        description: description.trim(),
        links: extraLinks,
      },
      ...current,
    ]);
    resetForm();
    setShowForm(false);
  }

  function closeForm() {
    setShowForm(false);
  }

  return (
    <div className="min-h-screen flex-1 bg-[#f7f8fc] text-slate-900">
      <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">Workspace</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800">My submissions</span>
        </div>
        {isMentor && (
          <span className="hidden rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 sm:inline-flex">
            Mentor view
          </span>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-medium text-blue-700">
              Submission history
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              My submissions
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Track project submissions and review decisions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-800"
          >
            <Plus className="size-4" />
            Submit a project
          </button>
        </div>

        <section
          aria-label="Submission totals"
          className="mb-6 grid gap-4 sm:grid-cols-3"
        >
          <Metric
            label="Total submissions"
            value={String(submissions.length)}
          />
          <Metric label="Pending review" value={String(pending)} />
          <Metric label="Approved" value={String(approved)} />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.025)]">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <h2 className="font-semibold">Recent projects</h2>
            <p className="mt-1 text-sm text-slate-500">
              Your submitted work and its latest status
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {submissions.map((submission) => (
              <article key={submission.id} className="px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <FileText className="size-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {submission.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {submission.course}
                        <span className="px-1.5">·</span>
                        {submission.submitted}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${submission.status === "Approved" ? "bg-emerald-50 text-emerald-700" : submission.status === "Rejected" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}
                    >
                      {submission.status === "Approved" ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : (
                        <Clock3 className="size-3.5" />
                      )}
                      {submission.status}
                    </span>
                    {isMentor && (
                      <a
                        href="/review"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
                      >
                        Open review <ArrowRight className="size-3.5" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="mt-4 ml-[52px]">
                  <p className="max-w-3xl text-sm leading-6 text-slate-600">
                    {submission.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium">
                    <a
                      href={submission.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-700 hover:underline"
                    >
                      <Link2 className="size-3.5" />
                      Repository
                    </a>
                    {submission.liveUrl && (
                      <a
                        href={submission.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-blue-700 hover:underline"
                      >
                        <Link2 className="size-3.5" />
                        Live project
                      </a>
                    )}
                    {submission.links.map((link) => (
                      <a
                        key={`${link.label}-${link.url}`}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-blue-700 hover:underline"
                      >
                        <Link2 className="size-3.5" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeForm();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-project-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/20 sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 id="submit-project-title" className="text-lg font-semibold">
                  Submit a project
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Share your project details and the links your mentor needs.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close dialog"
                onClick={closeForm}
                className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={submitProject}>
              <div className="grid gap-4">
                <label className="text-sm font-medium text-slate-700">
                  Project name
                  <input
                    required
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    placeholder="e.g. Personal portfolio"
                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Description
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe what you built and the main features..."
                    className="mt-2 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Project Links
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Add more resources with a label for each link.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setLinks((current) => [
                          ...current,
                          { label: "", url: "" },
                        ])
                      }
                      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                    >
                      <Plus className="size-3.5" />
                      Add link
                    </button>
                  </div>
                  <div className="space-y-3">
                    {links.map((link, index) => (
                      <div
                        key={index}
                        className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] sm:items-end"
                      >
                        <label className="text-xs font-medium text-slate-600">
                          Link label
                          <input
                            required
                            value={link.label}
                            onChange={(event) =>
                              setLinks((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, label: event.target.value }
                                    : item,
                                ),
                              )
                            }
                            placeholder="e.g. github link"
                            className="mt-1.5 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </label>
                        <label className="text-xs font-medium text-slate-600">
                          URL
                          <input
                            required
                            type="url"
                            value={link.url}
                            onChange={(event) =>
                              setLinks((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, url: event.target.value }
                                    : item,
                                ),
                              )
                            }
                            placeholder="https://..."
                            className="mt-1.5 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </label>
                        <button
                          type="button"
                          aria-label={`Remove link ${index + 1}`}
                          onClick={() =>
                            setLinks((current) =>
                              current.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            )
                          }
                          className="flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                    {links.length === 0 && (
                      <p className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-xs text-slate-400">
                        No additional links added.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
                >
                  <Plus className="size-4" />
                  Submit project
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.025)]">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
    </article>
  );
}
