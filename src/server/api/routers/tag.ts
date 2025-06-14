
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

export const tagsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.tags.findMany()
  })
});
