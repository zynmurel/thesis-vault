import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const notificationRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ take: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.studentBorrowNotification.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: input.take,
        include: {
          Student: true,
          StudentBorrow: true,
          Thesis: true,
        },
      });
    }),
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.studentBorrowNotification.count({
      where: {
        isAdminRead: false,
      },
    });
  }),
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input: { id } }) => {
      return await ctx.db.studentBorrowNotification.update({
        where: { id },
        data: {
          isAdminRead: true,
        },
      });
    }),
});
