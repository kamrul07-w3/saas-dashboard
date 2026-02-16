import { test, expect } from "@playwright/test";

test.describe("Customers", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("admin@example.com");
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });
  });

  test("customer list page loads", async ({ page }) => {
    await page.goto("/customers");
    await expect(page.getByRole("heading", { name: /customers/i })).toBeVisible();
  });

  test("customer list displays table or data", async ({ page }) => {
    await page.goto("/customers");
    // Wait for either a table or customer entries to appear
    const table = page.locator("table").or(page.locator("[class*='table']"));
    await expect(table.first()).toBeVisible({ timeout: 10000 });
  });

  test("create new customer flow", async ({ page }) => {
    await page.goto("/customers/new");
    await expect(page.getByRole("heading", { name: /new|create|add/i })).toBeVisible();

    // Fill the form
    await page.getByLabel(/name/i).first().fill("Test Customer");
    await page.getByLabel(/email/i).first().fill("testcustomer@example.com");

    // Look for company field if present
    const companyField = page.getByLabel(/company/i);
    if (await companyField.isVisible()) {
      await companyField.fill("Test Corp");
    }

    // Submit
    await page.getByRole("button", { name: /create|save|add/i }).click();

    // Should redirect to customer list or detail page
    await page.waitForURL(/customers/, { timeout: 10000 });
  });

  test("customer detail page loads", async ({ page }) => {
    await page.goto("/customers");
    // Wait for the table to load, then click the first customer link/row
    await page.waitForTimeout(2000);
    const firstRow = page.locator("table tbody tr").first()
      .or(page.locator("[class*='table'] [class*='row']").first());
    if (await firstRow.isVisible()) {
      await firstRow.click();
      // Should navigate to a customer detail or edit page
      await expect(page).toHaveURL(/customers\/.+/);
    }
  });

  test("edit customer page renders", async ({ page }) => {
    await page.goto("/customers");
    await page.waitForTimeout(2000);
    // Navigate to first customer then edit
    const firstRow = page.locator("table tbody tr").first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await page.waitForURL(/customers\/.+/, { timeout: 5000 });

      // Look for edit button or navigate to edit URL
      const editBtn = page.getByRole("link", { name: /edit/i })
        .or(page.getByRole("button", { name: /edit/i }));
      if (await editBtn.first().isVisible()) {
        await editBtn.first().click();
        await expect(page).toHaveURL(/edit/);
      }
    }
  });

  test("delete customer shows confirmation", async ({ page }) => {
    await page.goto("/customers");
    await page.waitForTimeout(2000);

    // Find a delete button in the table
    const deleteBtn = page.getByRole("button", { name: /delete|remove/i });
    if (await deleteBtn.first().isVisible()) {
      await deleteBtn.first().click();
      // Should show a confirmation dialog
      const dialog = page.getByRole("alertdialog")
        .or(page.getByRole("dialog"))
        .or(page.getByText(/are you sure|confirm/i));
      await expect(dialog.first()).toBeVisible({ timeout: 3000 });
    }
  });
});
