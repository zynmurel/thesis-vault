"use client";

import {
  useQueryStates,
  parseAsInteger,
  parseAsString,
  useQueryState,
} from "nuqs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EllipsisVertical, LoaderCircle, Plus, Upload, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { api } from "@/trpc/react";
import { Separator } from "@/components/ui/separator";
import TablePagination from "../_components/table-pagination";

function Page() {
  const createStudent = useQueryState("create", parseAsString);
  const uploadStudents = useQueryState("upload", parseAsString);
  const [courseCode, setCourseCode] = useQueryState(
    "courseCode",
    parseAsString.withDefault("ALL"),
  );
  const [studentId, setStudentId] = useQueryState(
    "studentId",
    parseAsString.withDefault(""),
  );
  const [pagination] = useQueryStates({
    skip: parseAsInteger.withDefault(0),
    take: parseAsInteger.withDefault(10),
  });

  const { data: courses, isLoading: coursesIsLoading } =
    api.courses.getAll.useQuery();

  const { data: students, isLoading: studentsIsLoading } =
    api.students.getMany.useQuery({
      courseCode,
      studentId,
      skip: pagination.skip,
      take: pagination.take,
    });

  const { data: studentCount } = api.students.getCount.useQuery({
    courseCode,
    studentId
  });

  const onCreateStudent = (id?: string) => createStudent[1](id || "open");
  const onUploadStudents = () => uploadStudents[1]("open");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <Users className="size-10" />
          <div className="flex flex-col">
            <h2 className="text-lg font-bold">Students</h2>
            <p className="-mt-1 text-sm">Manage students and informations</p>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between gap-2">
        <div className="flex w-full flex-col gap-2 lg:w-auto lg:flex-row">
          <Input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full xl:min-w-80"
            placeholder="Search student ID"
          />
          <div className="flex w-full flex-row gap-2">
            <Select onValueChange={(e) => setCourseCode(e)} value={courseCode}>
              <SelectTrigger className="flex-1">
                <div className=" truncate">
                  {courseCode === "ALL"
                    ? "All Programs"
                    : courses?.find((c) => c.code === courseCode)?.title}
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {coursesIsLoading ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <div>
                      <SelectItem value={"ALL"}>All Programs</SelectItem>
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
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <Button onClick={()=>onCreateStudent()} variant={"outline"}>
            <Plus />
            <p className="hidden pr-1 sm:flex">Student</p>
          </Button>
          <Button onClick={onUploadStudents}>
            <Upload />
            <p className="hidden pr-1 sm:flex">Upload File</p>
          </Button>
        </div>
      </div>
      <div className="rounded-lg border p-2 py-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students?.map((student) => {
              return (
                <TableRow key={student.id}>
                  <TableCell>{student.studentId}</TableCell>
                  <TableCell>{student.year}</TableCell>
                  <TableCell>{student.section}</TableCell>
                  <TableCell>{`${student.firstName} ${student.middleName ? `${student.middleName} ` : " "}${student.lastName}`}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.courseCode}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="p-0 w-8 h-8"
                              >
                                <EllipsisVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={()=>onCreateStudent(student.id)}>
                                Edit Student
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                // onClick={() => setToDeleteTour(tour)}
                                className="text-red-600"
                              >
                                View Student
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {studentsIsLoading && (
          <div className="flex w-full items-center justify-center p-5">
            <LoaderCircle className="animate-spin" />
          </div>
        )}
        {!studentCount && !studentsIsLoading && (
          <div className="text-muted-foreground flex items-center justify-center p-5 text-sm">
            <p>No students found</p>
          </div>
        )}
        <Separator />
        <TablePagination count={studentCount} />
      </div>
    </div>
  );
}

export default Page;
