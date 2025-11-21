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
# META SPEC: {{NOME_PROJETO}}

> **Status:** Living Document
> **Last Update:** {{DATA_ATUAL}}

## 1. Business Vision (The "Why")
* **Core Problem:** {{PROBLEM_STATEMENT}}
* **Value Proposition:** {{SOLUTION_DESCRIPTION}}
* **Target Audience:** {{TARGET_AUDIENCE}}

## 2. System Architecture (The "How")
* **Pattern:** {{ARCHITECTURE_PATTERN}} (e.g., Hexagonal, Clean Arch)
* **High-Level Diagram:**
    {{MERMAID_CODE_BLOCK}}

* **Directory Structure Map:**
    * `.ai/`: AI Personas and Rules.
    * `src/core/`: {{DESC_CORE}} (e.g., Pure Domain Logic, Entities).
    * `src/app/`: {{DESC_APP}} (e.g., Use Cases, Ports).
    * `src/infra/`: {{DESC_INFRA}} (e.g., Frameworks, DB Adapters, UI).

## 3. Tech Stack & Tooling
* **Language:** {{LANGUAGE}}
* **Framework:** {{FRAMEWORK}}
* **Database:** {{DATABASE}}
* **Infra/DevOps:** {{INFRA}}
* **Justification:** _(Brief note on why this stack matches the problem)_

## 4. Principles & Critical Rules
* **Technical Vision:** {{VISION_TECNICA}}
* **Non-Negotiable Rules:**
    1.  {{REGRA_1}} (e.g., "Inner layers never depend on outer layers")
    2.  {{REGRA_2}} (e.g., "Coverage minimum of 80%")
    3.  {{REGRA_3}}

## 5. Workflow & State
* **Current Phase:** {{CURRENT_PHASE}} (Specification | Architecture | Refinement | Completion)
* **Active Plan:** Link to `.ai/memory/current_plan.md`
* **Documentation Strategy:** `docs/` must always match `src/`. Changes in code require updates in docs.

## 6. Processes (Git & Quality)
* **Branching Model:** {{BRANCHING_MODEL}}
* **Commit Pattern:** {{COMMIT_PATTERN}}
* **PR Policy:** {{PR_POLICY}}