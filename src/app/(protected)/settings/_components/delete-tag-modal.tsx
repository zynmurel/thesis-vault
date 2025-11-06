"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { parseAsString, useQueryState } from "nuqs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

export function TagsDeleteModal() {
  const [tagId, setTagId] = useQueryState("tag-delete", parseAsString);
  const isOpen = !!tagId;

  const utils = api.useUtils();

  const { data: tags } = api.tags.getAll.useQuery();
  const deleteTag = api.tags.delete.useMutation({
    onSuccess: async () => {
      await utils.tags.getAll.invalidate();
      setTagId(null);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await deleteTag.mutateAsync({
      id: Number(tagId),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => setTagId(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Delete Tag`}</DialogTitle>
          <DialogDescription>{"Confirm tag deletion"}</DialogDescription>
        </DialogHeader>
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Tag Deletion Notice</AlertTitle>
          <AlertDescription>
            <p className="mb-2">Please read before confirming this action:</p>
            <ul className="list-inside list-disc space-y-1 text-sm">
              <li>
                Deleting this tag will also remove all its connections to thesis
                books.
              </li>
              <li>This action cannot be undone.</li>
              <li>
                Make sure you want to permanently delete this tag before
                proceeding.
              </li>
            </ul>
          </AlertDescription>
        </Alert>
        <p className=" text-destructive">
          Confirm delete tag {" "}
          {
            <span className="font-bold">
              {`"${tags?.find((t) => t.id === Number(tagId))?.tag}"`}
            </span>
          }
        </p>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => setTagId(null)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={deleteTag.isPending}
            variant={"destructive"}
            onClick={handleSubmit}
          >
            Confirm Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
