# 🏥 SAÚDE - Sistema FHIR BR Core

Aplicação web completa que simula o acesso ao histórico clínico do paciente, baseada no padrão **FHIR R4** com perfis **BR Core** e inspirada na **RNDS/RAC** (Rede Nacional de Dados em Saúde / Repositório Assistencial Clínico).

## 📋 Visão Geral

Este projeto entrega um **portal web** onde pacientes podem consultar de forma segura:

- 📊 Exames laboratoriais e sinais vitais
- 🏥 Histórico de atendimentos
- 💊 Alergias e medicamentos
- 🩺 Condições de saúde e procedimentos

O sistema é composto por:

1. **Frontend** React + TypeScript + Vite
2. **Backend** Node.js + Express + TypeScript + Prisma
3. **Banco de dados** PostgreSQL (modelagem baseada em FHIR)

## 🎯 Objetivo do Projeto

Demonstrar como implementar um sistema de saúde digital seguindo padrões nacionais e internacionais:

- ✅ Padrão **FHIR R4** (Fast Healthcare Interoperability Resources)
- ✅ Perfis **BR Core** do Ministério da Saúde
- ✅ Simulação do **RAC** da RNDS
- ✅ Segurança (JWT, bcrypt, HTTPS ready)
- ✅ Boas práticas de desenvolvimento

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd "TCC Project"
```

### 2. Configure o Backend

#### Opção A: Modo Mock (Recomendado - SEM banco de dados) ⚡

**Mais rápido! Não precisa configurar PostgreSQL/Supabase.**

```bash
cd backend
npm install
copy env.template .env
```

O `.env` já vem configurado para modo mock. **Não mude nada!**

Inicie o servidor:

```bash
npm run dev
```

✅ Pronto! API rodando em `http://localhost:3333`

**Credenciais mock:**
- CPF: `12345678910`
- Senha: `12345`

📚 [Guia completo do modo mock](./docs/SETUP-SEM-BANCO.md)

#### Opção B: Com Banco de Dados (PostgreSQL/Docker)

Se você precisa de banco real:

```bash
cd backend
npm install
copy env.template .env
```

Edite o `.env`:

```env
PORT=3333
DATABASE_URL="postgresql://usuario:senha@localhost:5432/fhir_rac"
JWT_SECRET="sua-chave-secreta-aqui"
ENABLE_MOCK_AUTH=false  # ← Mude para false
NODE_ENV=development
```

Rode as migrações e seed:

```bash
npm run generate
npm run migrate
npm run seed
npm run dev
```

📚 [Problemas com Supabase?](./docs/SUPABASE-SETUP.md)

### 3. Configure o Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

### 4. Acesse o Portal

