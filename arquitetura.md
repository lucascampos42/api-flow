# Arquitetura - api-flow

**Porta:** 4242 | **Papel:** Centralizador de Identidade e Catálogo Global

## Modelo de Dados: Banco Global (schema `public`)

A `api-flow` opera no schema `public` do banco global. Não utiliza multi-schema.

```
Tabelas: users, revendas, companies, clients, contracts,
         user_companies, access_rules, logs, blog_posts,
         contact_requests, suggestions, erp_instances
```

## Responsabilidades

- **Autenticação centralizada** — login, JWT, refresh token, 2FA, sessões
- **Gestão global de Usuários** — todos os tipos (CODESDEVS_SUPERADMIN, REVENDA_ADMIN, CLIENTE_ADMIN, etc.)
- **Catálogo de Revendas** — cadastro e mapeamento
- **Catálogo de Empresas** — mapeamento empresa ↔ schema
- **Gatilho de provisionamento** — dispara criação de schema na `api-revenda` via BullMQ/Redis
- **Sistema de Sugestões** — votação de funcionalidades
- **Blog e Contato** — CMS público

## Comunicação S2S

| Direção | Finalidade |
|---|---|
| `api-flow` → `api-revenda` | Provisionar schema de revenda |
| `api-flow` → `api-fiscal` | Fornecer configurações fiscais da empresa (nfeSettings) |
| `api-flow` ← `api-fiscal` | Webhook de retorno |

## Dependências

- NestJS + Prisma
- PostgreSQL (schema `public`)
- Redis + BullMQ (filas de provisionamento)
- Compartilha JWT_SECRET com as demais APIs
