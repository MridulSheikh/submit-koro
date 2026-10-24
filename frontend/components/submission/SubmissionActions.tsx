"use client";

import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SubmissionDeleteDialog from "@/components/submission/SubmissionDeleteDialog";
import SubmissionDetailsDialog from "@/components/submission/SubmissionDetailsDialog";
import SubmissionEditDialog from "@/components/submission/SubmissionEditDialog";
import type { Submission } from "@/components/submission/types";

export default function SubmissionActions({
  submission,
  canEdit,
}: {
  submission: Submission;
  canEdit: boolean;
}) {
  const [activeDialog, setActiveDialog] = useState<"details" | "edit" | "delete" | null>(null);

  return (
    <>
      <div className="flex flex-wrap gap-2 md:flex-nowrap">
        <Button type="button" variant="outline" size="sm" onClick={() => setActiveDialog("details")}>
          <Eye aria-hidden="true" /> Details
        </Button>
        {canEdit && (
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => setActiveDialog("edit")}>
              <Pencil aria-hidden="true" /> Edit
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={() => setActiveDialog("delete")}>
              <Trash2 aria-hidden="true" /> Delete
            </Button>
          </>
        )}
      </div>
      <SubmissionDetailsDialog
        submission={submission}
        open={activeDialog === "details"}
        onOpenChange={(open) => setActiveDialog(open ? "details" : null)}
      />
      {canEdit && (
        <>
          <SubmissionEditDialog
            submission={submission}
            open={activeDialog === "edit"}
            onOpenChange={(open) => setActiveDialog(open ? "edit" : null)}
          />
          <SubmissionDeleteDialog
            submission={submission}
            open={activeDialog === "delete"}
            onOpenChange={(open) => setActiveDialog(open ? "delete" : null)}
          />
        </>
      )}
    </>
  );
}