Abra [http://localhost:5173](http://localhost:5173) e faça login com:

- **CPF:** `12345678910`
- **Senha:** `12345`

## 📁 Estrutura do Projeto

```
TCC Project/
├── frontend/              # React + TypeScript
│   ├── src/
│   │   ├── components/   # Componentes reutilizáveis
│   │   ├── pages/        # Páginas (Login, Dashboard)
│   │   ├── services/     # Integração com API
│   │   ├── modules/      # Contextos (Auth)
│   │   └── styles/       # CSS global
│   └── package.json
│
├── backend/              # Node.js + Express
│   ├── src/
│   │   ├── controllers/  # Controllers (auth, fhir)
│   │   ├── services/     # Lógica de negócio
│   │   ├── repositories/ # Acesso a dados
│   │   ├── domain/fhir/  # Tipos e mappers FHIR
│   │   ├── routes/       # Rotas da API
│   │   ├── middlewares/  # Auth, errors
│   │   └── lib/          # Prisma client
│   ├── prisma/
│   │   ├── schema.prisma # Modelo do banco
│   │   └── seed.ts       # Dados iniciais
│   └── package.json
│
├── docs/                 # Documentação
│   ├── RNDS-SIMULATION.md
│   ├── architecture-overview.md
│   └── database-schema.md
│
└── README.md             # Este arquivo
```

## 🔌 API - Principais Endpoints

### Autenticação

- `POST /auth/login` - Login com CPF + senha
- `GET /auth/me` - Dados do usuário autenticado

### Recursos FHIR (requerem autenticação)

- `GET /fhir/patient/:cpf` - Busca paciente por CPF
- `GET /fhir/patient/:id/history` - Histórico completo (RAC)
- `GET /fhir/encounters/:patientId` - Atendimentos
- `GET /fhir/observations/:patientId` - Exames e sinais vitais
- `GET /fhir/conditions/:patientId` - Problemas de saúde
- `GET /fhir/allergies/:patientId` - Alergias
- `GET /fhir/procedures/:patientId` - Procedimentos
- `GET /fhir/medications/:patientId` - Medicamentos

Todas as respostas são **FHIR Bundles** no formato JSON.

## 🛠️ Tecnologias Utilizadas

### Frontend

- **React 18** - UI library
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **React Router** - Roteamento
- **Context API** - Gerenciamento de estado

### Backend

- **Node.js** + **Express** - Runtime e framework
- **TypeScript** - Tipagem estática
- **Prisma ORM** - Acesso ao banco de dados
- **PostgreSQL** - Banco relacional
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **Zod** - Validação de schemas
- **Helmet** - Segurança HTTP
- **Morgan** - Logs de requisições

## 📚 Documentação

- [Backend README](./backend/README.md) - Detalhes da API
- [Simulação RNDS/RAC](./docs/RNDS-SIMULATION.md) - Como funciona
- [Arquitetura](./docs/architecture-overview.md) - Visão geral do sistema
- [Schema do Banco](./docs/database-schema.md) - Modelo de dados

## 🧪 Desenvolvimento

### Backend

```bash
cd backend

# Iniciar servidor dev
npm run dev

# Gerar cliente Prisma
npm run generate

# Rodar migrations
npm run migrate

# Popular banco
npm run seed

# Abrir Prisma Studio
npm run studio

# Resetar banco
npm run db:reset
```

### Frontend

```bash
cd frontend

# Iniciar dev server
npm run dev

# Build para produção
npm run build

# Preview build
npm run preview
```

## 🔒 Segurança

- ✅ Senhas hasheadas com bcrypt
- ✅ Autenticação JWT com expiração
- ✅ Autorização: paciente acessa apenas seus dados
- ✅ Helmet para headers de segurança
- ✅ CORS configurado
- ✅ Validação de entrada com Zod
- ✅ Auditoria de acessos

## 🌐 FHIR e BR Core

O sistema implementa os seguintes recursos FHIR com perfis BR Core:

- **Patient** (BR Core Indivíduo)
- **Practitioner** (BR Core Profissional)
- **Organization** (BR Core Estabelecimento de Saúde)
- **Encounter** (BR Core Encontro)
- **Observation** (BR Core Observação)
- **Condition** (BR Core Problema/Condição)
- **AllergyIntolerance** (BR Core Alergia/Reação Adversa)
- **Procedure** (BR Core Procedimento Realizado)
- **MedicationStatement** (BR Core Medicamento)

## 📊 Dados de Exemplo

Após rodar `npm run seed` no backend, você terá:

- **Paciente:** Maria Oliveira Santos (CPF: 12345678910)
- **Estabelecimento:** Hospital Santa Luzia
- **Profissional:** Dra. Ana Silva
- **2 encontros** (consulta de rotina, exames)
- **4 observações** (glicose, triglicerídeos, PA, FC)
- **2 alergias** (dipirona, crustáceos)
- **1 condição** (hiperlipidemia)
- **1 procedimento** (hemograma)
- **1 medicamento** (sinvastatina)

## 🚧 Limitações

Esta é uma **simulação acadêmica**. Não inclui:

- ❌ Integração real com RNDS
- ❌ Autenticação Gov.br
- ❌ Certificados ICP-Brasil
- ❌ Conformidade 100% com perfis BR Core
- ❌ Escalabilidade para produção
- ❌ Implementação completa de LGPD

## 📖 Referências

- [FHIR R4](https://hl7.org/fhir/R4/)
- [BR Core FHIR](http://www.saude.gov.br/fhir/r4/)
- [RNDS - Guia](https://rnds-guia.saude.gov.br/)
- [RNDS - RAC](https://rnds-guia.saude.gov.br/docs/rac/objetivo-rac)

## 👨‍💻 Desenvolvimento

Este projeto foi desenvolvido como Trabalho de Conclusão de Curso (TCC), demonstrando a aplicação de padrões modernos de interoperabilidade em saúde digital.

## 📝 Licença

Projeto acadêmico - TCC

---

**Desenvolvido com ❤️ seguindo padrões FHIR BR Core e inspirado na RNDS/RAC**

