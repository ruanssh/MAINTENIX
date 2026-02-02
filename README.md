# 🔧 MAINTENIX

<div align="center">

**Sistema de Gerenciamento de Manutenção de Máquinas**

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## 📋 Sobre o Projeto

O **MAINTENIX** é uma aplicação web completa para gerenciamento de manutenções de máquinas industriais. O sistema permite cadastrar máquinas, criar e acompanhar registros de manutenção, atribuir responsáveis, registrar eventos de manutenção e acompanhar métricas através de um dashboard intuitivo.

### ✨ Principais Funcionalidades

- 🏭 **Cadastro de Máquinas** - Registre máquinas com informações detalhadas (nome, linha, localização, modelo, número de série, foto)
- 📝 **Registros de Manutenção** - Crie e gerencie ordens de manutenção com prioridade, categoria, turno e responsável
- 📸 **Fotos de Manutenção** - Anexe fotos antes e depois da manutenção para documentação
- 🔧 **Eventos de Manutenção** - Registre eventos detalhados (substituição, inspeção, ajuste) com peças utilizadas
- 👥 **Gestão de Usuários** - Sistema completo de usuários com diferentes níveis de permissão
- 📊 **Dashboard** - Visualize métricas de manutenções pendentes e concluídas por turno
- 📧 **Notificações por E-mail** - Envio automático de e-mails para atribuições e recuperação de senha
- 📥 **Caixa de Entrada** - Cada técnico possui sua caixa de entrada com manutenções atribuídas

---

## 🛠️ Tecnologias

### Backend

| Tecnologia        | Descrição                                                                          |
| ----------------- | ---------------------------------------------------------------------------------- |
| **NestJS 11**     | Framework Node.js progressivo para construção de aplicações server-side eficientes |
| **Prisma 7**      | ORM moderno para Node.js e TypeScript                                              |
| **MariaDB/MySQL** | Banco de dados relacional                                                          |
| **JWT**           | Autenticação baseada em tokens                                                     |
| **Passport**      | Middleware de autenticação                                                         |
| **MinIO**         | Armazenamento de objetos compatível com S3 para upload de imagens                  |
| **Resend**        | Serviço de envio de e-mails transacionais                                          |
| **Swagger**       | Documentação automática da API                                                     |

### Frontend

| Tecnologia             | Descrição                                           |
| ---------------------- | --------------------------------------------------- |
| **React 19**           | Biblioteca para construção de interfaces de usuário |
| **TypeScript**         | Superset tipado de JavaScript                       |
| **Vite 7**             | Build tool e dev server ultrarrápido                |
| **TailwindCSS 4**      | Framework CSS utilitário                            |
| **React Router DOM 7** | Roteamento para aplicações React                    |
| **React Hook Form**    | Gerenciamento de formulários                        |
| **Zod**                | Validação de schemas                                |
| **Axios**              | Cliente HTTP                                        |
| **Sonner**             | Notificações toast elegantes                        |

### DevOps

| Tecnologia         | Descrição                    |
| ------------------ | ---------------------------- |
| **Docker**         | Containerização da aplicação |
| **Docker Compose** | Orquestração de containers   |

---

## 📁 Estrutura do Projeto

```
MAINTENIX/
├── backend/                    # API NestJS
│   ├── prisma/                 # Schema e configurações do Prisma
│   │   └── schema.prisma       # Definição do banco de dados
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # Autenticação (login, JWT, reset senha)
│   │   │   ├── dashboard/      # Métricas e resumos
│   │   │   ├── machines/       # CRUD de máquinas e manutenções
│   │   │   ├── mail/           # Serviço de e-mail
│   │   │   └── users/          # CRUD de usuários
│   │   ├── prisma/             # Módulo do Prisma
│   │   └── storage/            # Serviço MinIO para uploads
│   └── Dockerfile
│
├── frontend/                   # Aplicação React
│   ├── src/
│   │   ├── api/                # Configuração HTTP e tratamento de erros
│   │   ├── auth/               # Contexto de autenticação e rotas protegidas
│   │   ├── components/         # Componentes reutilizáveis
│   │   ├── layouts/            # Layouts da aplicação
│   │   ├── pages/              # Páginas da aplicação
│   │   │   ├── Home/           # Dashboard
│   │   │   ├── Login/          # Autenticação
│   │   │   ├── Machines/       # Gestão de máquinas
│   │   │   ├── MaintenanceRecords/  # Registros de manutenção
│   │   │   ├── Profile/        # Perfil do usuário
│   │   │   └── Users/          # Gestão de usuários
│   │   ├── schemas/            # Schemas de validação Zod
│   │   ├── services/           # Serviços de API
│   │   └── types/              # Definições de tipos TypeScript
│   └── Dockerfile
│
├── minio/                      # Configuração do MinIO
│   └── docker-compose.yml
│
└── docker-compose.yml          # Orquestração dos serviços
```

