# 🏥 Backend FHIR BR Core - Simulação RNDS/RAC

API REST que simula o comportamento da **RNDS (Rede Nacional de Dados em Saúde)** e seu componente **RAC (Repositório Assistencial Clínico)**, implementando o padrão **FHIR R4** com perfis **BR Core**.

## 📋 Visão Geral

Este backend funciona como uma **RNDS local simplificada**, permitindo que pacientes consultem seu histórico clínico de forma segura e padronizada. Toda resposta segue o formato FHIR Bundle compatível com os perfis nacionais BR Core.

### Principais Funcionalidades

- ✅ Autenticação JWT para pacientes (via CPF)
- ✅ Consulta de histórico clínico completo (RAC)
- ✅ Endpoints FHIR padronizados para recursos clínicos
- ✅ Banco relacional PostgreSQL mapeado para FHIR
- ✅ Modo mock para desenvolvimento sem banco
- ✅ Segurança (Helmet, CORS, bcrypt, JWT)
- ✅ Seed com dados realistas de exemplo

## 🗂️ Recursos FHIR Implementados

- **Patient** (BR Core Indivíduo)
- **Practitioner** (BR Core Profissional)
- **Organization** (BR Core Estabelecimento de Saúde)
- **Encounter** (BR Core Encontro/Atendimento)
- **Observation** (BR Core Observação - exames, sinais vitais)
- **Condition** (BR Core Problema/Condição)
- **AllergyIntolerance** (BR Core Alergia/Reação Adversa)
- **Procedure** (BR Core Procedimento Realizado)
- **MedicationStatement** (BR Core Medicamento)

## 🚀 Como Rodar

### Pré-requisitos

- Node.js 18+ e npm
- PostgreSQL 14+ rodando
- (Opcional) Docker para rodar PostgreSQL em container

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de template e ajuste conforme seu ambiente:

```bash
copy env.template .env
```

#### Opção A: Supabase (Recomendado)

**⚠️ IMPORTANTE:** Use a **Direct Connection** (porta 5432), não Session Pooler!

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Settings → Database → Connection string → **Direct connection**
3. Copie a URI (porta 5432)

```env
# Direct Connection do Supabase (porta 5432)
DATABASE_URL="postgresql://postgres.[REF]:[SENHA]@db.[REF].supabase.co:5432/postgres"

JWT_SECRET="sua-chave-secreta-super-segura-minimo-32-caracteres"
PORT=3333
ENABLE_MOCK_AUTH=true
NODE_ENV=development
```

**Problemas com migration travando?** Veja [SUPABASE-SETUP.md](../docs/SUPABASE-SETUP.md)

#### Opção B: PostgreSQL Local

```env
# PostgreSQL local
DATABASE_URL="postgresql://usuario:senha@localhost:5432/fhir_rac"

JWT_SECRET="sua-chave-secreta-super-segura-aqui"
PORT=3333
ENABLE_MOCK_AUTH=true
NODE_ENV=development
```

#### Opção C: Modo Mock (Sem Banco)

Para testar sem configurar banco de dados:

```env
# Qualquer URL válida (não será usada)
DATABASE_URL="postgresql://mock:mock@localhost:5432/mock"

JWT_SECRET="chave-qualquer"
PORT=3333
ENABLE_MOCK_AUTH=true  # ← Deixe true
NODE_ENV=development
```

Com `ENABLE_MOCK_AUTH=true`, a API funciona sem banco! Use CPF `12345678910` e senha `12345`.

### 3. Gerar Cliente Prisma

```bash
npm run generate
```

### 4. Rodar Migrações

```bash
npm run migrate
```

Isso criará todas as tabelas no banco.

### 5. Popular Banco com Dados de Exemplo (Seed)

```bash
npm run seed
```

Cria um paciente com histórico completo:
- **CPF:** 12345678910
- **Senha:** 12345

### 6. Iniciar Servidor

```bash
npm run dev
```

O servidor subirá em `http://localhost:3333`.

Teste o health check:

```bash
curl http://localhost:3333/health
```

## 📡 Endpoints da API

### Autenticação

#### `POST /auth/login`

Autentica o paciente e retorna token JWT.

**Body:**
```json
{
  "cpf": "12345678910",
  "password": "12345"
}
```

