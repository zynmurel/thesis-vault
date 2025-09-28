"use client";
import { RatingRoundedStar } from "@/app/_components/react-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button-small";
import { isDateBAfterDateA } from "@/lib/utils";
import { api } from "@/trpc/react";
import type { $Enums, Tags, Theses, ThesesTags } from "@prisma/client";
import { format } from "date-fns";
import {
  BookCheck,
  BookLock,
  BookOpenText,
  BookX,
  CornerUpLeft,
  LoaderCircle,
  Luggage,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  parseAsBoolean,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "nuqs";
import React, { useState } from "react";

function Bag() {
  const [show, setShowBag] = useQueryState(
    "show-bag",
    parseAsBoolean.withDefault(false),
  );

  const onBack = () => setShowBag(false);

  return (
    <div className="max-h-[100vh] w-full text-xs">
      <div className="absolute top-0 right-0 bottom-0 left-0 z-50 bg-white">
        <div className="relative flex h-screen flex-col">
          <div
            className="bg-secondary text-foreground/70 flex h-10 items-center justify-start px-0"
            onClick={() => onBack()}
          >
            <Button
              onClick={() => onBack()}
              variant={"ghost"}
              className="h-6 gap-0.5"
            >
              <CornerUpLeft strokeWidth={2.5} className="size-3" />
            </Button>
            <p className="text-xs font-normal">Go Back</p>
          </div>
          <div className="h-full space-y-3 overflow-auto p-1.5 pb-20">
            <div className="mt-2 flex flex-row items-center gap-1 px-1">
              <Luggage className="size-5" strokeWidth={2.5} />
              <p className="text-sm font-bold">Your Bag</p>
            </div>
            <Theses />
          </div>
        </div>
      </div>
    </div>
  );
}
const Theses = () => {
  const { studentId } = useParams();

  const { data: theses, isLoading: thesesIsLoading } =
    api.mobile.theses.getBagTheses.useQuery({
      studentId: studentId as string,
    });

  if (thesesIsLoading) {
    return (
      <div className="text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-2 overflow-auto">
        <BookOpenText className="size-10 flex-none" />
        <div className="pb-20 text-sm">Loading...</div>
      </div>
    );
  }

  if (!theses?.length) {
    return (
      <div className="text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-2 overflow-auto">
        <BookX className="size-10 flex-none" />
        <div className="pb-20 text-sm">No added in bag</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-foreground/5 flex h-full flex-col gap-2 overflow-auto p-2">
        {theses?.map((thesis, index) => {
          return <Thesis key={index} thesis={thesis} index={index} />;
        })}
      </div>
    </>
  );
};

const Thesis = ({
  thesis,
  index,
}: {
  thesis: Theses & {
    averageRating: number;
    Tags: (ThesesTags & { Tag: Tags })[];
  };
  index: number;
}) => {
  const [_b, setShowBorrow] = useQueryState("borrow", parseAsString);
  const [_v, setShowView] = useState<null | string>(null);
  const { studentId } = useParams();
  const utils = api.useUtils();

  const { mutate, isPending } =
    api.mobile.student.removeThesisToBag.useMutation({
      onSuccess: async () => {
        await utils.mobile.theses.getBagTheses.invalidate();
        await utils.mobile.student.getBag.invalidate();
      },
    });

  const onAddToBag = (thesisId: string) => {
    mutate({
      thesisId,
      studentId: String(studentId),
    });
  };
  const onClose = () => setShowView(null);
  // if (_v) {
  //   return (
  //     <div className="max-h-[100vh] w-full">
  //       <div className="absolute top-0 right-0 bottom-0 left-0 z-50 bg-white">
  //         <ThesiPage thesisId={_v} onClose={onClose} />
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div
      key={index}
      className="bg-background flex flex-col gap-1 rounded-xl border p-2 shadow"
    >
      <div className="flex flex-row items-center gap-2">
        <Image
          width={50}
          height={50}
          src={thesis.thesisPhoto}
          alt={`thesis ${index}`}
          className="bg-primary h-full w-18 rounded-lg object-cover"
        />
        <div className="text-foreground/80 flex-col gap-1 text-xs">
          <p className="font-black uppercase">
            {thesis.title} {thesis.averageRating}
          </p>
          <p className="text-[12px] font-bold">
            {thesis.courseCode} - {new Date(thesis.year).getFullYear()}
          </p>
          <RatingRoundedStar value={thesis.averageRating} />
          <div className="mt-1 flex flex-wrap gap-0.5">
            {thesis.Tags.map((t) => {
              const tag = t.Tag;
              return (
                <Badge key={t.tagId} variant={"outline"} className="text-[9px]">
                  {tag.tag}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant={"secondary"}
          className="flex-1 p-1"
          disabled={isPending}
          onClick={() => onAddToBag(thesis.id)}
        >
          {isPending ? "Removing..." : "Remove in Bag"}
        </Button>
        <Button className="flex-1 p-1" onClick={() => setShowBorrow(thesis.id)}>
          Borrow
        </Button>
      </div>
    </div>
  );
};

export default Bag;
