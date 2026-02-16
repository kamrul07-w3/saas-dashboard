import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("admin@example.com");
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });
  });

  test("dashboard page loads after login", async ({ page }) => {
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByRole("heading", { name: /dashboard|overview/i })).toBeVisible();
  });

  test("KPI cards are visible", async ({ page }) => {
    // Look for stat/KPI cards on the dashboard
    const cards = page.locator("[class*='card']");
    await expect(cards.first()).toBeVisible({ timeout: 5000 });
    // Should have multiple KPI cards (total customers, MRR, etc.)
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("navigation sidebar has key links", async ({ page }) => {
    await expect(page.getByRole("link", { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /customers/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /settings/i }).or(page.getByText(/settings/i))).toBeVisible();
  });

  test("clicking customers link navigates to customers page", async ({ page }) => {
    await page.getByRole("link", { name: /customers/i }).click();
    await expect(page).toHaveURL(/customers/);
  });
});
