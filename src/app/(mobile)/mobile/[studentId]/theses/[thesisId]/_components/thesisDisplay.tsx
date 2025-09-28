"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import {
  BookX,
  CalendarDays,
  MessageSquareText,
  Send,
  Star,
  Tag,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Button as ButtonSmall } from "@/components/ui/button-small";
import { RatingRoundedStar } from "@/app/_components/react-rating";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatName } from "@/lib/utils";

function ThesisDisplay({ thesisId }: { thesisId: string }) {
  const { studentId } = useParams();
  const utils = api.useUtils();

  const [_, setShowBorrow] = useQueryState("borrow", parseAsString);
  const [_r, setOpenRating] = useQueryState("rating-modal", parseAsBoolean);

  const { data: bag } = api.mobile.student.getBag.useQuery({
    studentId: String(studentId),
  });

  const { data, isLoading } = api.mobile.theses.getThesis.useQuery(
    {
      thesisId: String(thesisId),
    },
    { enabled: !!thesisId },
  );
  const [comment, setComment] = useState("");
  const { data: rating, isLoading: ratingIsLoading } =
    api.mobile.theses.getStudentRating.useQuery({
      thesisId: String(thesisId),
      studentId: String(studentId),
    });
  const { data: comments, isLoading: commentsIsLoading } =
    api.mobile.theses.getThesisComment.useQuery({
      thesisId: String(thesisId),
    });

  const { mutate, isPending } = api.mobile.student.putThesisInBag.useMutation({
    onSuccess: async () => {
      await utils.mobile.student.getBag.invalidate();
      await utils.mobile.theses.getBagTheses.invalidate();
    },
  });

  const { mutate: commentThesis, isPending: commentIsPending } =
    api.mobile.theses.createThesisComment.useMutation({
      onSuccess: async () => {
        await utils.mobile.theses.getThesisComment.invalidate();
        setComment("");
      },
    });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1">
        <Skeleton className="bg-primary/20 h-32 w-full" />
        <Skeleton className="bg-primary/20 h-8 w-2/3" />
        <Skeleton className="bg-primary/20 h-6 w-1/2" />
        <Skeleton className="bg-primary/20 h-4 w-3/4" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-2 overflow-auto py-20">
        <BookX className="size-10 flex-none" />
        <div className="pb-20 text-sm">No thesis found</div>
      </div>
    );
  }

  const isAdded = !!bag?.find((b) => b.thesisId === data.id);

  const onAddToBag = () => {
    mutate({
      thesisId: data.id,
      studentId: String(studentId),
    });
  };

  const isBorrowed = data?.StudentBorrows.length;

  return (
    <div className="text-foreground/80 flex flex-col gap-1">
      <RateDialog
        star={rating?.stars || 0}
        thesisId={thesisId}
        studentId={studentId as string}
      />
      <Image
        width={200}
        height={200}
        alt="Thesis image"
        src={data.thesisPhoto}
        className="bg-primary/50 h-52 w-full rounded-md border object-cover"
      />
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
        <div className="px-2">
          {isBorrowed ? (
            <Badge className="bg-red-500 px-3">Not Available</Badge>
          ) : (
            <Badge className="bg-blue-500 px-3">Available</Badge>
          )}
        </div>
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
        <div className="flex flex-row flex-wrap gap-1">
          <p className="px-1 text-justify text-xs">{data.abstract}</p>
        </div>
      </div>
      <Separator className="my-2" />
      <div className="flex flex-row items-center gap-1 text-xs font-bold">
        <MessageSquareText className="size-4" /> Comments
      </div>

      <div>
        <Textarea
          className="text-xs"
          placeholder="Comment about this thesis"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="flex flex-row justify-end gap-1 pt-1">
          <ButtonSmall
            className="bg-amber-400 hover:bg-amber-400"
            onClick={() => setOpenRating(true)}
          >
            Add Rating <Star className="size-4" />
          </ButtonSmall>
          <ButtonSmall
            onClick={() => {
              commentThesis({
                comment,
                thesisId,
                studentId: studentId as string,
              });
            }}
            disabled={commentIsPending || !comment.length}
          >
            Send <Send className="size-4" />
          </ButtonSmall>
        </div>
      </div>
      <div className="my-2 border-t"></div>
      {comments?.map((com) => {
        return (
          <div className="mb-2 border-b" key={com.id}>
            <div className="flex flex-row items-start gap-2">
              <Avatar className="text-foreground size-8 rounded-lg text-xs">
                <AvatarImage
                  src={undefined}
                  alt={com.Student.firstName || ""}
                />
                <AvatarFallback className="rounded-lg bg-slate-100">
                  {com.Student.firstName?.[0]}
                  {com.Student.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="leading-2">
                <p className="text-xs font-semibold">
                  {formatName(com.Student)}
                </p>
                <p className="text-[10px] text-slate-500">
                  {format(com.createdAt, "PP hh:mm aa")}
                </p>
                <div className="py-2 text-xs">{com.comment}</div>
              </div>
            </div>
          </div>
        );
      })}
      <div className="bg-background absolute right-0 bottom-0 left-0 flex w-full flex-row justify-end">
        <Button
          variant={"secondary"}
          className="flex-1 rounded-none"
          disabled={isPending || isAdded}
          onClick={onAddToBag}
        >
          {isAdded ? "In Bag" : isPending ? "Adding..." : "Add To Bag"}
        </Button>
        <Button
          className="flex-1 rounded-none"
          onClick={() => setShowBorrow(data.id)}
          disabled={!!isBorrowed}
        >
          Borrow
        </Button>
      </div>
    </div>
  );
}

const RateDialog = ({
  star,
  thesisId,
  studentId,
}: {
  star: number;
  thesisId: string;
  studentId: string;
}) => {
  const utils = api.useUtils();
  const [openRating, setOpenRating] = useQueryState(
    "rating-modal",
    parseAsBoolean,
  );
  const [starValue, setStarValue] = useState(star);

  const { mutate, isPending } = api.mobile.theses.setStudentRating.useMutation({
    onSuccess: async () => {
      await utils.mobile.theses.getThesis.invalidate();
      setOpenRating(false);
    },
  });
  const onClose = () => {
    setOpenRating(false);
    setStarValue(star);
  };
  return (
    <Dialog open={!!openRating} onOpenChange={onClose}>
      <DialogContent className="w-xs gap-3 p-3 px-4">
        <DialogHeader className="flex flex-col items-center gap-0">
          <DialogTitle className="flex flex-row items-center gap-1 text-center text-base">
            Thesis Rating
          </DialogTitle>
          <DialogDescription className="mt-2 flex flex-row items-center gap-1 text-center text-xs">
            Submit your thesis rating
          </DialogDescription>
        </DialogHeader>

        <div className="flex w-full flex-row items-center justify-center gap-1">
          <RatingRoundedStar
            value={starValue}
            onChange={setStarValue}
            maxWidth={200}
          />
        </div>
        <Button
          size={"sm"}
          disabled={isPending}
          onClick={() =>
            mutate({
              thesisId,
              studentId,
              rating: starValue,
            })
          }
        >
          Submit
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ThesisDisplay;
