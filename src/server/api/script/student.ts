import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const studentScriptRouter = createTRPCRouter({
  trimStudentIds: publicProcedure
    .mutation(async ({ ctx }) => {
      const students = await ctx.db.students.findMany();

      for (const student of students) {
        const trimmedId = student.studentId.trim();

        if (trimmedId !== student.studentId) {
          await ctx.db.students.update({
            where: { id: student.id },
            data: { studentId: trimmedId },
          });
        }
      }

      return { message: "All studentIds trimmed successfully" };
    }),
});
