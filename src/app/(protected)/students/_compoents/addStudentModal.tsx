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

import { parseAsString, useQueryState } from "nuqs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "@/trpc/react";
import { LoaderCircle, SendHorizonal } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  id: z.string().optional(),
  courseCode: z.string(),
  studentId: z.string(),
  firstName: z.string(),
  middleName: z.string().optional(),
  lastName: z.string(),
  email: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE"]),
});
type FormValues = z.infer<typeof formSchema>;

export default function AddStudentModal() {
  const utils = api.useUtils();
  const [modal, setModal] = useQueryState("create", parseAsString);

  const { data: courses, isLoading: coursesIsLoading } =
    api.courses.getAll.useQuery();

  const { mutate, isPending } = api.students.upsertStudent.useMutation({
    onSuccess: async () => {
      await utils.students.getMany.invalidate();
      onClose();
      toast.success("Success", {
        description: "Students submitted.",
      });
    },
    onError: () => {
      toast.error("Failed", {
        description: "Failed to submit student",
      });
    },
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
    },
  });

  const onClose = () => setModal(null);

  const onSubmit = (values: FormValues) => {
    mutate({
      id : modal,
      ...values
    })
  };

  return (
    <Dialog open={!!modal} onOpenChange={onClose}>
      <DialogContent className="md:min-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Student</DialogTitle>
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
                              ?.title || "Select Course"}
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
            </div>

            <div className="grid gap-3 gap-y-6 sm:grid-cols-2">
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
