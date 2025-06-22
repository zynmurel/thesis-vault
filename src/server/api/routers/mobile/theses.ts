import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const mobileThesesRouter = createTRPCRouter({
  getFilters: publicProcedure.query(async ({ ctx }) => {
    const data = await Promise.all([
      ctx.db.course.findMany(),
      ctx.db.tags.findMany(),
    ]);
    return {
      courses: data[0],
      tags: data[1],
    };
  }),
  getTheses: publicProcedure
    .input(
      z.object({
        title: z.string(),
        tags: z.array(z.number()),
        year: z.array(z.string()),
        courseCodes: z.array(z.string()),
        take : z.number()
      }),
    )
    .query(async ({ ctx, input: { tags, year, courseCodes, title, take } }) => {
        console.log(tags)
      const whereCourseCode = courseCodes.length
        ? {
            courseCode: {
              in: courseCodes,
            },
          }
        : {};

      const whereYear = year.length
        ? {
          year : {
            in : year
          }
          }
        : {};

      const whereTags = tags.length
        ? {
            Tags: {
              some: {
                tagId: { in: tags },
              },
            },
          }
        : {};

        console.log(whereTags)

      return await ctx.db.theses.findMany({
        where: {
          title: { contains: title, mode: "insensitive" },
          ...whereCourseCode,
          ...whereYear,
          ...whereTags,
        },
        include: {
          Tags: {
            include: {
              Tag: true,
            },
          },
          Course : true
        },
        take
      });
    }),
});
