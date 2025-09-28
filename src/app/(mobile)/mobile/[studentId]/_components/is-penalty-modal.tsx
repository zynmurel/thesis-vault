"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  UserCheck,
  XCircle,
} from "lucide-react";
import React from "react";

function IsPenaltyModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const onClose = () => setOpen(false)
  return (
    <Dialog open={!!open} onOpenChange={onClose}>
      <DialogContent className="gap-3 p-3 px-4 md:min-w-xl">
        <DialogHeader className="flex flex-col items-center gap-0">
          <XCircle className="size-12 text-red-600" strokeWidth={2.5} />
          <DialogTitle className="flex flex-row items-center gap-1 text-center text-base">
            Cannot Borrow Thesis Book
          </DialogTitle>
          <DialogDescription className="mt-2 flex flex-row items-center gap-1 text-center text-xs">
            You still have a pending penalty that must be settled at the library
            admin before borrowing new books.
          </DialogDescription>
        </DialogHeader>

        <div className="text-foreground/70 space-y-3 rounded-md border p-4">
          <div className="flex flex-col text-xs">
            <div className="flex flex-row items-center gap-1">
              <AlertTriangle
                className="size-3.5 text-red-600"
                strokeWidth={3}
              />
              <p className="text-sm font-bold">Why You Can’t Borrow</p>
            </div>
            <p>
              Our records show you returned a previous thesis book late. A
              penalty is still unsettled in the library system.
            </p>
          </div>

          <div className="flex flex-col text-xs">
            <div className="flex flex-row items-center gap-1">
              <UserCheck className="size-3.5 text-red-600" strokeWidth={3} />
              <p className="text-sm font-bold">How to Settle</p>
            </div>
            <p>
              Please proceed to the Library Admin to settle your penalty. The
              admin may require you to complete community service in school or
              another task they assign before restoring your borrowing
              privileges.
            </p>
          </div>

          <p className="text-xs text-gray-600">
            Once the penalty is cleared, you will be allowed to borrow thesis
            books again. Thank you for your understanding.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default IsPenaltyModal;
