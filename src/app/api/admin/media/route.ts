import { HttpError, requireAdmin } from "@/lib/auth";
import { checkOrigin, errorResponse } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { validateImage } from "@/lib/upload";
import { mediaStorage } from "@/lib/storage";
export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    checkOrigin(request);
    await rateLimit(`upload:${user.id}`, 20, 300);
    const reader = request.body?.getReader();
    if (!reader) throw new HttpError(400, "Fichier manquant.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 5 * 1024 * 1024 + 10000) {
        await reader.cancel();
        throw new HttpError(413, "Fichier trop volumineux.");
      }
      chunks.push(value);
    }
    const form = await new Response(Buffer.concat(chunks), {
      headers: { "content-type": request.headers.get("content-type") || "" },
    }).formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new HttpError(400, "Image manquante.");
    let image;
    try {
      image = await validateImage(file);
    } catch (e) {
      throw new HttpError(
        400,
        e instanceof Error ? e.message : "Image invalide.",
      );
    }
    return Response.json(await mediaStorage.put(image, file.name), {
      status: 201,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
