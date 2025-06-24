import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const mobileStudentRouter = createTRPCRouter({
  getStudentInfo: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
      }),
    )
    .query(async ({ ctx, input: { studentId } }) => {
      return await ctx.db.students.findUnique({
        where : {
          id : studentId
        }
      })
    }),
  getBag: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
      }),
    )
    .query(async ({ ctx, input: { studentId } }) => {
      return await ctx.db.studentBag.findMany({
        where : {
          studentId
        },
        orderBy : {
          createdAt : "desc"
        }
      })
    }),
});
