"use client";
import { signIn, signOut } from "next-auth/react";
import { Github, LogOut } from "lucide-react";
export function LoginButton() {
  return (
    <button
      className="button"
      onClick={() => signIn("github", { callbackUrl: "/admin" })}
    >
      <Github size={18} /> Se connecter avec GitHub
    </button>
  );
}
export function LogoutButton() {
  return (
    <button
      className="admin-logout"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut size={16} /> Déconnexion
    </button>
  );
}
