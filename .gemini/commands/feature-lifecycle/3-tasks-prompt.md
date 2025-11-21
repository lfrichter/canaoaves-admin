---
name: "feature: techspec"
description: Transform PRD into detailed Technical Specification through collaborative analysis
model: gemini
color: blue
agents: "[domain-expert-validator]"
toml: .IA/commands/cli/4-implement.toml
---
@{roles/task-creator.md}

---
# Contexto da Execução

**Feature Slug:** {{args}}

**Instruções Imediatas:**
1.  Verifique se os documentos de entrada existem para a feature `{{args}}`:
    - PRD: `features/{{args}}/prd.md`
    - Tech Spec: `features/{{args}}/techspec.md`
2.  Se existirem, analise-os profundamente.
3.  Gere o plano de tarefas usando os templates abaixo como referência estrita de formato.

**Templates de Saída:**
Para o Resumo (Summary), use:
@{templates/tasks-summary.tpl.md}

Para cada Tarefa Individual (Detail), use:
@{templates/task-detail.tpl.md}