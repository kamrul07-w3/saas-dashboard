import { test, expect } from "@playwright/test";

test.describe("Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("admin@example.com");
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });
  });

  test("account settings page loads", async ({ page }) => {
    await page.goto("/settings/account");
    await expect(page.getByRole("heading", { name: /account|profile|settings/i })).toBeVisible();
  });

  test("profile update form has expected fields", async ({ page }) => {
    await page.goto("/settings/account");
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("team settings page loads", async ({ page }) => {
    await page.goto("/settings/team");
    await expect(page.getByRole("heading", { name: /team|members/i })).toBeVisible();
  });

  test("API keys settings page loads", async ({ page }) => {
    await page.goto("/settings/api-keys");
    await expect(page.getByRole("heading", { name: /api key/i })).toBeVisible();
  });

  test("notification settings page loads", async ({ page }) => {
    await page.goto("/settings/notifications");
    await expect(page.getByRole("heading", { name: /notification/i })).toBeVisible();
  });
});
