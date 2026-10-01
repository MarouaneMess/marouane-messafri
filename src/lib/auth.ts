import "server-only";
import { getServerSession, type NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { db } from "./db";
import { allowedAdmin } from "./identity";
import { redirect } from "next/navigation";
export const authConfigured = Boolean(
  process.env.GITHUB_CLIENT_ID &&
  process.env.GITHUB_CLIENT_SECRET &&
  process.env.NEXTAUTH_SECRET &&
  (process.env.ADMIN_GITHUB_ID ||
    process.env.ADMIN_GITHUB_USERNAME ||
    process.env.ADMIN_EMAIL),
);
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      authorization: { params: { scope: "read:user user:email" } },
    }),
  ],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  useSecureCookies: process.env.NEXTAUTH_URL?.startsWith("https://") ?? false,
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    async signIn({ profile, account, user }) {
      if (!authConfigured || account?.provider !== "github" || !profile)
        return false;
      const github = profile as { id?: number; login?: string };
      let verifiedEmail: string | undefined;
      if (
        process.env.ADMIN_EMAIL &&
        !process.env.ADMIN_GITHUB_ID &&
        !process.env.ADMIN_GITHUB_USERNAME
      ) {
        try {
          const response = await fetch("https://api.github.com/user/emails", {
            headers: {
              Authorization: `Bearer ${account.access_token}`,
              Accept: "application/vnd.github+json",
            },
            signal: AbortSignal.timeout(8000),
            cache: "no-store",
          });
          if (!response.ok) return false;
          const emails: { email: string; verified: boolean }[] =
            await response.json();
          verifiedEmail = emails.find(
            (e) =>
              e.verified &&
              e.email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase(),
          )?.email;
        } catch {
          return false;
        }
      }
      user.verifiedEmail = verifiedEmail;
      return allowedAdmin({
        githubId: String(github.id ?? ""),
        login: github.login,
        verifiedEmail,
      });
    },
    async jwt({ token, account, profile, user }) {
      if (account?.provider === "github" && profile) {
        const github = profile as { id?: number; login?: string };
        token.githubId = String(github.id ?? "");
        token.login = github.login;
        token.verifiedEmail = user?.verifiedEmail;
      }
      return token;
    },
    async session({ session, token }) {
      session.identity = {
        githubId: token.githubId,
        login: token.login,
        verifiedEmail: token.verifiedEmail,
      };
      return session;
    },
    async redirect({ url, baseUrl }) {
      const target = new URL(url, baseUrl);
      return target.origin === new URL(baseUrl).origin
        ? target.toString()
        : baseUrl;
    },
  },
  logger: {
    error(code) {
      console.error("Authentication error:", code);
    },
    warn(code) {
      console.warn("Authentication warning:", code);
    },
    debug() {},
  },
};
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function requireAdmin() {
  if (!process.env.NEXTAUTH_SECRET)
    throw new HttpError(401, "Authentification requise.");
  const session = await getServerSession(authOptions);
  if (!session?.identity?.githubId)
    throw new HttpError(401, "Authentification requise.");
  if (!allowedAdmin(session.identity))
    throw new HttpError(403, "Accès non autorisé.");
  const user = await db.user.upsert({
    where: { githubId: session.identity.githubId },
    update: {},
    create: {
      githubId: session.identity.githubId,
      name: session.user?.name ?? session.identity.login ?? "Admin",
      email: session.identity.verifiedEmail ?? null,
    },
  });
  if (user.role !== "ADMIN")
    throw new HttpError(403, "Droits administrateur requis.");
  return user;
}
export async function requirePageAdmin() {
  try {
    return await requireAdmin();
  } catch (error) {
    if (
      error instanceof HttpError &&
      (error.status === 401 || error.status === 403)
    )
      redirect("/login");
    throw error;
  }
}
