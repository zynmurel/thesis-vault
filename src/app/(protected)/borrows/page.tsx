"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/trpc/react";
import {
  BookOpenText,
  BookText,
  CalendarCheck,
  ListFilterPlus,
  LoaderCircle,
  QrCode,
  User,
  View,
  X,
} from "lucide-react";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates,
} from "nuqs";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import TablePagination from "../_components/table-pagination";

function Page() {
  const [filterStatus, setFilterStatus] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString).withDefault([]),
  );
  const [title, setTitle] = useQueryState(
    "title",
    parseAsString.withDefault(""),
  );
  const [_, setQR] = useQueryState("ScanQR", parseAsString);

  const [pagination] = useQueryStates({
    skip: parseAsInteger.withDefault(0),
    take: parseAsInteger.withDefault(10),
  });

  const toggleStatus = (status: string) => {
    setFilterStatus((prev) => {
      const list = prev ?? [];
      return list.includes(status)
        ? list.filter((t) => t !== status)
        : [...list, status];
    });
  };

  const onSearchTitle = (title: string) => {
    setTitle(title);
  };

  const DisplayFilter = ({ statuses }: { statuses: string[] }) => {
    return statuses.length ? (
      <div>
        <p className="text-muted-foreground mb-1 text-xs">Filters</p>
        <div className="flex flex-row flex-wrap gap-1">
          {statuses.map((stat) => {
            return (
              <Badge
                key={stat}
                variant={"default"}
                className={`${stat === "BORROWED" ? "bg-orange-500" : stat === "RETURNED" ? "bg-blue-500" : "bg-gray-500"}`}
              >
                {stat}
                <div
                  className={`size-3.5 cursor-pointer`}
                  onClick={() => toggleStatus(stat)}
                >
                  <X className="size-3.5" />
                </div>
              </Badge>
            );
          })}
        </div>
      </div>
    ) : (
      <></>
    );
  };

  const { data, isLoading } = api.borrows.getBorrows.useQuery({
    search: title || "",
    statuses: filterStatus,
    skip: pagination.skip,
    take: pagination.take,
  });

  const { data: count, isLoading: countIsLoading } =
    api.borrows.getBorrowsCount.useQuery({
      search: title || "",
      statuses: filterStatus,
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <BookText className="size-10" />
          <div className="flex flex-col">
            <h2 className="text-lg font-bold">Borrows</h2>
            <p className="-mt-1 text-sm">Manage theses borrows</p>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between gap-2">
        <div className="flex w-full flex-col gap-2 lg:w-auto lg:flex-row">
          <Input
            value={title}
            onChange={(e) => onSearchTitle(e.target.value)}
            className="w-full xl:min-w-80"
            placeholder="Search theses title"
          />
          <div className="flex w-full flex-row gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <ListFilterPlus />
                  Status
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <h4 className="mb-2 text-sm font-medium">Filter by Status</h4>
                <div className="flex max-h-60 flex-col gap-2 overflow-auto">
                  {["PENDING", "BORROWED", "RETURNED"].map((stat) => (
                    <label key={stat} className="flex items-center gap-2">
                      <Checkbox
                        checked={filterStatus?.includes(stat)}
                        onCheckedChange={() => toggleStatus(stat)}
                      />
                      <span className="text-sm">{stat}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <Button onClick={() => setQR("open")}>
          <QrCode />
          <p className="hidden pr-1 sm:flex">Scan</p>
        </Button>
      </div>
      <DisplayFilter statuses={filterStatus} />

      <div className="rounded-lg border p-2 py-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex flex-row items-center gap-1">
                  <CalendarCheck className="size-4" />
                  <p>Status/Date</p>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex flex-row items-center gap-1">
                  <BookOpenText className="size-4" />
                  <p>Thesis</p>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex flex-row items-center gap-1">
                  <User className="size-4" />
                  <p>Borrowed By</p>
                </div>
              </TableHead>
              <TableHead className="text-center">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((borrow) => {
              return (
                <TableRow key={borrow.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge
                        variant={"default"}
                        className={`${borrow.status === "BORROWED" ? "bg-orange-500" : borrow.status === "RETURNED" ? "bg-blue-500" : "bg-gray-500"}`}
                      >
                        {borrow.status}
                      </Badge>
                      <p className="text-sm font-semibold text-wrap">
                        {format(borrow.updatedAt, "MM/dd/yyyy, hh:mm:aa")}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="flex flex-col gap-1">
                    <p className="max-w-[200px] truncate text-sm font-semibold text-nowrap lg:max-w-[400px] xl:max-w-[600px] ...">
                      {borrow.Thesis.title}
                    </p>
                    <div className="flex flex-row items-center gap-1">
                      <Badge variant={"outline"}>
                        {borrow.Thesis.courseCode}
                      </Badge>
                      {borrow.Thesis.Tags.map((tag) => (
                        <Badge key={tag.Tag.tag} variant={"outline"}>
                          {tag.Tag.tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-row items-center gap-1">
                      <p className="font-semibold">{`${borrow.Student.firstName}${borrow.Student.middleName ? ` ${borrow.Student.middleName}` : " "} ${borrow.Student.lastName}`}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-row items-center justify-center gap-1">
                      <Button
                        onClick={() => setQR(borrow.Thesis.id)}
                        variant={"outline"}
                        size={"sm"}
                        className="text-xs"
                      >
                        <View />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {isLoading && (
          <div className="flex w-full items-center justify-center p-5">
            <LoaderCircle className="animate-spin" />
          </div>
        )}
        {!count && !countIsLoading && (
          <div className="text-muted-foreground flex items-center justify-center p-5 text-sm">
            <p>No borrows found</p>
          </div>
        )}
        <Separator />
        <TablePagination count={count} />
      </div>
    </div>
  );
}

export default Page;
