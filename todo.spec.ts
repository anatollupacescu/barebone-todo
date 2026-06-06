import { test, expect, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_URL = "http://localhost:5173"; // Vite dev server — adjust if different
const API_URL = "http://localhost:3000/todo";

/** Wipe all todos and optionally seed fresh ones via the json-server REST API. */
async function resetServer(seeds: { title: string; done: boolean }[] = [], retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(API_URL);
      const items = (await res.json()) as { id: number }[];

      for (const item of items) {
        await fetch(`${API_URL}/${item.id}`, { method: 'DELETE' });
      }

      for (const seed of seeds) {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...seed, date: new Date().toISOString() }),
        });
      }

      return; // success — exit
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(resolve => setTimeout(resolve, 150 * attempt));
    }
  }
}

/** Shorthand selectors */
const sel = {
  input: "#todoText",
  addBtn: "#addBtn",
  errorMsg: ".error-message",
  table: "#table",
  deleteBtn: "#deleteBtn",
};

/** Returns all <li> elements inside #table */
function listItems(page: Page) {
  return page.locator(`${sel.table} li`);
}

/** Returns the checkbox inside the nth list item (0-indexed). */
function nthCheckbox(page: Page, n: number) {
  return listItems(page).nth(n).locator('input[type="checkbox"]');
}

