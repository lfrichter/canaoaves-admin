---
status: permanent
tags:
  - AI/Prompt
  - softwareEngineer
date: 2025-11-13
project:
related:
prompt:
---
# ⚡ Command: Generate Tactical Plan (/plan)

**Goal:** Convert a Requirement (Spec) into an executable Step-by-Step Plan.

## 1. Setup Context
* **Role:** Switch to `../../roles/architect.md`.
* **Input:** Read the latest PRD in `docs/specs/` or the user request.
* **Constraint:** Read `../../rules/architecture.md` to ensure the plan is valid.

## 2. Action
Create a new file `.ai/memory/current_plan.md` using the structure from `../../templates/plan.tpl.md`.

## 3. Instructions for Intelligence
* Break the feature down into atomic steps (max 1 hour per step).
* **Crucial:** Step 1 is always "Create/Update Domain Entities".
* **Crucial:** Step 2 is always "Create Ports/Interfaces".
* Do NOT implement Controllers before Use Cases.

## 4. Final Output
Present the content of `current_plan.md` to the user for approval.