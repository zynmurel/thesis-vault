// src/types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      name?: string | null;
      email?: string | null;
    };
  }

  interface User {
    id: number;
    name?: string | null;
    email?: string | null;
  }
}
