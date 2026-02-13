import { expect, test } from "@playwright/test";

test.describe("Job Dashboard E2E", () => {
  test("create, update status, and delete a job on real backend", async ({ page }) => {
    // Debug logging
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
    page.on('pageerror', err => console.log(`BROWSER ERROR: ${err}`));

    console.log("Navigating to home page...");
    await page.goto("/");
    console.log("Navigation complete. Checking for input...");

    // 1. Create a new job
    const timestamp = Date.now();
    const jobName = `E2E Job ${timestamp}`;
    
    await expect(page.getByTestId("new-job-input")).toBeVisible();
    await page.getByTestId("new-job-input").fill(jobName);
    await page.getByTestId("create-job-button").click();
    console.log(`Created job: ${jobName}. Waiting for visibility...`);

    // 2. Verify it appears in the list with PENDING status
    await expect(page.getByText(jobName)).toBeVisible({ timeout: 10000 });
    console.log("Job visible.");
    
    // Find the row container
    const jobRow = page.locator("li", { hasText: jobName });
    await expect(jobRow).toBeVisible();
    await expect(jobRow).toContainText("PENDING");

    // 3. Update status to RUNNING
    console.log("Updating status to RUNNING...");
    const statusSelect = jobRow.locator("select");
    await statusSelect.selectOption("RUNNING");
    await expect(jobRow).toContainText("RUNNING");

    // 4. Update status to COMPLETED
    console.log("Updating status to COMPLETED...");
    await statusSelect.selectOption("COMPLETED");
    await expect(jobRow).toContainText("COMPLETED");

    // 5. Delete the job
    console.log("Deleting job...");
    const deleteBtn = jobRow.locator("button", { hasText: "Delete" });
    await deleteBtn.click();

    // 6. Verify job is gone
    await expect(page.getByText(jobName)).not.toBeVisible();
    console.log("Job deleted.");
  });
});
