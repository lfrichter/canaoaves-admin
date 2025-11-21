---
name: architecture
description: Definition to project structure
filename: .gemini/rules/architecture.md
---
# 🏛️ Project Architecture & Boundaries

Esta regra define a estrutura sagrada do projeto. Todos os agentes devem respeitar rigorosamente a **Dependency Rule**.

## 1. O Mapa Mental (Visual Architecture)

O fluxo de dependência deve **SEMPRE** apontar para dentro. A camada externa conhece a interna; a interna desconhece a externa.

```mermaid
---
config:
  theme: default
  look: default
---
%%{init: {'sequence': {'messageFontMaxSize': 14, 'wrap': true, 'diagramWidth': 600}}}%%
flowchart BT
    subgraph Infra ["4\. Infrastructure & Frameworks"]
        DB[(Database / ORM)]
        API[External APIs]
        UI_FW[React / Next.js]
    end

    subgraph Adapters ["3\. Interface Adapters"]
        Controllers[Server Actions / API Routes]
        Presenters[Components / Hooks]
        Repos[Repository Implementation]
    end

    subgraph App ["2\. Application (Use Cases)"]
        Services[Services / Use Cases]
        Ports[Repository Interfaces]
    end

    subgraph Domain ["1\. Domain (Entities)"]
        Models[Core Models / Types]
        Rules[Business Logic Rules]
    end

    Infra --> Adapters
    Adapters --> App
    App --> Domain

    style Domain fill:#f87171,stroke:#333,stroke-width:2px,color:#fff
    style App fill:#fbbf24,stroke:#333,stroke-width:2px
    style Adapters fill:#34d399,stroke:#333,stroke-width:2px
    style Infra fill:#60a5fa,stroke:#333,stroke-width:2px
````

## 2\. Camadas e Responsabilidades

### 🔴 1. Domain (Entities)

  * **O que é:** O coração do negócio. Regras que existiriam mesmo sem software.
  * **Onde:** `src/domain/entities/` ou `src/core/types/`.
  * **Regra de Ouro:** **ZERO dependências**. Não importa React, não importa Zod, não importa Axios. Apenas TypeScript puro.

### 🟡 2. Application (Use Cases)

  * **O que é:** O que o software *faz*. Orquestra o fluxo de dados.
  * **Onde:** `src/application/use-cases/` ou `src/services/`.
  * **Regra de Ouro:** Contém lógica de aplicação. Define interfaces (Ports) para repositórios, mas não os implementa.
  * **Teste:** Testável unitariamente sem UI ou BD.

### 🟢 3. Interface Adapters

  * **O que é:** Converte dados. Onde a "Mágica" encontra o "Mundo Real".
  * **Onde:**
      * **Hooks:** `src/hooks/` (Lógica de View).
      * **Repositories:** `src/infra/repositories/` (Implementação concreta).
      * **Components:** `src/components/`.
  * **Regra de Ouro:** Conecta os Use Cases à UI ou ao Banco.

### 🔵 4. Infrastructure

  * **O que é:** Frameworks e ferramentas externas.
  * **Onde:** `src/app/` (Next.js), Configurações de DB, Libs de terceiros.
  * **Regra de Ouro:** A camada mais volátil. Se trocarmos o Next.js por Remix, apenas isso muda.

## 3\. 🚫 Regras de Importação (Strict Linting)

Ao gerar código, o agente deve validar estas restrições:

1.  **Domain** NUNCA importa de **Infrastructure**.
      * ❌ `import { db } from '@/lib/prisma'` dentro de uma Entity.
2.  **Application** NUNCA importa de **UI**.
      * ❌ `import { Button } from '@/components'` dentro de um Service.
3.  **Components** (UI) devem ser **Burros**.
      * Eles não devem conter regras de negócio complexas. Eles apenas renderizam dados e disparam eventos.
      * Lógica complexa deve ser extraída para **Custom Hooks** ou **Use Cases**.

## 4\. Estrutura de Pastas do Projeto

O projeto segue esta organização física para refletir a arquitetura lógica:

  - `src/core/` (Domain & Application puro)
  - `src/infra/` (Implementações de Banco de Dados, HTTP Clients)
  - `src/components/` (Interface Adapters - UI)
  - `src/app/` (Infrastructure - Next.js Routing)

<!-- end list -->