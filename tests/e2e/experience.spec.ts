import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("global search supports accents, keyboard navigation, focus restoration and empty results", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", {
    name: "Rechercher dans le portfolio",
  });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Explorer le portfolio" });
  const input = dialog.getByRole("combobox");
  await expect(input).toBeFocused();
  await expect(dialog.getByRole("status")).toContainText("PROJETS, RECHERCHES");
  await input.fill("postgresql react");
  await expect(dialog.getByRole("option")).toHaveCount(1);
  await expect(dialog.getByRole("option")).toContainText("Vulscan");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/projects\/vulscan$/);
  await expect(dialog).not.toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Navigation principale" })
      .getByRole("link", { name: "Projets", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await trigger.click();
  await expect(dialog.getByRole("status")).toContainText("PROJETS, RECHERCHES");
  await input.fill("securite");
  await expect(dialog.getByRole("option").first()).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await input.press("ArrowDown");
  await expect(dialog.getByRole("option").nth(1)).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await input.fill("aucun-projet-inconnu-123456");
  await expect(dialog.getByText(/Aucun résultat pour/)).toBeVisible();
  await input.fill("vulscan");
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    audit.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  await input.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Control+k");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Control+k");
  await expect(dialog).not.toBeVisible();
});

test("search keeps navigation available when content fails and can retry", async ({
  page,
}) => {
  await page.route("**/api/search", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: "{}" }),
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Rechercher dans le portfolio" })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("status")).toContainText("indisponibles");
  await expect(dialog.getByRole("option")).toHaveCount(7);
  await page.unroute("**/api/search");
  await dialog.getByRole("button", { name: "Réessayer" }).click();
  await expect(dialog.getByRole("status")).toContainText("PROJETS, RECHERCHES");
  await dialog.getByRole("combobox").fill("Vulscan");
  await expect(dialog.getByRole("option")).toHaveCount(1);
});

test("expertise tabs and case-study architecture work with keyboard and mobile", async ({
  page,
}) => {
  await page.goto("/");
  const frontend = page.getByRole("tab", { name: "Frontend", exact: true });
  await frontend.focus();
  await frontend.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Backend", exact: true }),
  ).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText(
    "La logique derrière l’expérience.",
  );
  await page.getByRole("tab", { name: "Cybersécurité", exact: true }).click();
  await expect(page.getByRole("tabpanel").getByRole("link")).toHaveAttribute(
    "href",
    "/security",
  );
  await page.goto("/projects/vulscan");
  await page.getByRole("button", { name: /Données PostgreSQL/ }).click();
  await expect(
    page.getByRole("heading", { name: "Conserver les relations utiles." }),
  ).toBeVisible();
  await expect(page.locator(".architecture-entities")).toContainText("VulnCVE");
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `${width}px`,
    ).toBe(true);
    await page
      .getByRole("button", { name: "Rechercher dans le portfolio" })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.keyboard.press("Escape");
  }
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    audit.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: ".local/screenshots/project-vulscan.png",
    fullPage: true,
  });
});
