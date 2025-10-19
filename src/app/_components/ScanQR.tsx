"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRef, useState } from "react";
import {
  BookAlert,
  CalendarDays,
  Check,
  CheckCheck,
  LoaderCircle,
  ScanQrCode,
  Tag,
  X,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import React from "react";
import { api } from "@/trpc/react";
import Image from "next/image";
import { format } from "date-fns";
import { RatingRoundedStar } from "./react-rating";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { isDateBAfterDateA } from "@/lib/utils";
import { TooltipArrow } from "@radix-ui/react-tooltip";

function SuccessBorrowThesisModal() {
  const [qr, setScanQR] = useQueryState("ScanQR", parseAsString);

  const onClose = () => {
    setScanQR(null);
  };

  const onScan = (text: string) => {
    setScanQR(text);
  };

  return (
    <Dialog open={!!qr} onOpenChange={onClose}>
      <DialogContent
        className={`${qr === "open" ? "min-w-sm" : "min-w-[800px]"} gap-3`}
      >
        <DialogHeader className="flex flex-row items-center gap-2">
          {/* <ScanBarcode className=" size-12" strokeWidth={2.5}/> */}
          <div className="flex flex-col gap-0">
            <DialogTitle className="text-2xl font-bold">
              {qr === "open" ? "Thesis Book" : "Thesis Book"}
            </DialogTitle>
            <DialogDescription>
              Thesis book details and borrowers
            </DialogDescription>
          </div>
        </DialogHeader>
        <QRScannerInput onScan={onScan} />
        {qr &&
          (qr === "open" ? (
            <div className="flex w-full flex-col items-center justify-center gap-5 py-5">
              <ScanQrCode
                className="size-52 flex-none scale-120"
                strokeWidth={1.5}
              />
              <div className="flex w-full flex-row justify-end">
                <Button variant={"outline"} onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <ScannedView thesisId={qr} onClose={onClose} />
          ))}
      </DialogContent>
    </Dialog>
  );
}

const ScannedView = ({
  thesisId,
  onClose,
}: {
  thesisId: string;
  onClose: () => void;
}) => {
  const [borrowId] = useQueryState("ScanQRBorrowId", parseAsInteger);
  const { data, isLoading } = api.theses.getThesisByQR.useQuery({
    thesisId,
    borrowId: borrowId || undefined,
  });
  const [isLoadingId, setIsLoadingId] = useState<number[]>([]);
  const utils = api.useUtils();
  const { mutate: confirmBorrow, isPending: confirmBorrowIsPending } =
    api.theses.confirmThesisBorrow.useMutation({
      onSuccess: async () => {
        toast.success("Borrow Confirmed");
        await Promise.all([
          utils.theses.getThesisByQR.invalidate(),
          utils.borrows.getBorrows.invalidate(),
          utils.borrows.getBorrowsCount.invalidate(),
        ]);
      },
      onError() {
        toast.error("Failed to confirm student borrow. Please try again.");
      },
    });
  const { mutate: confirmReturn, isPending: confirmReturnIsPending } =
    api.theses.confirmThesisReturn.useMutation({
      onSuccess: async () => {
        toast.success("Thesis Marked as Returned");
        onClose();
        await Promise.all([
          utils.theses.getThesisByQR.invalidate(),
          utils.borrows.getBorrows.invalidate(),
          utils.borrows.getBorrowsCount.invalidate(),
        ]);
      },
      onError() {
        toast.error("Processing return Failed. Please try again.");
      },
    });

  const { mutate: declineBorrow, isPending: declineBorrowIsPending } =
    api.theses.declineThesisBorrow.useMutation({
      onSuccess: async () => {
        toast.success("Thesis borrow declined");
        onClose();
        await Promise.all([
          utils.theses.getThesisByQR.invalidate(),
          utils.borrows.getBorrows.invalidate(),
          utils.borrows.getBorrowsCount.invalidate(),
        ]);
      },
      onError() {
        toast.error("Processing return Failed. Please try again.");
      },
    });

  if (isLoading) {
    return (
      <div className="text-foreground/70 flex flex-row items-center justify-center gap-2 p-5">
        <LoaderCircle className="animate-spin" />
        <p>Loading content ... </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-foreground/70 flex flex-col items-center justify-center gap-2 p-5">
        <BookAlert className="text-amber-500" />
        <p className="font-medium text-amber-500">No thesis record found.</p>
        <p className="text-center">
          Please try scanning again or ensure the QR code is registered in the
          system.
        </p>
      </div>
    );
  }

  const borrows = data?.StudentBorrows;

  return (
    <div className="grid w-full gap-5">
      <div className="grid grid-cols-3 gap-5">
        <div className="text-foreground/80 col-span-2 flex w-full flex-col gap-1">
          <div className="flex flex-row items-center justify-between">
            <div className="flex w-full flex-row gap-2">
              <div className="flex flex-row items-center gap-1 text-sm font-semibold">
                <CalendarDays className="size-3.5" strokeWidth={3} />{" "}
                {format(data.year, "yyyy")}
              </div>
              <div className="flex flex-row items-center gap-1 text-sm font-semibold">
                <Tag className="size-3.5" strokeWidth={3} /> {data.Course.title}
              </div>
            </div>
            <div className="px-2">
              {data.available <= 0 ? (
                <Badge className="bg-red-500 px-3">Not Available</Badge>
              ) : (
                <Badge className="bg-blue-500 px-3">Available</Badge>
              )}
            </div>
          </div>
          <p className="justify-between font-bold uppercase">{data.title}</p>
          <div className="flex w-full flex-row items-center justify-between">
            <div className="text-foreground/50 flex flex-row items-center gap-2 text-sm">
              <RatingRoundedStar
                value={data.averageRating}
                onChange={() => {}}
                readOnly={true}
              />{" "}
              <p>({data.Ratings.length})</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-foreground/50 text-xs">Tags</div>
            <div className="flex flex-row flex-wrap gap-1">
              {data.Tags.map((t) => {
                return <Badge key={t.tagId}>{t.Tag.tag}</Badge>;
              })}
            </div>
          </div>
          <div className="mt-2 flex flex-col gap-1">
            <div className="text-foreground/50 text-xs">Abstract</div>
            <div className="flex flex-row flex-wrap gap-1">
              <p className="px-1 text-justify text-xs">{data.abstract}</p>
            </div>
          </div>
        </div>

        <Image
          width={200}
          height={200}
          alt="Thesis image"
          src={data.thesisPhoto}
          className="bg-primary/50 h-full w-full rounded-md border object-cover"
        />
      </div>
      <div className="grid gap-5 gap-y-3">
        <div className="">
          <div className="flex flex-row items-center justify-between px-1">
            <p className="text-foreground/80 text-sm font-bold">{`Available book copies : ${data.available}/${data.quantity}`}</p>
          </div>
          <div className="mt-1 overflow-hidden rounded border">
            <Table className="w-full">
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead align="center" className="text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {borrows.map((borrow) => {
                  return (
                    <TableRow key={borrow.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <p className="font-bold">
                            {borrow.Student.studentId} -{" "}
                            {borrow.Student.courseCode}
                          </p>
                          <p className="text-base font-bold">
                            {borrow.Student.firstName}{" "}
                            {borrow.Student.middleName}{" "}
                            {borrow.Student.lastName}
                          </p>

                          {borrow.borrowDueAt ? (
                            <p className="text-xs">
                              Return Due Date :{" "}
                              <span
                                className={`${isDateBAfterDateA(borrow.borrowDueAt, new Date()) ? "text-red-500" : "opacity-50"}`}
                              >
                                {format(borrow.borrowDueAt, "PPP hh:mm:aa")}
                              </span>
                            </p>
                          ) : (
                            <p className="text-xs opacity-50">
                              Requested at :{" "}
                              <span>
                                {format(borrow.createdAt, "PPP hh:mm:aa")}
                              </span>
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          key={borrow.status}
                          variant={"default"}
                          className={`${borrow.status === "BORROWED" ? "bg-orange-500" : borrow.status === "RETURNED" ? "bg-blue-500" : borrow.status === "CANCELLED" ? "bg-red-500" : "text-foreground border border-gray-200 bg-white"}`}
                        >
                          {borrow.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex h-full flex-row items-center justify-center gap-1">
                          {borrow.status === "PENDING" ? (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size={"icon"}
                                    variant={"destructive"}
                                    className="size-7"
                                    disabled={
                                      isLoadingId.includes(borrow.id) &&
                                      declineBorrowIsPending &&
                                      confirmBorrowIsPending
                                    }
                                    onClick={() => {
                                      setIsLoadingId((prev) => [
                                        ...prev,
                                        borrow.id,
                                      ]);
                                      declineBorrow({
                                        thesisBorrowId: borrow.id,
                                      });
                                    }}
                                  >
                                    <X />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-destructive">
                                  <p>Decline borrow</p>
                                  <TooltipArrow className="fill-destructive" />
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size={"icon"}
                                    className="size-7 bg-green-700"
                                    onClick={() => {
                                      setIsLoadingId((prev) => [
                                        ...prev,
                                        borrow.id,
                                      ]);
                                      confirmBorrow({
                                        thesisBorrowId: borrow.id,
                                      });
                                    }}
                                    disabled={
                                      isLoadingId.includes(borrow.id) &&
                                      (confirmBorrowIsPending ||
                                        declineBorrowIsPending)
                                    }
                                  >
                                    <Check />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="">
                                  <p>Confirm borrow</p>
                                  <TooltipArrow className="fill-primary" />
                                </TooltipContent>
                              </Tooltip>
                            </>
                          ) : (
                            borrow.status === "BORROWED" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size={"icon"}
                                    className="size-7 bg-blue-600 hover:bg-blue-400"
                                    onClick={() => {
                                      setIsLoadingId((prev) => [
                                        ...prev,
                                        borrow.id,
                                      ]);
                                      confirmReturn({
                                        thesisBorrowId: borrow.id,
                                      });
                                    }}
                                    disabled={
                                      isLoadingId.includes(borrow.id) &&
                                      confirmReturnIsPending
                                    }
                                  >
                                    <CheckCheck />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-blue-600">
                                  <p>Confirm return</p>
                                  <TooltipArrow className="fill-blue-600" />
                                </TooltipContent>
                              </Tooltip>
                            )
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!borrows.length && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="bg-slate-100 p-5 text-center opacity-50"
                    >
                      No pending borrows
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* <div className="mt-2">
              {isBorrowed[0]?.status === "BORROWED" &&
                isBorrowed[0]?.borrowDueAt && (
                  <p className="text-xs">
                    Return Due Date :{" "}
                    <span
                      className={`${isDateBAfterDateA(isBorrowed[0].borrowDueAt, new Date()) ? "text-red-500" : ""}`}
                    >
                      {format(isBorrowed[0].borrowDueAt, "PPP hh:mm:aa")}
                    </span>
                  </p>
                )}
            </div> */}
        </div>
        {/* <div className="flex flex-row justify-end gap-2">
            <Button variant={"outline"} onClick={onClose}>
              Close
            </Button>
            {isBorrowed[0]?.status === "PENDING" ? (
              <Button
                onClick={() => {
                  confirmBorrow({ thesisBorrowId: isBorrowed[0]!.id! });
                }}
              >
                {confirmBorrowIsPending ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <CheckCircle />
                )}
                Confirm Borrow
              </Button>
            ) : (
              <Button
                onClick={() => {
                  confirmReturn({ thesisBorrowId: isBorrowed[0]!.id! });
                }}
                className="bg-blue-500 hover:bg-blue-400"
              >
                {confirmReturnIsPending ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <CheckCircle />
                )}
                Mark as Returned
              </Button>
            )}
          </div> */}
      </div>
    </div>
  );
};

export default SuccessBorrowThesisModal;

function QRScannerInput({ onScan }: { onScan: (text: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const buffer = useRef("");
  const timeout = useRef<NodeJS.Timeout | null>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    buffer.current += e.key;

    if (timeout.current) clearTimeout(timeout.current);

    timeout.current = setTimeout(() => {
      const scannedValue = buffer.current.trim();
      if (scannedValue) {
        console.log("✅ Full scanned value:", scannedValue);
        onScan(scannedValue.replace("Enter", ""));
      }
      buffer.current = "";
    }, 300); // adjust if scanner is slow
  };

  return (
    <input
      ref={inputRef}
      type="text"
      autoFocus
      className="pointer-events-none absolute h-0 w-0 opacity-0"
      onKeyDown={handleKeyPress}
    />
  );
}
