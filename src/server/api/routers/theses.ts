import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

export const thesesRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        tags: z.number().array(),
        courseCode: z.string(),
        title: z.string(),
        skip: z.number(),
        take: z.number(),
      }),
    )
    .query(async ({ ctx, input: { skip, take, courseCode, title, tags } }) => {
      const whereCourseCode = courseCode === "ALL" ? {} : { courseCode };
      console.log({ skip, take, courseCode, title, tags });
      return await ctx.db.theses.findMany({
        where: {
          title,
          ...whereCourseCode,
          Tags: {
            some: {
              tagId: { in: tags },
            },
          },
        },
        skip,
        take,
        include: {
          Tags: {
            include: {
              Tag: true,
            },
          },
        },
      });
    }),
  getCount: protectedProcedure
    .input(
      z.object({
        tags: z.number().array(),
        courseCode: z.string(),
        title: z.string(),
      }),
    )
    .query(async ({ ctx, input: { courseCode, title, tags } }) => {
      const whereCourseCode = courseCode === "ALL" ? {} : { courseCode };
      const whereTags = tags.length ? {Tags: {
            some: {
              tagId: { in: tags },
            },
          }} : {}
      console.log({ courseCode, title, tags });
      return await ctx.db.theses.count({
        where: {
          title : { contains : title, mode : "insensitive" },
          ...whereCourseCode,
          ...whereTags
        },
      });
    }),
});