**Resposta:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxx",
    "fhirId": "patient-123",
    "name": "Maria Oliveira Santos",
    "cpf": "12345678910"
  }
}
```

#### `GET /auth/me`

Retorna dados do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

---

### Recursos FHIR (Todos requerem autenticação)

Todos os endpoints retornam um **FHIR Bundle** no formato JSON.

#### `GET /fhir/patient/:cpf`

Busca paciente por CPF.

**Exemplo:**
```bash
GET /fhir/patient/12345678910
Authorization: Bearer <token>
```

**Resposta:** Bundle com o recurso Patient.

---

#### `GET /fhir/patient/:patientId/history`

Busca histórico completo do paciente (RAC).

**Exemplo:**
```bash
GET /fhir/patient/clxxx/history
Authorization: Bearer <token>
```

**Resposta:** Bundle com Patient + Encounters + Observations + Conditions + Allergies + Procedures + Medications.

---

#### `GET /fhir/encounters/:patientId`

Busca encontros/atendimentos do paciente.

---

#### `GET /fhir/observations/:patientId`

Busca observações (exames, sinais vitais) do paciente.

**Query params:**
- `category` (opcional): `laboratory`, `vital-signs`, `exam`

**Exemplo:**
```bash
GET /fhir/observations/clxxx?category=laboratory
```

---

#### `GET /fhir/conditions/:patientId`

Busca condições/problemas de saúde do paciente.

---

#### `GET /fhir/allergies/:patientId`

Busca alergias e intolerâncias do paciente.

---

#### `GET /fhir/procedures/:patientId`

Busca procedimentos realizados no paciente.

---

#### `GET /fhir/medications/:patientId`

Busca medicamentos do paciente.

---

## 🔒 Segurança

- **JWT:** Tokens com expiração de 1 hora
- **bcrypt:** Hash de senhas com salt=10
- **Helmet:** Headers de segurança HTTP
- **CORS:** Configurado para permitir frontend local
- **Autenticação obrigatória:** Todos os endpoints FHIR exigem token
- **Autorização:** Paciente só acessa seus próprios dados

## 🧪 Modo Mock (Desenvolvimento)

Com `ENABLE_MOCK_AUTH=true` no `.env`, a API usa dados mockados sem consultar o banco.

**Credenciais mock:**
- CPF: `12345678910`
- Senha: `12345`

Útil para desenvolver o frontend sem configurar PostgreSQL.

## 🗄️ Banco de Dados

### Schema Prisma

O schema está em `prisma/schema.prisma` e reflete a estrutura do RAC:

- `Patient` → identificadores (CPF, CNS), nomes, contatos, endereços
- `Organization` → estabelecimentos de saúde (CNES)
- `Practitioner` → profissionais (CPF, CNS, CBO, registro em conselho)
- `Encounter` → atendimentos
- `Observation` → exames e sinais vitais
- `Condition` → problemas de saúde (CID-10)
- `AllergyIntolerance` → alergias
- `Procedure` → procedimentos (TUSS, SIGTAP)
- `MedicationStatement` → medicamentos
- `PatientCredential` → credenciais de login
- `AuditEvent` → trilha de auditoria

### Comandos Úteis

```bash
# Ver banco no Prisma Studio
npm run studio

# Resetar banco (apaga tudo e roda migrations + seed)
npm run db:reset

# Criar nova migration
npm run migrate

# Aplicar migrations em produção
npm run migrate:deploy
```

## 📁 Estrutura de Pastas

```
backend/
├── prisma/
│   ├── schema.prisma       # Schema do banco
│   └── seed.ts             # Dados iniciais
├── src/
│   ├── config/
│   │   └── env.ts          # Variáveis de ambiente
│   ├── controllers/
│   │   ├── auth/
│   │   │   └── authController.ts
│   │   └── fhir/
│   │       └── patientController.ts
│   ├── domain/
│   │   └── fhir/
│   │       ├── types.ts    # Tipos FHIR BR Core
│   │       ├── mapper.ts   # Conversores Prisma → FHIR
│   │       └── index.ts
│   ├── errors/
│   │   └── AppError.ts
│   ├── lib/
│   │   └── prisma.ts       # Cliente Prisma
│   ├── middlewares/
│   │   ├── authenticate.ts
│   │   └── asyncHandler.ts
│   ├── repositories/
│   │   ├── patientRepository.ts
│   │   └── authRepository.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── fhir.routes.ts
│   ├── services/
│   │   ├── auth/
│   │   │   └── authService.ts
│   │   └── fhir/
│   │       └── patientService.ts
│   ├── app.ts              # Configuração Express
│   └── server.ts           # Entrada do servidor
├── .env                    # Variáveis de ambiente (não versionado)
├── env.template            # Template de .env
├── package.json
├── tsconfig.json
└── README.md
```

## 🧩 Arquitetura

O projeto segue **Clean Architecture**:

1. **Domain** (`domain/fhir/`): tipos e mapeadores FHIR puros
2. **Repositories** (`repositories/`): acesso ao banco via Prisma
3. **Services** (`services/`): lógica de negócio e montagem de Bundles FHIR
4. **Controllers** (`controllers/`): validação de entrada e resposta HTTP
5. **Routes** (`routes/`): definição de endpoints e middlewares
6. **Middlewares**: autenticação, tratamento de erros, async handler

## 🌐 Integração com Frontend

O frontend React deve:

1. Fazer login em `POST /auth/login` e guardar o token
2. Incluir o token em todas as requisições:
   ```
   Authorization: Bearer <token>
   ```
3. Consumir bundles FHIR dos endpoints `/fhir/*`
4. Decodificar recursos FHIR para exibição

## 📚 Referências

- [FHIR R4](https://hl7.org/fhir/R4/)
- [BR Core FHIR](http://www.saude.gov.br/fhir/r4/)
- [RNDS - Guia RAC](https://rnds-guia.saude.gov.br/docs/rac/objetivo-rac)
- [Repositório RNDS](https://github.com/kyriosdata/rnds)

## 📝 Licença

Este projeto é um protótipo acadêmico (TCC).

---

**Desenvolvido com ❤️ para simular a RNDS/RAC no padrão BR Core FHIR**
