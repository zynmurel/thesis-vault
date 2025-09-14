"use client";
import React from "react";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, BookDashed, BookUp2, LoaderCircle } from "lucide-react";
import { api } from "@/trpc/react";
import { formatName } from "@/lib/utils";
import { format } from "date-fns";
function BorrowedBooksTable() {
  const { data, isLoading } = api.dashboard.getDashboardBorrows.useQuery();
  return (
    <Card className="rounded-xl border border-gray-100 bg-white p-2 py-8 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex flex-row items-center gap-1 font-semibold tabular-nums">
          <BookUp2 className="size-5" />
          Latest Borrows
        </CardTitle>
        <CardDescription>List of latest book borrows.</CardDescription>
        <CardAction>
          <Badge
            variant="outline"
            className="cursor-pointer bg-white hover:opacity-80"
          >
            <ArrowUpRight />
            Show More
          </Badge>
        </CardAction>
      </CardHeader>
      <div className="bg-card/50 mx-5 rounded-md border px-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Book Title</TableHead>
              <TableHead>Borrow Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((borrow, i) => (
              <TableRow key={i}>
                <TableCell>{formatName(borrow.Student)}</TableCell>
                <TableCell>{borrow.Thesis.title}</TableCell>
                <TableCell>
                  {format(borrow.updatedAt, "MM/dd/yyyy, hh:mm:aa")}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {isLoading ? (
          <div className="text-muted-foreground flex w-full flex-row items-center justify-center gap-2 p-10 text-sm">
            <LoaderCircle className="animate-spin" />
            Loading Borrows
          </div>
        ) : !data?.length ? (
          <div className="text-muted-foreground flex w-full flex-row items-center justify-center gap-2 p-10 text-sm">
            <BookDashed />
            No Recent Borrows Yet
          </div>
        ) : (
          <></>
        )}
      </div>
    </Card>
  );
}

export default BorrowedBooksTable;
