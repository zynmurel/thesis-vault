"use client";
import { api } from "@/trpc/react";
import {
  Book,
  BookCheck,
  BookDashed,
  BookText,
  BookX,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import PendingBorrows from "./_components/pending-borrows";
import RecentActivity from "./_components/recent-activity";
import ThesiPage from "../theses/[thesisId]/_components/thesisPage";
import { parseAsStringEnum, useQueryState } from "nuqs";
import ShowBorrows from "./_components/show-borrows";

function Page() {
  const { studentId } = useParams();
  const [viewThesis, setViewThesis] = useState<string | null>(null);
  const [showPage, setShowPage] = useQueryState(
    "page-shown",
    parseAsStringEnum(["PENDING", "BORROWED", "RETURNED", "CANCELLED", "OVERDUE"]),
  );
  const { data } = api.mobile.student.getStudentInfo.useQuery({
    studentId: String(studentId),
  });
  const { data: borrows } = api.mobile.student.getStudentBorrows.useQuery({
    studentId: String(studentId),
  });

  if (viewThesis) {
    return (
      <div className="max-h-[100vh] w-full">
        <div className="absolute top-0 right-0 bottom-0 left-0 z-50 bg-white">
          <ThesiPage
            thesisId={viewThesis}
            onClose={() => setViewThesis(null)}
          />
        </div>
      </div>
    );
  }

  if (!!showPage) {
    return <ShowBorrows />;
  }

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
          <div></div>
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
          <div
            className="flex flex-row items-center justify-between rounded bg-white p-4 py-2 shadow"
            onClick={() => setShowPage("PENDING")}
          >
            <div className="flex flex-col">
              <p className="text-foreground/60 px-1 text-[10px]">
                Pending Borrows
              </p>
              <div className="text-foreground/80 flex flex-row items-center gap-2">
                <BookDashed className="size-6" strokeWidth={2.5} />
                <div className="flex flex-row items-end gap-1">
                  <p className="h-7 text-2xl font-medium">
                    {borrows?.pendingCount ?? (
                      <LoaderCircle className="mt-1 animate-spin" />
                    )}
                  </p>
                  <p className="text-foreground/60 pb-0.5 text-[10px] font-normal">{`Book${borrows?.pendingCount ? "s" : ""}`}</p>
                </div>
              </div>
            </div>
            <ChevronRight />
          </div>
          <div
            className="flex flex-row items-center justify-between rounded bg-white p-4 py-2 shadow"
            onClick={() => setShowPage("BORROWED")}
          >
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
          <div
            className="flex flex-row items-center justify-between rounded bg-white p-4 py-2 shadow"
            onClick={() => setShowPage("RETURNED")}
          >
            <div className="flex flex-col">
              <p className="text-foreground/60 px-1 text-[10px]">Returned</p>
              <div className="text-foreground/80 flex flex-row items-center gap-2">
                <BookText className="size-6" strokeWidth={2.5} />
                <div className="flex flex-row items-end gap-1">
                  <p className="h-7 text-2xl font-medium">
                    {borrows?.returnedCount ?? (
                      <LoaderCircle className="mt-1 animate-spin" />
                    )}
                  </p>
                  <p className="text-foreground/60 pb-0.5 text-[10px] font-normal">{`Book${borrows?.returnedCount ? "s" : ""}`}</p>
                </div>
              </div>
            </div>
            <ChevronRight />
          </div>
          <div
            className="flex flex-row items-center justify-between rounded bg-white p-4 py-2 shadow"
            onClick={() => setShowPage("CANCELLED")}
          >
            <div className="flex flex-col">
              <p className="text-foreground/60 px-1 text-[10px]">Cancelled</p>
              <div className="text-foreground/80 flex flex-row items-center gap-2">
                <BookX className="size-6" strokeWidth={2.5} />
                <div className="flex flex-row items-end gap-1">
                  <p className="h-7 text-2xl font-medium">
                    {borrows?.cancelledCount ?? (
                      <LoaderCircle className="mt-1 animate-spin" />
                    )}
                  </p>
                  <p className="text-foreground/60 pb-0.5 text-[10px] font-normal">{`Book${borrows?.cancelledCount ? "s" : ""}`}</p>
                </div>
              </div>
            </div>
            <ChevronRight />
          </div>
        </div>
        <PendingBorrows setViewThesis={setViewThesis} />
        <RecentActivity setViewThesis={setViewThesis} />
      </div>
    </div>
  );
}

export default Page;
