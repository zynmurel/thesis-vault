"use client";
import { RatingRoundedStar } from "@/app/_components/react-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Button as ButtonSmall } from "@/components/ui/button-small";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import {
  BookOpenText,
  BookX,
  LoaderCircle,
  SlidersHorizontal,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates,
} from "nuqs";
import React, { useState } from "react";
import type { Tags, Theses, ThesesTags } from "@prisma/client";
import ThesiPage from "./[thesisId]/_components/thesisPage";
import StudentBag from "../_components/studentBag";

function Page() {
  const [filters, setFilters] = useQueryStates({
    title: parseAsString.withDefault(""),
    take: parseAsInteger.withDefault(100),
    courseCodes: parseAsArrayOf(parseAsString).withDefault([]),
    tags: parseAsArrayOf(parseAsInteger).withDefault([]),
    year: parseAsArrayOf(parseAsString).withDefault([]),
  });
  const [showFilter, setShowFilter] = useQueryState(
    "showFilter",
    parseAsBoolean.withDefault(false),
  );

  const { data, isLoading } = api.mobile.theses.getFilters.useQuery();
  return (
    <div className="relative flex h-screen max-h-screen w-full flex-col">
      <div
        className={`bg-sidebar flex w-full flex-col gap-2 py-2 pb-3 shadow transition-all duration-300 ease-in-out ${showFilter ? "max-h-[600px]" : "max-h-[50px]"}`}
      >
        <div className="flex flex-row gap-2 px-3">
          <Input
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, title: e.target.value }))
            }
            className="bg-background text-xs"
            placeholder="Search Thesis"
          />
          <Button
            variant={!showFilter ? "outline" : "default"}
            onClick={() => setShowFilter((prev) => !prev)}
          >
            <SlidersHorizontal className="size-3.5" />
          </Button>
          <StudentBag/>
        </div>
        {
          <div
            className={`mt-2 flex flex-col space-y-3 overflow-hidden px-3 pb-1 transition-all duration-300 ease-in-out ${
              showFilter
                ? "max-h-[600px] scale-100 opacity-100"
                : "pointer-events-none max-h-0 scale-95 opacity-0"
            }`}
          >
            <p className="text-foreground/80 flex flex-row items-center gap-1 px-1 text-xs">
              <SlidersHorizontal className="size-3" /> Filters
            </p>
            <div className="border-foreground/10 border-b"></div>
            {isLoading ? (
              <div className="flex w-full items-center justify-center p-5">
                <LoaderCircle className="text-accent animate-spin" />
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1 px-1">
                  <p className="text-foreground/80 text-xs">Programs</p>
                  <div className="flex flex-wrap gap-2">
                    {data?.courses?.map((course) => {
                      const isSelected = filters.courseCodes?.includes(
                        course.code,
                      );
                      return (
                        <Badge
                          key={course.code}
                          className={`border ${!isSelected ? "text-foreground/60 bg-white" : ""}`}
                          onClick={() => {
                            const selected = filters.courseCodes || [];
                            if (isSelected) {
                              setFilters((prev) => ({
                                ...prev,
                                courseCodes: selected.filter(
                                  (t) => t !== course.code,
                                ),
                              }));
                            } else {
                              setFilters((prev) => ({
                                ...prev,
                                courseCodes: [...selected, course.code],
                              }));
                            }
                          }}
                        >
                          <p>{course.code}</p>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-col gap-1 px-1">
                  <p className="text-foreground/80 text-xs">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {data?.tags?.map((tag) => {
                      const isSelected = filters.tags?.includes(tag.id);
                      return (
                        <Badge
                          key={tag.id}
                          className={`border ${!isSelected ? "text-foreground/60 bg-white" : ""}`}
                          onClick={() => {
                            const selected = filters.tags || [];
                            if (isSelected) {
                              setFilters((prev) => ({
                                ...prev,
                                tags: selected.filter((t) => t !== tag.id),
                              }));
                            } else {
                              setFilters((prev) => ({
                                ...prev,
                                tags: [...selected, tag.id],
                              }));
                            }
                          }}
                        >
                          {tag.tag}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
            <div className="flex w-full justify-end px-2">
              <Badge
                variant={"outline"}
                className="bg-background/90 text-foreground/70"
                onClick={() => setFilters(null)}
              >
                Clear Filter
              </Badge>
            </div>
          </div>
        }
      </div>
      <Theses />
    </div>
  );
}

const Theses = () => {
  const [filters] = useQueryStates({
    title: parseAsString.withDefault(""),
    take: parseAsInteger.withDefault(100),
    courseCodes: parseAsArrayOf(parseAsString).withDefault([]),
    tags: parseAsArrayOf(parseAsInteger).withDefault([]),
    year: parseAsArrayOf(parseAsString).withDefault([]),
  });

  const { data: theses, isLoading: thesesIsLoading } =
    api.mobile.theses.getTheses.useQuery({
      ...filters,
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
        <div className="pb-20 text-sm">No theses found in this filter</div>
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
  const router = useRouter();

  const { data: bag } = api.mobile.student.getBag.useQuery({
    studentId: String(studentId),
  });

  const { mutate, isPending } = api.mobile.student.putThesisInBag.useMutation({
    onSuccess: async () => {
      await utils.mobile.student.getBag.invalidate();
    },
  });

  const isAdded = !!bag?.find((b) => b.thesisId === thesis.id);

  const onView = (thesisId: string) => {
    router.push(`theses/${thesisId}`);
  };

  const onAddToBag = (thesisId: string) => {
    mutate({
      thesisId,
      studentId: String(studentId),
    });
  };
  const onClose = () => setShowView(null);
  return (
    <div
      key={index}
      className="bg-background flex flex-col gap-1 rounded-xl border p-2 shadow"
    >
      {_v && <div className="absolute top-0 right-0 bottom-0 left-0 bg-white z-50">
        <ThesiPage thesisId={_v} onClose={onClose} />
      </div>}
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
        <ButtonSmall
          variant={"outline"}
          className="flex-1 p-1"
          onClick={() => setShowView(thesis.id)}
        >
          View
        </ButtonSmall>
        <ButtonSmall
          variant={"secondary"}
          className="flex-1 p-1"
          disabled={isPending || isAdded}
          onClick={() => onAddToBag(thesis.id)}
        >
          {isAdded ? "In Bag" : isPending ? "Adding..." : "Add To Bag"}
        </ButtonSmall>
        <ButtonSmall
          className="flex-1 p-1"
          onClick={() => setShowBorrow(thesis.id)}
        >
          Borrow
        </ButtonSmall>
      </div>
    </div>
  );
};

export default Page;
