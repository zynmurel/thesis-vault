"use client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";

export function SectionCards() {
  const { data, isLoading } = api.dashboard.getDashboardCounts.useQuery();
  return (
    <div className="*:data-[slot=card]:from-secondary/20 *:data-[slot=card]:to-secondary/5 dark:*:data-[slot=card]:bg-card grid gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 xl:grid-cols-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>📚 Total Books</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? <LoaderCircle className=" size-9 animate-spin" strokeWidth={2.5} /> : data?.booksCount}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="cursor-pointer bg-white hover:opacity-80"
            >
              <ArrowUpRight />
              View
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 opacity-50">
            Total number of thesis books
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>⏳ Books Not Yet Returned</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? <LoaderCircle className=" size-9 animate-spin" strokeWidth={2.5} /> : data?.borrowedCount}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="cursor-pointer bg-white hover:opacity-80"
            >
              <ArrowUpRight />
              View
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 opacity-60">
            Currently borrowed books not yet returned
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>⚠️ Overdue Books</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? <LoaderCircle className=" size-9 animate-spin" strokeWidth={2.5} /> : data?.overDueCount}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="cursor-pointer bg-white hover:opacity-80"
            >
              <ArrowUpRight />
              View
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 opacity-60">
            Books past due date without return
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>🧑‍🎓 Students with Penalties</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? <LoaderCircle className=" size-9 animate-spin" strokeWidth={2.5} /> : data?.studentWithPenaltyCount}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="cursor-pointer bg-white hover:opacity-80"
            >
              <ArrowUpRight />
              View
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 opacity-60">
            Unique students with active penalties
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
