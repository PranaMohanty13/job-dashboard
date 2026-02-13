# AGENTS.md

## Purpose

This file defines how AI coding models must assist with this repository.

Primary goal: help the user build the Job Management Dashboard **incrementally** with high quality, not autonomously implement everything at once.

---

## Non-Negotiable Working Mode

1. **Context-first, implementation-second**
   - Before suggesting code changes, read and align with:
     - `job_dashboard_infor.md`
     - all files in `docs/`
   - Explain how the next step maps to assignment requirements and evaluation criteria.

2. **Collaborative build, not autonomous build**
   - Do **not** implement full features end-to-end in one shot.
   - Work in small, reviewable increments.
   - Keep the user in the loop after every step.

3. **Step granularity constraints**
   - Per step, change at most:
     - up to **2 small file edits**.
   - If a step needs more, stop and split into smaller steps.

4. **Approval gate**
   - Reading/searching/analyzing can proceed without approval.
   - **Must ask for approval before any edit**.

5. **Mandatory check-in format before each edit step**
   - Provide:
     1. **Plan** (exact files and change intent)
     2. **Rationale** (why this step now)
     3. **Acceptance check** (how to verify this step worked)
   - Then ask: **"Proceed with this step?"**

6. **Post-step handoff**
   - After each step, provide:
     - what changed
     - requirement(s) covered
     - verification result
     - next smallest step
   - Ask for confirmation before continuing.

---

## Build Philosophy for This Repo

1. **Start small and de-risk early**
   - Prioritize foundations that unblock future work.
   - Prefer vertical slices only when they remain small and testable.

2. **One concern at a time**
   - Avoid mixing backend API changes, frontend UI changes, and infra changes in a single step unless absolutely required.

3. **Always map to rubric impact**
   - For each step, explicitly mention expected impact on:
     - correctness
     - maintainability/modularity
     - testing reliability
     - setup/deployment repeatability

4. **Prefer clarity over cleverness**
   - Keep architecture modular and readable.
   - Use straightforward patterns unless complexity is required.

---

## Requirements Alignment Protocol

Before any implementation proposal, the model must answer:

1. Which exact requirement(s) does this step satisfy?
2. Why this is the smallest useful increment?
3. What is the risk if this step is skipped?

If any requirement is ambiguous, ask clarifying questions first.

---

## Phase-Driven Guidance (Reference)

Use these planning docs as the execution backbone:

- `docs/requirements.md`
- `docs/backend-design.md`
- `docs/frontend-design.md`
- `docs/infrastructure.md`
- `docs/testing.md`
- `docs/stretch-goals.md`
- `docs/evaluation-mapping.md`
- `docs/scalability-and-performance.md`

The model should follow phased progression, but each implementation action must still respect the step-size and approval rules above.

---

## Quality and Safety Constraints

1. Do not introduce unrelated refactors.
2. Do not edit many files at once “for convenience”.
3. Validate each step with the smallest useful check (lint/test/command scoped to change).
4. If validation fails, diagnose and propose a minimal fix in the next approved step.
5. Never claim completion of major milestones without evidence.

---

## Communication Contract

Use concise, technical updates.

Before edit:

- Plan
- Rationale
- Acceptance check
- "Proceed with this step?"

After edit:

- Changed files
- What requirement/rubric it advances
- Verification output summary
- Next proposed step
- "Proceed to next step?"

---

## Definition of Success for AI Assistance

AI assistance is successful when:

- progress is steady and transparent,
- each step is small and reversible,
- the user approves each edit step,
- implementation stays tightly aligned with assignment requirements,git g
- and `make test` readiness is continuously improved without big-bang changes.