---

## 🚀 Como Executar

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- MariaDB/MySQL
- MinIO (ou serviço compatível S3)

### Desenvolvimento Local

#### Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.dev .env

# Executar migrations do Prisma
npx prisma migrate dev

# Gerar cliente Prisma
npx prisma generate

# Iniciar servidor de desenvolvimento
npm run start:dev
```

#### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.dev .env

# Iniciar servidor de desenvolvimento
npm run dev
```

### Produção com Docker

```bash
# Na raiz do projeto
docker-compose up -d --build
```

O backend estará disponível em `http://localhost:3000` e o frontend em `http://localhost:4173`.

---

## 📊 Modelo de Dados

### Entidades Principais

- **Users** - Usuários do sistema com diferentes roles
- **Machines** - Máquinas cadastradas para manutenção
- **Maintenance Records** - Registros de manutenção com status, prioridade, categoria e turno
- **Maintenance Events** - Eventos dentro de uma manutenção (substituição, inspeção, ajuste)
- **Maintenance Photos** - Fotos antes/depois da manutenção

### Enums

| Enum               | Valores                                                                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**         | `PENDING`, `DONE`                                                                                                                              |
| **Prioridade**     | `LOW`, `MEDIUM`, `HIGH`                                                                                                                        |
| **Categoria**      | `ELETRICA`, `MECANICA`, `PNEUMATICA`, `PROCESSO`, `ELETRONICA`, `AUTOMACAO`, `PREDIAL`, `FERRAMENTARIA`, `REFRIGERACAO`, `SETUP`, `HIDRAULICA` |
| **Turno**          | `PRIMEIRO`, `SEGUNDO`, `TERCEIRO`                                                                                                              |
| **Tipo de Evento** | `REPLACEMENT`, `INSPECTION`, `ADJUSTMENT`                                                                                                      |
| **Destino**        | `REPAIR`, `SCRAP`, `ANALYSIS`, `STORAGE`, `RETURN`                                                                                             |

---

## 🔐 Variáveis de Ambiente

### Backend (`.env`)

```env
DATABASE_URL="mysql://user:password@localhost:3306/maintenix"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="maintenix"
MINIO_PUBLIC_URL="http://localhost:9000"
RESEND_API_KEY="your-resend-api-key"
```

### Frontend (`.env`)

```env
VITE_API_BASE_URL="http://localhost:3000"
VITE_ALLOWED_HOSTS="localhost"
```

---

## 📚 Documentação da API

A documentação da API está disponível via Swagger em:

```
http://localhost:3000/api
```

---

## 📝 Scripts Disponíveis

### Backend

| Script               | Descrição                                    |
| -------------------- | -------------------------------------------- |
| `npm run start:dev`  | Inicia o servidor em modo de desenvolvimento |
| `npm run start:prod` | Inicia o servidor em modo de produção        |
| `npm run build`      | Compila o projeto                            |
| `npm run lint`       | Executa o linter                             |
| `npm run test`       | Executa os testes                            |

### Frontend

| Script            | Descrição                            |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Inicia o servidor de desenvolvimento |
| `npm run build`   | Compila o projeto para produção      |
| `npm run preview` | Visualiza o build de produção        |
| `npm run lint`    | Executa o linter                     |

---

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob licença privada. Todos os direitos reservados.

---

<div align="center">

**Desenvolvido com ❤️ para gestão eficiente de manutenções industriais**

</div>
