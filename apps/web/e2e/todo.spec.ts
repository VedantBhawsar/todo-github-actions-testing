import { test, expect, Page } from "@playwright/test";

const API_URL = "http://localhost:3001";

async function registerAndLogin(page: Page, email: string, password: string, name: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  await res.json();

  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("http://localhost:3000/");
}

test.describe("Todo App E2E", () => {
  test.beforeEach(async ({ page }, info) => {
    const uniqueEmail = `test${info.parallelIndex}-${Date.now()}@example.com`;
    await registerAndLogin(page, uniqueEmail, "password123", "Test User");
  });

  test("page loads with heading and empty state", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "My Todos" })).toBeVisible();
    await expect(page.getByTestId("empty-state")).toBeVisible();
    await expect(page.getByTestId("empty-state").getByText("No todos yet. Add one above!")).toBeVisible();
  });

  test("add a todo", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("todo-title-input").fill("My first todo");
    await page.getByTestId("todo-description-input").fill("Description here");
    await page.getByTestId("add-todo-button").click();
    await expect(page.getByTestId("todo-item").filter({ hasText: "My first todo" })).toBeVisible();
    await expect(page.getByTestId("todo-title").filter({ hasText: "My first todo" })).toHaveText("My first todo");
  });

  test("complete a todo", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("todo-title-input").fill("Todo to complete");
    await page.getByTestId("add-todo-button").click();
    const todoItem = page.getByTestId("todo-item").filter({ hasText: "Todo to complete" });
    await expect(todoItem).toBeVisible();
    await todoItem.getByTestId("toggle-todo-button").click();
    await expect(todoItem.getByTestId("todo-title")).toHaveClass(/line-through/);
  });

  test("delete a todo", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("todo-title-input").fill("Todo to delete");
    await page.getByTestId("add-todo-button").click();
    const todoItem = page.getByTestId("todo-item").filter({ hasText: "Todo to delete" });
    await expect(todoItem).toBeVisible();
    await todoItem.getByTestId("delete-todo-button").click();
    await expect(page.getByTestId("empty-state")).toBeVisible();
  });

  test("validation - empty form does not add todo", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("add-todo-button").click({ force: true });
    await expect(page.getByTestId("empty-state")).toBeVisible();
    await expect(page.getByTestId("todo-item")).not.toBeVisible();
  });

  test("text change detection - heading text has changed", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "My Todos" })).toHaveText("My Todos Changed");
  });
});