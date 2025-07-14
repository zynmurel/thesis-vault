"use client";
import { Button } from "@/components/ui/button-small";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { BookOpenCheck, BookText, CheckCircle, Scan } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import React from "react";

function SuccessBorrowThesisModal() {
  const [borrow, setShowBorrow] = useQueryState("borrowSuccess", parseAsString);

  const { data: settings } = api.mobile.student.getThesisDueDayCount.useQuery();
  const { data } = api.mobile.theses.getThesis.useQuery(
    {
      thesisId: String(borrow),
    },
    { enabled: !!borrow },
  );

  const onClose = () => {
    setShowBorrow(null);
  };

  return (
    <Dialog open={!!borrow} onOpenChange={onClose}>
      <DialogContent className="gap-3 p-3 px-4 md:min-w-xl">
        <DialogHeader className="flex flex-col items-center gap-0">
          <CheckCircle className="size-12 text-green-600" strokeWidth={2.5} />
          <DialogTitle className="flex flex-row items-center gap-1 text-center text-base">
            Borrow Successfully
          </DialogTitle>
          <DialogDescription className="mt-2 flex flex-row items-center gap-1 text-center text-xs">
            Instructions for claiming and returning your thesis
          </DialogDescription>
        </DialogHeader>
        <div className="text-foreground/70 flex flex-col items-center space-y-1 rounded-md border border-green-500 bg-green-50 p-4">
          <BookText className="text-primary mb-2 size-10" strokeWidth={2} />
          <h2 className="text-primary text-sm font-semibold text-center tracking-tighter leading-4">
            {data?.title || "Loading..."}
          </h2>
        </div>
        <div className="text-foreground/70 space-y-3 rounded-md border p-4">
          <div className="text-foreground/70 flex flex-col text-xs">
            <div className="flex flex-row items-center gap-1">
              <BookOpenCheck className="size-3.5" strokeWidth={3} />
              <p className="text-sm font-bold">Claim the Thesis</p>
            </div>
            <p>Proceed to the CCIS Library to pick up your thesis book.</p>
          </div>
          <div className="flex flex-col text-xs">
            <div className="flex flex-row items-center gap-1">
              <Scan className="size-3.5" strokeWidth={3} />
              <p className="text-sm font-bold">Scan at the Admin Desk</p>
            </div>
            <p>
              Upon claiming the book, have it scanned at the Admin Desk to
              confirm that you received it.
            </p>
          </div>
          <div className="flex flex-col text-xs">
            <div className="flex flex-row items-center gap-1">
              <Scan className="size-3.5" strokeWidth={3} />
              <p className="text-sm font-bold">Return Process</p>
            </div>
            <p>
              When you&apos;re ready to return it, please go back to the Admin Desk
              and have it scanned again. You must return the thesis within{" "}
              {settings?.dayCount || 0} days of the initial scan to avoid any
              penalties.
            </p>
          </div>
          <p className="text-xs text-gray-600">
            Please handle the book with care. Thank you!
          </p>
        </div>

        <div>
          <div className="flex w-full justify-end gap-1">
            <Button variant={"outline"} onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SuccessBorrowThesisModal;
