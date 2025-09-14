"use client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { Activity, BookOpen } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React from "react";

function RecentActivity({
  setViewThesis,
}: {
  setViewThesis: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const { studentId } = useParams();
  const { data, isLoading } =
    api.mobile.student.getStudentRecentActivity.useQuery(
      {
        studentId: String(studentId),
      },
      { enabled: !!studentId },
    );
  const onView = (thesisId: string) => {
    setViewThesis(thesisId);
  };

  return (
    <div className="mt-2 flex flex-col">
      <div className="flex flex-row items-center gap-1 px-1">
        <Activity className="size-3.5" />
        <p className="text-foreground/90 text-xs">Recent Activity</p>
      </div>
      <div className="mt-1 flex flex-col gap-1 rounded bg-white p-2 py-1 shadow">
        {isLoading ? (
          <>
            <Skeleton className="h-20 w-full bg-slate-500/20" />
            <Skeleton className="h-20 w-full bg-slate-500/20" />
            <Skeleton className="h-20 w-full bg-slate-500/20" />
          </>
        ) : data?.length ? (
          data.map((borrows, index) => {
            const thesis = borrows.Thesis;
            return (
              <div
                key={index}
                onClick={() => onView(borrows.thesisId)}
                className={`flex flex-row items-center gap-2 ${!!index && "border-t"} bg-white p-2`}
              >
                <div className="text-foreground/80 grid w-full gap-1 text-xs">
                  <div className="flex w-full flex-row items-center justify-between">
                    <p className="text-[10px]">
                      Request Date : {format(borrows.createdAt, "MM/dd/yyy")}
                    </p>
                    <Badge
                      className={`text-[10px] text-white ${borrows.status === "RETURNED" ? "bg-blue-500" : borrows.status === "BORROWED" ? "bg-orange-400" : ""}`}
                      variant={"outline"}
                    >
                      {borrows.status}
                    </Badge>
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
                    <div className="flex flex-1 flex-col">
                      <p className="font-black uppercase">{thesis.title}</p>
                      <div className="flex flex-col justify-between">
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
          })
        ) : (
          <div className="text-muted-foreground/60 flex flex-col items-center p-3 py-10 text-center text-xs">
            <BookOpen />
            No recent activity
            {/* <Button className=" mt-3" onClick={()=>router.push("theses")}><BookText/>Borrow</Button> */}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentActivity;
