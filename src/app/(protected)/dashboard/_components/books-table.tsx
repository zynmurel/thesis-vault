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
function ThesesBooksTable() {
  const { data, isLoading } = api.dashboard.getDashboardBooks.useQuery();
  return (
    <Card className="rounded-xl border border-gray-100 bg-white p-2 py-8 shadow-sm transition-shadow duration-200 hover:shadow-md">
      {" "}
      <CardHeader>
        <CardTitle className="flex flex-row items-center gap-1 font-semibold tabular-nums">
          <BookUp2 className="size-5" />
          Latest Theses Added
        </CardTitle>
        <CardDescription>List of latest theses book added.</CardDescription>
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
              <TableHead>Title</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Date Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((thesis, i) => (
              <TableRow key={i}>
                <TableCell>
                  <p className="text-wrap">{thesis.title}</p>
                </TableCell>
                <TableCell>{thesis.courseCode}</TableCell>
                <TableCell>{new Date(thesis.year).getFullYear()}</TableCell>
                <TableCell className="flex flex-wrap gap-1">
                  {thesis.Tags.map((tag) => (
                    <Badge key={tag.Tag.tag} variant={"outline"}>
                      {tag.Tag.tag}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>{format(thesis.createdAt, "PPP")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {isLoading ? (
          <div className="text-muted-foreground flex w-full flex-row items-center justify-center gap-2 p-10 text-sm">
            <LoaderCircle className="animate-spin" />
            Loading Books
          </div>
        ) : !data?.length ? (
          <div className="text-muted-foreground flex w-full flex-row items-center justify-center gap-2 p-10 text-sm">
            <BookDashed />
            No Thesis Book Added Yet
          </div>
        ) : (
          <></>
        )}
      </div>
    </Card>
  );
}

export default ThesesBooksTable;
