"use client";
import React from "react";
import ThesisDisplay from "./_components/thesisDisplay";
import { MoveLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ReviewDisplay from "./_components/reviewDisplay";

function ThesiPage() {
  const router = useRouter();
  const onBack = () => router.back();
  return (
    <div className="flex h-screen flex-col relative">
      <div className="bg-secondary flex h-10 items-center px-2">
        <div onClick={onBack}>
          <MoveLeft className="text-white size-10 rounded-md bg-foreground/20 h-6 px-2" strokeWidth={2} />
        </div>
      </div>
      <div className="space-y-3 p-1.5 h-full overflow-auto pb-20">
        <ThesisDisplay />
        <ReviewDisplay/>
      </div>
    </div>
  );
}

export default ThesiPage;
