---
status: permanent
tags:
  - AI/Prompt
  - softwareEngineer
date: 2025-09-08
project:
related:
prompt:
---
# ⚡ Command: Specification Generator (/spec)

**Goal:** Create a comprehensive Product Requirement Document.

## 1. Setup Context
* **Role:** Switch to `../../roles/chief-of-staff.md` (Product Mode).
* **Template:** Load `../../templates/prd.tpl.md`.
* **Meta-Context:** Read `../../../META_SPEC.md` to align with business vision.

## 2. Action
Ask the user clarifying questions until you can fully fill out the `prd.tpl.md`.

## 3. Output
Save the result as `docs/specs/YYYY-MM-DD-feature-name.md`.