import { postRouter } from "@/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { tagsRouter } from "./routers/tag";
import { coursesRouter } from "./routers/course";
import { thesesRouter } from "./routers/theses";
import { studentsRouter } from "./routers/students";
import { mobileThesesRouter } from "./routers/mobile/theses";
import { mobileStudentRouter } from "./routers/mobile/student";
import { borrowsRouter } from "./routers/borrows";
import { dashboardRouter } from "./routers/dashboard";
import { settingsRouter } from "./routers/settings";
import { reportRouter } from "./routers/reports";
import { mobileNotificationRouter } from "./routers/mobile/notification";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  theses: thesesRouter,
  tags: tagsRouter,
  courses: coursesRouter,
  students: studentsRouter,
  borrows: borrowsRouter,
  dashboard: dashboardRouter,
  settings: settingsRouter,
  report: reportRouter,
  mobile: {
    student: mobileStudentRouter,
    theses: mobileThesesRouter,
    notification: mobileNotificationRouter,
  },
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
