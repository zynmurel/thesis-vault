"use client";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { CircleDashed } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React from "react";

function PendingBorrows({
  setViewThesis,
}: {
  setViewThesis: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const { studentId } = useParams();
  const { data } = api.mobile.student.getStudentPendingBorrows.useQuery(
    {
      studentId: String(studentId),
    },
    { enabled: !!studentId },
  );
  if (!data?.length) return <></>;

  const onView = (thesisId: string) => {
    setViewThesis(thesisId);
  };
  return (
    <div className="mt-2 flex flex-col">
      <div className="flex flex-row items-center gap-1 px-1">
        <CircleDashed className="size-3.5" />
        <p className="text-foreground/90 text-xs">Pending Borrows</p>
      </div>
      <div className="mt-1 flex flex-col gap-1 rounded bg-white p-2 py-1 shadow">
        {data.map((borrows) => {
          const thesis = borrows.Thesis;
          return (
            <div
              key={borrows.id}
              onClick={() => onView(borrows.thesisId)}
              className="flex w-full flex-row items-center gap-2 border-b bg-white p-2"
            >
              <div className="text-foreground/80 grid w-full gap-1 text-xs">
                <div className="flex w-full flex-row items-center justify-between">
                  <p className="text-[10px]">
                    Request Date : {format(borrows.createdAt, "MM/dd/yyy")}
                  </p>
                </div>
                <div className="flex h-full w-full flex-row gap-1">
                  <div className="h-full w-15">
                    <Image
                      width={200}
                      height={200}
                      alt="Thesis image"
                      src={thesis.thesisPhoto}
                      className="bg-primary/50 h-full w-full rounded-md border object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="font-black uppercase">{thesis.title}</p>
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <p className="my-1 rounded border border-orange-100 bg-orange-100 p-1 px-2 text-[10px] text-orange-500">
          <span className="font-bold">Reminder:</span> Please claim your
          borrowed thesis book at the CCIS Library. Make sure to have it scanned
          at the Admin Desk to confirm that you’ve received it.
        </p>
      </div>
    </div>
  );
}

export default PendingBorrows;
