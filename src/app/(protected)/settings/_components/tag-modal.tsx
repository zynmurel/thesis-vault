"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { parseAsString, useQueryState } from "nuqs";

export function TagsModal() {

  const [thesesId, setThesesId] = useQueryState("tag-upsert", parseAsString);
  const [tag, setTag] = useState("");
  const isOpen = !!thesesId;
  const isCreate = thesesId === "create";

  const utils = api.useUtils();

  const { data: tags } = api.tags.getAll.useQuery();
  const upsertTag = api.tags.upsert.useMutation({
    onSuccess: async () => {
      await utils.tags.getAll.invalidate()
      setThesesId(null);
    },
  });

  useEffect(() => {
    const activeTag = tags?.find((t) => t.id === Number(thesesId));
    if (activeTag && !isCreate) {
      setTag(activeTag.tag);
    } else if (isCreate) {
      setTag("");
    }
  }, [thesesId, isCreate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsertTag.mutateAsync({
      id: !isCreate ? Number(thesesId) : undefined,
      tag,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => setThesesId(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isCreate ? "Create Tag" : "Update Tag"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Tag name"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setThesesId(null)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={upsertTag.isPending}>
              {isCreate ? "Create" : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}