"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { BriefcaseBusiness, LoaderCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { parseAsBoolean, useQueryState } from "nuqs";
import React, { type HTMLAttributes } from "react";

function StudentBag(props: HTMLAttributes<HTMLDivElement>) {
  const { studentId } = useParams();

  const [_, setShowBag] = useQueryState("show-bag", parseAsBoolean);

  const { data: bag, isLoading: bagIsLoading } =
    api.mobile.student.getBag.useQuery({ studentId: String(studentId) });
  return (
    <div {...props}>
      <Button className="relative" onClick={()=>setShowBag(true)}>
        <div className="bg-secondary text-primary border-primary absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full border text-xs font-semibold">
          {bagIsLoading ? (
            <LoaderCircle className="size-3 animate-spin" />
          ) : (
            bag?.length || 0
          )}
        </div>
        <BriefcaseBusiness className="size-5" />
      </Button>
    </div>
  );
}

export default StudentBag;
