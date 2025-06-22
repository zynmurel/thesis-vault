"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import {
  Backpack,
  BookOpenText,
  BookX,
  BriefcaseBusiness,
  LoaderCircle,
  SlidersHorizontal,
} from "lucide-react";
import Image from "next/image";
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates,
} from "nuqs";
import React from "react";

function Page() {
  const [filters, setFilters] = useQueryStates({
    title: parseAsString.withDefault(""),
    take: parseAsInteger.withDefault(10),
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
    <div className="flex h-screen max-h-screen w-full flex-col">
      <div
        className={`bg-sidebar flex w-full flex-col gap-2 py-2 pb-3 shadow transition-all duration-300 ease-in-out ${showFilter ? "max-h-[600px]" : "max-h-[110px]"}`}
      >
        <div className="flex flex-row items-center px-3">
          <div className="flex flex-1 flex-row gap-2">
            <Image
              width={40}
              height={40}
              className="size-10"
              src={"/images/nwssu-ccis-logo.png"}
              alt="Logo"
            />
            <div className="flex flex-col justify-center">
              <p className="text-primary text-[13px] font-bold uppercase">Thesis Vault</p>
              <p className="text-primary -mt-[2px] text-[10px]">
                College of Computing and Information Science
              </p>
            </div>
          </div>
          <div className="text-primary px-2">
            <BriefcaseBusiness className="size-6" strokeWidth={3} />
          </div>
        </div>
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
                          className={`border ${!isSelected ? " text-foreground/60 bg-white" : ""}`}
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
                          className={`border ${!isSelected ? " text-foreground/60 bg-white" : ""}`}
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
    take: parseAsInteger.withDefault(10),
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
            const members = (
              JSON.parse(thesis.members) as { name: string }[]
            ).map((m) => m.name);
            return (
              <div
                key={index}
                className="bg-background  rounded-xl border p-2 shadow flex flex-col gap-1"
              >
                <div className="flex flex-row items-center gap-2">
                  <Image
                    width={50}
                    height={50}
                    src={thesis.thesisPhoto}
                    alt={`thesis ${index}`}
                    className="bg-primary h-20 w-18 rounded-lg object-cover"
                  />
                  <div className="text-foreground/80 flex-col gap-1 text-xs">
                    <p className="font-black uppercase">{thesis.title}</p>
                    <p className="text-[12px]">{members.join(", ")}</p>
                    <p className="text-[12px] font-bold">
                      {thesis.courseCode} -{" "}
                      {new Date(thesis.year).getFullYear()}
                    </p>
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
                <div className=" flex justify-end gap-2">
                  <Badge variant={"outline"} className=" flex-1 p-1">View</Badge>
                  <Badge variant={"secondary"} className=" flex-1 p-1">Add To Bag</Badge>
                  <Badge className=" flex-1 p-1">Borrow</Badge>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
};

export default Page;
