"use client";
import { RatingRoundedStar } from "@/app/_components/react-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button-small";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import {
  BookCheck,
  CalendarDays,
  CheckCircle,
  InfoIcon,
  LoaderCircle,
  Tag,
} from "lucide-react";
import { useParams } from "next/navigation";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import React from "react";
import { toast } from "sonner";

function BorrowManyBookModal({
  setIds,
}: {
  setIds: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const { studentId } = useParams();
  const utils = api.useUtils();
  const [borrowIds, setShowBorrow] = useQueryState(
    "borrowMany",
    parseAsArrayOf(parseAsString),
  );
  const [_, setShowBorrowSuccess] = useQueryState(
    "borrowManySuccess",
    parseAsArrayOf(parseAsString),
  );

  const { data: theses, isLoading } = api.mobile.theses.getBagTheses.useQuery({
    studentId: studentId as string,
  });

  const { mutate, isPending } = api.mobile.student.borrowManyThesis.useMutation(
    {
      onSuccess: async (data) => {
        setIds([]);
        await Promise.all([
          utils.mobile.theses.getThesis.invalidate(),
          utils.mobile.theses.getBagTheses.invalidate(),
        ]);
        setShowBorrowSuccess(borrowIds);
        onClose();
      },
      onError: (e) => {
        toast.error(e.message);
      },
    },
  );

  const onClose = () => {
    setShowBorrow([]);
  };

  const onBorrow = () => {
    if (studentId && borrowIds?.length) {
      mutate({ studentId: String(studentId), thesisIds: borrowIds });
    }
  };

  const borrowed = theses?.filter((t) => borrowIds?.includes(t.id));

  return (
    <Dialog open={!!borrowIds?.length} onOpenChange={onClose}>
      <DialogContent className="p-3 px-4 md:min-w-xl">
        <DialogHeader className="flex flex-row items-center gap-2">
          <BookCheck className="size-7" strokeWidth={2.5} />
          <div className="flex flex-col">
            <DialogTitle className="text-sm font-semibold">
              Borrow Confirmation
            </DialogTitle>
            <DialogDescription className="text-foreground/70 text-xs">
              Review and confirm the theses you wish to borrow.
            </DialogDescription>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex w-full items-center justify-center py-8">
            <LoaderCircle className="size-6 animate-spin" />
          </div>
        ) : (
          <div className="mt-2 flex max-h-[60vh] flex-col gap-4 overflow-y-auto">
            {borrowed?.map((thesis) => {
              const isBorrowed = thesis.available <= 0;

              return (
                <div
                  key={thesis.id}
                  className="hover:bg-muted/40 rounded-lg border p-3 shadow-sm transition"
                >
                  <p className="text-sm font-bold uppercase">{thesis.title}</p>

                  <div className="mt-1 flex flex-row gap-3 text-sm">
                    <div className="flex flex-row items-center gap-1 font-medium">
                      <CalendarDays className="size-3.5" strokeWidth={3} />
                      {format(new Date(thesis.year), "yyyy")}
                    </div>
                    <div className="flex flex-row items-center gap-1 font-medium">
                      <Tag className="size-3.5" strokeWidth={3} />
                      {thesis.Course?.title}
                    </div>
                  </div>

                  <div className="mt-2 flex flex-row items-center justify-between">
                    <div className="text-foreground/60 flex flex-row items-center gap-2 text-sm">
                      <RatingRoundedStar
                        value={thesis.averageRating}
                        onChange={() => {}}
                        readOnly
                      />
                      <p>({thesis.Ratings?.length || 0})</p>
                    </div>
                    <Badge
                      className={isBorrowed ? "bg-red-500" : "bg-blue-500"}
                    >
                      {isBorrowed ? "Not Available" : "Available"}
                    </Badge>
                  </div>

                  {thesis.Tags?.length > 0 && (
                    <div className="mt-2">
                      <div className="text-foreground/50 mb-1 text-xs">
                        Tags
                      </div>
                      <div className="flex flex-row flex-wrap gap-1">
                        {thesis.Tags.map((t) => (
                          <Badge
                            key={t.tagId}
                            variant="secondary"
                            className="text-xs"
                          >
                            {t.Tag.tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-2">
                    <div className="text-foreground/50 mb-1 text-xs">
                      Abstract
                    </div>
                    <p className="line-clamp-4 overflow-hidden px-1 text-justify text-xs">
                      {thesis.abstract}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && (borrowed?.length || 0) > 0 && (
          <div className="mt-5">
            <p className="text-foreground/70 mb-2 text-xs">
              Please review your selected theses before confirming. Once
              confirmed, these theses will be marked as borrowed under your
              account.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onBorrow} disabled={isPending}>
                {isPending ? (
                  <>
                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                    Borrowing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 size-4" />
                    Borrow Selected
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default BorrowManyBookModal;
