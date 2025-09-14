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
  getStudentWithPenalties: protectedProcedure
    .input(
      z.object({
        search: z.string(),
        status: z.enum(["settled", "unsetteled", "all"]),
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
  getStudentWithPenaltiesCount: protectedProcedure
    .query(async ({ ctx, input }) => {
      const data = await Promise.all([
        ctx.db.studentBorrow.count({
          where : { isPenalty : true, penaltyIsPaid : false}
        }),
        ctx.db.studentBorrow.count({
          where : { isPenalty : true, penaltyIsPaid : true}
        })
      ])
      return {
          unsetteled : data[0],
          setteled : data[1]
      }
    }),
});
