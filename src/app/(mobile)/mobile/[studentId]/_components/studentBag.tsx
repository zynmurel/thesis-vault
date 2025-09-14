"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { BriefcaseBusiness, LoaderCircle } from "lucide-react";
import { useParams } from "next/navigation";
import React, { type HTMLAttributes } from "react";

function StudentBag(props: HTMLAttributes<HTMLDivElement>) {
  const { studentId } = useParams();

  const { data: bag, isLoading: bagIsLoading } =
    api.mobile.student.getBag.useQuery({ studentId: String(studentId) });
  return (
    <div {...props}>
      <Button className=" relative">
        <div className=" absolute -top-1 -right-1 rounded-full bg-secondary text-primary font-semibold size-4 flex items-center justify-center text-xs border border-primary">{bagIsLoading ? (<LoaderCircle className=" size-3 animate-spin"/>) : (bag?.length || 0)}</div>
        <BriefcaseBusiness className=" size-5" />
      </Button>
    </div>
  );
}

export default StudentBag;
