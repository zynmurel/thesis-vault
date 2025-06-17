import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { hashPassword } from "@/utils/hash";
import { z } from "zod";

export const studentsRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        courseCode: z.string(),
        studentId: z.string(),
        skip: z.number(),
        take: z.number(),
      }),
    )
    .query(async ({ ctx, input: { skip, take, courseCode, studentId } }) => {
      const whereCourseCode = courseCode === "ALL" ? {} : { courseCode };
      return await ctx.db.students.findMany({
        where: {
          studentId: { contains: studentId, mode: "insensitive" },
          ...whereCourseCode,
        },
        skip,
        take,
      });
    }),
  getCount: protectedProcedure
    .input(
      z.object({
        courseCode: z.string(),
        studentId: z.string(),
      }),
    )
    .query(async ({ ctx, input: { courseCode, studentId } }) => {
      const whereCourseCode = courseCode === "ALL" ? {} : { courseCode };
      return await ctx.db.students.count({
        where: {
          studentId: { contains: studentId, mode: "insensitive" },
          ...whereCourseCode,
        },
      });
    }),
  upsertStudent: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        courseCode: z.string(),
        studentId: z.string(),
        firstName: z.string(),
        middleName: z.string().optional(),
        lastName: z.string(),
        email: z.string().optional(),
        gender: z.enum(["MALE", "FEMALE"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = await hashPassword("Default@123")
      return await ctx.db.students.upsert({
        where: { id: input.id || "" },
        update: {
          studentId: input.studentId,
          courseCode: input.courseCode,
          firstName: input.firstName,
          middleName: input.middleName,
          lastName: input.lastName,
          email: input.email,
          gender: input.gender,
        },
        create: {
          courseCode: input.courseCode,
          studentId: input.studentId,
          firstName: input.firstName,
          middleName: input.middleName,
          lastName: input.lastName,
          email: input.email,
          password: hashedPassword,
          gender: input.gender,
        },
      });
    }),
  upsertManyStudents: protectedProcedure
    .input(
      z.object({
        students: z.array(
          z.object({
            courseCode: z.string(),
            studentId: z.string(),
            firstName: z.string(),
            middleName: z.string().optional(),
            lastName: z.string(),
            email: z.string().optional(),
            gender: z.enum(["MALE", "FEMALE"]),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input: { students } }) => {
      return await ctx.db.$transaction(async (tx) => {
        const hashedPassword = await hashPassword("Default@123")
        return await Promise.all(
          students.map((student) =>
            tx.students.upsert({
              where: { studentId: student.studentId },
              update: {
                studentId : student.studentId,
                courseCode: student.courseCode,
                firstName: student.firstName,
                middleName: student.middleName,
                lastName: student.lastName,
                email: student.email,
                gender: student.gender,
              },
              create: {
                courseCode: student.courseCode,
                studentId: student.studentId,
                firstName: student.firstName,
                middleName: student.middleName,
                lastName: student.lastName,
                email: student.email,
                password: hashedPassword,
                gender: student.gender,
              },
            }),
          ),
        );
      });
    }),
});
