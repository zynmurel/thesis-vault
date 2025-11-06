"use client";
import { IconReport } from "@tabler/icons-react";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpenText,
  CalendarCheck,
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Download,
  LoaderCircle,
  SearchIcon,
  User,
} from "lucide-react";
import { api } from "@/trpc/react";
import {
  parseAsInteger,
  parseAsIsoDate,
  parseAsString,
  useQueryState,
  useQueryStates,
} from "nuqs";
import type { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  BorrowStatus,
  cn,
  formatName,
  getBase64ImageFromUrl,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TablePagination from "./_components/table-pagination";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toast } from "sonner";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { type TDocumentDefinitions } from "pdfmake/interfaces";

(pdfMake as any).vfs = pdfFonts.vfs;

function Page() {
  const [pagination] = useQueryStates({
    skip: parseAsInteger.withDefault(0),
    take: parseAsInteger.withDefault(10),
  });
  const [date, setDate] = React.useState<DateRange | undefined>(undefined);
  const [type, setType] = React.useState<"ALL" | "PENALTY">("ALL");
  const [studentId, setStudentId] = useQueryState("student-id", parseAsString);
  const [search, setSearch] = useState("");

  const { data, isLoading } = api.report.getReport.useQuery({
    type,
    startDate: date?.from,
    endDate: date?.to,
    studentId,
    ...pagination,
  });
  const { data: count } = api.report.getReportCount.useQuery({
    type,
    startDate: date?.from,
    endDate: date?.to,
    studentId,
  });
  const { data: students, isLoading: studentsIsLoading } =
    api.report.getStudents.useQuery({
      search,
    });

  const { mutate, isPending } = api.report.getReportPrint.useMutation({
    onSuccess: async ({ data, startDate, endDate }) => {
      if (!data[0]) {
        toast.error("No data found");
        return;
      }

      const student = studentId ? data[0].Student : null;

      // Title and metadata
      const reportTitle = "Student Borrow Report";
      const reportDate =
        startDate && endDate
          ? `Report Period: ${format(startDate, "PPP")} to ${format(endDate, "PPP")}`
          : `Report Period: From the beginning of thesis borrowing`;
      // Table headers
      const hasPenalty = type === "PENALTY";
      const headers = student
        ? [
            "MANUSCRIPT TITLE",
            "BORROWED",
            "OVERDUE",
            "RETURNED",
            "STATUS",
            ...(hasPenalty ? ["PENALTY STATUS"] : []),
          ]
        : [
            "MANUSCRIPT TITLE",
            "BORROWER",
            "BORROWED",
            "OVERDUE",
            "RETURNED",
            "STATUS",
            ...(hasPenalty ? ["PENALTY STATUS"] : []),
          ];
      const body = [
        headers.map((h) => ({ text: h, bold: true, fontSize: 9 })),
        ...data.map((row) => {
          const status = !row.returnedAt
            ? "Book not returned yet"
            : row.returnedAt <= row.borrowDueAt!
              ? "Returned on time"
              : "Returned late";

          const baseRow = student
            ? [
                row.Thesis.title,
                row.borrowedAt ? format(row.borrowedAt, "PP") : "",
                row.borrowDueAt ? format(row.borrowDueAt, "PP") : "",
                row.returnedAt ? format(row.returnedAt, "PP") : "",
                status,
              ]
            : [
                row.Thesis.title,
                `${row.Student.firstName} ${row.Student.lastName}`,
                row.borrowedAt ? format(row.borrowedAt, "PP") : "",
                row.borrowDueAt ? format(row.borrowDueAt, "PP") : "",
                row.returnedAt ? format(row.returnedAt, "PP") : "",
                status,
              ];

          if (hasPenalty)
            baseRow.push(row.penaltyIsPaid ? "Settled" : "Unsettled");
          return baseRow.map((cell, index) => {
            const dateColums = student ? [2, 3, 4, 5] : [2, 3, 4];
            const isDateColumn = dateColums.includes(index); // indexes for date columns
            return {
              text: cell,
              fontSize: 8,
              noWrap: isDateColumn, // 👈 prevent wrapping for date columns
            };
          });
        }),
      ];
      const colCount = body[0]?.length || 0; // number of columns based on headers
      const widths = Array(colCount).fill("auto"); // generate equal widths

      const headerImageBase64 = await getBase64ImageFromUrl(
        "/images/report-head.png",
      );
      const footerImageBase64 = await getBase64ImageFromUrl(
        "/images/report-foot.png",
      );

      const docDefinition: TDocumentDefinitions = {
        // 🔹 Background images (full width)
        header: {
          stack: [
            {
              image: headerImageBase64,
              width: 595.28, // full width for A4 at 72 DPI
              height: 76,
              absolutePosition: { x: 0, y: 0 },
              alignment: "center",
            },
          ],
          margin: [0, 0, 0, 30],
        },

        content: [
          { text: reportTitle, style: "header", marginTop: 50 },
          student
            ? {
                text: `Student: ${student.firstName} ${student.lastName}\nID: ${student.studentId}\nCourse/Year: ${student.courseCode}-${student.year}${student.section}\n${reportDate}`,
                margin: [0, 0, 0, 10],
                style: "header",
              }
            : { text: reportDate, margin: [0, 0, 0, 10], style: "header" },
          {
            style: "tableExample",
            table: {
              headerRows: 1,
              widths,
              body,
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => "#aaaaaa",
              vLineColor: () => "#aaaaaa",
              paddingLeft: () => 6,
              paddingRight: () => 6,
              paddingTop: () => 4,
              paddingBottom: () => 4,
            },
            margin: [0, 0, 0, 20],
          },
        ],

        styles: {
          header: {
            fontSize: 10,
            bold: true,
            margin: [0, 0, 0, 10],
          },
          tableExample: {
            fontSize: 7,
          },
        },

        footer: (currentPage, pageCount) => {
          return {
            margin: [0, 5, 0, 0],
            stack: [
              // Text ABOVE the image
              {
                columns: [
                  {
                    text: `Thesis Vault : Northwest Samar State University`,
                    alignment: "left",
                    fontSize: 8,
                    bold: true,
                    color: "#005e36",
                    margin: [40, 0, 0, 2], // small space before image
                  },
                  {
                    text: `Page ${currentPage} of ${pageCount}`,
                    alignment: "right",
                    fontSize: 8,
                    margin: [0, 0, 40, 2],
                  },
                ],
              },
            ],
          };
        },
      };

      // Create and download the PDF
      pdfMake
        .createPdf(docDefinition)
        .download(`${student?.studentId || "All"}_borrow_report.pdf`);
    },
  });

  const handleDownload = () => {
    mutate({
      type,
      startDate: date?.from,
      endDate: date?.to,
      studentId,
    });
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <IconReport className="size-10" />
          <div className="flex flex-col">
            <h2 className="text-lg font-bold">Reports</h2>
            {/* <p className="-mt-1 text-sm">Thesis vault overall report.</p> */}
          </div>
        </div>
      </div>
      {/* <DepartmentStats /> */}
      <Card>
        <CardHeader>
          <CardTitle>Student Borrow Report</CardTitle>
          <CardDescription>
            Filter and download student borrow reports
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "min-w-60 justify-between",
                      !students && "text-muted-foreground",
                    )}
                  >
                    <p className="flex-1 truncate text-start">
                      {(() => {
                        const student = students?.find(
                          (s) => s.id === studentId,
                        );
                        return student && student.firstName && student.lastName
                          ? formatName({
                              firstName: student.firstName,
                              middleName: student.middleName ?? undefined,
                              lastName: student.lastName,
                            })
                          : "Search student";
                      })()}
                    </p>
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="min-w-60 p-0">
                  <Command
                    filter={(value, search) => {
                      return 1;
                    }}
                  >
                    <CommandInput
                      placeholder="Search student by ID/Name"
                      className="h-9"
                      value={search}
                      onValueChange={(e) => setSearch(e)}
                    />
                    {
                      <CommandList className="max-h-[500px] overflow-y-auto">
                        {studentsIsLoading ? (
                          <div className="flex flex-row items-center justify-center gap-1 p-5 text-xs text-slate-500">
                            <LoaderCircle className="size-4 animate-spin" />
                            Loading...
                          </div>
                        ) : (
                          <CommandEmpty>No student found.</CommandEmpty>
                        )}
                        <CommandGroup>
                          {students?.map((student) => (
                            <CommandItem
                              value={student.id}
                              key={student.id}
                              onSelect={() =>
                                setStudentId((prev) =>
                                  prev === student.id ? null : student.id,
                                )
                              }
                            >
                              <div className="flex flex-col">
                                <p>{formatName(student)}</p>
                                <p className="text-xs text-slate-500">
                                  {student.studentId}
                                </p>
                              </div>
                              <Check
                                className={cn(
                                  "ml-auto",
                                  student.id === studentId
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    }
                  </Command>
                </PopoverContent>
              </Popover>
              <div>
                <div className={cn("grid gap-2")}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-[300px] justify-start text-left font-normal",
                          !date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, "LLL dd, y")} -{" "}
                              {format(date.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(date.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={(r) => {
                          setDate(r);
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <Select
                onValueChange={(e) => setType(e as any)}
                value={type as any}
              >
                <SelectTrigger className="min-w-60">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <div>
                      <SelectItem value={"ALL"} key={"all"}>
                        Borrow Report
                      </SelectItem>
                      <SelectItem value={"PENALTY"} key={"penalty"}>
                        Penalty Report
                      </SelectItem>
                    </div>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleDownload} disabled={isPending}>
              <Download />
              Download
            </Button>
          </div>
          <div className="rounded-lg border p-2 py-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex flex-row items-center gap-1">
                      <BookOpenText className="size-4" />
                      <p>Manuscript Title</p>
                    </div>
                  </TableHead>
                  {!studentId ? (
                    <TableHead>
                      <div className="flex flex-row items-center gap-1">
                        <User className="size-4" />
                        <p>Borrower</p>
                      </div>
                    </TableHead>
                  ) : (
                    <></>
                  )}
                  <TableHead>
                    <div className="flex flex-row items-center gap-1">
                      <p>Date Borrowed</p>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex flex-row items-center gap-1">
                      <p>Due Date</p>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex flex-row items-center gap-1">
                      <p>Date Returned</p>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex flex-row items-center gap-1">
                      <p>Status</p>
                    </div>
                  </TableHead>
                  {type === "PENALTY" ? (
                    <TableHead>
                      <div className="flex flex-row items-center gap-1">
                        <p>Penalty Status</p>
                      </div>
                    </TableHead>
                  ) : (
                    <></>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((borrow) => {
                  return (
                    <TableRow key={borrow.id}>
                      <TableCell className="flex flex-col gap-1">
                        <p className="max-w-[200px] text-sm text-wrap lg:max-w-[400px]">
                          {borrow.Thesis.title}
                        </p>
                      </TableCell>
                      {!studentId ? (
                        <TableCell>
                          <div className="flex flex-row items-center gap-1">
                            <p>{formatName(borrow.Student)}</p>
                          </div>
                        </TableCell>
                      ) : (
                        <></>
                      )}
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-wrap">
                            {borrow.borrowedAt &&
                              format(borrow.borrowedAt, "MM/dd/yyyy, hh:mm:aa")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-wrap">
                            {borrow.borrowDueAt &&
                              format(
                                borrow.borrowDueAt,
                                "MM/dd/yyyy, hh:mm:aa",
                              )}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-wrap">
                            {borrow.returnedAt &&
                              format(borrow.returnedAt, "MM/dd/yyyy, hh:mm:aa")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          if (!borrow.returnedAt) {
                            return (
                              <span className="font-medium">
                                Book not returned yet
                              </span>
                            );
                          }
                          if (!borrow.borrowDueAt) return <></>;

                          if (borrow.returnedAt <= borrow.borrowDueAt) {
                            return (
                              <span className="font-medium">
                                Returned on time
                              </span>
                            );
                          }

                          return (
                            <span className="font-medium">Returned late</span>
                          );
                        })()}
                      </TableCell>
                      {type === "PENALTY" ? (
                        <TableCell>
                          {borrow.penaltyIsPaid ? (
                            <span className="font-medium text-green-600">
                              Settled
                            </span>
                          ) : (
                            <span className="font-medium text-red-600">
                              Unsettled
                            </span>
                          )}
                        </TableCell>
                      ) : (
                        <></>
                      )}
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
            {!count && !isLoading && (
              <div className="text-muted-foreground flex items-center justify-center p-5 text-sm">
                <p>No report found</p>
              </div>
            )}
            <Separator />
            <TablePagination count={count} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;
