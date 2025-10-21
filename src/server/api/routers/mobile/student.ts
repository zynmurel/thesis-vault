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
      const [borrowedCount, cancelledCount, pendingCount, returnedCount] =
        await Promise.all([
          ctx.db.studentBorrow.count({
            where: {
              studentId,
              status: { in: ["BORROWED"] },
            },
          }),
          ctx.db.studentBorrow.count({
            where: {
              studentId,
              status: { in: ["CANCELLED"] },
            },
          }),
          ctx.db.studentBorrow.count({
            where: {
              studentId,
              status: { in: ["PENDING"] },
            },
          }),
          ctx.db.studentBorrow.count({
            where: {
              studentId,
              status: { in: ["RETURNED"] },
            },
          }),
        ]);
      return {
        borrowedCount,
        cancelledCount,
        pendingCount,
        returnedCount,
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

  removeThesisToBag: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
        thesisId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { thesisId, studentId } }) => {
      return await ctx.db.studentBag
        .delete({
          where: {
            studentId_thesisId: {
              thesisId: thesisId,
              studentId: studentId,
            },
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
        where: { id: thesisId },
      });

      const isPenalty = await ctx.db.studentBorrow.findFirst({
        where: { studentId, isPenalty: true, penaltyIsPaid: false },
      });

      if (isPenalty)
        throw new Error(
          "You can't borrow right now. You still have penalty to settle.",
        );

      if (!thesis) throw new Error("No thesis found.");

      const isBorrowed = thesis.available <= 0;

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
      const limit = admin?.BorrowLimitSettings?.limitCount || 0;
      const remaining = limit - borrowCount;

      if (borrowCount >= limit)
        throw new Error(
          `You’ve reached your borrow limit. Your remaining available to borrow is ${remaining <= 0 ? 0 : remaining}.`,
        );

      return await ctx.db.$transaction(async (tx) => {
        await tx.theses.update({
          where: { id: thesisId },
          data: {
            available: thesis.available - 1,
          },
        });
        return await tx.studentBorrow.create({
          data: {
            thesisId,
            studentId,
          },
        });
      });
    }),

  borrowManyThesis: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
        thesisIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input: { thesisIds, studentId } }) => {
      const theses = await ctx.db.theses.findMany({
        where: { id: { in: thesisIds } },
      });

      const isPenalty = await ctx.db.studentBorrow.findFirst({
        where: { studentId, isPenalty: true, penaltyIsPaid: false },
      });

      if (isPenalty)
        throw new Error(
          "You can't borrow right now. You still have penalty to settle.",
        );

      if (!theses.length) throw new Error("No thesis found.");

      const isBorrowed = theses.find((t) => t.available <= 0);

      if (isBorrowed)
        throw new Error(`${isBorrowed.title} is already borrowed.`);

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
      const limit = admin?.BorrowLimitSettings?.limitCount || 0;
      const totalAfterBorrow = borrowCount + thesisIds.length;
      const remaining = limit - borrowCount;
      console.log(totalAfterBorrow);
      if (totalAfterBorrow > limit) {
        throw new Error(
          `You’ve reached your borrow limit. Your remaining available to borrow is ${remaining <= 0 ? 0 : remaining}.`,
        );
      }

      return await ctx.db.$transaction(async (tx) => {
        // Decrement available count
        await Promise.all(
          theses.map((thesis) =>
            tx.theses.update({
              where: { id: thesis.id },
              data: {
                available: thesis.available - 1,
              },
            }),
          ),
        );
        // Remove from student's bag (if applicable)
        await Promise.all(
          thesisIds.map((thesisId) =>
            tx.studentBag.deleteMany({
              where: {
                studentId,
                thesisId,
              },
            }),
          ),
        );
        // Create multiple borrow records
        const borrows = await tx.studentBorrow.createMany({
          data: thesisIds.map((thesisId) => ({
            thesisId,
            studentId,
          })),
        });

        return borrows;
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

  getIfPenalty: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
      }),
    )
    .query(async ({ ctx, input: { studentId } }) => {
      const isPenalty = await ctx.db.studentBorrow.findFirst({
        where: { studentId, isPenalty: true, penaltyIsPaid: false },
      });
      return !!isPenalty;
    }),

  getActiveBorrows: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
      }),
    )
    .query(async ({ ctx, input: { studentId } }) => {
      const data = await ctx.db.studentBorrow.findMany({
        where: {
          studentId,
          status: "BORROWED",
        },
        include: {
          Thesis: {
            include: {
              Tags: {
                include: {
                  Tag: true,
                },
              },
            },
          },
        },
      });
      console.log(data);
      return data;
    }),

  getBorrowsByStatus: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
        status: z.enum(["PENDING", "BORROWED", "RETURNED", "CANCELLED"]),
      }),
    )
    .query(async ({ ctx, input: { studentId, status } }) => {
      const data = await ctx.db.studentBorrow.findMany({
        where: {
          studentId,
          status,
        },
        include: {
          Thesis: {
            include: {
              Tags: {
                include: {
                  Tag: true,
                },
              },
            },
          },
        },
      });
      console.log(data);
      return data;
    }),
  getBorrowHistory: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
      }),
    )
    .query(async ({ ctx, input: { studentId } }) => {
      return await ctx.db.studentBorrow.findMany({
        where: {
          studentId,
        },
        include: {
          Thesis: {
            include: {
              Tags: {
                include: {
                  Tag: true,
                },
              },
            },
          },
        },
      });
    }),

  declineThesisBorrow: publicProcedure
    .input(
      z.object({
        thesisBorrowId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input: { thesisBorrowId } }) => {
      const borrow = await ctx.db.studentBorrow.findUnique({
        where: {
          id: thesisBorrowId,
          status: "PENDING",
        },
        include: {
          Thesis: true,
        },
      });

      if (!borrow) throw new Error("No Borrow Found");
      return await ctx.db.$transaction(async (tx) => {
        await tx.theses.update({
          where: {
            id: borrow.Thesis.id,
          },
          data: {
            available: borrow.Thesis.available + 1,
          },
        });
        //NOTIFICATION
        await tx.studentBorrowNotification.create({
          data: {
            thesisId: borrow.thesisId,
            studentId: borrow.studentId,
            borrowId: borrow.id,
            type: "DECLINED",
          },
        });
        return await tx.studentBorrow.update({
          where: {
            id: thesisBorrowId,
          },
          data: {
            status: "CANCELLED",
          },
        });
      });
    }),
});
