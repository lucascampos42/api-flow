# 🚀 API Flow

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-10.0-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**Núcleo de Autenticação e Gestão de Revendas do Ecossistema CDS**

</div>

---

## 📋 Sobre o Projeto

A **API Flow** é o ponto de entrada central do ecossistema. Ela é responsável por gerenciar a identidade dos usuários, controlar o acesso aos sistemas e orquestrar o onboarding de novas revendas. Além disso, fornece o suporte necessário para as funcionalidades do site institucional e o controle interno de demandas.

### ✨ Funcionalidades Principais

- 🔐 **Autenticação Centralizada**: Gerenciamento de login e JWT para todo o ecossistema.
- 🤝 **Gestão de Revendas**: Cadastro, ativação e controle de permissões de parceiros.
- 🌐 **Backend Institucional**: Suporte para formulários e dados dinâmicos do site oficial.
- 📈 **Controle de Demandas**: Sistema interno para acompanhamento de solicitações e tickets.
- 🛠️ **Onboarding**: Fluxo automatizado para novos clientes e parceiros.

## 🚀 Como Rodar

Este projeto utiliza o **Bun** para máxima performance.

### Pré-requisitos

- [Bun](https://bun.sh/) instalado.
- Banco de Dados (PostgreSQL/MySQL) configurado.

### Passos

1. **Instale as dependências**
   ```bash
   bun install
   ```

2. **Configure as Variáveis de Ambiente**
   Crie um arquivo `.env` na raiz do projeto (veja `.env.example` se disponível) e configure as credenciais do banco e JWT.

3. **Execute as Migrations**
   ```bash
   bun x prisma generate
   bun x prisma migrate dev
   ```

4. **Inicie o Servidor**
   ```bash
   # Modo Desenvolvimento
   bun run start:dev

   # Modo Produção
   bun run start:prod
   ```

## 🛠️ Tecnologias

- **Framework**: NestJS
- **ORM**: Prisma
- **Runtime**: Bun
- **Linguagem**: TypeScript

---
<div align="center">
Desenvolvido por CodesDevs
</div>
