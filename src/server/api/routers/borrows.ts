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
            status: { in: statuses as ("PENDING" | "BORROWED" | "RETURNED")[] },
          }
        : {};
      const borrows = await ctx.db.studentBorrow.findMany({
        where: {
          ...whereStatus,
          Thesis: {
            title: { contains: search, mode: "insensitive" },
          },
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
            status: { in: statuses as ("PENDING" | "BORROWED" | "RETURNED")[] },
          }
        : {};
      const borrows = await ctx.db.studentBorrow.count({
        where: {
          ...whereStatus,
          Thesis: {
            title: { contains: search, mode: "insensitive" },
          },
        },
      });
      return borrows;
    }),
});
