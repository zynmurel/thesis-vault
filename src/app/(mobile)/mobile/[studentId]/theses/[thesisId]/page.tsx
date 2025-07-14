"use client";
import React from "react";
import ThesisDisplay from "./_components/thesisDisplay";
import { CornerUpLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ReviewDisplay from "./_components/reviewDisplay";
import { Button } from "@/components/ui/button-small";

function ThesiPage() {
  const router = useRouter();
  const onBack = () => router.back();
  return (
    <div className="flex h-screen flex-col relative">
      <div className="bg-secondary flex h-10 justify-start items-center px-0">
        <Button onClick={()=>onBack()} variant={"ghost"} className=" h-6 gap-0.5">
        <CornerUpLeft strokeWidth={3} className=" size-4" />
        </Button>
        <p className=" text-sm font-bold">View Thesis</p>
      </div>
      <div className="space-y-3 p-1.5 h-full overflow-auto pb-20">
        <ThesisDisplay />
        <ReviewDisplay/>
      </div>
    </div>
  );
}

export default ThesiPage;
