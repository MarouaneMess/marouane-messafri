export type Identity = {
  githubId?: string;
  login?: string;
  verifiedEmail?: string;
};
export function allowedAdmin(
  identity: Identity,
  config: Record<string, string | undefined> = process.env,
): boolean {
  if (config.ADMIN_GITHUB_ID)
    return identity.githubId === config.ADMIN_GITHUB_ID;
  if (config.ADMIN_GITHUB_USERNAME)
    return (
      identity.login?.toLowerCase() ===
      config.ADMIN_GITHUB_USERNAME.toLowerCase()
    );
  if (config.ADMIN_EMAIL)
    return (
      identity.verifiedEmail?.toLowerCase() === config.ADMIN_EMAIL.toLowerCase()
    );
  return false;
}
