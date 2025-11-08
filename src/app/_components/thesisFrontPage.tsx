import type { Theses } from "@prisma/client";
import { format } from "date-fns";
import React from "react";

function ThesisFrontPage({ thesis }: { thesis: Theses }) {
  const members = JSON.parse(thesis.members) as { name: string }[];
  return (
    <div  className=" w-80 aspect-[3/4]">
      <div
        className={`page page-cover w-full h-full contrast-75 ${thesis.courseCode === "BSIT" ? "bg-primary" : thesis.courseCode === "BSIS" ? "bg-red-600" : "bg-red-800"}`}
      >
        <div className="page-content h-full">
          <div className="flex h-full w-full flex-col items-center justify-between gap-3 px-1 py-2 text-[1.8vw] text-amber-300">
            <div className="flex flex-col gap-2">
              <p className="text-center font-bold">{thesis.title}</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-0">
                <p className="text-center text-[1.7vw] font-medium opacity-80">
                  By
                </p>
                {members.map((m, idx) => {
                  return (
                    <p
                      key={idx}
                      className="text-center text-[1.7vw] font-medium"
                    >
                      {m.name}
                    </p>
                  );
                })}
              </div>
              <p className="text-center text-[1.7vw] font-bold uppercase">
                {format(thesis.year, "MMM yyyy")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThesisFrontPage;
