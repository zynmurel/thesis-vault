import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { title } from "process";
import { years } from "@/utils/year";

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
      const whereTags = tags.length
        ? {
            Tags: {
              some: {
                tagId: { in: tags },
              },
            },
          }
        : {};
      return await ctx.db.theses.findMany({
        where: {
          title: { contains: title, mode: "insensitive" },
          ...whereCourseCode,
          ...whereTags,
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
      const whereTags = tags.length
        ? {
            Tags: {
              some: {
                tagId: { in: tags },
              },
            },
          }
        : {};
      console.log({ courseCode, title, tags });
      return await ctx.db.theses.count({
        where: {
          title: { contains: title, mode: "insensitive" },
          ...whereCourseCode,
          ...whereTags,
        },
      });
    }),
  upsertTheses: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        title: z.string(),
        abstract: z.string(),
        year: z.string(),
        members: z.string(),
        courseCode: z.string(),
        tagIds: z.number().array(),
        thesisPhoto : z.string()
      }),
    )
    .mutation(
      async ({
        ctx,
        input: { id, title, abstract, year, members, courseCode, tagIds, thesisPhoto },
      }) => {
        if (id) {
          await ctx.db.thesesTags.deleteMany({
            where: {
              thesisId: id,
            },
          });
        }
        return await ctx.db.theses.upsert({
          where: { id: id || "" },
          create: {
            title,
            abstract,
            year: new Date(year),
            members,
            courseCode,
            thesisPhoto,
            Tags: {
              createMany: {
                data: tagIds.map((tagId) => ({ tagId })),
              },
            },
          },
          update: {
            title,
            abstract,
            year: new Date(year),
            members,
            courseCode,
            thesisPhoto,
            Tags: {
              createMany: {
                data: tagIds.map((tagId) => ({ tagId })),
              },
            },
          },
        });
      },
    ),
});
