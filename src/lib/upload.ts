import sharp from "sharp";
const allowed = new Map([
  ["image/jpeg", ["jpg", "jpeg"]],
  ["image/png", ["png"]],
  ["image/webp", ["webp"]],
  ["image/avif", ["avif"]],
]);
export async function validateImage(file: File) {
  if (file.size === 0 || file.size > 5 * 1024 * 1024)
    throw new Error("La taille maximale est de 5 Mo.");
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  if (!allowed.get(file.type)?.includes(extension))
    throw new Error("Formats autorisés : JPEG, PNG, WebP et AVIF.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const pipeline = sharp(bytes, {
    limitInputPixels: 25_000_000,
    animated: false,
  });
  const metadata = await pipeline.metadata();
  const expected =
    file.type === "image/avif" ? "heif" : file.type.split("/")[1];
  if (metadata.format !== expected || (metadata.pages ?? 1) > 1)
    throw new Error(
      "Le contenu du fichier ne correspond pas à une image autorisée.",
    );
  if (
    !metadata.width ||
    !metadata.height ||
    metadata.width < 32 ||
    metadata.height < 32
  )
    throw new Error("L’image doit mesurer au moins 32 × 32 pixels.");
  const result = await pipeline
    .rotate()
    .resize({
      width: 2400,
      height: 2400,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 85 })
    .toBuffer({ resolveWithObject: true });
  return {
    data: new Uint8Array(result.data),
    size: result.info.size,
    width: result.info.width,
    height: result.info.height,
    mimeType: "image/webp",
  };
}
