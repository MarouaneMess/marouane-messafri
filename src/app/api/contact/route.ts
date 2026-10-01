import { contactSchema } from "@/lib/validation";
import { checkOrigin, errorResponse, readJson } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { getSettings } from "@/lib/content";
import { HttpError } from "@/lib/auth";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const input = contactSchema.parse(await readJson(request, 15000));
    const settings = await getSettings();
    if (!settings.contactEmail)
      throw new HttpError(
        503,
        "Les coordonnées de contact seront bientôt disponibles.",
      );
    const subject = `[Portfolio · ${input.subject}] ${input.name}`;
    const body = `Nom : ${input.name}\nEmail : ${input.email}\nEntreprise : ${input.company || "—"}\n\n${input.message}`;
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM)
      return Response.json({
        mailto: `mailto:${settings.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      });
    await rateLimit(`contact:${clientKey(request)}`, 5, 3600);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM,
        to: settings.contactEmail,
        reply_to: input.email,
        subject,
        text: body,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok)
      throw new HttpError(
        503,
        "Envoi indisponible. Vous pouvez utiliser le lien email direct.",
      );
    return Response.json({ sent: true });
  } catch (e) {
    return errorResponse(e);
  }
}
