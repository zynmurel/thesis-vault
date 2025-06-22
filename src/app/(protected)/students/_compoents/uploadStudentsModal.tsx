"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info, LoaderCircle, SendHorizonal, Upload } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import type { Students } from "@prisma/client";
import { toast } from "sonner";
import { api } from "@/trpc/react";

export default function UploadStudentsModal() {
  const utils = api.useUtils();
  const [modal, setModal] = useQueryState("upload", parseAsString);
  const [excelData, setExcelData] = useState<Students[]>([]);
  const [courseCode, setCourseCode] = useState<string | null>(null);

  const { data: courses, isLoading: coursesIsLoading } =
    api.courses.getAll.useQuery();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const sheet = workbook.Sheets[workbook.SheetNames[0] as string];
        const rows = XLSX.utils.sheet_to_json(sheet as XLSX.WorkSheet, {
          header: 1,
        });

        const headers = rows[0] as string[];

        const requiredHeaders = [
          "Student ID",
          "First Name",
          "Last Name",
          "Gender",
          "Email",
          "Contact Number",
          "Address",
        ];

        const missingHeaders = requiredHeaders.filter(
          (h) => !headers.includes(h),
        );

        if (missingHeaders.length > 0) {
          throw new Error(
            `Missing required headers: ${missingHeaders.join(", ")}`,
          );
        }

        const json = XLSX.utils.sheet_to_json(sheet as XLSX.WorkSheet) as {
          "Student ID": string;
          "First Name": string;
          "Middle Name"?: string | null;
          "Last Name": string;
          Gender?: string | null;
          Email?: string | null;
        }[];

        const students = json.map((data) => ({
          studentId: data["Student ID"],
          firstName: data["First Name"],
          middleName: data["Middle Name"],
          lastName: data["Last Name"],
          email: data["Email"],
          gender: data["Gender"]?.toLowerCase()?.includes("f")
            ? "FEMALE"
            : "MALE",
        })) as Students[];

        setExcelData(students);
      } catch (err: any) {
        toast.error(err.message || "Failed to process file");
      }
    };

    // ✅ THIS LINE WAS MISSING
    reader.readAsArrayBuffer(file);
  };

  const { mutate, isPending } = api.students.upsertManyStudents.useMutation({
    onSuccess: async () => {
      await utils.students.getMany.invalidate();
      onClose();
      setExcelData([]);
      setCourseCode(null)
      toast.success("Add Success", {
        description: "All students added.",
      });
    },
    onError: () => {
      toast.error("Failed", {
        description: "Failed to add students. Recheck file format",
      });
    },
  });

  const onClose = () => setModal(null);

  const onAddStudents = () => {
    excelData.length && courseCode &&
      mutate({
        students: excelData.map((stud) => ({
          studentId: stud.studentId,
          courseCode: courseCode,
          firstName: stud.firstName,
          middleName: stud.middleName || undefined,
          lastName: stud.lastName,
          email: stud.email || undefined,
          gender: stud.gender,
        })),
      });
  };

  return (
    <Dialog open={modal === "open"} onOpenChange={onClose}>
      <DialogContent
        className={`${excelData.length ? "lg:min-w-5xl" : "min-w-xl"} gap-2`}
      >
        <DialogHeader>
          <DialogTitle>Upload Students</DialogTitle>
          <DialogDescription>
            Upload students using a .xlsx, .xls, or .csv file.
          </DialogDescription>
        </DialogHeader>
        {(excelData.length && courseCode) ? (
          <>
            <div className="flex w-full flex-row items-end justify-between">
              <p className="text-sm font-bold">{courses?.find(c=>c.code === courseCode)?.title} - {excelData.length} Students</p>
              <Button
                onClick={() => setExcelData([])}
                variant={"outline"}
                size={"sm"}
                className="text-xs"
              >
                Clear Students
              </Button>
            </div>
            <div className="w-full overflow-auto">
              <div className="text-foreground max-h-[60vh] overflow-auto rounded-md border text-xs sm:max-h-[70vh]">
                <Table className="relative max-w-full text-xs">
                  <TableHeader className="top-0">
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>First Name</TableHead>
                      <TableHead>Middle Name</TableHead>
                      <TableHead>Last Name</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {excelData.map((student) => {
                      return (
                        <TableRow key={student.id}>
                          <TableCell>{student.studentId}</TableCell>
                          <TableCell>{student.firstName}</TableCell>
                          <TableCell>{student.middleName}</TableCell>
                          <TableCell>{student.lastName}</TableCell>
                          <TableCell className="capitalize">
                            {student.gender.toLowerCase()}
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-5 flex w-full justify-between">
                <p className="text-primary/80 text-xs">
                  If a student with the same Student ID already exists, their
                  information will be updated instead of creating a duplicate.
                </p>

                <Button
                  type="submit"
                  onClick={onAddStudents}
                  disabled={isPending}
                >
                  Submit
                  <SendHorizonal />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex w-full flex-col items-center justify-center gap-2 py-5">
            <TooltipProvider>
              <div className="text-muted-foreground flex items-center gap-2 p-0 text-sm">
                <span>Expected Excel Format</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="text-foreground bg-card max-w-full p-1 text-xs shadow"
                  >
                    <p className="text-muted-foreground p-1">Excel Format</p>
                    <div className="overflow-auto rounded-md border text-xs opacity-50">
                      <Table className="text-xs">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student ID</TableHead>
                            <TableHead>First Name</TableHead>
                            <TableHead>Middle Name</TableHead>
                            <TableHead>Last Name</TableHead>
                            <TableHead>Gender</TableHead>
                            <TableHead>Email</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>2023002</TableCell>
                            <TableCell>Maria</TableCell>
                            <TableCell>Elsa</TableCell>
                            <TableCell>Santos</TableCell>
                            <TableHead>Female</TableHead>
                            <TableCell>student@example.com</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
            <div className="flex flex-row items-center gap-2 w-full mt-2">
              <Select
                onValueChange={(e) => setCourseCode(e)}
                value={courseCode || undefined}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select Program"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {coursesIsLoading ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      <div>
                        {courses?.map((course) => (
                          <SelectItem value={course.code} key={course.code}>
                            <div className="flex flex-row gap-1">
                              <span>{course.title}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <CustomFileUpload disabled={!courseCode} handleFile={handleFile} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function CustomFileUpload({
  handleFile,
  disabled = false
}: {
  handleFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?:boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const triggerInput = () => {
    inputRef.current?.click();
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
        onChange={handleFile}
        disabled={disabled}
        className="hidden"
      />
      <Button
        type="button"
        onClick={triggerInput}
        disabled={disabled}
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        Upload File
      </Button>
    </div>
  );
}
