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
# 🏗️ Technical Context & Standards

## Architecture Principles
* **Pattern:** Hexagonal Architecture / Ports & Adapters.
* **Core Logic:** Deve ser pura, isolada de frameworks e infraestrutura.
* **Dependency Rule:** Dependências apontam apenas para dentro (Domínio).
* **SOLID:** Aplicação rigorosa, especialmente SRP e DIP.

## Tech Stack
* **Backend:** Python (FastAPI) / PHP (Laravel) [Ajuste conforme o projeto ativo].
* **Infrastructure:** Docker, Docker Compose.
* **Database:** [Postgres/MySQL].

## Coding Standards
* **Language:** English for code (vars, functions, comments), Portuguese for documentation/commits.
* **Type Hinting:** Obrigatório (Python Strict).
* **Error Handling:** Exceptions customizadas no domínio; Tratamento global na borda (adapters).
* **Tests:** Pytest/PHPUnit. Foco em testes de unidade para UseCases e integração para Adapters.

## SPARC+DD Protocol
* **Commits:** Conventional Commits (feat, fix, chore, docs).
* **Diagrams:** Mermaid.js (HandDrawn look).
* **Documentation:** Atualizada via comando `/update-docs` antes do merge.