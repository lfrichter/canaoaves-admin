---
name: workflow
description: Definition to workfow of complete developing cycle until deploy
filename: .gemini/rules/workflow.md
---
# 🔄 Workflow & Memory Protocol

Este documento define como os Agentes de IA devem gerenciar o estado do projeto usando a memória persistente.

## 1. A "Verdade Única" (Source of Truth)
O estado atual do desenvolvimento reside EXCLUSIVAMENTE em:
👉 **`.gemini/memory/current_plan.md`**

Nenhum código deve ser escrito sem que exista uma tarefa correspondente e **pendente (`[ ]`)** neste arquivo.

## 2. O Protocolo de Memória (The Loop)

Todos os agentes de execução (`developer`, `react-coder`) devem seguir este ciclo estrito:

### Fase 1: Leitura (Loading)
1.  Leia o arquivo `current_plan.md`.
2.  Identifique a **primeira** tarefa não marcada (`[ ]`).
3.  Se a tarefa estiver bloqueada ou não estiver clara, PARE e peça ajuda ao usuário.
4.  Se todas as tarefas estiverem marcadas (`[x]`), o trabalho acabou.

### Fase 2: Execução (Action)
1.  Realize a tarefa (crie código, testes, docs).
2.  Siga as regras de arquitetura definidas em `rules/architecture.md`.

### Fase 3: Commit de Memória (Update)
1.  Após o sucesso da execução (e apenas após o sucesso), você deve instruir o usuário a atualizar a memória.
2.  **Formato de Solicitação:**
    > "Tarefa concluída. Por favor, marque **'[x] Step X'** em `current_plan.md` e prossiga para a próxima."

## 3. Gerenciamento de Contexto
- **Notas de Contexto:** Se você descobrir algo crítico que afetará tarefas futuras (ex: "A API mudou a rota de login"), adicione uma nota na seção `## Context & Notes` do plano.
- **Erros:** Se uma tarefa falhar, não a marque como feita. Adicione uma nota de bloqueio.

## 4. Quem pode editar o plano?
- **Architect Agent:** Cria o plano inicial e os passos.
- **User:** Marca os checkboxes (`[x]`) conforme as tarefas são concluídas.
- **Developer Agent:** *Lê* o plano e sugere atualizações, mas (geralmente) não sobrescreve o arquivo inteiro para evitar perda de dados.