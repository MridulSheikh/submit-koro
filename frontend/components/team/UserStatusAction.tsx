"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiBaseUrl, getApiError } from "@/lib/api";
import { withMutationToast } from "@/lib/mutation-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function UserStatusAction({ userId, name, status }: { userId: string; name: string; status: string | null }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const nextStatus = status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  async function updateStatus() {
    setError("");
    setSaving(true);
    try {
      await withMutationToast({
        loading: `${nextStatus === "ACTIVE" ? "Activating" : "Deactivating"} account…`,
        success: `Account ${nextStatus === "ACTIVE" ? "activated" : "deactivated"}.`,
        error: "Unable to update account status.",
      }, async () => {
        const response = await fetch(`${apiBaseUrl()}/api/users/${encodeURIComponent(userId)}/status`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });
        const result: unknown = await response.json();
        if (!response.ok) throw new Error(getApiError(result, "Unable to update account status."));
      });
      setOpen(false);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update account status.");
    } finally {
      setSaving(false);
    }
  }

  return <div className="flex flex-col items-start gap-1 sm:items-end">
    <Button type="button" variant={nextStatus === "INACTIVE" ? "outline" : "secondary"} size="sm" onClick={() => { setError(""); setOpen(true); }}>
      {nextStatus === "ACTIVE" ? "Activate" : "Deactivate"}
    </Button>
    {error && !open && <p role="alert" className="max-w-56 text-right text-[11px] text-red-700">{error}</p>}
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader><div><DialogTitle>{nextStatus === "ACTIVE" ? "Activate" : "Deactivate"} {name}?</DialogTitle><DialogDescription>{nextStatus === "ACTIVE" ? "This account will be able to sign in again." : "This account will be signed out and will not be able to use the workspace."}</DialogDescription></div></DialogHeader>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2"><DialogClose render={<Button type="button" variant="outline" disabled={saving} />}>Cancel</DialogClose><Button type="button" variant={nextStatus === "INACTIVE" ? "destructive" : "default"} disabled={saving} onClick={() => void updateStatus()}>{saving ? "Saving…" : `Confirm ${nextStatus === "ACTIVE" ? "activation" : "deactivation"}`}</Button></div>
      </DialogContent>
    </Dialog>
  </div>;
}
