"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { parseAsInteger, useQueryState } from "nuqs";
import React from "react";
import { toast } from "sonner";

function OnSettleModal() {
  const utils = api.useUtils();
  const [id, setId] = useQueryState("settle-penalty-id", parseAsInteger);
  const onClose = () => setId(null);
  const { mutate, isPending } = api.report.markPenaltyAsPaid.useMutation({
    onSuccess: async (data) => {
      await Promise.all([
        utils.report.getStudentWithPenalties.invalidate(),
        utils.report.getStudentWithPenaltiesCount.invalidate(),
      ]);
      toast.success("Penalty marked as settled");
      onClose();
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });
  return (
    <Dialog open={!!id} onOpenChange={onClose}>
      <DialogContent className="">
        <DialogHeader className="flex flex-col gap-0">
          <DialogTitle className="flex flex-row items-center gap-1 text-center text-base">
            Mark Penalty As Settled
          </DialogTitle>
          <DialogDescription className="flex flex-row items-center gap-1 text-center text-xs">
            Confirm marking this penalty as settled
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-row items-center justify-end gap-1">
          <Button variant={"outline"} onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => mutate({ id: id! })} disabled={isPending}>
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default OnSettleModal;
