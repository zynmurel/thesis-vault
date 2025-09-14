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
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import {
  Camera,
  LoaderCircle,
  Plus,
  SendHorizonal,
  Trash2,
} from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { handleUploadSupabase } from "@/lib/upload";

const thesisSchema = z.object({
  thesisPhoto: z.any().optional(),
  courseCode: z.string(),
  title: z.string(),
  abstract: z.string(),
  year: z.string().min(1, { message: "Year is required" }),
  quantity: z.number().min(1, { message: "Quantity must not be less than 1" }),
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
  isPending: boolean;
  thesisPhoto: string | null;
  setThesisPhoto: Dispatch<SetStateAction<string | null>>;
}

export default function UpsertThesis() {
  const [thesesId, setThesesId] = useQueryState("upsert", parseAsString);

  const [_, setTheses] = useQueryState(
    "thesesQR",
    parseAsArrayOf(parseAsString).withDefault([]),
  );

  const [thesisPhoto, setThesisPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isCreate = thesesId === "create";
  const utils = api.useUtils();

  const { data: thesis, isLoading: thesisIsLoading } =
    api.theses.getThesisByQR.useQuery(
      {
        thesisId: thesesId as string,
      },
      { enabled: !!thesesId && thesesId !== "create" },
    );

  const form = useForm<ThesisFormValues>({
    resolver: zodResolver(thesisSchema),
    defaultValues: {
      quantity: 1,
      members: [{ name: "" }],
    },
  });

  const onClose = () => setThesesId(null);

  const { mutate, isPending } = api.theses.upsertTheses.useMutation({
    onSuccess: async (data) => {
      await utils.theses.getMany.invalidate();
      await utils.theses.getThesisByQR.invalidate();
      toast("Thesis added");
      form.reset();
      onSetThesesData({ id: data.id, title: data.title });
      setThesisPhoto(null);
      onClose();
    },
    onSettled: () => setIsLoading(false),
  });

  const onSubmit = async (data: ThesisFormValues) => {
    if (!isCreate && data.quantity <= thesis!.quantity - thesis!.available) {
      form.setError("quantity", { message: `` });
      toast.error(
        `Cannot deduct quantity less than the borrowed thesis (${thesis!.quantity - thesis!.available})`,
      );
      return;
    }
    setIsLoading(true);
    let photo = thesisPhoto;
    if (data.thesisPhoto) {
      photo = await handleUploadSupabase(data.thesisPhoto).finally(() =>
        setIsLoading(false),
      );
    }
    if (!photo) {
      setIsLoading(false);
      form.setError("thesisPhoto", { message: "Image is required" });
    } else {
      mutate({
        id: thesesId === "ALL" ? "" : String(thesesId),
        title: data.title,
        abstract: data.abstract,
        year: data.year,
        courseCode: data.courseCode,
        members: JSON.stringify(data.members),
        tagIds: data.tags,
        thesisPhoto: photo,
        quantity: data.quantity,
      });
    }
  };

  const onSetThesesData = ({ id, title }: { id: string; title: string }) => {
    setTheses([id, title]);
  };

  useEffect(() => {
    if (thesesId === "create") {
      form.reset({
        members: [{ name: "" }],
      });
      setThesisPhoto(null);
    } else if (thesis) {
      setThesisPhoto(thesis.thesisPhoto);
      form.reset({
        title: thesis.title,
        abstract: thesis.abstract,
        courseCode: thesis.courseCode,
        quantity: thesis.quantity,
        tags: thesis.Tags.map((t) => t.Tag.id),
        year: String(new Date(thesis.year).getFullYear()),
        members: JSON.parse(thesis.members),
      });
    }
  }, [thesis, thesesId]);

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
        {thesisIsLoading ? (
          <div className="flex flex-row items-center justify-center gap-2 p-10">
            <LoaderCircle className="animate-spin" /> Loading...
          </div>
        ) : (
            <ThesisForm
              form={form}
              onSubmit={onSubmit}
              onClose={onClose}
              isPending={isPending || isLoading}
              thesisPhoto={thesisPhoto}
              setThesisPhoto={setThesisPhoto}
            />
        )}
      </DialogContent>
    </Dialog>
  );
}

const ThesisForm = ({
  onSubmit,
  form,
  onClose,
  isPending,
  thesisPhoto,
  setThesisPhoto,
}: Props) => {
  const { control, handleSubmit } = form;

  const { data: courses, isLoading: coursesIsLoading } =
    api.courses.getAll.useQuery();

  const { data: tags, isLoading: tagsIsLoading } = api.tags.getAll.useQuery();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members", // ✅ Zod: members: [{ name: string }]
  });

  const handleChangeLogo = (event: any) => {
    const file = event.target.files[0];
    // if (file.size > 2 * 1024 * 1024) {
    //   form.setError("thesisPhoto", {
    //     type: "manual",
    //     message: "File size should not exceed 2MB",
    //   });
    //   return;
    // }
    const reader = new FileReader();
    reader.onload = () => {
      const dataURL = reader.result as string;
      setThesisPhoto(dataURL);
    };
    form.setValue("thesisPhoto", file);
    form.clearErrors("thesisPhoto");
    reader.readAsDataURL(file);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="mt-2 space-y-4 px-2 max-h-[70vh] overflow-y-scroll">
          <FormField
            control={form.control}
            name="thesisPhoto"
            render={() => (
              <FormItem>
                <FormLabel>Thesis Photo</FormLabel>
                <div className="flex items-center gap-x-6">
                  <FormControl>
                    <div className="relative">
                      {thesisPhoto ? (
                        <img
                          src={thesisPhoto}
                          alt="Company Logo"
                          className="h-20 w-20 rounded-lg border object-contain shadow-sm"
                        />
                      ) : (
                        <div className="text-muted-foreground flex h-20 w-20 items-center justify-center rounded-lg border object-contain shadow-sm">
                          <Plus />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <div>
                    <Label
                      htmlFor="thesisPhoto"
                      className="hover:bg-accent inline-flex cursor-pointer items-center gap-x-2 rounded-md border px-4 py-2 text-sm font-medium"
                    >
                      <Camera className="h-4 w-4" />
                      Upload
                    </Label>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="thesisPhoto"
                      onChange={handleChangeLogo}
                    />
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
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
                      {[...years].reverse().map((year) => (
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

          <div className="grid grid-cols-3 gap-5">
            <FormField
              control={control}
              name="courseCode"
              render={({ field }) => (
                <FormItem className="col-span-2">
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
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem className="relative w-full">
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <div className="grid h-9 max-w-44 grid-cols-3 items-center gap-x-1 rounded-md border">
                      <button
                        onClick={() => field.onChange((field.value || 0) - 1)}
                        type="button"
                        className="text-primary"
                      >
                        -
                      </button>
                      <div className="border-r border-l py-1 text-center text-sm">
                        {field.value || 0}
                      </div>
                      <button
                        onClick={() => field.onChange((field.value || 0) + 1)}
                        type="button"
                        className="text-primary"
                      >
                        +
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="absolute -bottom-4" />
                </FormItem>
              )}
            />
          </div>

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
              setThesisPhoto(null);
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
