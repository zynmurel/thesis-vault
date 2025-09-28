"use client";
import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import IsPenaltyModal from "./_components/is-penalty-modal";

function Layout({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)
  const { studentId } = useParams();
  const { data } = api.mobile.student.getIfPenalty.useQuery({
    studentId: studentId as string,
  });

  useEffect(() => {
    if (data) {
        setOpen(true)
    }
  }, [data]);
  return (
    <div>
      <IsPenaltyModal open={open} setOpen={setOpen}/>
      {children}
    </div>
  );
}

export default Layout;
