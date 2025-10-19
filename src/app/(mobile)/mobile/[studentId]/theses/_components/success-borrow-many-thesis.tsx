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
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import React from "react";

function SuccessBorrowManyThesisModal() {
  const [borrowIds, setShowBorrow] = useQueryState(
    "borrowManySuccess",
    parseAsArrayOf(parseAsString),
  );

  const { data: settings } = api.mobile.student.getThesisDueDayCount.useQuery();

  const { data: theses, isLoading } = api.mobile.theses.getThesesByIds.useQuery(
    {
      thesisIds: borrowIds || [],
    },
    { enabled: !!borrowIds?.length },
  );

  const onClose = () => setShowBorrow(null);

  return (
    <Dialog open={!!borrowIds?.length} onOpenChange={onClose}>
      <DialogContent className="gap-3 p-3 px-4 md:min-w-xl">
        <DialogHeader className="flex flex-col items-center gap-1 text-center">
          <CheckCircle className="size-12 text-green-600" strokeWidth={2.5} />
          <DialogTitle className="text-base font-semibold">
            Borrow Successful
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            Below are the thesis titles you’ve successfully borrowed. Please
            follow the claiming and return instructions.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto grid gap-3">
          <div className="text-foreground/70 flex flex-col items-center space-y-2 rounded-md border border-green-500 bg-green-50 p-4">
            <BookText className="text-primary mb-2 size-8" strokeWidth={2} />
            {isLoading ? (
              <p className="text-xs text-gray-500">
                Loading borrowed theses...
              </p>
            ) : theses?.length ? (
              <div className="flex w-full flex-col gap-1">
                {theses.map((thesis) => (
                  <h2
                    key={thesis.id}
                    className="text-primary text-center text-sm leading-4 font-semibold tracking-tight"
                  >
                    {thesis.title}
                  </h2>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No thesis found.</p>
            )}
          </div>

          <div className="text-foreground/70 space-y-3 rounded-md border p-4">
            <div className="flex flex-col text-xs">
              <div className="flex flex-row items-center gap-1">
                <BookOpenCheck className="size-3.5" strokeWidth={3} />
                <p className="text-sm font-bold">Claim Your Thesis</p>
              </div>
              <p>
                Proceed to the CCIS Library to pick up your borrowed thesis
                books.
              </p>
            </div>

            <div className="flex flex-col text-xs">
              <div className="flex flex-row items-center gap-1">
                <Scan className="size-3.5" strokeWidth={3} />
                <p className="text-sm font-bold">Scan at the Admin Desk</p>
              </div>
              <p>
                Upon claiming, have each book scanned at the Admin Desk to
                confirm receipt.
              </p>
            </div>

            <div className="flex flex-col text-xs">
              <div className="flex flex-row items-center gap-1">
                <Scan className="size-3.5" strokeWidth={3} />
                <p className="text-sm font-bold">Return Process</p>
              </div>
              <p>
                When you’re ready to return, go to the Admin Desk again and have
                the theses scanned. You must return them within{" "}
                <span className="text-foreground font-semibold">
                  {settings?.dayCount || 0} days
                </span>{" "}
                of the initial claim to avoid penalties.
              </p>
            </div>

            <p className="text-xs text-gray-600 italic">
              Please handle all thesis books with care. Thank you!
            </p>
          </div>
        </div>

        <div className="mt-2 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SuccessBorrowManyThesisModal;
