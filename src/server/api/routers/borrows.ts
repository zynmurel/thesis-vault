import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const borrowsRouter = createTRPCRouter({
  getBorrows: protectedProcedure
    .input(
      z.object({
        statuses: z.string().array(),
        search: z.string(),
        skip: z.number(),
        take: z.number(),
      }),
    )
    .query(async ({ ctx, input: { statuses, search, skip, take } }) => {
      const whereStatus = statuses.length
        ? {
            status: {
              in: statuses.filter((s) => s !== "OVERDUE") as (
                | "PENDING"
                | "BORROWED"
                | "RETURNED"
              )[],
            },
          }
        : {};
      const whereOverDue = statuses.includes("OVERDUE");
      const borrows = await ctx.db.studentBorrow.findMany({
        where: {
          OR: [
            {
              ...whereStatus,
              Thesis: {
                title: { contains: search, mode: "insensitive" },
              },
            },
            {
              ...(whereOverDue
                ? {
                    AND: [
                      { borrowDueAt: { lt: new Date() } },
                      { status: "BORROWED" },
                    ],
                  }
                : {}),
            },
          ],
        },
        skip,
        take,
        include: {
          Thesis: {
            include: { Course: true, Tags: { include: { Tag: true } } },
          },
          Student: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
      return borrows;
    }),
  getBorrowsCount: protectedProcedure
    .input(
      z.object({
        statuses: z.string().array(),
        search: z.string(),
      }),
    )
    .query(async ({ ctx, input: { statuses, search } }) => {
      const whereStatus = statuses.length
        ? {
            status: {
              in: statuses.filter((s) => s !== "OVERDUE") as (
                | "PENDING"
                | "BORROWED"
                | "RETURNED"
              )[],
            },
          }
        : {};
      const whereOverDue = statuses.includes("OVERDUE");
      const borrows = await ctx.db.studentBorrow.count({
        where: {
          OR: [
            {
              ...whereStatus,
              Thesis: {
                title: { contains: search, mode: "insensitive" },
              },
            },
            {
              ...(whereOverDue
                ? {
                    AND: [
                      { borrowDueAt: { lt: new Date() } },
                      { status: "BORROWED" },
                    ],
                  }
                : {}),
            },
          ],
        },
      });
      return borrows;
    }),
});
