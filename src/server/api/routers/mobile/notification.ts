import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const mobileNotificationRouter = createTRPCRouter({
  getAllNotifications: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
        take: z.number(),
        unread: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const isUnreadOnly = input.unread ? { isRead: null } : {};
      return await ctx.db.studentBorrowNotification.findMany({
        where: { studentId: input.studentId, ...isUnreadOnly },
        orderBy: {
          createdAt: "desc",
        },
        take: input.take,
        include: {
          Thesis: true,
          StudentBorrow: true,
        },
      });
    }),
  markAsRead: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.studentBorrowNotification.update({
        where: { id: input.id },
        data: {
          isRead: new Date(),
        },
      });
    }),
});
