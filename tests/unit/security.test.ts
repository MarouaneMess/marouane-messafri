import { describe, it, expect } from "vitest";
import { allowedAdmin } from "../../src/lib/identity";
import {
  postSchema,
  projectSchema,
  researchSchema,
  settingsSchema,
  contactSchema,
} from "../../src/lib/validation";
import { isPublic, slugify } from "../../src/lib/utils";
import { validateImage } from "../../src/lib/upload";
import { getHeadings } from "../../src/lib/headings";
import sharp from "sharp";
describe("Administrator identity", () => {
  it("denies by default without an allowlist", () =>
    expect(allowedAdmin({ githubId: "1" }, {})).toBe(false));
  it("prioritizes an immutable ID over a matching username", () =>
    expect(
      allowedAdmin(
        { githubId: "2", login: "admin" },
        { ADMIN_GITHUB_ID: "1", ADMIN_GITHUB_USERNAME: "admin" },
      ),
    ).toBe(false));
  it("accepts only the configured identity", () => {
    expect(allowedAdmin({ githubId: "1" }, { ADMIN_GITHUB_ID: "1" })).toBe(
      true,
    );
    expect(
      allowedAdmin({ login: "someone" }, { ADMIN_GITHUB_USERNAME: "admin" }),
    ).toBe(false);
  });
  it("email authorization requires a verified email", () => {
    expect(allowedAdmin({}, { ADMIN_EMAIL: "admin@example.com" })).toBe(false);
    expect(
      allowedAdmin(
        { verifiedEmail: "ADMIN@example.com" },
        { ADMIN_EMAIL: "admin@example.com" },
      ),
    ).toBe(true);
  });
});
describe("Public visibility", () => {
  it.each(["DRAFT", "ARCHIVED"])("never exposes %s", (status) =>
    expect(isPublic({ status })).toBe(false),
  );
  it("excludes deleted, hidden and future content", () => {
    expect(isPublic({ status: "PUBLISHED", deletedAt: new Date() })).toBe(
      false,
    );
    expect(isPublic({ status: "PUBLISHED", hidden: true })).toBe(false);
    expect(
      isPublic({
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() + 100000),
      }),
    ).toBe(false);
  });
});
describe("Validation", () => {
  it("rejects invalid slugs and unknown author/role fields", () => {
    expect(
      postSchema.safeParse({
        title: "Test",
        slug: "../test",
        excerpt: "Résumé test",
        content: "",
      }).success,
    ).toBe(false);
    expect(
      postSchema.safeParse({
        title: "Test",
        slug: "test",
        excerpt: "Résumé test",
        content: "",
        authorId: "other",
      }).success,
    ).toBe(false);
  });
  it("rejects unsupported URLs, images and CVSS values", () => {
    expect(
      projectSchema.safeParse({
        title: "Test",
        slug: "test",
        description: "Projet de test",
        demoUrl: "file:///local",
      }).success,
    ).toBe(false);
    expect(
      postSchema.safeParse({
        title: "Test",
        slug: "test",
        excerpt: "Résumé test",
        content: "",
        coverImage: "https://external.example/image.svg",
      }).success,
    ).toBe(false);
    expect(
      researchSchema.safeParse({
        title: "Test",
        slug: "test",
        description: "Research test",
        cvss: 11,
      }).success,
    ).toBe(false);
  });
  it("rejects secrets in settings and incomplete contact messages", () => {
    expect(
      settingsSchema.safeParse({
        heroMessage: "Hello",
        availability: true,
        contactEmail: "",
        github: "",
        linkedin: "",
        secret: "x",
      }).success,
    ).toBe(false);
    expect(
      contactSchema.safeParse({
        name: "Test",
        email: "invalid",
        subject: "Autre",
        message: "Hello",
      }).success,
    ).toBe(false);
  });
  it("generates portable slugs", () =>
    expect(slugify("Écrire ma première CVE !")).toBe("ecrire-ma-premiere-cve"));
});
describe("Image processing", () => {
  it("rejects unsupported files", async () => {
    await expect(
      validateImage(
        new File(["plain text"], "notes.txt", { type: "text/plain" }),
      ),
    ).rejects.toThrow("Formats");
  });
  it("rejects a non-image renamed as a PNG", async () => {
    await expect(
      validateImage(
        new File(["plain text"], "image.png", { type: "image/png" }),
      ),
    ).rejects.toThrow();
  });
  it("rejects oversize files", async () => {
    await expect(
      validateImage(
        new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.png", {
          type: "image/png",
        }),
      ),
    ).rejects.toThrow("5 Mo");
  });
  it("re-encodes and bounds legitimate images", async () => {
    const buffer = await sharp({
      create: { width: 100, height: 80, channels: 3, background: "#78e7d2" },
    })
      .png()
      .toBuffer();
    const image = await validateImage(
      new File([new Uint8Array(buffer)], "image.png", { type: "image/png" }),
    );
    expect(image.mimeType).toBe("image/webp");
    expect(image.width).toBe(100);
    expect((await sharp(image.data).metadata()).format).toBe("webp");
  });
});
it("table of contents ignores fenced code and deduplicates headings", () => {
  expect(
    getHeadings("## Hello\n```md\n## Not a heading\n```\n## Hello"),
  ).toEqual([
    { text: "Hello", id: "hello" },
    { text: "Hello", id: "hello-1" },
  ]);
});
