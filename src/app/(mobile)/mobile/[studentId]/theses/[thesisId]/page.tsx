"use client";
import React from "react";
import ThesisDisplay from "./_components/thesisDisplay";
import { CornerUpLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import ReviewDisplay from "./_components/reviewDisplay";
import { Button } from "@/components/ui/button-small";

function ThesiPage() {
  const router = useRouter();
  const { studentId } = useParams()
  const onBack = () => router.push(`/mobile/${studentId}/theses`);
  return (
    <div className="flex h-screen flex-col relative">
      <div className="bg-secondary flex h-10 justify-start items-center px-0 text-foreground/70" onClick={()=>onBack()}>
        <Button onClick={()=>onBack()} variant={"ghost"} className=" h-6 gap-0.5">
        <CornerUpLeft strokeWidth={2.5} className=" size-3" />
        </Button>
        <p className=" text-xs font-normal">Go Back</p>
      </div>
      <div className="space-y-3 p-1.5 h-full overflow-auto pb-20">
        <ThesisDisplay />
        <ReviewDisplay/>
      </div>
    </div>
  );
}

export default ThesiPage;
