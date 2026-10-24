"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiBaseUrl, getApiError } from "@/lib/api";
import { withMutationToast } from "@/lib/mutation-toast";

export default function SubmissionCreateForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      await withMutationToast({ loading: "Submitting project…", success: "Project submitted.", error: "Unable to submit your project." }, async () => {
        const response = await fetch(`${apiBaseUrl()}/api/submission`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectName: String(form.get("projectName") ?? "").trim(),
            description: String(form.get("description") ?? "").trim() || null,
            liveUrl: String(form.get("liveUrl") ?? "").trim(),
            repositoryUrl: String(form.get("repositoryUrl") ?? "").trim(),
          }),
        });
        const result: unknown = await response.json();
        if (!response.ok) throw new Error(getApiError(result, "Unable to submit your project."));
      });
      setOpen(false);
      formElement.reset();
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to submit your project.");
    } finally {
      setSaving(false);
    }
  }

  return <div>
    <button type="button" onClick={() => { setOpen(true); setError(""); }} className="h-10 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-800">Submit a project</button>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="new-submission-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"><div className="mb-5 flex items-start justify-between"><div><h2 id="new-submission-title" className="text-lg font-semibold">Submit a project</h2><p className="mt-1 text-sm text-slate-500">Add project links for your reviewer.</p></div><button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-slate-400 hover:text-slate-700">×</button></div>
      <form onSubmit={submit} className="space-y-4"><Field name="projectName" label="Project name" required /><Field name="repositoryUrl" label="Repository URL" type="url" required /><Field name="liveUrl" label="Live project URL" type="url" required /><label className="block text-sm font-medium text-slate-700">Description<textarea name="description" rows={4} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" /></label>{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Cancel</button><button disabled={saving} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Submitting…" : "Submit project"}</button></div></form>
    </section></div>}
  </div>;
}

function Field({ name, label, type = "text", required = false }: { name: string; label: string; type?: string; required?: boolean }) {
  return <label className="block text-sm font-medium text-slate-700">{label}<input name={name} type={type} required={required} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500" /></label>;
}
