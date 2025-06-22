"use client";
import {
  useQueryStates,
  parseAsInteger,
  parseAsString,
  useQueryState,
  parseAsArrayOf,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BookOpenText,
  ListFilterPlus,
  LoaderCircle,
  Plus,
  QrCode,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { Course, Tags } from "@prisma/client";
import TablePagination from "../_components/table-pagination";

function Page() {
  const [_theses, setTheses] = useQueryState("thesesQR",parseAsArrayOf(parseAsString).withDefault([]));
  const thesisIdQueryState = useQueryState("upsert", parseAsString);
  const [_thesisPhoto, setThesisPhoto] = useQueryState("thesisPhoto", parseAsString);
  const [filterTags, setFilterTags] = useQueryState(
    "tags",
    parseAsArrayOf(parseAsInteger).withDefault([]),
  );
  const [courseCode, setCourseCode] = useQueryState(
    "courseCode",
    parseAsString.withDefault("ALL"),
  );
  const [title, setTitle] = useQueryState(
    "title",
    parseAsString.withDefault(""),
  );

  const [pagination] = useQueryStates({
    skip: parseAsInteger.withDefault(0),
    take: parseAsInteger.withDefault(10),
  });

  const { data: tags, isLoading: tagsIsLoading } = api.tags.getAll.useQuery();
  const { data: courses, isLoading: coursesIsLoading } =
    api.courses.getAll.useQuery();
  const { data: theses, isLoading: thesesIsLoading } =
    api.theses.getMany.useQuery({
      tags: filterTags ?? [],
      courseCode,
      title,
      skip: pagination.skip,
      take: pagination.take,
    });

  const { data: thesesCount } = api.theses.getCount.useQuery({
    tags: filterTags ?? [],
    courseCode,
    title,
  });

  const toggleTag = (tagId: number) => {
    setFilterTags((prev) => {
      const list = prev ?? [];
      return list.includes(tagId)
        ? list.filter((t) => t !== tagId)
        : [...list, tagId];
    });
  };

  const onSelectCourse = (courseCode: string) => {
    setCourseCode(courseCode);
  };

  const onSearchTitle = (title: string) => {
    setTitle(title);
  };

  const onCreateThesis = () => thesisIdQueryState[1]("create");

  const onOpenThesisPhoto = (url: string) => setThesisPhoto(url);

  // Placeholder filter logic (you can replace this with real logic)

  const DisplayFilter = ({
    tagIds,
    courseCode,
    tags,
    courses,
  }: {
    tagIds: number[];
    courseCode?: string;
    tags: Tags[];
    courses: Course[];
  }) => {
    const foundCourse = courses.find((c) => c.code === courseCode);
    return foundCourse || tagIds.length ? (
      <div>
        <p className=" text-xs text-muted-foreground mb-1">Filters</p>
        <div className="flex flex-row flex-wrap gap-1">
          {foundCourse && (
            <Badge>
              {foundCourse.title}
              <div
                className="size-3.5 cursor-pointer"
                onClick={() => onSelectCourse("ALL")}
              >
                <X className="size-3.5" />
              </div>
            </Badge>
          )}
          {tagIds.map((tag) => {
            const foundTag = tags.find((t) => t.id === tag);
            return foundTag ? (
              <Badge>
                {foundTag.tag}
                <div
                  className="size-3.5 cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  <X className="size-3.5" />
                </div>
              </Badge>
            ) : (
              <></>
            );
          })}
        </div>
      </div>
    ) : (
      <></>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <BookOpenText className="size-10" />
          <div className="flex flex-col">
            <h2 className="text-lg font-bold">Theses</h2>
            <p className="-mt-1 text-sm">Find and filter theses</p>
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
            <Select onValueChange={(e) => onSelectCourse(e)} value={courseCode}>
              <SelectTrigger className="flex-1">
                <div className="max-w-44 truncate">
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
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <ListFilterPlus />
                  Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <h4 className="mb-2 text-sm font-medium">Filter by Tags</h4>
                <div className="flex max-h-60 flex-col gap-2 overflow-auto">
                  {tagsIsLoading ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    tags?.map((tag) => (
                      <label key={tag.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={filterTags?.includes(tag.id)}
                          onCheckedChange={() => toggleTag(tag.id)}
                        />
                        <span className="text-sm">{tag.tag}</span>
                      </label>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <Button onClick={onCreateThesis}>
          <Plus />
          <p className="hidden pr-1 sm:flex">Thesis</p>
        </Button>
      </div>
      <DisplayFilter
        tagIds={filterTags}
        courseCode={courseCode}
        tags={tags || []}
        courses={courses || []}
      />
      <div className="rounded-lg border p-2 py-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Photo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {theses?.map((thesis) => {
              const members = JSON.parse(thesis.members) as { name: string }[];
              const membersNameArray = members.map((member) => member.name);
              return (
                <TableRow key={thesis.id}>
                  <TableCell>{thesis.title}</TableCell>
                  <TableCell>{thesis.courseCode}</TableCell>
                  <TableCell>{membersNameArray.join(", ")}</TableCell>
                  <TableCell>{new Date(thesis.year).getFullYear()}</TableCell>
                  <TableCell className="flex flex-wrap gap-1">
                    {thesis.Tags.map((tag) => (
                      <Badge key={tag.Tag.tag} variant={"outline"}>
                        {tag.Tag.tag}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => onOpenThesisPhoto(thesis.thesisPhoto)}
                      variant={"outline"}
                      size={"sm"}
                      className="text-xs"
                    >
                      View
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => setTheses([thesis.id, thesis.title])}
                      variant={"outline"}
                      size={"sm"}
                      className="text-xs"
                    >
                      <QrCode/>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {thesesIsLoading && (
          <div className="flex w-full items-center justify-center p-5">
            <LoaderCircle className="animate-spin" />
          </div>
        )}
        {!thesesCount && !thesesIsLoading && (
          <div className="text-muted-foreground flex items-center justify-center p-5 text-sm">
            <p>No theses found</p>
          </div>
        )}
        <Separator />
        <TablePagination count={thesesCount} />
      </div>
    </div>
  );
}

export default Page;
