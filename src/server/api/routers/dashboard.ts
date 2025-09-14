import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const dashboardRouter = createTRPCRouter({
  getDashboardCounts: protectedProcedure.query(async ({ ctx }) => {
    const data = await Promise.all([
      ctx.db.theses.count(),
      ctx.db.studentBorrow.count({
        where: { status: "BORROWED" },
      }),
      ctx.db.studentBorrow.count({
        where: { status: "BORROWED", borrowDueAt: { lt: new Date() } },
      }),
      ctx.db.students.count(),
    ]);
    return {
      booksCount: data[0],
      borrowedCount: data[1],
      overDueCount: data[2],
      studentCount: data[3],
    };
  }),
  getDashboardBooks: protectedProcedure.query(async ({ ctx }) => {
    const books = await ctx.db.theses.findMany({
      skip: 0,
      take: 10,
      include: {
        Tags: {
          include: {
            Tag: true,
          },
        },
      },
    });
    return books;
  }),
  getDashboardBorrows: protectedProcedure.query(async ({ ctx }) => {
    const borrows = await ctx.db.studentBorrow.findMany({
      where: {
        status: { in: ["PENDING", "BORROWED"] },
      },
      skip: 0,
      take: 10,
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
  getOverdueBorrows: protectedProcedure.query(async ({ ctx }) => {
    const borrows = await ctx.db.studentBorrow.findMany({
      where: {
        status: "BORROWED",
        borrowDueAt: {
          lt: new Date(),
        },
      },
      skip: 0,
      take: 10,
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
});
