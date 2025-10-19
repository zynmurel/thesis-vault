"use client";

import { useQueryState, parseAsString } from "nuqs";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BadgeCheck, Edit } from "lucide-react";

export default function TagsPage() {
  const { data: tags, refetch } = api.tags.getAll.useQuery();
  const [thesesId, setThesesId] = useQueryState("tag-upsert", parseAsString);

  return (
    <Card className="grid gap-2 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <BadgeCheck className="size-5" strokeWidth={3} />
          <h1 className="text-base font-semibold">Thesis Tags</h1>
        </div>
        <Button onClick={() => setThesesId("create")}>Add Tag</Button>
      </div>
      <Separator className="my-1" />

      <div className="rounded-lg border px-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tag</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {tags?.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell>{tag.tag}</TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setThesesId(String(tag.id))}
                  >
                    <Edit />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
