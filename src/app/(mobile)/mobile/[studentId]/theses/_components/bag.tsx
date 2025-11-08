"use client";
import { RatingRoundedStar } from "@/app/_components/react-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button-small";
import { Checkbox } from "@/components/ui/checkbox";
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
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "nuqs";
import React, { useState } from "react";
import BorrowManyBookModal from "./borrow-many-thesis";
import SuccessBorrowManyThesisModal from "./success-borrow-many-thesis";
import ThesisFrontPageStudent from "@/app/_components/thesisFrontPageStudent";

function Bag() {
  const [show, setShowBag] = useQueryState(
    "show-bag",
    parseAsBoolean.withDefault(false),
  );
  const [ids, setIds] = useState<string[]>([]);

  const onBack = () => setShowBag(false);

  return (
    <div className="max-h-[100vh] w-full text-xs">
      <div className="absolute top-0 right-0 bottom-0 left-0 z-50 bg-white">
        <div className="relative flex h-[100vh] flex-col">
          <div
            className="bg-secondary text-foreground/70 flex h-[6vh] items-center justify-start px-0"
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
          <div className="space-y-3 overflow-auto p-1.5">
            <div className="mt-2 flex h-[2vh] flex-row items-center gap-1 px-1">
              <Luggage className="size-5" strokeWidth={2.5} />
              <p className="text-sm font-bold">Your Bag</p>
            </div>
            <div className="h-[92vh] overflow-scroll">
              <Theses ids={ids} setIds={setIds} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Theses = ({
  ids,
  setIds,
}: {
  ids: string[];
  setIds: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const { studentId } = useParams();

  const [borrowIds, setShowBorrow] = useQueryState(
    "borrowMany",
    parseAsArrayOf(parseAsString),
  );

  const { data: theses, isLoading: thesesIsLoading } =
    api.mobile.theses.getBagTheses.useQuery({
      studentId: studentId as string,
    });

  const toggleId = (id: string) => {
    setIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((p) => p !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  if (thesesIsLoading) {
    return (
      <div className="text-muted-foreground flex w-full flex-col items-center justify-center gap-2">
        <BookOpenText className="size-10 flex-none" />
        <div className="pb-20 text-sm">Loading...</div>
      </div>
    );
  }

  if (!theses?.length) {
    return (
      <div className="text-muted-foreground flex w-full flex-col items-center justify-center gap-2">
        <BookX className="size-10 flex-none" />
        <div className="pb-20 text-sm">No added in bag</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2 p-2 pb-20">
        <BorrowManyBookModal setIds={setIds} />
        <SuccessBorrowManyThesisModal />
        <div className="bg-background flex flex-row items-center gap-2 rounded-xl border p-2 shadow">
          <Checkbox
            checked={ids.length === theses.length}
            onClick={() =>
              setIds(
                ids.length === theses.length ? [] : theses.map((t) => t.id),
              )
            }
          />{" "}
          Select all
        </div>

        {theses?.map((thesis, index) => {
          return (
            <Thesis
              key={index}
              thesis={thesis}
              index={index}
              onClick={toggleId}
              ids={ids}
            />
          );
        })}
        {ids.length ? (
          <div className="bg-background absolute right-0 bottom-0 left-0 flex w-full flex-row items-center justify-between p-5">
            <p className="font-semibold">{ids.length} Selected</p>
            <Button onClick={() => setShowBorrow(ids)}>Borrow Selected</Button>
          </div>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

const Thesis = ({
  thesis,
  index,
  onClick,
  ids,
}: {
  thesis: Theses & {
    averageRating: number;
    Tags: (ThesesTags & { Tag: Tags })[];
  };
  index: number;
  onClick: (id: string) => void;
  ids: string[];
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
    <div className="bg-background flex flex-row items-center gap-2 rounded-xl border p-2 shadow">
      <Checkbox
        checked={ids.includes(thesis.id)}
        onCheckedChange={() => onClick(thesis.id)}
      />
      <div key={index} className="flex flex-col gap-1">
        <div className="flex flex-row items-center gap-2">
          <ThesisFrontPageStudent thesis={thesis} />
          <div className="text-foreground/80 flex-col gap-1 text-xs">
            <p className="font-black uppercase">{thesis.title}</p>
            <p className="text-[12px] font-bold">
              {thesis.courseCode} - {new Date(thesis.year).getFullYear()}
            </p>
            <RatingRoundedStar value={thesis.averageRating} />
            <div className="mt-1 flex flex-wrap gap-0.5">
              {thesis.Tags.map((t) => {
                const tag = t.Tag;
                return (
                  <Badge
                    key={t.tagId}
                    variant={"outline"}
                    className="text-[9px]"
                  >
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
          {/* <Button className="flex-1 p-1" onClick={() => setShowBorrow(thesis.id)}>
          Borrow
        </Button> */}
        </div>
      </div>
    </div>
  );
};

export default Bag;
