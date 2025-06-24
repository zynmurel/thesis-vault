"use client";
import { api } from "@/trpc/react";
import { User, User2 } from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";
import StudentBag from "../_components/studentBag";

function Page() {
  const { studentId } = useParams();
  const { data, isLoading } = api.mobile.student.getStudentInfo.useQuery({
    studentId: String(studentId),
  });

  return (
    <div className="relative flex h-screen max-h-screen w-full flex-col">
      <div
        className="bg-sidebar flex w-full flex-col gap-2 p-2 pb-3 shadow transition-all duration-300 ease-in-out">
        <div className="flex flex-row justify-between">
          <div className="flex flex-row gap-2 items-center px-1">
            <div className="text-foreground/60 flex size-10 items-center justify-center rounded-full bg-white">
              <User className="size-5" strokeWidth={2.5} />
            </div>
            <div className=" flex flex-col gap-1">
            <p>{data?.firstName}</p>
            </div>
          </div>
          <StudentBag className=" m-2 bg-primary p-1.5 rounded-full text-white"/>
        </div>
      </div>
    </div>
  );
}

export default Page;
