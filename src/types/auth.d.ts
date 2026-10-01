import "next-auth";
import "next-auth/jwt";
declare module "next-auth" {
  interface Session {
    identity: { githubId?: string; login?: string; verifiedEmail?: string };
  }
  interface User {
    verifiedEmail?: string;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    githubId?: string;
    login?: string;
    verifiedEmail?: string;
  }
}
