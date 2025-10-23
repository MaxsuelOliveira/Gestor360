# 💼 Gestor360 — Painel de Gestão de Empresas

Interface frontend em React com Vite para gerenciar empresas, contatos, servidores e suporte técnico.

<!-- Badges: substitua os valores/links conforme seu pipeline/versão -->
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/MaxsuelOliveira/GestaoEmpresasReactJS/actions)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/MaxsuelOliveira/GestaoEmpresasReactJS/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)

---

## Visão geral

`Gestor360` é uma plataforma web em React com Vite para gerenciamento de empresas, contatos, servidores e suporte (helpdesk). Foi pensada para ser fácil de customizar e integrar com micro-serviços.

## Principais funcionalidades

- Autenticação e controle de acesso
- Gestão de empresas, contatos e certificados
- Monitoramento e suporte (helpdesk, Anydesk)
- Relatórios e administração de usuários

## Tecnologias

- React
- Vite
- TypeScript
- Tailwind CSS

---

## Sobre a API (opcional)

Este repositório contém a interface frontend. Caso você também use a API que acompanha o projeto (Node/Express + Prisma + Oracle), abaixo seguem instruções e referências rápidas para rodar a API localmente.

> Observação: as instruções abaixo assumem que a API está em um repositório ou pasta separada — adapte os caminhos conforme sua organização.

### 💼 API - Sistema de Controle de Clientes (resumo)

API para gerenciar empresas, contatos, acessos via Anydesk, servidores, helpdesk, certificados digitais, sistemas utilizados e usuários administradores. Ideal para uso interno em empresas de tecnologia ou suporte técnico.

### 🔧 Tecnologias usadas na API

- Node.js
- Express.js
- Prisma ORM
- Oracle Database (via Docker)
- JWT para autenticação
- Bcrypt para criptografia de senhas
- Dotenv para variáveis de ambiente

### 🐘 Banco de Dados (Oracle com Docker)

Para facilitar o desenvolvimento, você pode subir uma instância Oracle 21c com Docker. Exemplo de compose (ajuste conforme necessário):

```powershell
docker-compose up -d
```

### 📦 Instalação da API

```powershell
git clone https://github.com/seu-usuario/nome-da-api.git
cd nome-da-api
npm install
```

### .env (exemplo)

Crie o arquivo `.env` com as variáveis principais:

```text
PORT=3000
HOST=localhost
DATABASE_URL="oracle://oracle:oracle@localhost:1521/oracle"
JWT_SECRET="sua_chave_secreta_super_segura"
```

Usuário: **oracle** | Senha: **oracle** | DB: **oracle**

### 🔄 Prisma ORM

```powershell
# Gerando o client
npx prisma generate
# Obs: Oracle não suporta prisma migrate, use db push (Cuidado em PROD):
npx prisma db push
# Testando a conexão
npx prisma studio
```

### 🧪 Seed (Usuário Admin)

Para criar um usuário administrador padrão:

Usuário: `admin@admin.com`

Senha: **senha123**

```powershell
node prisma/seed.js
```

### Execução da API

```powershell
npm run dev
```

### Autenticação

Todas as rotas protegidas usam o header Authorization:

```text
Authorization: Bearer SEU_TOKEN_AQUI
```

### Postman

Importe a coleção Postman para exemplos de requisição: (substitua pelo seu link)

[Coleção Postman](https://elements.getpostman.com/redirect?entityId=17594781-7c9d4b48-77d6-4a73-8cc1-c18953a3ac78&entityType=collection)

---

<!-- ## Captura de tela / Demo

Insira capturas de tela ou GIFs na pasta `assets/` e referencie aqui.

![Screenshot placeholder](./assets/screenshot.png)

Exemplo de uso de GIF (troque pelo seu arquivo):

![Demo GIF placeholder](./assets/demo.gif)

Dica: gere um GIF curto (5-8s) mostrando a tela principal e coloque em `assets/demo.gif`. -->

## Instalação

1. Clone o repositório

2. Instale dependências

```powershell
npm install
```

## Execução (desenvolvimento)

```powershell
npm run dev
```

## Produção

```powershell
npm run build; npm run preview
```

## Contribuição

Contribuições são bem-vindas. Abra issues para discutir features e bugs. Para mudanças mais complexas, crie um pull request com uma descrição clara.

## Licença

Licença: MIT — consulte o arquivo LICENSE (se aplicável).
