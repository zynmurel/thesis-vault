"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button-small";
import { isDateBAfterDateA } from "@/lib/utils";
import { api } from "@/trpc/react";
import type { $Enums } from "@prisma/client";
import { format } from "date-fns";
import { BookCheck, BookLock, CornerUpLeft, LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { parseAsStringEnum, useQueryState } from "nuqs";
import React from "react";

export const BorrowStatus = ({
  status,
}: {
  status: $Enums.StudentBorrowStatus;
}) => {
  return (
    <Badge
      variant={"default"}
      className={` text-[8px] px-0 w-full ${status === "BORROWED" ? "bg-orange-500" : status === "RETURNED" ? "bg-blue-500" : status === "CANCELLED" ? "bg-red-500" : "bg-gray-500"}`}
    >
      {status}
    </Badge>
  );
};

function BorrowHistory() {
  const { studentId } = useParams();
  const [_, setShowPage] = useQueryState(
    "page-shown",
    parseAsStringEnum(["active", "history"]),
  );
  const { data, isLoading } = api.mobile.student.getBorrowHistory.useQuery(
    {
      studentId: String(studentId),
    },
    { enabled: !!studentId },
  );

  const onBack = () => setShowPage(null);

  return (
    <div className="max-h-[100vh] w-full text-xs">
      <div className="absolute top-0 right-0 bottom-0 left-0 z-50 bg-white">
        <div className="relative flex h-screen flex-col">
          <div
            className="bg-secondary text-foreground/70 flex h-10 items-center justify-start px-0"
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
          <div className="h-full space-y-3 overflow-auto p-1.5 pb-20">
            <div className="mt-2 flex flex-row items-center gap-1 px-1">
              <BookLock className="size-4" strokeWidth={3} />
              <p className="text-sm font-bold">Borrow History</p>
            </div>
            {isLoading ? (
              <div className="flex flex-row items-center justify-center gap-1 py-10">
                <LoaderCircle className="size-5 animate-spin" />
                Loading ...
              </div>
            ) : !data?.length ? (
              <div className="flex flex-row items-center justify-center gap-1 rounded bg-slate-100 py-10 text-slate-500">
                No borrow history
              </div>
            ) : (
              data?.map((borrows, index) => {
                const thesis = borrows.Thesis;
                return (
                  <div
                    key={borrows.id}
                    className={`flex w-full flex-row items-center gap-2 border-b bg-white p-2 ${!index && "border-t"}`}
                  >
                    <div className="text-foreground/80 grid w-full gap-1 text-xs">
                      <div className="flex h-full w-full flex-row gap-1">
                        <div>
                          <BorrowStatus status={borrows.status} />
                          <div className="h-full w-15 mt-1">
                            <Image
                              width={200}
                              height={200}
                              alt="Thesis image"
                              src={thesis.thesisPhoto}
                              className="bg-primary/50 aspect-square w-full rounded-md border object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <p className="font-black uppercase">
                              {thesis.title}
                            </p>
                          </div>
                          <div className="flex flex-col justify-between">
                            {" "}
                            <p className="text-[12px] font-bold">
                              {thesis.courseCode} -{" "}
                              {new Date(thesis.year).getFullYear()}
                            </p>
                            <div className="flex flex-wrap gap-0.5">
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
                            {borrows.borrowDueAt && borrows.returnedAt && (
                              <div
                                className={`text-end text-[10px] ${isDateBAfterDateA(borrows.borrowDueAt, borrows.returnedAt) ? "text-red-500" : "text-green-500"}`}
                              >
                                {isDateBAfterDateA(borrows.borrowDueAt, borrows.returnedAt) ? 'Penalty' : 'Returned at time'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BorrowHistory;
