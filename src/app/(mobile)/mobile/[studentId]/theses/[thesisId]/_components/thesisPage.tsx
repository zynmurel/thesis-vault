"use client";
import React from "react";
import ThesisDisplay from "./thesisDisplay";
import { CornerUpLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import ReviewDisplay from "./reviewDisplay";
import { Button } from "@/components/ui/button-small";

function ThesiPage({
  thesisId,
  onClose,
}: {
  thesisId: null | string;
  onClose: () => void;
}) {
  const onBack = () => onClose();
  if (!thesisId) return <></>;
  return (
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
        <ThesisDisplay thesisId={thesisId} />
        <ReviewDisplay />
      </div>
    </div>
  );
}

export default ThesiPage;
