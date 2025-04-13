import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "~/server/db";
import { UserRole, ApprovalStatus } from "@prisma/client";

// Using a simple hash for development purposes
const simpleHash = (str: string) => {
  return Buffer.from(`${str}_hashed`).toString('base64');
};

const simpleCompare = (plainText: string, hashedText: string) => {
  return simpleHash(plainText) === hashedText;
};

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
      approvalStatus: ApprovalStatus;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    approvalStatus: ApprovalStatus;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.approvalStatus = user.approvalStatus;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
        role: token.role as UserRole,
        approvalStatus: token.approvalStatus as ApprovalStatus,
      },
    }),
    authorized: ({ auth, request }) => {
      const user = auth?.user;
      const isOnAdminPanel = request.nextUrl?.pathname.startsWith("/admin");
      const isOnUstadzPanel = request.nextUrl?.pathname.startsWith("/ustadz");
      const isOnSantriPanel = request.nextUrl?.pathname.startsWith("/santri");
      const isOnAuthPages = request.nextUrl?.pathname.startsWith("/auth");

      // Allow unauthenticated users to access auth pages
      if (isOnAuthPages) return true;

      // Require authentication for all other pages
      if (!user) return false;

      // Only approved users can access their respective panels
      if (user.approvalStatus !== "APPROVED") {
        return request.nextUrl?.pathname === "/pending-approval";
      }

      // Role-based access control
      if (isOnAdminPanel && user.role !== "ADMIN") return false;
      if (isOnUstadzPanel && user.role !== "USTADZ") return false;
      if (isOnSantriPanel && user.role !== "SANTRI") return false;

      return true;
    },
  },
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = simpleCompare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          approvalStatus: user.approvalStatus,
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
} satisfies NextAuthConfig;
