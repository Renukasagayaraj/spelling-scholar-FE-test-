import { test, expect } from "@playwright/test";
import { E2E_EMAIL, E2E_PASSWORD } from "./constants";

test.describe("Journey 1: Authentication & Navigation Integrity", () => {
  // Use unauthenticated storageState for sign in modal testing
  test.use({ storageState: { cookies: [], origins: [] } });

  test("user sign in, invalid credential feedback, and session persistence", async ({ page }) => {
    // 1. Open home page in unauthenticated state
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Spell smarter. Coached by AI." })).toBeVisible();

    // Open Sign in modal
    const signInTitle = page.getByTitle("Sign in");
    const signInBtn = page.getByRole("button", { name: "Sign in", exact: true });
    await (await signInTitle.isVisible() ? signInTitle : signInBtn).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // 2. Invalid Password handling
    await page.locator('input[type="email"]').fill(E2E_EMAIL);
    await page.locator('input[type="password"]').fill("intentionally-invalid-password");
    await page.locator('form').getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByRole("dialog").locator(".text-destructive").first()).toBeVisible();

    // 3. Valid Sign In
    await page.locator('input[type="email"]').fill(E2E_EMAIL);
    await page.locator('input[type="password"]').fill(E2E_PASSWORD);
    await page.locator('form').getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByTitle("View Account Profile")).toBeVisible();

    // 4. Reload preserves authenticated state
    await page.reload();
    await expect(page.getByTitle("View Account Profile")).toBeVisible();
  });

  test("profile navigation, browser Back, and second tab restore", async ({ page, context }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Spell smarter. Coached by AI." })).toBeVisible();
    
    const signInTitle = page.getByTitle("Sign in");
    const signInBtn = page.getByRole("button", { name: "Sign in", exact: true });

    // Sign in (this test always starts unauthenticated)
    await (await signInTitle.isVisible() ? signInTitle : signInBtn).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.locator('input[type="email"]').fill(E2E_EMAIL);
    await page.locator('input[type="password"]').fill(E2E_PASSWORD);
    await page.locator('form').getByRole("button", { name: "Sign in", exact: true }).click();

    await expect(page.getByTitle("View Account Profile")).toBeVisible({ timeout: 30000 });

    // Navigate to Profile
    await page.getByTitle("View Account Profile").click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByRole("heading", { name: "My Profile" })).toBeVisible();

    // Browser Back
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(/Master every word/i)).toBeVisible();

    // Open second tab - should restore authenticated state automatically
    const secondTab = await context.newPage();
    await secondTab.goto("/");
    await expect(secondTab.getByTitle("View Account Profile")).toBeVisible();
    await expect(secondTab.getByText(/Master every word/i)).toBeVisible();
    await secondTab.close();
  });
});
