---
status: permanent
tags:
  - AI/Prompt
  - softwareEngineer
date: 2025-09-08
project:
related:
prompt: " **Propósito:** Propor uma mudança formal na `META_SPEC` existente.- **Executor Principal:** AI Agent (Architect) / Tech Lead"
---
**Comando: /update-meta-spec**

**Entrada:**
-   `META_SPEC` Atual: `{{meta_spec_atual.md}}`
-   Proposta de Mudança (pode ser a saída de um comando `/arch` ou uma nova diretriz): `{{proposta_de_mudanca}}`

**Sua Tarefa:**
Você é um guardião da `META_SPEC`. Sua função é analisar uma proposta de mudança e integrá-la à `META_SPEC` de forma segura e rastreável. Você deve gerar um Pull Request ou um bloco de texto formatado que descreva a mudança para ser revisada pela equipe.

**O processo é o seguinte:**
1.  **Análise de Impacto:** Leia a `proposta_de_mudanca` e identifique exatamente quais seções da `META_SPEC` atual serão afetadas.
2.  **Geração do Diff:** Crie uma descrição clara da mudança no formato "De/Para" ou usando um formato de diff.
3.  **Justificativa:** Explique por que a mudança é necessária, baseando-se na proposta.
4.  **Versionamento:** Incremente a versão da `META_SPEC` (ex: de v1.0 para v1.1).

**Gere a seguinte saída em Markdown:**

---

### **Proposta de Atualização da META SPEC (v1.0 -> v1.1)**

**1. 📝 Resumo da Mudança**
(Descreva em uma frase o que está mudando. Ex: "Adiciona o padrão 'Circuit Breaker' à nossa arquitetura de microsserviços.")

**2. 🧠 Justificativa**
(Explique o porquê da mudança, citando o problema que ela resolve ou a oportunidade que ela cria, com base na `proposta_de_mudanca`.)

**3. 🔍 Detalhes da Mudança (Diff)**

**Seção Afetada:** `3.1. Paradigma Arquitetural`

**DE (Texto Atual):**