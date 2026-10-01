import NextAuth from "next-auth";
import { authConfigured, authOptions } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/http";
import type { NextRequest } from "next/server";
const handler = NextAuth(authOptions);
type Context = { params: Promise<{ nextauth: string[] }> };
async function auth(request: NextRequest, context: Context) {
  if (!authConfigured)
    return Response.json(
      { error: "Connexion GitHub à configurer." },
      { status: 503 },
    );
  try {
    const params = await context.params;
    if (params.nextauth[0] !== "session")
      await rateLimit(`login:${clientKey(request)}`, 40, 300);
    return await handler(request, { params });
  } catch (error) {
    return errorResponse(error);
  }
}
export { auth as GET, auth as POST };
