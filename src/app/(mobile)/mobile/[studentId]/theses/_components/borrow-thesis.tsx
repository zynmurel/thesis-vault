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
import { parseAsString, useQueryState } from "nuqs";
import React from "react";
import { toast } from "sonner";

function BorrowBookModal() {
  const { studentId } = useParams();
  const utils = api.useUtils();
  const [borrow, setShowBorrow] = useQueryState("borrow", parseAsString);
  const [_, setShowBorrowSuccess] = useQueryState("borrowSuccess", parseAsString);
  
  const { data, isLoading } = api.mobile.theses.getThesis.useQuery(
    {
      thesisId: String(borrow),
    },
    { enabled: !!borrow },
  );

  const { mutate, isPending } = api.mobile.student.borrowThesis.useMutation({
    onSuccess: async (data) => {
      await Promise.all([utils.mobile.theses.getThesis.invalidate()]);
      setShowBorrowSuccess(data.thesisId)
      onClose()
    },
    onError: (e) => {
      toast.error(e.message)
    },
  });

  const onClose = () => {
    setShowBorrow(null);
  };

  const onBorrow = () => {
    if (studentId && data?.id) {
      mutate({ studentId: String(studentId), thesisId: data.id });
    }
  };

  const isBorrowed = data?.StudentBorrows?.[0];

  return (
    <Dialog open={!!borrow} onOpenChange={onClose}>
      <DialogContent className="p-3 px-4 md:min-w-xl">
        <DialogHeader className="flex flex-row items-center">
          <BookCheck className="size-7" strokeWidth={2.5} />
          <div className="flex flex-col gap-0">
            <DialogTitle className="flex flex-row items-center gap-1 text-start text-sm">
              Borrow Confirmation
            </DialogTitle>
            <DialogDescription className="flex flex-row items-center gap-1 text-start text-xs">
              Review and confirm thesis to borrow
            </DialogDescription>
          </div>
        </DialogHeader>
        {isLoading ? (
          <div className="flex w-full items-center justify-center">
            <LoaderCircle className="animate-spin" />
          </div>
        ) : data ? (
          <div>
            <p className="justify-between font-bold uppercase">{data.title}</p>
            <div className="flex w-full flex-row gap-2">
              <div className="flex flex-row items-center gap-1 text-sm font-semibold">
                <CalendarDays className="size-3.5" strokeWidth={3} />{" "}
                {format(data.year, "yyyy")}
              </div>
              <div className="flex flex-row items-center gap-1 text-sm font-semibold">
                <Tag className="size-3.5" strokeWidth={3} /> {data.Course.title}
              </div>
            </div>
            <div className="flex w-full flex-row items-center justify-between">
              <div className="text-foreground/50 flex flex-row items-center gap-2 text-sm">
                <RatingRoundedStar
                  value={data.averageRating}
                  onChange={() => {}}
                  readOnly={true}
                />{" "}
                <p>({data.Ratings.length})</p>
              </div>
              {isBorrowed ? (
                <Badge className="bg-red-500">Not Available</Badge>
              ) : (
                <Badge className="bg-blue-500">Available</Badge>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-foreground/50 text-xs">Tags</div>
              <div className="flex flex-row flex-wrap gap-1">
                {data.Tags.map((t) => {
                  return <Badge key={t.tagId}>{t.Tag.tag}</Badge>;
                })}
              </div>
            </div>
            <div className="mt-2 flex flex-col gap-1">
              <div className="text-foreground/50 text-xs">Abstract</div>
              <div className="flex max-h-[200px] flex-row flex-wrap gap-1 overflow-y-scroll">
                <p className="px-1 text-justify text-xs">{data.abstract}</p>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
        <div>
          {isBorrowed && (
            <div className="flex flex-row items-center gap-1 mb-1">
              <InfoIcon className="size-3.5 text-orange-400" />
              <p className="text-xs text-orange-400">
                {isBorrowed.studentId === studentId
                  ? "You have already borrowed this book."
                  : "This book is currently borrowed by another student."}
              </p>
            </div>
          )}
          <div className="flex w-full justify-end gap-1">
            <Button variant={"outline"} onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={onBorrow}
              disabled={!data || !!isBorrowed || isPending}
            >
              {isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <CheckCircle />
              )}
              {isBorrowed ? "Borrowed" : "Borrow"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BorrowBookModal;
