import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { addDays } from "date-fns";
import { isDateBAfterDateA } from "@/lib/utils";

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
        thesisPhoto: z.string(),
      }),
    )
    .mutation(
      async ({
        ctx,
        input: {
          id,
          title,
          abstract,
          year,
          members,
          courseCode,
          tagIds,
          thesisPhoto,
        },
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
              deleteMany : {},
              createMany: {
                data: tagIds.map((tagId) => ({ tagId })),
              },
            },
          },
        });
      },
    ),
  getThesisByQR: protectedProcedure
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
          StudentBorrows: {
            where: {
              status: { not: "RETURNED" },
            },
            include: { Student: true },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
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
  confirmThesisBorrow: protectedProcedure
    .input(
      z.object({
        thesisBorrowId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input: { thesisBorrowId } }) => {
      const settings = await ctx.db.admin.findFirst({
        include: { BorrowDueDateSettings: true },
      });
      return await ctx.db.studentBorrow.update({
        where: {
          id: thesisBorrowId,
        },
        data: {
          status: "BORROWED",
          borrowedAt: new Date(),
          borrowDueAt: addDays(
            new Date(),
            settings?.BorrowDueDateSettings?.dayCount || 3,
          ),
        },
      });
    }),
  confirmThesisReturn: protectedProcedure
    .input(
      z.object({
        thesisBorrowId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input: { thesisBorrowId } }) => {
      const borrow = await ctx.db.studentBorrow.findUnique({
        where: {
          id: thesisBorrowId,
        },
      });

      if (!borrow) throw new Error("No Borrow Found");
      const returnedAt = new Date();
      const borrowDueAt = borrow.borrowDueAt || new Date();
      const isPenalty = isDateBAfterDateA(borrowDueAt, returnedAt);
      return await ctx.db.studentBorrow.update({
        where: {
          id: thesisBorrowId,
        },
        data: {
          status: "RETURNED",
          returnedAt,
          isPenalty,
        },
      });
    }),
});
