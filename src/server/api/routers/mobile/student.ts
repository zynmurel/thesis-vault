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
        where: {
          id: studentId,
        },
      });
    }),
  getStudentBorrows: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
      }),
    )
    .query(async ({ ctx, input: { studentId } }) => {
      const borrowedCount = await ctx.db.studentBorrow.count({
        where: {
          studentId,
          status: { in: ["BORROWED"] },
        },
      });
      const borrowHistory = await ctx.db.studentBorrow.count({
        where: { studentId },
      });
      return {
        borrowedCount,
        borrowHistory,
      };
    }),

  getStudentPendingBorrows: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
      }),
    )
    .query(async ({ ctx, input: { studentId } }) => {
      return await ctx.db.studentBorrow.findMany({
        where: {
          studentId,
          status: "PENDING",
        },
        include: {
          Thesis: {
            include: {
              Tags: {
                include: {
                  Tag: true,
                },
              },
              Ratings: true,
            },
          },
        },
      });
    }),

  getStudentRecentActivity: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
      }),
    )
    .query(async ({ ctx, input: { studentId } }) => {
      return await ctx.db.studentBorrow
        .findMany({
          where: {
            studentId,
            status: { not: "PENDING" },
          },
          include: {
            Thesis: {
              include: {
                Tags: {
                  include: {
                    Tag: true,
                  },
                },
                Ratings: true,
              },
            },
          },
        })
        .then((data) => {
          return data.map((borrow) => {
            const t = borrow.Thesis;
            return {
              ...borrow,
              Thesis: {
                ...t,
                averageRating: t.Ratings.length
                  ? t.Ratings.reduce((a, c) => a + c.stars, 0) /
                    t.Ratings.length
                  : 0,
              },
            };
          });
        });
    }),
  getBag: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
      }),
    )
    .query(async ({ ctx, input: { studentId } }) => {
      return await ctx.db.studentBag.findMany({
        where: {
          studentId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
  getThesisDueDayCount: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.borrowDueDateSettings.findFirst();
  }),

  putThesisInBag: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
        thesisId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { thesisId, studentId } }) => {
      console.log("thesisId", thesisId);
      console.log("studentId", studentId);
      return await ctx.db.studentBag
        .create({
          data: {
            thesisId,
            studentId,
          },
        })
        .catch((e) => console.log(e));
    }),

  borrowThesis: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
        thesisId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { thesisId, studentId } }) => {
      const thesis = await ctx.db.theses.findUnique({
          where: { id: thesisId, },
        })

      if (!thesis) throw new Error("No thesis found.");

      const isBorrowed = thesis.available <= 0

      if (isBorrowed) throw new Error("This thesis is already borrowed.");

      const [admin, borrowCount] = await Promise.all([
        ctx.db.admin.findFirst({
          include: { BorrowLimitSettings: true },
        }),
        ctx.db.studentBorrow.count({
          where: {
            studentId,
            status: { in: ["BORROWED", "PENDING"] },
          },
        }),
      ]);

      if (borrowCount >= (admin?.BorrowLimitSettings?.limitCount || 0))
        throw new Error(
          `You’ve reached your borrow limit. Each student is allowed a maximum of ${borrowCount} thesis borrows to ensure fair access for others.`,
        );

      return await ctx.db.$transaction(async (tx) => {
        await tx.theses.update({
          where : { id : thesisId },
          data : {
            available : thesis.available - 1
          }
        })
        return await tx.studentBorrow.create({
          data: {
            thesisId,
            studentId,
          },
        });
      });
    }),

  getYourRating: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
        thesisId: z.string(),
      }),
    )
    .query(async ({ ctx, input: { thesisId, studentId } }) => {
      return await ctx.db.thesesRatings.findUnique({
        where: {
          thesisId_studentId: {
            thesisId,
            studentId,
          },
        },
      });
    }),
});
