"use client";
import { api } from "@/trpc/react";
import { BriefcaseBusiness } from "lucide-react";
import { useParams } from "next/navigation";
import React, { type HTMLAttributes } from "react";

function StudentBag(props: HTMLAttributes<HTMLDivElement>) {
  const { studentId } = useParams();

  const { data: bag, isLoading: bagIsLoading } =
    api.mobile.student.getBag.useQuery({ studentId: String(studentId) });

  return (
    <div {...props}>
      <div className=" relative">
        <div className=" absolute -top-2 -right-2 rounded-full bg-secondary text-primary font-semibold size-4 flex items-center justify-center text-xs border border-primary">{bag?.length}</div>
        <BriefcaseBusiness />
      </div>
    </div>
  );
}

export default StudentBag;
