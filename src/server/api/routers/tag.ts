import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const tagsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.tags.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });
  }),
  getById: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    return ctx.db.tags.findUnique({
      where: { id: input },
    });
  }),

  upsert: protectedProcedure
    .input(
      z.object({
        id: z.number().optional(),
        tag: z.string().min(1, "Tag name is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.id) {
        return ctx.db.tags.update({
          where: { id: input.id },
          data: { tag: input.tag },
        });
      }
      return ctx.db.tags.create({
        data: { tag: input.tag },
      });
    }),

  delete: protectedProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
    return ctx.db.tags.delete({
      where: { id: input },
    });
  }),
});
