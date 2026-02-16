import { expect, test } from "@playwright/test";

test.describe("Job Dashboard E2E", () => {
  test("create, update status, and delete a job on real backend", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. Create a new job
    const timestamp = Date.now();
    const jobName = `E2E Job ${timestamp}`;

    await expect(page.getByTestId("new-job-input")).toBeVisible();
    await page.getByTestId("new-job-input").fill(jobName);
    await page.getByTestId("create-job-button").click();

    // 2. Verify it appears in the list with PENDING status
    await expect(page.getByText(jobName)).toBeVisible({ timeout: 10000 });

    // Find the row container
    const jobRow = page.locator("li", { hasText: jobName });
    await expect(jobRow).toBeVisible();
    await expect(jobRow).toContainText("PENDING");

    // 3. Update status to RUNNING
    const statusSelect = jobRow.locator("select");
    await statusSelect.selectOption("RUNNING");
    await expect(jobRow).toContainText("RUNNING");

    // 4. Update status to COMPLETED
    await statusSelect.selectOption("COMPLETED");
    await expect(jobRow).toContainText("COMPLETED");

    // 5. Delete the job
    const deleteBtn = jobRow.locator("button", { hasText: "Delete" });
    page.once("dialog", async (dialog) => {
      await dialog.accept();
    });
    await deleteBtn.click();

    // 6. Verify job is gone
    await expect(jobRow).toHaveCount(0);
  });
});
