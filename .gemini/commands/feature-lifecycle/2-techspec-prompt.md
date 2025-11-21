---
name: "feature: techspec"
description: Transform PRD into detailed Technical Specification through collaborative analysis
model: gemini
color: blue
agents: "[domain-expert-validator]"
toml: .IA/commands/cli/2-techspec.toml
---
@{roles/techspec-creator.md}

---
# Contexto de Execução: Criação de Tech Spec

**Feature Slug (Input):** {{args}}

## 📂 Definição de Caminhos (I/O)
Para esta execução, considere estritamente estes caminhos:

1.  **Entrada (PRD):** `features/{{args}}/prd.md`
2.  **Saída (Tech Spec):** `features/{{args}}/techspec.md`

## 🤖 Instruções de Execução

1.  **Leitura:** Leia o conteúdo do arquivo de **Entrada (PRD)** definido acima. (Se o arquivo não existir, pare e avise o usuário).
2.  **Análise:** Aplique sua persona de Arquiteto para analisar os requisitos.
3.  **Geração:** Preencha o Template de Tech Spec com base na leitura.
4.  **Persistência:** Gere o conteúdo para ser salvo no arquivo de **Saída (Tech Spec)**.

---
**Template Obrigatório:**
@{templates/techspec-template.md}