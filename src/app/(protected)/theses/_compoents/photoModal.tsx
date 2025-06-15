"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";

export default function ThesisBookPhoto() {
  const [thesisPhoto, setThesisPhoto] = useQueryState(
    "thesisPhoto",
    parseAsString,
  );
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;
  const onClose = () => setThesisPhoto(null);
  return (
    <Dialog open={!!thesisPhoto} onOpenChange={onClose}>
      <DialogContent className="md:min-w-3xl">
        <DialogHeader>
          <DialogTitle>{`Thesis Book Photo`}</DialogTitle>
        </DialogHeader>
        {thesisPhoto && (
          <Image
            alt={"Thesis Book Photo"}
            className=" w-full max-h-[60vh] object-contain"
            src={thesisPhoto}
            width={100}
            height={100}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
