import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const reportRouter = createTRPCRouter({
  getDepartmentReport: protectedProcedure.query(async ({ ctx }) => {
    const data = await Promise.all([
      ctx.db.students.count(),
      ctx.db.theses.count(),
      ctx.db.studentBorrow.count({
        where: { status: "BORROWED" },
      }),
    ]);
    console.log(data);
    return {
      code: "CCIS",
      title: "College of Computing and Information Sciences",
      studentCount: data[0],
      thesesCount: data[1],
      activeBorrows: data[2],
      trend: "up",
    };
  }),
  getStudents: protectedProcedure
    .input(
      z.object({
        search: z.string(),
      }),
    )
    .query(async ({ ctx, input: { search } }) => {
      return await ctx.db.students.findMany({
        where: {
          OR: [
            {
              firstName: { contains: search, mode: "insensitive" },
            },
            {
              middleName: { contains: search, mode: "insensitive" },
            },
            {
              lastName: { contains: search, mode: "insensitive" },
            },
            {
              studentId: { contains: search, mode: "insensitive" },
            },
          ],
        },
        take: 20,
      });
    }),
  getReport: protectedProcedure
    .input(
      z.object({
        type: z.enum(["ALL", "PENALTY"]),
        skip: z.number(),
        take: z.number(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        studentId: z.string().nullable(),
      }),
    )
    .query(
      async ({
        ctx,
        input: { type, skip, take, startDate, endDate, studentId },
      }) => {
        const isPenaltyOnly = type === "PENALTY" ? { isPenalty: true } : {};

        const dateFilter =
          startDate && endDate
            ? {
                createdAt: {
                  gte: startDate,
                  lte: endDate,
                },
              }
            : {};

        if (!studentId) throw new Error("No student id");

        return await ctx.db.studentBorrow.findMany({
          where: {
            ...isPenaltyOnly,
            ...dateFilter,
            studentId,
            status: { notIn: ["PENDING", "CANCELLED"] },
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            Thesis: true,
            Student: true,
          },
          skip,
          take,
        });
      },
    ),
  getReportCount: protectedProcedure
    .input(
      z.object({
        type: z.enum(["ALL", "PENALTY"]),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        studentId: z.string().nullable(),
      }),
    )
    .query(async ({ ctx, input: { type, startDate, endDate, studentId } }) => {
      const isPenaltyOnly = type === "PENALTY" ? { isPenalty: true } : {};

      const dateFilter =
        startDate && endDate
          ? {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            }
          : {};

      if (!studentId) throw new Error("No student id");

      return await ctx.db.studentBorrow.count({
        where: {
          ...isPenaltyOnly,
          ...dateFilter,
          studentId,
          status: { notIn: ["PENDING", "CANCELLED"] },
        },
      });
    }),
  getReportPrint: protectedProcedure
    .input(
      z.object({
        type: z.enum(["ALL", "PENALTY"]),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        studentId: z.string(),
      }),
    )
    .mutation(
      async ({ ctx, input: { type, startDate, endDate, studentId } }) => {
        const isPenaltyOnly = type === "PENALTY" ? { isPenalty: true } : {};

        const dateFilter =
          startDate && endDate
            ? {
                createdAt: {
                  gte: startDate,
                  lte: endDate,
                },
              }
            : {};

        return await ctx.db.studentBorrow.findMany({
          where: {
            ...isPenaltyOnly,
            ...dateFilter,
            studentId,
            status: { notIn: ["PENDING", "CANCELLED"] },
          },
          include: {
            Thesis: true,
            Student: true,
          },
        });
      },
    ),
  getStudentWithPenalties: protectedProcedure
    .input(
      z.object({
        search: z.string(),
        status: z.enum(["settled", "unsettled", "all"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const wherePenaltyIsPaid =
        input.status === "all"
          ? {}
          : {
              penaltyIsPaid: input.status === "settled" ? true : false,
            };
      return await ctx.db.studentBorrow.findMany({
        where: {
          isPenalty: true,
          Student: {
            studentId: {
              contains: input.search,
              mode: "insensitive",
            },
          },
          ...wherePenaltyIsPaid,
        },
        include: {
          Student: true,
          Thesis: true,
        },
      });
    }),
  getStudentWithPenaltiesCount: protectedProcedure.query(
    async ({ ctx, input }) => {
      const data = await Promise.all([
        ctx.db.studentBorrow.count({
          where: { isPenalty: true, penaltyIsPaid: false },
        }),
        ctx.db.studentBorrow.count({
          where: { isPenalty: true, penaltyIsPaid: true },
        }),
      ]);
      return {
        unsettled: data[0],
        settled: data[1],
      };
    },
  ),
  markPenaltyAsPaid: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input: { id } }) => {
      return await ctx.db.studentBorrow.update({
        where: { id },
        data: {
          penaltyIsPaid: true,
        },
      });
    }),
});
