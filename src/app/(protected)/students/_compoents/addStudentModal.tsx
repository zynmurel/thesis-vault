"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates,
} from "nuqs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "@/trpc/react";
import { LoaderCircle, SendHorizonal } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

const formSchema = z.object({
  id: z.string().optional(),
  courseCode: z.string(),
  studentId: z.string(),
  firstName: z.string(),
  middleName: z.string().optional(),
  lastName: z.string(),
  email: z.string().optional(),
  year: z.number(),
  section: z.string(),
  contactNumber: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE"]),
});
type FormValues = z.infer<typeof formSchema>;

export default function AddStudentModal() {
  const utils = api.useUtils();
  const [modal, setModal] = useQueryState("create", parseAsString);
  const [courseCode] = useQueryState(
    "courseCode",
    parseAsString.withDefault("ALL"),
  );
  const [studentId] = useQueryState("studentId", parseAsString.withDefault(""));
  const [pagination] = useQueryStates({
    skip: parseAsInteger.withDefault(0),
    take: parseAsInteger.withDefault(10),
  });

  const isCreate = modal === "open";

  const { data: courses, isLoading: coursesIsLoading } =
    api.courses.getAll.useQuery();

  const { mutate, isPending } = api.students.upsertStudent.useMutation({
    onSuccess: async () => {
      await utils.students.getMany.invalidate();
      onClose();
      toast.success(`Success, student ${isCreate ? "added":"updated"}.`);
    },
    onError: () => {
      toast.error("Failed to submit student");
    },
  });

  const { data: students, isLoading: studentsIsLoading } =
    api.students.getMany.useQuery({
      courseCode,
      studentId,
      skip: pagination.skip,
      take: pagination.take,
    });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseCode: "",
      studentId: "",
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      gender: "MALE",
      year: 1,
      section: undefined,
      contactNumber: undefined,
    },
  });

  const onClose = () => setModal(null);

  const onSubmit = (values: FormValues) => {
    mutate({
      id: modal || undefined,
      ...values,
    });
  };

  useEffect(() => {
    const student = students?.find((s) => s.id === modal);
    console.log(student)
    if (student) {
      form.reset({
        courseCode: student.courseCode,
        studentId: student.studentId,
        firstName: student.firstName,
        middleName: student.middleName || undefined,
        lastName: student.lastName,
        email: student.email || undefined,
        gender: student.gender,
        year: student.year,
        section: student.section,
        contactNumber: student.contactNo || undefined,
      });
    }
  }, [modal]);

  return (
    <Dialog open={!!modal} onOpenChange={onClose}>
      <DialogContent className="md:min-w-3xl">
        <DialogHeader>
          <DialogTitle>{isCreate ? "Add" : "Update"} Student</DialogTitle>
          <DialogDescription>Input student details.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <div className="grid gap-3 gap-y-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Student ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="courseCode"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Course</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <div className="truncate">
                            {courses?.find((c) => c.code === field.value)
                              ?.title || "Select Program"}
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {coursesIsLoading ? (
                            <LoaderCircle className="animate-spin" />
                          ) : (
                            courses?.map((course) => (
                              <SelectItem key={course.code} value={course.code}>
                                <div className="flex flex-row gap-1">
                                  <span>{course.title}</span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-3 gap-y-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter First Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="middleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Middle Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Last Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-3 gap-y-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(e) => {
                          field.onChange(Number(e));
                        }}
                        defaultValue={String(field.value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            { label: "1st Year", value: 1 },
                            { label: "2nd Year", value: 2 },
                            { label: "3rd Year", value: 3 },
                            { label: "4th Year", value: 4 },
                          ].map((level) => {
                            return (
                              <SelectItem key={level.value} value={String(level.value)}>
                                {level.label}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter section" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                Submit
                <SendHorizonal />
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
