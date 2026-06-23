# Arquitetura e Organização - Ecossistema CodesDevs

Este documento descreve a arquitetura de microserviços e a organização do ecossistema de APIs da CodesDevs.

## 🏗️ APIs e Responsabilidades

### 1. **api-flow** (Porta: 4242)
- **Papel:** Centralizador de Identidade e Catálogo Global.
- **Responsabilidades:**
  - Login e gerenciamento de sessões (JWT).
  - Gestão global de Usuários (Identity).
  - Cadastro de **Revendas**.
  - Gatilho de provisionamento de schemas de Revenda.
  - Catálogo de roteamento (qual usuário pertence a qual revenda/empresa).

### 2. **api-revenda** (Porta: 4243)
- **Papel:** Painel Administrativo da Revenda.
- **Responsabilidades:**
  - Gestão de **Clientes da Revenda** (Contratantes).
  - Cadastro de **Empresas (Tenants)** dentro da revenda.
  - Gatilho de provisionamento de schemas de Empresa no CDS Gestor.
  - Sistema de **Tickets e Suporte** da revenda.
  - Gestão de **Contratos** e Cobrança da revenda.

### 3. **api-cdsgestor** (Porta: 4244)
- **Papel:** Core ERP / Software de Gestão.
- **Responsabilidades:**
  - Lógica de negócio do ERP (Produtos, Categorias, Clientes do ERP, etc).
  - Multi-tenancy via **Schemas Dinâmicos** (um schema por empresa).
  - Provisionamento físico de tabelas do ERP.

### 4. **api-whatsapp** (Porta: 4245 - *Em construção*)
- **Papel:** Microserviço especializado em integrações de mensageria.
- **Responsabilidades:**
  - Gerenciamento de sessões do WhatsApp (Instâncias).
  - Webhooks e WebSockets para mensageria em tempo real.
  - Isolamento de dependências pesadas (ex: Puppeteer/Baileys).

### 5. **api-fiscal** (Porta: 4246 - *Planejado*)
- **Papel:** Motor especializado de emissão de documentos fiscais eletrônicos.
- **Responsabilidades:**
  - Emissão de NF-e, NFC-e e NFS-e.
  - Comunicação com SEFAZ (autorização, cancelamento, inutilização, CC-e).
  - Gestão de certificados digitais (A1/A3).
  - Tabelas auxiliares fiscais (NCM, CFOP, CEST).
  - Armazenamento de XML em storage externo (S3/R2).
  - **Banco único** (sem multi-schema) — dados fiscais são referenciados por `companyId`.
  - **Não possui cadastro próprio** — busca produtos+tributação do `api-cdsgestor` e configurações da empresa do `api-flow` via S2S.

---

## 📁 Estrutura de Diretórios (Padrão NestJS + Bun)

```
repos/
├── api-flow/          # Auth & Global Catalog
├── api-revenda/       # Reseller Admin & Support
├── api-cdsgestor/     # ERP Core & Tenant Data
├── api-whatsapp/      # WhatsApp Messaging Service
└── api-fiscal/        # Fiscal Document Issuance Engine
```

## 👥 Hierarquia de Usuários (UserType)

### 1. **CODESDEVS_SUPERADMIN**
- Administrador total do ecossistema.
- Gerencia Revendas na `api-flow`.

### 2. **REVENDA_ADMIN / GERENTE / SUPORTE**
- Gerenciam seus clientes e empresas na `api-revenda`.
- Prestam suporte via sistema de Tickets.

### 3. **CLIENTE_ADMIN / GERENTE / FUNCIONARIO**
- Usuários finais que utilizam o ERP na `api-cdsgestor`.

---

## 📊 Estrutura de Dados Multi-Tenant

### Banco de Dados Global (`flow` - Schema `public`)
Utilizado por todas as APIs como referência (Catálogo).
- Tabelas: `users`, `revendas`, `companies` (mapping), `user_companies`.

### Schemas de Revenda (`revenda_domain`)
Localizado na `api-revenda`.
- Tabelas: `clients` (contratantes), `tickets`, `contracts`.

### Schemas de Empresa (`company_subdomain`)
Localizado na `api-cdsgestor`.
- Tabelas: `products`, `categories`, `customers` (ERP), `orders`, etc.

### Banco Único da `api-fiscal`
A `api-fiscal` **não segue** o modelo multi-schema. Utiliza um banco único com discriminação por `companyId`.
- Tabelas: `nfe_issued`, `nfe_events`, `ncm_table`, `cfop_table`, `cest_table`.
- XMLs armazenados em storage externo (S3/R2), não no banco.
- Motivo: motor de transmissão — recebe dados prontos via S2S e só persiste o resultado da emissão.

---

## 🚀 Fluxo de Provisionamento

1. **Criação de Revenda:**
   `api-flow` (salva registro) ➔ `api-revenda` (cria schema `revenda_xxx`).

2. **Criação de Empresa:**
   `api-revenda` (salva registro no global) ➔ `api-cdsgestor` (cria schema `company_xxx`).

---

## 🔒 Segurança e Comunicação S2S

- **Autenticação:** Centralizada na `api-flow`. JWT compartilhado entre todos os subdomínios via cookie `.codesdevs.com.br`.
- **S2S (Service-to-Service):** Comunicação entre APIs protegida por `INTERNAL_API_KEY` via header `x-api-key`.
