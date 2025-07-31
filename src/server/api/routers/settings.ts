import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const settingsRouter = createTRPCRouter({
  getAdminDetails: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.admin.findFirst();
  }),
  updateAdminDetails: protectedProcedure
    .input(
      z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        username: z.string().optional(),
        email: z.string().optional(),
        password: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const admin = await ctx.db.admin.findFirst();
      if (!admin) {
        throw new Error("Admin not found");
      }
      return await ctx.db.admin.update({
        where: { id: admin.id },
        data: { ...input },
      });
    }),

  getAdminBorrowBookLimit: protectedProcedure.query(async ({ ctx }) => {
    const admin = await ctx.db.admin.findFirst();
    if (!admin) {
      throw new Error("Admin not found");
    }
    return await ctx.db.borrowLimitSettings.findFirst({
      where: { adminId: admin.id },
    });
  }),

  getAdminBorrowBookDayCount: protectedProcedure.query(async ({ ctx }) => {
    const admin = await ctx.db.admin.findFirst();
    if (!admin) {
      throw new Error("Admin not found");
    }
    return await ctx.db.borrowDueDateSettings.findFirst({
      where: { adminId: admin.id },
    });
  }),

  updateAdminBorrowBookLimit: protectedProcedure
    .input(z.object({ limitCount: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const admin = await ctx.db.admin.findFirst();
      if (!admin) {
        throw new Error("Admin not found");
      }
      return await ctx.db.borrowLimitSettings.upsert({
        where: { adminId: admin.id },
        create: { ...input, adminId : admin.id },
        update: { ...input, adminId : admin.id  },
      });
    }),

  updateAdminBorrowBookDayCount: protectedProcedure
    .input(z.object({ dayCount: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const admin = await ctx.db.admin.findFirst();
      if (!admin) {
        throw new Error("Admin not found");
      }
      return await ctx.db.borrowDueDateSettings.upsert({
        where: { adminId: admin.id },
        create: { ...input, adminId : admin.id },
        update: { ...input, adminId : admin.id  },
      });
    }),
});
