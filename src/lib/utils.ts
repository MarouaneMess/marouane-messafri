export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
export function readingTime(text: string) {
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 220));
}
export function formatDate(value?: string | Date | null) {
  return value
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(value))
    : "";
}
export function isPublic(record: {
  status: string;
  deletedAt?: Date | string | null;
  publishedAt?: Date | string | null;
  hidden?: boolean;
}) {
  return (
    record.status === "PUBLISHED" &&
    !record.deletedAt &&
    !record.hidden &&
    (!record.publishedAt ||
      new Date(record.publishedAt).getTime() <= Date.now())
  );
}
