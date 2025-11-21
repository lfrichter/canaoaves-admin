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
# 📄 PRD: {{FEATURE_TITLE}}

> **Status:** Draft | In Review | Approved
> **Owner:** {{PRODUCT_OWNER}}
> **Date:** {{DATE}}
> **Issue ID:** #{{ISSUE_ID}}

## 1. Context & Motivation (The "Why")
* **Problem Statement:** {{DESCRIBE_THE_PAIN_POINT}}
* **Target Persona:** {{PERSONA_NAME}} (e.g., "Admin User", "End Customer")
* **Value Proposition:** Why is this valuable to the user/business?

## 2. Scope (The "What")
### ✅ In Scope
* {{FEATURE_A}}
* {{FEATURE_B}}

### ⛔ Out of Scope (Phase 2)
* {{EXCLUDED_FEATURE_X}}

## 3. Functional Requirements
> Use concise language. Ideally, map to User Stories.

| ID | User Story / Requirement | Priority |
| :--- | :--- | :--- |
| **FR-01** | As a user, I want to... so that... | P0 (Critical) |
| **FR-02** | As a user, I want to... so that... | P1 (Important) |

## 4. Acceptance Criteria (Gherkin)
*Strict criteria for QA and Automated Tests.*

**Scenario 1: {{SCENARIO_NAME}}**
* **Given** {{CONTEXT}}
* **When** {{ACTION}}
* **Then** {{EXPECTED_RESULT}}

## 5. Non-Functional Requirements (Technical Constraints)
* **Performance:** (e.g., Response time < 200ms)
* **Security:** (e.g., RBAC requirements, Encryption)
* **Scalability:** (e.g., Handles 1000 concurrent requests)

## 6. UX/UI Guidelines
* [ ] **Mockup:** {{LINK_OR_DESCRIPTION}}
* [ ] **Flow:**
    * Screen A -> Action -> Screen B
    * Error State -> Toast Notification

## 7. Risks & Open Questions
* [ ] **Question:** {{UNKNOWN_VARIABLE}}?
    * *Answer:* {{RESOLUTION}}
* [ ] **Risk:** {{POTENTIAL_BLOCKER}}
    * *Mitigation:* {{STRATEGY}}