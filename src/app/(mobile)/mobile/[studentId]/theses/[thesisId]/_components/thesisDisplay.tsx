"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { BookX, CalendarDays, Tag } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingRoundedStar } from "@/app/_components/react-rating";

function ThesisDisplay() {
  const { thesisId, studentId } = useParams();
  const utils = api.useUtils();

  const { data: bag } = api.mobile.student.getBag.useQuery({
    studentId: String(studentId),
  });

  const { data, isLoading } = api.mobile.theses.getThesis.useQuery(
    {
      thesisId: String(thesisId),
    },
    { enabled: !!thesisId },
  );

  const { mutate, isPending } = api.mobile.theses.putThesisInBag.useMutation({
    onSuccess: async () => {
      await utils.mobile.student.getBag.invalidate();
    },
  });

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-32 w-full" />
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
      thesisId : data.id,
      studentId : String(studentId),
    });
  };

  return (
    <div className="text-foreground/80 flex flex-col gap-1">
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
      <div className="text-foreground/50 flex flex-row items-center gap-2 text-sm">
        <RatingRoundedStar value={data.averageRating} />{" "}
        <p>({data.Ratings.length})</p>
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
      <div className="bg-background absolute right-0 bottom-0 left-0 flex w-full flex-row justify-end">
        <Button variant={"secondary"} className="flex-1 rounded-none" disabled={isPending || isAdded} onClick={onAddToBag}>
          {isAdded ? "In Bag" : isPending ? "Adding..." : "Add To Bag"}
        </Button>
        <Button className="flex-1 rounded-none">Borrow</Button>
      </div>
    </div>
  );
}

export default ThesisDisplay;
