import { expect, test } from "@playwright/test";

type JobStatusType = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

interface JobRecord {
  id: number;
  name: string;
  current_status_type: JobStatusType;
  current_status_timestamp: string;
  created_at: string;
  updated_at: string;
}

test("create, update status, and delete a job", async ({ page }) => {
  const now = new Date().toISOString();
  let nextId = 2;
  let createdJobId: number | null = null;

  const jobs: JobRecord[] = [
    {
      id: 1,
      name: "Seed Job",
      current_status_type: "PENDING",
      current_status_timestamp: now,
      created_at: now,
      updated_at: now,
    },
  ];

  await page.route("**/api/jobs/**", async (route) => {
    const request = route.request();
    const method = request.method();
    const url = new URL(request.url());
    const pathname = url.pathname;

    if (method === "GET" && pathname === "/api/jobs/") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          count: jobs.length,
          next: null,
          previous: null,
          results: jobs,
        }),
      });
      return;
    }

    if (method === "POST" && pathname === "/api/jobs/") {
      const payload = request.postDataJSON() as { name: string };
      const timestamp = new Date().toISOString();
      const newJob: JobRecord = {
        id: nextId++,
        name: payload.name,
        current_status_type: "PENDING",
        current_status_timestamp: timestamp,
        created_at: timestamp,
        updated_at: timestamp,
      };
      createdJobId = newJob.id;
      jobs.unshift(newJob);

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(newJob),
      });
      return;
    }

    const detailMatch = pathname.match(/^\/api\/jobs\/(\d+)\/$/);

    if (detailMatch && method === "PATCH") {
      const jobId = Number(detailMatch[1]);
      const payload = request.postDataJSON() as { status_type: JobStatusType };
      const job = jobs.find((item) => item.id === jobId);

      if (!job) {
        await route.fulfill({
          status: 404,
          body: JSON.stringify({ detail: "Job not found." }),
        });
        return;
      }

      const timestamp = new Date().toISOString();
      job.current_status_type = payload.status_type;
      job.current_status_timestamp = timestamp;
      job.updated_at = timestamp;

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(job),
      });
      return;
    }

    if (detailMatch && method === "DELETE") {
      const jobId = Number(detailMatch[1]);
      const index = jobs.findIndex((item) => item.id === jobId);
      if (index >= 0) {
        jobs.splice(index, 1);
      }

      await route.fulfill({ status: 204, body: "" });
      return;
    }

    if (method === "GET" && pathname.match(/^\/api\/jobs\/\d+\/statuses\/$/)) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          count: 0,
          next: null,
          previous: null,
          results: [],
        }),
      });
      return;
    }

    await route.fulfill({ status: 500, body: "Unhandled mock route" });
  });

  await page.goto("/");

  await expect(page.getByTestId("new-job-input")).toBeVisible();
  await page.getByTestId("new-job-input").fill("E2E Job");
  await page.getByTestId("create-job-button").click();

  await expect(page.getByText("E2E Job")).toBeVisible();

  if (createdJobId === null) {
    throw new Error("Expected createdJobId to be set after creating a job");
  }

  const newJobId: number = createdJobId;

  await page.getByTestId(`status-select-${newJobId}`).selectOption("COMPLETED");
  await expect(page.getByTestId(`job-row-${newJobId}`)).toContainText(
    "COMPLETED",
  );

  await page.getByTestId(`delete-job-${newJobId}`).click();
  await expect(page.getByTestId(`job-row-${newJobId}`)).toHaveCount(0);
});
