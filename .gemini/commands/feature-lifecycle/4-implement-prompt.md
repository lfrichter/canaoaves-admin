---
name: "feature: techspec"
description: Transform PRD into detailed Technical Specification through collaborative analysis
model: gemini
color: blue
agents: "[domain-expert-validator]"
toml: .IA/commands/cli/2-techspec.toml
---
@{roles/react-coder.md}

---
# Contexto de Execução: Implementação de Tarefa

**Feature Slug:** {{args}}

## Localização dos Arquivos da Feature
- **PRD:** `features/{{args}}/prd.md`
- **Tech Spec:** `features/{{args}}/techspec.md`
- **Task Summary:** `features/{{args}}/tasks-summary.md`

## Instruções de Execução

### 1. Pre-Task Setup (Identificação)
1.  Leia o arquivo `tasks-summary.md` da feature.
2.  Identifique a **primeira tarefa** com status **"Pending"** que não tenha dependências bloqueantes.
3.  Leia o arquivo específico dessa tarefa (ex: `features/{{args}}/T01-create-atoms.md`).

### 2. Task Analysis
Analise o PRD e o Tech Spec para entender o contexto específico desta tarefa.
Verifique os **Design Principles** e **Style Guide** (injetados na sua role) para garantir conformidade visual.

### 3. Output da Análise (Responda com isso antes de gerar código)
Por favor, inicie gerando um resumo do que será feito:

**Task ID:** [ID]
**Task Name:** [Nome]
**Alinhamento Visual:** [Cite qual token/princípio do Style Guide será usado]
**Plano de Ação:** [Breve lista de arquivos que serão criados/editados]

---
**APÓS gerar esse resumo, aguarde minha confirmação ou prossiga para gerar o código (artifacts).**