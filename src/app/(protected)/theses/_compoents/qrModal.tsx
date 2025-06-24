"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import QRCode from "react-qr-code";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import { Printer } from "lucide-react";

export default function ThesesQRModal() {
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  const [theses, setTheses] = useQueryState("thesesQR",parseAsArrayOf(parseAsString).withDefault([]));

  const onClose = () => setTheses(null);

  if (!theses[0]) return null;

  return (
    <Dialog open={!!theses.length} onOpenChange={onClose}>
      <DialogContent className="md:min-w-xl">
        <DialogHeader>
          <DialogTitle>Thesis QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-2">
          <div ref={contentRef} className="print-container">
            <div className="flex flex-col items-center justify-center gap-2">
              <p className="text-xl font-bold text-center">{theses[1]}</p>
              <QRCode value={theses[0]} />
            </div>
          </div>
          <div className="my-2 w-40">
            <Button onClick={reactToPrintFn} className=" w-full cursor-pointer"><Printer/><span className=" pr-1">Print QR</span></Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
