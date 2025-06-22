"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import {
  Backpack,
  BookOpenText,
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
  const [showFilter, setShowFilter] = useQueryState('showFilter', parseAsBoolean.withDefault(false));

  
  const { data, isLoading } = api.mobile.theses.getFilters.useQuery();
  return (
    <div className="flex h-screen max-h-screen w-full flex-col">
      <div
        className={`bg-sidebar flex w-full flex-col gap-2 py-2 pb-3 transition-all duration-300 ease-in-out ${showFilter ? "max-h-[600px]" : "max-h-[110px]"}`}
      >
        <div className="flex flex-row items-center px-3">
          <div className="flex flex-1 flex-row gap-2">
            <Image
              width={40}
              height={40}
              className="size-11"
              src={"/images/nwssu-ccis-logo.png"}
              alt="Logo"
            />
            <div className="flex flex-col justify-center">
              <p className="text-accent text-[14px]">
                Northwest Samar State University
              </p>
              <p className="text-secondary -mt-[2px] text-[11px]">
                College of Computing and Information Science
              </p>
            </div>
          </div>
          <Button>
            <Backpack className="size-6" />
          </Button>
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
            variant={!showFilter ? "default" : "outline"}
            onClick={() =>
              setShowFilter(prev=>!prev)
            }
          >
            <SlidersHorizontal className="size-3.5" />
          </Button>
        </div>
        {
          <div
            className={`flex flex-col space-y-2 overflow-hidden px-3 pb-1 transition-all duration-300 ease-in-out ${
              showFilter
                ? "max-h-[600px] scale-100 opacity-100"
                : "pointer-events-none max-h-0 scale-95 opacity-0"
            }`}
          >
            <p className="text-accent/80 flex flex-row items-center gap-1 px-1 text-xs">
              <SlidersHorizontal className="size-3" /> Filters
            </p>
            <Separator className="opacity-70" />
            {isLoading ? (
              <div className="flex w-full items-center justify-center p-5">
                <LoaderCircle className="text-accent animate-spin" />
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1 px-1">
                  <p className="text-accent/80 text-xs">Programs</p>
                  <div className="flex flex-wrap gap-2">
                    {data?.courses?.map((course) => {
                      const isSelected = filters.courseCodes?.includes(
                        course.code,
                      );
                      return (
                        <Badge
                        key={course.code}
                          className={`border-accent/50 border ${isSelected ? "bg-secondary text-foreground" : ""}`}
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
                  <p className="text-accent/80 text-xs">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {data?.tags?.map((tag) => {
                      const isSelected = filters.tags?.includes(tag.id);
                      return (
                        <Badge
                        key={tag.id}
                          className={`border-accent/50 border ${isSelected ? "bg-secondary text-foreground" : ""}`}
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
        <BookOpenText className="size-20 flex-none" />
        <div className="pb-20 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-2  h-full overflow-auto">
      {theses && [...theses,...theses,...theses,...theses,...theses]?.map((thesis, index) => {
        const members = (JSON.parse(thesis.members) as {name:string;}[]).map((m)=>m.name)
        return <div key={index} className=" shadow border p-2 rounded-xl flex flex-row gap-2 items-center">
          <Image width={50} height={50} src={thesis.thesisPhoto} alt={`thesis ${index}`} className=" object-cover h-20 rounded-lg w-18 bg-primary"/>
          <div className=" flex-col text-xs text-foreground/80 gap-1">
            <p className=" font-black uppercase">{thesis.title}</p>
            <p className=" text-[12px]">{members.join(", ")}</p>
            <p className=" font-bold text-[12px]">{thesis.courseCode} - {new Date(thesis.year).getFullYear()}</p>
            <div className=" flex flex-wrap gap-0.5 mt-1">
              {
                thesis.Tags.map((t)=>{
                  const tag = t.Tag
                  return <Badge key={t.tagId} variant={"outline"} className=" text-[9px]">{tag.tag}</Badge>
                })
              }
            </div>
          </div>
        </div>;
      })}
    </div>
  );
};

export default Page;
