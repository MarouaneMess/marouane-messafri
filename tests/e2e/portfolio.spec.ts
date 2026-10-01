import { test, expect, type BrowserContext } from "@playwright/test";
import { encode } from "next-auth/jwt";
import sharp from "sharp";
import AxeBuilder from "@axe-core/playwright";
const base = "http://localhost:3100";
async function session(context: BrowserContext, githubId = "test-admin-001") {
  const token = await encode({
    secret: process.env.TEST_AUTH_SECRET!,
    maxAge: 3600,
    token: { sub: githubId, githubId, login: "test-owner", name: "Test owner" },
  });
  await context.addCookies([
    {
      name: "next-auth.session-token",
      value: token,
      url: base,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}
test("public pages, 404s and unpublished file articles", async ({
  page,
  request,
}) => {
  for (const path of [
    "/",
    "/about",
    "/projects",
    "/projects/vulscan",
    "/security",
    "/security/cve-2026-92711",
    "/blog",
    "/blog/build-break-secure",
    "/services",
    "/contact",
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator("h1").first()).toBeVisible();
  }
  for (const path of [
    "/projects/nonexistent",
    "/blog/my-first-cve",
    "/blog/nonexistent",
    "/security/nonexistent",
  ])
    expect((await request.get(path)).status(), path).toBe(404);
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain(
    "my-first-cve",
  );
});
test("anonymous users cannot reach admin pages or mutation endpoints", async ({
  page,
  request,
}) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
  for (const path of [
    "/api/admin/posts",
    "/api/admin/projects",
    "/api/admin/security",
    "/api/admin/media",
    "/api/admin/taxonomy",
  ]) {
    const response = await request.post(path, {
      headers: { Origin: base },
      data: {},
    });
    expect(response.status(), path).toBe(401);
  }
  expect(
    (
      await request.put("/api/admin/settings", {
        headers: { Origin: base },
        data: {},
      })
    ).status(),
  ).toBe(401);
  expect((await request.get("/api/admin/export")).status()).toBe(401);
  await page.goto("/admin/preview/posts/unknown");
  await expect(page).toHaveURL(/\/login/);
});
test("authenticated non-administrator is rejected", async ({
  page,
  context,
}) => {
  await session(context, "unapproved-user");
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
  expect(
    (
      await context.request.post("/api/admin/posts", {
        headers: { Origin: base },
        data: {},
      })
    ).status(),
  ).toBe(403);
});
test("admin draft, autosave, private preview, publish, unpublish and restore workflow", async ({
  page,
  context,
}) => {
  await session(context);
  await page.goto("/admin/posts/new?type=WRITEUP");
  await expect(
    page.getByRole("heading", { name: "Une nouvelle idée." }),
  ).toBeVisible();
  const title = `Journal de test ${Date.now()}`;
  const slug = title.toLowerCase().replaceAll(" ", "-");
  await page.getByLabel("Titre", { exact: true }).fill(title);
  await page
    .getByLabel("Résumé", { exact: true })
    .fill("Un article de test pour vérifier le cycle de publication.");
  await page
    .getByLabel("Contenu Markdown")
    .fill(
      '## Une note de travail\n\nUn contenu réservé au brouillon.\n\n```json\n{"ready": true}\n```',
    );
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Enregistré");
  await expect(page).toHaveURL(/\/admin\/posts\/c/);
  const id = page.url().split("/").pop()!;
  expect((await context.request.get(`/blog/${slug}`)).status()).toBe(404);
  expect(await (await context.request.get("/api/search")).text()).not.toContain(
    slug,
  );
  await page
    .getByLabel("Contenu Markdown")
    .fill(
      "## Une note enregistrée\n\nLe brouillon a été enregistré automatiquement.",
    );
  await expect(page.getByRole("status")).toHaveText("Enregistré");
  const preview = await context.request.get(`/admin/preview/posts/${id}`);
  expect(preview.status()).toBe(200);
  expect(await preview.text()).toContain(
    "Le brouillon a été enregistré automatiquement.",
  );
  await page.getByRole("button", { name: "Publier", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Enregistré");
  const publicPage = await context.request.get(`/blog/${slug}`);
  expect(publicPage.status()).toBe(200);
  expect(await publicPage.text()).toContain(title);
  expect(await (await context.request.get("/api/search")).text()).toContain(
    slug,
  );
  await page.getByRole("button", { name: "Dépublier", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Enregistré");
  expect((await context.request.get(`/blog/${slug}`)).status()).toBe(404);
  await page.getByRole("button", { name: "Supprimer le contenu" }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page
    .getByRole("button", { name: "Déplacer dans la corbeille" })
    .click();
  await expect(page).toHaveURL(/\/admin\/posts$/);
  await page.goto("/admin/trash");
  const row = page.getByRole("row").filter({ hasText: title });
  await row.getByRole("button", { name: "Restaurer" }).click();
  await expect(row).toHaveCount(0);
  expect((await context.request.get(`/blog/${slug}`)).status()).toBe(404);
});
test("mutations validate session, origin, values, unique slugs, versions, uploads and exports", async ({
  context,
}) => {
  await session(context);
  const request = context.request;
  const headers = { Origin: base };
  const slug = `integration-project-${Date.now()}`;
  expect(
    (await request.post("/api/admin/projects", { data: {} })).status(),
  ).toBe(403);
  expect(
    (await request.post("/api/admin/projects", { headers, data: {} })).status(),
  ).toBe(400);
  const payload = {
    title: "Integration project",
    slug,
    description: "Projet utilisé uniquement pour la validation locale.",
    status: "DRAFT",
  };
  const created = await request.post("/api/admin/projects", {
    headers,
    data: payload,
  });
  expect(created.status()).toBe(201);
  const project = await created.json();
  expect(
    (
      await request.post("/api/admin/projects", { headers, data: payload })
    ).status(),
  ).toBe(409);
  expect((await request.get(`/projects/${slug}`)).status()).toBe(404);
  const published = await request.put(`/api/admin/projects/${project.id}`, {
    headers,
    data: { ...payload, version: project.version, status: "PUBLISHED" },
  });
  expect(published.status()).toBe(200);
  expect((await request.get(`/projects/${slug}`)).status()).toBe(200);
  expect(
    (
      await request.put(`/api/admin/projects/${project.id}`, {
        headers,
        data: { ...payload, version: 1 },
      })
    ).status(),
  ).toBe(409);
  expect(
    (
      await request.post("/api/admin/media", {
        headers,
        multipart: {
          file: {
            name: "notes.txt",
            mimeType: "text/plain",
            buffer: Buffer.from("A harmless text document."),
          },
        },
      })
    ).status(),
  ).toBe(400);
  const buffer = await sharp({
    create: { width: 80, height: 60, channels: 3, background: "#78e7d2" },
  })
    .png()
    .toBuffer();
  const media = await request.post("/api/admin/media", {
    headers,
    multipart: { file: { name: "sample.png", mimeType: "image/png", buffer } },
  });
  expect(media.status()).toBe(201);
  const image = await request.get((await media.json()).url);
  expect(image.headers()["content-type"]).toBe("image/webp");
  const research = await request.post("/api/admin/security", {
    headers,
    data: {
      title: "Recherche de test",
      slug: `research-${Date.now()}`,
      description: "Une fiche destinée au test local.",
      status: "PUBLISHED",
      timeline: [
        {
          label: "Documentation",
          date: "",
          description: "Création de la fiche.",
        },
      ],
    },
  });
  expect(research.status()).toBe(201);
  const exportData = await (await request.get("/api/admin/export")).json();
  expect(exportData.posts).toBeDefined();
  expect(exportData).not.toHaveProperty("users");
  expect(exportData).not.toHaveProperty("sessions");
  expect(JSON.stringify(exportData)).not.toContain(
    process.env.TEST_AUTH_SECRET!,
  );
  await request.delete(`/api/admin/projects/${project.id}`, { headers });
  await request.delete(`/api/admin/security/${(await research.json()).id}`, {
    headers,
  });
});
test("search, contact fallback and mobile navigation work", async ({
  page,
}) => {
  await page.goto("/projects");
  await page
    .getByRole("textbox", { name: "Rechercher un projet" })
    .fill("Vulscan");
  await expect(page.locator(".project-card")).toHaveCount(1);
  await page
    .getByRole("textbox", { name: "Rechercher un projet" })
    .fill("No matching project 123");
  await expect(
    page.getByText("Aucun résultat", { exact: false }),
  ).toBeVisible();
  await page.goto("/contact");
  await page.getByLabel("Votre nom").fill("Test Person");
  await page.getByLabel("Votre email").fill("test@example.com");
  await page
    .getByLabel("Votre message")
    .fill("Bonjour, je souhaite échanger sur un projet de développement.");
  await page.getByRole("button", { name: "Préparer mon email" }).click();
  await expect(
    page.getByRole("link", { name: "Ouvrir ma messagerie" }),
  ).toHaveAttribute("href", /^mailto:marouanemessafri3@gmail.com/);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  await page
    .getByRole("navigation", { name: "Navigation mobile" })
    .getByRole("link", { name: "Projets" })
    .click();
  await expect(page).toHaveURL(/\/projects$/);
});
test("responsive pages have no horizontal overflow or browser errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of [
      "/",
      "/projects",
      "/blog/build-break-secure",
      "/security",
      "/contact",
    ]) {
      await page.goto(path);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${path} at ${width}px`,
      ).toBe(true);
    }
    await page.goto("/");
    for (const item of await page.locator(".reveal-item").all())
      await item.scrollIntoViewIfNeeded();
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: `.local/screenshots/home-${width}.png`,
      fullPage: true,
    });
  }
  expect(errors).toEqual([]);
});

test("accessibility and production headers", async ({ page, context }) => {
  for (const path of [
    "/",
    "/projects",
    "/blog/build-break-secure",
    "/contact",
    "/login",
  ]) {
    const response = await page.goto(path);
    expect(response?.headers()["content-security-policy"]).toContain(
      "script-src 'self' 'nonce-",
    );
    expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect
      .soft(
        results.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
        path,
      )
      .toEqual([]);
  }
  await session(context);
  for (const path of [
    "/admin",
    "/admin/posts/new",
    "/admin/projects/new",
    "/admin/security/new",
    "/admin/settings",
    "/admin/media",
    "/admin/taxonomy",
  ]) {
    await page.goto(path);
    await expect(page.locator("h1").first()).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect
      .soft(
        results.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
        path,
      )
      .toEqual([]);
  }
  await page.goto("/admin");
  await page.screenshot({
    path: ".local/screenshots/admin-desktop.png",
    fullPage: true,
  });
});

test("3D perspectives, pause and reduced-motion experience", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".interactive-core")).toHaveAttribute(
    "data-ready",
    "true",
    { timeout: 20000 },
  );
  await page.getByRole("button", { name: "02 Break" }).click();
  await expect(page.locator(".interactive-core")).toHaveAttribute(
    "data-mode",
    "break",
  );
  await expect(
    page.getByText("Changer de perspective.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "03 Secure" }).click();
  await expect(
    page.getByText("La confiance se construit.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /animation 3D en pause/ }).click();
  await expect(
    page.getByRole("button", { name: /Reprendre.*animation 3D/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "01 Build" }).click();
  await page.screenshot({ path: ".local/screenshots/hero-3d.png" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.locator(".reveal-item")).toHaveCount(0);
  await page.getByRole("button", { name: "02 Break" }).click();
  await expect(
    page.getByText("Changer de perspective.", { exact: true }),
  ).toBeVisible();
});

test("database rate limiting caps repeated upload attempts", async ({
  context,
}) => {
  await session(context);
  let status = 0;
  for (let i = 0; i < 22; i++) {
    const response = await context.request.post("/api/admin/media", {
      headers: { Origin: base },
      multipart: {
        file: {
          name: "note.txt",
          mimeType: "text/plain",
          buffer: Buffer.from("A text note, not an image."),
        },
      },
    });
    status = response.status();
    if (status === 429) break;
    expect(status).toBe(400);
  }
  expect(status).toBe(429);
});
