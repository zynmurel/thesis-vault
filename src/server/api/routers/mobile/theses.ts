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
        take: z.number(),
      }),
    )
    .query(async ({ ctx, input: { tags, year, courseCodes, title, take } }) => {
      const whereCourseCode = courseCodes.length
        ? {
            courseCode: {
              in: courseCodes,
            },
          }
        : {};

      const whereYear = year.length
        ? {
            year: {
              in: year,
            },
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

      const theses = await ctx.db.theses.findMany({
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
          Course: true,
          Ratings: true,
        },
        take,
      });

      return theses.map((t) => {
        return {
          ...t,
          averageRating: t.Ratings.length
            ? t.Ratings.reduce((a, c) => a + c.stars, 0) / t.Ratings.length
            : 0,
        };
      });
    }),

  getThesis: publicProcedure
    .input(
      z.object({
        thesisId: z.string(),
      }),
    )
    .query(async ({ ctx, input: { thesisId } }) => {
      const t = await ctx.db.theses.findUnique({
        where: {
          id: thesisId,
        },
        include: {
          Tags: {
            include: {
              Tag: true,
            },
          },
          Course: true,
          Ratings: true,
        },
      });

      return t
        ? {
            ...t,
            averageRating: t.Ratings.length
              ? t.Ratings.reduce((a, c) => a + c.stars, 0) / t.Ratings.length
              : 0,
          }
        : null;
    }),

  getThesisComments: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
        thesisId: z.string(),
      }),
    )
    .query(async ({ ctx, input: { thesisId, studentId } }) => {
      return await ctx.db.thesesComments.findMany({
        where: {
          thesisId,
        },
        include: {
          Student: {
            include: {
              Ratings: {
                where: {
                  thesisId,
                },
              },
            },
          },
        },
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

  putThesisInBag: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
        thesisId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { thesisId, studentId } }) => {
      return await ctx.db.studentBag.create({
        data: {
          thesisId,
          studentId,
        },
      });
    }),
});