/** Returns the "Done" button inside the nth list item (0-indexed). */
function nthDoneBtn(page: Page, n: number) {
  return listItems(page).nth(n).locator("button", { hasText: "Done" });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("Todo App", () => {
  // -------------------------------------------------------------------------
  // Initial state
  // -------------------------------------------------------------------------

  test.describe("initial state", () => {
    test.beforeEach(async ({ page }) => {
      await resetServer([]);
      await page.goto(BASE_URL);
    });

    test("add button is disabled and error hidden on load", async ({
      page,
    }) => {
      await expect(page.locator(sel.addBtn)).toBeDisabled();
      await expect(page.locator(sel.errorMsg)).toBeHidden();
    });

    test('delete button is disabled with label "Delete"', async ({ page }) => {
      await expect(page.locator(sel.deleteBtn)).toBeDisabled();
      await expect(page.locator(sel.deleteBtn)).toHaveText("Delete");
    });

    test("task list is empty", async ({ page }) => {
      await expect(listItems(page)).toHaveCount(0);
    });
  });

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------

  test.describe("input validation", () => {
    test.beforeEach(async ({ page }) => {
      await resetServer([]);
      await page.goto(BASE_URL);
    });

    test("empty input keeps add button disabled and error hidden", async ({
      page,
    }) => {
      // Input starts empty — button stays disabled, no error yet
      await expect(page.locator(sel.addBtn)).toBeDisabled();
      await expect(page.locator(sel.errorMsg)).toBeHidden();
    });

    test("valid input hides error and enables add button", async ({ page }) => {
      await page.fill(sel.input, "Buy milk");

      await expect(page.locator(sel.addBtn)).toBeEnabled();
      await expect(page.locator(sel.errorMsg)).toBeHidden();
    });

    test("clearing a valid input disables button again", async ({ page }) => {
      await page.fill(sel.input, "Buy milk");
      await expect(page.locator(sel.addBtn)).toBeEnabled();

      await page.fill(sel.input, "");
      await page.locator(sel.input).dispatchEvent("input");
      await expect(page.locator(sel.addBtn)).toBeDisabled();
    });

    test("form submit with invalid value calls onInvalid (error shown, no item added)", async ({
      page,
    }) => {
      // Programmatically submit without filling in anything
      await page
        .locator("#mainForm")
        .evaluate((f: HTMLFormElement) => f.requestSubmit());

      await expect(page.locator(sel.errorMsg)).toBeVisible();
      await expect(listItems(page)).toHaveCount(0);
    });
  });

  // -------------------------------------------------------------------------
  // Adding a task
  // -------------------------------------------------------------------------

  test.describe("adding a task", () => {
    test.beforeEach(async ({ page }) => {
      await resetServer([]);
      await page.goto(BASE_URL);
    });

    test("happy path — item appears in list", async ({ page }) => {
      await page.fill(sel.input, "Buy milk");
      await page.locator(sel.addBtn).click();

      await expect(listItems(page)).toHaveCount(1);
      await expect(listItems(page).first()).toContainText("Buy milk");
    });

    test("input clears after successful submit", async ({ page }) => {
      await page.fill(sel.input, "Buy milk");
      await page.locator(sel.addBtn).click();

      await expect(listItems(page)).toHaveCount(1);
      await expect(page.locator(sel.input)).toHaveValue("");
    });

    test("add button is disabled again after successful submit", async ({
      page,
    }) => {
      await page.fill(sel.input, "Buy milk");
      await page.locator(sel.addBtn).click();

      await expect(listItems(page)).toHaveCount(1);
      await expect(page.locator(sel.addBtn)).toBeDisabled();
    });

    test('new item has a "Done" button (not struck-through)', async ({
      page,
    }) => {
      await page.fill(sel.input, "Walk the dog");
      await page.locator(sel.addBtn).click();

      await expect(listItems(page)).toHaveCount(1);
      await expect(nthDoneBtn(page, 0)).toBeVisible();

      const span = listItems(page).first().locator("span");
      await expect(span).not.toHaveClass(/todo-title--done/);
    });

    test("adding multiple items appends to the list", async ({ page }) => {
      for (const title of ["Alpha", "Beta", "Gamma"]) {
        await page.fill(sel.input, title);
        await page.locator(sel.addBtn).click();
        await expect(listItems(page)).toContainText([title]);
      }
      await expect(listItems(page)).toHaveCount(3);
    });
  });

  // -------------------------------------------------------------------------
  // Marking an item done
  // -------------------------------------------------------------------------

  test.describe("marking an item done", () => {
    test.beforeEach(async ({ page }) => {
      await resetServer([
        { title: "Cherry", done: false },
        { title: "Strawberry", done: false },
      ]);
      await page.goto(BASE_URL);
      await expect(listItems(page)).toHaveCount(2);
    });

    test("clicking Done strikes through the title and removes Done button", async ({
      page,
    }) => {
      await nthDoneBtn(page, 0).click();

      // clicking Done strikes through the title and removes Done button
      const firstSpan = listItems(page).first().locator("span");
      await expect(firstSpan).toHaveClass(/todo-title--done/); // was: span
      await expect(nthDoneBtn(page, 0)).toHaveCount(0);
    });

    test("marking one item done does not affect the other", async ({
      page,
    }) => {
      await nthDoneBtn(page, 0).click();

      // marking one item done does not affect the other
      const secondSpan = listItems(page).nth(1).locator("span");
      await expect(secondSpan).not.toHaveClass(/todo-title--done/); // was: span
      await expect(nthDoneBtn(page, 1)).toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // Checkbox selection & delete button label reactivity
  // -------------------------------------------------------------------------

  test.describe("checkbox selection and delete button reactivity", () => {
    test.beforeEach(async ({ page }) => {
      await resetServer([
        { title: "Alpha", done: false },
        { title: "Beta", done: false },
        { title: "Gamma", done: false },
      ]);
      await page.goto(BASE_URL);
      await expect(listItems(page)).toHaveCount(3);
    });

    test('selecting one item enables delete button with label "Delete (1)"', async ({
      page,
    }) => {
      await nthCheckbox(page, 0).check();

      await expect(page.locator(sel.deleteBtn)).toBeEnabled();
      await expect(page.locator(sel.deleteBtn)).toHaveText("Delete (1)");
    });

    test('selecting two items shows "Delete (2)"', async ({ page }) => {
      await nthCheckbox(page, 0).check();
      await nthCheckbox(page, 1).check();

      await expect(page.locator(sel.deleteBtn)).toHaveText("Delete (2)");
    });

    test('deselecting all items disables button and resets label to "Delete"', async ({
      page,
    }) => {
      await nthCheckbox(page, 0).check();
      await nthCheckbox(page, 1).check();
      await expect(page.locator(sel.deleteBtn)).toHaveText("Delete (2)");

      await nthCheckbox(page, 0).uncheck();
      await nthCheckbox(page, 1).uncheck();

      await expect(page.locator(sel.deleteBtn)).toBeDisabled();
      await expect(page.locator(sel.deleteBtn)).toHaveText("Delete");
    });

    test("partial deselect updates count correctly", async ({ page }) => {
      await nthCheckbox(page, 0).check();
      await nthCheckbox(page, 1).check();
      await nthCheckbox(page, 2).check();
      await expect(page.locator(sel.deleteBtn)).toHaveText("Delete (3)");

      await nthCheckbox(page, 1).uncheck();
      await expect(page.locator(sel.deleteBtn)).toHaveText("Delete (2)");
    });
  });

  // -------------------------------------------------------------------------
  // Bulk delete
  // -------------------------------------------------------------------------

  test.describe("bulk delete", () => {
    test.beforeEach(async ({ page }) => {
      await resetServer([
        { title: "Alpha", done: false },
        { title: "Beta", done: false },
        { title: "Gamma", done: false },
      ]);
      await page.goto(BASE_URL);
      await expect(listItems(page)).toHaveCount(3);
    });

    test("deleting a single selected item removes it from the list", async ({
      page,
    }) => {
      await nthCheckbox(page, 0).check();
      await page.locator(sel.deleteBtn).click();

      await expect(listItems(page)).toHaveCount(2);
      // "Alpha" should be gone
      await expect(page.locator(sel.table)).not.toContainText("Alpha");
    });

    test("bulk deleting two items leaves only the unselected one", async ({
      page,
    }) => {
      await nthCheckbox(page, 0).check();
      await nthCheckbox(page, 2).check();
      await page.locator(sel.deleteBtn).click();

      await expect(listItems(page)).toHaveCount(1);
      await expect(page.locator(sel.table)).toContainText("Beta");
    });

    test("deleting all items empties the list", async ({ page }) => {
      await nthCheckbox(page, 0).check();
      await nthCheckbox(page, 1).check();
      await nthCheckbox(page, 2).check();
      await page.locator(sel.deleteBtn).click();

      await expect(listItems(page)).toHaveCount(0);
    });

    test("selection clears and delete button resets after delete", async ({
      page,
    }) => {
      await nthCheckbox(page, 0).check();
      await nthCheckbox(page, 1).check();
      await page.locator(sel.deleteBtn).click();

      await expect(page.locator(sel.deleteBtn)).toBeDisabled();
      await expect(page.locator(sel.deleteBtn)).toHaveText("Delete");

      // Checkboxes on the surviving item should be unchecked
      await expect(nthCheckbox(page, 0)).not.toBeChecked();
    });
  });

  // -------------------------------------------------------------------------
  // State after page reload (persistence)
  // -------------------------------------------------------------------------

  test.describe("state persistence", () => {
    test("items seeded on the server appear after a fresh page load", async ({
      page,
    }) => {
      await resetServer([
        { title: "Cherry", done: true },
        { title: "Strawberry", done: false },
      ]);
      await page.goto(BASE_URL);

      await expect(listItems(page)).toHaveCount(2);

      // state persistence
      const cherrySpan = listItems(page).first().locator("span");
      await expect(cherrySpan).toHaveClass(/todo-title--done/); // was: span
      await expect(nthDoneBtn(page, 0)).toHaveCount(0);

      // Strawberry is not done — has Done button
      await expect(nthDoneBtn(page, 1)).toBeVisible();
    });
  });
});
