import type { Theses } from "@prisma/client";
import { format } from "date-fns";
import React from "react";

function ThesisFrontPageStudent({ thesis }: { thesis: Theses }) {
  const members = JSON.parse(thesis.members) as { name: string }[];
  return (
    <div className="aspect-[3/4] w-18 flex-none overflow-hidden rounded">
      <div
        className={`page page-cover flex h-full w-full items-center justify-center contrast-75 ${thesis.courseCode === "BSIT" ? "bg-primary" : thesis.courseCode === "BSIS" ? "bg-red-600" : "bg-red-800"}`}
      >
        <div className="page-content">
          <div className="flex h-full w-full flex-col items-center justify-between gap-3 px-1 py-2 text-[7px] text-amber-300">
            <div className="flex flex-col gap-2">
              <p className="text-center font-bold">{thesis.title}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThesisFrontPageStudent;
