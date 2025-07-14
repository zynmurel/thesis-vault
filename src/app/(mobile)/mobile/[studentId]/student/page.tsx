"use client";
import { api } from "@/trpc/react";
import {
  BookCheck,
  BookText,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";
import StudentBag from "../_components/studentBag";
import PendingBorrows from "./_components/pending-borrows";
import RecentActivity from "./_components/recent-activity";

function Page() {
  const { studentId } = useParams();
  const { data } = api.mobile.student.getStudentInfo.useQuery({
    studentId: String(studentId),
  });
  const { data: borrows } = api.mobile.student.getStudentBorrows.useQuery({
    studentId: String(studentId),
  });

  return (
    <div className="relative flex h-screen max-h-screen w-full flex-col overflow-y-auto bg-slate-100 pb-5">
      <div className="bg-sidebar relative z-10 flex w-full flex-col gap-2 p-3 px-3 pb-10 shadow transition-all duration-300 ease-in-out">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col items-start gap-2">
            <div className="text-foreground/60 items-center justify-center rounded-full">
              <img
                src="/images/nwssu-ccis-logo.png"
                className="w-16 object-contain"
              />
            </div>
          </div>
          <div>
            <StudentBag className="bg-primary rounded-full p-1.5 text-white" />
          </div>
        </div>
        <div className="flex flex-col">
          <p className="flex flex-row items-center text-xl font-semibold">
            Welcome{" "}
            {data?.firstName || (
              <span>
                <LoaderCircle
                  className="mx-2 size-5 animate-spin"
                  strokeWidth={3}
                />
              </span>
            )}
            !
          </p>
          <p className="text-foreground/80 text-xs">
            Use the app to easily browse and borrow thesis books.
          </p>
        </div>
      </div>
      <div className="z-50 -mt-8 flex flex-col gap-2 px-2">
        <div className="grid grid-cols-2 gap-1">
          <div className="flex flex-row items-center justify-between rounded bg-white p-4 py-2 shadow">
            <div className="flex flex-col">
              <p className="text-foreground/60 px-1 text-[10px]">
                Active Borrows
              </p>
              <div className="text-foreground/80 flex flex-row items-center gap-2">
                <BookCheck className="size-6" strokeWidth={2.5} />
                <div className="flex flex-row items-end gap-1">
                  <p className="h-7 text-2xl font-medium">
                    {borrows?.borrowedCount ?? (
                      <LoaderCircle className="mt-1 animate-spin" />
                    )}
                  </p>
                  <p className="text-foreground/60 pb-0.5 text-[10px] font-normal">{`Book${borrows?.borrowedCount ? "s" : ""}`}</p>
                </div>
              </div>
            </div>
            <ChevronRight />
          </div>
          <div className="flex flex-row items-center justify-between rounded bg-white p-4 py-2 shadow">
            <div className="flex flex-col">
              <p className="text-foreground/60 px-1 text-[10px]">
                Borrow History
              </p>
              <div className="text-foreground/90 flex flex-row items-center gap-2">
                <BookText className="size-6" strokeWidth={2.5} />
                <div className="flex flex-row items-end gap-1">
                  <p className="h-7 text-2xl font-medium">
                    {borrows?.borrowHistory ?? (
                      <LoaderCircle className="mt-1 animate-spin" />
                    )}
                  </p>
                  <p className="text-foreground/60 pb-0.5 text-[10px] font-normal">{`Book${borrows?.borrowedCount ? "s" : ""}`}</p>
                </div>
              </div>
            </div>
            <ChevronRight />
          </div>
        </div>
        <PendingBorrows/>
        <RecentActivity/>
      </div>
    </div>
  );
}

export default Page;
