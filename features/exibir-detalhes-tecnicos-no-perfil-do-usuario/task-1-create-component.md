# 📄 Tarefa 1: Criar Componente `TechnicalDetailsCard`

**ID da Tarefa:** 1
**Status:** `Pendente`
**Feature Associada:** `Exibir Detalhes Técnicos no Perfil do Usuário`

## 🎯 Objetivo
Desenvolver o componente de UI auto-contido `TechnicalDetailsCard.tsx` que será responsável por exibir o `slug` do perfil e o link público.

## 📚 Documentação de Referência
- **Tech Spec:** `features/exibir-detalhes-tecnicos-no-perfil-do-usuario/techspec.md#passo-2-implementar-o-componente-technicaldetailscardtsx`

## 💻 Manifesto de Arquivos
- **CRIAR:** `src/components/profile/`
- **CRIAR:** `src/components/profile/TechnicalDetailsCard.tsx`

## ✅ Critérios de Aceite
- O componente deve ser declarado como um Componente de Cliente (`"use client";`).
- Deve aceitar a propriedade `slug` do tipo `string`.
- Deve usar componentes Shadcn UI (`Card`, `Input`, `Button`, `Label`) para a estrutura.
- O `slug` deve ser exibido em um campo `<Input />` desabilitado.
- A URL pública completa deve ser construída usando `process.env.NEXT_PUBLIC_SITE_URL` e o `slug`.
- A URL deve ser um link `<a>` clicável que abre em uma nova aba.
- Um botão "Copiar" deve estar funcional, usando `navigator.clipboard.writeText`, e deve fornecer feedback visual ao usuário após a cópia.
