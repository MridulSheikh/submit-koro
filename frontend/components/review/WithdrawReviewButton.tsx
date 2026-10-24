"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiBaseUrl, getApiError } from "@/lib/api";
import { withMutationToast } from "@/lib/mutation-toast";

export default function WithdrawReviewButton({ reviewId, projectName }: { reviewId: string; projectName: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function withdraw() {
    setError("");
    setDeleting(true);
    try {
      await withMutationToast({ loading: "Withdrawing review…", success: "Review withdrawn.", error: "Unable to withdraw this review." }, async () => {
        const response = await fetch(`${apiBaseUrl()}/api/review/${encodeURIComponent(reviewId)}`, {
          method: "DELETE",
          credentials: "include",
        });
        const result: unknown = await response.json();
        if (!response.ok) throw new Error(getApiError(result, "Unable to withdraw this review."));
      });
      setOpen(false);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to withdraw this review.");
    } finally {
      setDeleting(false);
    }
  }

  return <>
    <Button type="button" variant="destructive" size="sm" className="h-7" onClick={() => { setError(""); setOpen(true); }}><Trash2 aria-hidden="true" />Withdraw</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader><div><DialogTitle>Withdraw this review?</DialogTitle><DialogDescription>Your review for “{projectName}” will be deleted. You can submit a new review afterward.</DialogDescription></div></DialogHeader>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2"><DialogClose render={<Button type="button" variant="outline" disabled={deleting} />}>Cancel</DialogClose><Button type="button" variant="destructive" disabled={deleting} onClick={() => void withdraw()}>{deleting ? "Withdrawing…" : "Withdraw review"}</Button></div>
      </DialogContent>
    </Dialog>
  </>;
}
