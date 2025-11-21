---
name: design-principles
description: Princípios que guiam todas as decisões de UI/UX do projeto.
---
# 🎨 Princípios de Design (UX/UI Philosophy)

Estes princípios orientam todas as decisões de interface. Em caso de conflito, priorize-os sobre estética ou conveniência.

---

## 1. Clareza > Criatividade (Simplicidade é Prioridade)
- **Redução Cognitiva:** Remova tudo que não contribui diretamente com a tarefa principal da tela. Menos é mais.
- **Ação Primária Única:** Cada tela deve ter **uma única ação principal**, visualmente destacada.
- **Hierarquia Visual Clara:** O elemento mais importante deve ser o mais visível — por tamanho, cor, posição ou peso visual.
- **Feedback Imediato:** Toda interação (clique, hover, submit, loading) deve ter resposta visual em **< 100ms**. Nunca deixe o usuário no escuro.

---

## 2. Consistência Gera Confiança
- **Padrões Repetidos:** Não reinvente componentes ou fluxos. Se um botão “Salvar” está à direita em uma tela, deve estar em todas.
- **Previsibilidade:** O usuário deve saber o que um elemento faz apenas olhando para ele — pela cor, ícone, posição ou label.
- **Componentes Padrão:** Use componentes do sistema sempre que possível. A familiaridade acelera o uso.

---

## 3. Acessibilidade (A11y) É Mandatório
- **Navegação por Teclado:** Tudo deve ser acessível via Tab/Enter/Space.
- **Contraste WCAG AA:** Textos e elementos interativos devem atender às taxas mínimas de contraste.
- **Semântica HTML:** Use tags corretas (`<button>`, `<input>`, etc.) e associe labels e erros com ARIA quando necessário.
- **Foco Visível:** Elementos ativos devem ter indicador claro de foco.

---

## 4. Conteúdo Realista Define a Interface
- **Nunca use “Lorem Ipsum”:** Teste layouts com dados reais ou realistas — especialmente textos longos, números, datas e nomes.
- **Tipografia como Guia:** Use pesos e tamanhos de fonte para criar hierarquia visual — não dependa só de linhas, caixas ou cores.
- **Conteúdo é Interface:** A forma como o conteúdo se comporta define a experiência. Projete para o que realmente será exibido.

---

## 5. Mobile First & Responsividade
- **Design para Telas Pequenas:** Comece o layout pensando em mobile. Se funciona em pequeno, funciona em grande.
- **Tamanho de Toque:** Elementos interativos devem ter no mínimo **44x44px** para toque preciso.
- **Adaptação Fluida:** Garanta funcionalidade e legibilidade em qualquer dispositivo, sem quebras de layout.
