"use client";

import { z } from "zod";
import { useFieldArray, useForm, type UseFormReturn } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { parseAsString, useQueryState } from "nuqs";
import { LoaderCircle, Plus, SendHorizonal, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { years } from "@/utils/year";
import { toast } from "sonner";

const thesisSchema = z.object({
  courseCode: z.string(),
  title: z.string(),
  abstract: z.string(),
  year: z.string(),
  tags: z.array(z.number()),
  members: z
    .array(
      z.object({
        name: z.string().min(1, "Full name is required"),
      }),
    )
    .min(1, "At least one member is required"),
});

type ThesisFormValues = z.infer<typeof thesisSchema>;

interface Props {
  onSubmit: (values: ThesisFormValues) => void;
  form: UseFormReturn<ThesisFormValues>;
  onClose: () => void;
  isPending : boolean;
}

export default function UpsertThesis() {
  const [thesesId, setThesesId] = useQueryState("upsert", parseAsString);
  const isCreate = thesesId === "create";
  const utils = api.useUtils();

  const form = useForm<ThesisFormValues>({
    resolver: zodResolver(thesisSchema),
    defaultValues: {
      members: [{ name: "" }],
    },
  });

  const onClose = () => setThesesId(null);

  const { mutate, isPending } = api.theses.upsertTheses.useMutation({
    onSuccess: async () => {
      await utils.theses.getMany.invalidate();
      toast("Thesis added", {
        description: "Your thesis has been saved.",
      });
      form.reset()
      onClose()
    },
  });

  const onSubmit = (data: ThesisFormValues) => {
    mutate({
      id: thesesId === "ALL" ? "" : String(thesesId),
      title: data.title,
      abstract: data.abstract,
      year: data.year,
      courseCode: data.courseCode,
      members: JSON.stringify(data.members),
      tagIds : data.tags
    });
  };

  return (
    <Dialog open={!!thesesId} onOpenChange={onClose}>
      <DialogContent className="md:min-w-3xl">
        <DialogHeader>
          <DialogTitle>{`${isCreate ? "Add New" : "Update"} Thesis`}</DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Fill out the form below to add a new thesis record to the system."
              : "Make the necessary changes to update the existing thesis information."}
          </DialogDescription>
        </DialogHeader>
        <ThesisForm form={form} onSubmit={onSubmit} onClose={onClose} isPending={isPending} />
      </DialogContent>
    </Dialog>
  );
}

const ThesisForm = ({ onSubmit, form, onClose, isPending }: Props) => {
  const { control, handleSubmit } = form;

  const { data: courses, isLoading: coursesIsLoading } =
    api.courses.getAll.useQuery();

  const { data: tags, isLoading: tagsIsLoading } = api.tags.getAll.useQuery();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members", // ✅ Zod: members: [{ name: string }]
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="mt-2 space-y-4 px-2">
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem className="col-span-2 w-full">
                  <FormLabel>Thesis Title</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Input title"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Year</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-96">
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={control}
            name="abstract"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Abstract</FormLabel>
                <FormControl>
                  <Textarea placeholder="Input abstract..." {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="courseCode"
            render={({ field }) => (
              <FormItem className="md:max-w-2/3">
                <FormLabel>Course</FormLabel>
                <Select onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <div className="truncate">
                        {courses?.find((c) => c.code === field.value)?.title ||
                          "Select Course"}
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

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {tagsIsLoading ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    tags?.map((tag) => {
                      const isSelected = field.value?.includes(tag.id);
                      return (
                        <Button
                          key={tag.id}
                          type="button"
                          size={"sm"}
                          className="min-w-14 text-sm"
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => {
                            const selected = field.value || [];
                            if (isSelected) {
                              field.onChange(
                                selected.filter((t) => t !== tag.id),
                              );
                            } else {
                              field.onChange([...selected, tag.id]);
                            }
                          }}
                        >
                          {tag.tag}
                        </Button>
                      );
                    })
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Members FieldArray */}
          <div className="space-y-3">
            <FormLabel>Members</FormLabel>
            {fields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`members.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Input placeholder={`Name of member`} {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      {fields.length > 1 && (
                        <Trash2 className="text-destructive size-5" />
                      )}
                    </Button>
                  </FormItem>
                )}
              />
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => append({ name: "" })}
              className="mt-1 text-sm"
              size={"sm"}
            >
              <Plus className="size-4" /> Add Member
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant={"outline"}
            onClick={() => {
              form.reset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            Submit
            <SendHorizonal />
          </Button>
        </div>
      </form>
    </Form>
  );
};
