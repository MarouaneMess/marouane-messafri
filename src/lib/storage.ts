import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "./db";
// Portable PostgreSQL storage. Replace this adapter to store binaries in an object store.
export const mediaStorage = {
  async put(
    image: {
      data: Uint8Array;
      size: number;
      width: number;
      height: number;
      mimeType: string;
    },
    label: string,
  ) {
    const id = randomUUID();
    await db.media.create({
      data: {
        ...image,
        data: new Uint8Array(image.data),
        id,
        name: label.slice(0, 180),
      },
    });
    return { id, url: `/api/media/${id}` };
  },
  async get(id: string) {
    return db.media.findUnique({ where: { id } });
  },
};
