# 📝 Changelog - Reestruturação RNDS/RAC

Data: 25 de Novembro de 2024

## 🎯 Objetivo da Reestruturação

Transformar o backend em uma **simulação simplificada da RNDS (RAC)**, implementando:

1. ✅ Estrutura de banco alinhada ao RAC
2. ✅ Endpoints FHIR padronizados
3. ✅ Mapeadores unificados BR Core
4. ✅ Clean Architecture
5. ✅ Seed com dados realistas

---

## 🗄️ Banco de Dados - Schema Prisma

### ✨ Campos Adicionados

**Patient**
- `cpf` (String, unique)
- `cns` (String, unique)
- `photo` (String, URL)
- Índices em `cpf` e `cns`

**Organization**
- `cnes` (String, unique, Código Nacional de Estabelecimento)
- `alias` (String, nome fantasia)
- `active` (Boolean)
- Índice em `cnes`

**Practitioner**
- `cpf` (String, unique)
- `cns` (String, unique)
- `councilType` (String, ex: CRM, COREN)
- `councilNumber` (String)
- `councilUF` (String)
- `qualificationText` (String)
- Índices em `cpf` e `cns`

**Encounter**
- Índices de performance: `[patientId, start]`, `status`
- Comentários explicativos nos campos

**Observation**
- `note` (String, observações adicionais)
- Índices: `[patientId, effectiveDateTime]`, `categoryCode`, `code`

**Condition**
- `severity` (String, mild|moderate|severe)
- `abatementDateTime` (DateTime, data de resolução)
- Índices: `patientId`, `code`, `clinicalStatus`

**AllergyIntolerance**
- `type` (String, allergy|intolerance)
- `category` (String, food|medication|environment|biologic)
- Índices: `patientId`, `clinicalStatusCode`

**Procedure**
- `note` (String)
- Índices: `patientId`, `code`

**MedicationStatement**
- `dosage` (String, texto da dosagem)
- `route` (String, via de administração)
- Índices: `patientId`, `status`

---

## 🏗️ Arquitetura - Novos Módulos

### 1. Domain Layer (`src/domain/fhir/`)

**Criado:**
- `types.ts` - Tipos TypeScript completos para recursos FHIR BR Core
  - FHIRBundle, FHIRPatient, FHIREncounter, FHIRObservation, etc.
  - Constantes BR Core (perfis, sistemas de identificação)
  
- `mapper.ts` - Conversores unificados Prisma → FHIR
  - `mapPatientToFHIR()`
  - `mapEncounterToFHIR()`
  - `mapObservationToFHIR()`
  - `mapConditionToFHIR()`
  - `mapAllergyIntoleranceToFHIR()`
  - `mapProcedureToFHIR()`
  - `mapMedicationStatementToFHIR()`
  - `mapPractitionerToFHIR()`
  - `mapOrganizationToFHIR()`
  - `createBundle()` - helper para criar Bundles

- `index.ts` - Exportações centralizadas

### 2. Repositories Layer (`src/repositories/`)

**Criado:**
- `patientRepository.ts` - Consultas ao banco
  - `findByCPF()`
  - `findById()`, `findByFhirId()`
  - `findEncounters()`
  - `findObservations()`
  - `findConditions()`
  - `findAllergies()`
  - `findProcedures()`
  - `findMedications()`
  - `findPatientHistory()` - consulta agregada

- `authRepository.ts` - Credenciais
  - `findCredentialsByUsername()`
  - `findPatientWithCredentials()`
  - `createCredential()`
  - `updatePassword()`

### 3. Services Layer (`src/services/`)

**Criado:**
- `fhir/patientService.ts` - Lógica FHIR
  - `getPatientByCPF()`
  - `getPatientHistory()` - monta Bundle completo
  - `getPatientEncounters()`
  - `getPatientObservations()`
  - `getPatientConditions()`
  - `getPatientAllergies()`
  - `getPatientProcedures()`
  - `getPatientMedications()`

- `auth/authService.ts` - Autenticação
  - `login()` - valida e gera JWT
  - `verifyToken()` - valida JWT
  - `hashPassword()`, `comparePassword()`
  - Mock integrado para desenvolvimento

### 4. Controllers Layer (`src/controllers/`)

**Criado:**
- `fhir/patientController.ts` - Controllers FHIR
  - Validação com Zod
  - Autorização (paciente só acessa seus dados)
  - Um controller por endpoint

- `auth/authController.ts` - Controllers Auth
  - `login()`
  - `me()` - retorna usuário autenticado

### 5. Routes Layer (`src/routes/`)

**Criado:**
- `fhir.routes.ts` - Rotas FHIR
  - `GET /fhir/patient/:cpf`
  - `GET /fhir/patient/:patientId/history`
  - `GET /fhir/encounters/:patientId`
  - `GET /fhir/observations/:patientId`
  - `GET /fhir/conditions/:patientId`
  - `GET /fhir/allergies/:patientId`
  - `GET /fhir/procedures/:patientId`
  - `GET /fhir/medications/:patientId`

**Atualizado:**
- `auth.routes.ts`
  - `POST /auth/login`
  - `GET /auth/me` (novo)

### 6. Middlewares

**Criado:**
- `asyncHandler.ts` - Wrapper para erros assíncronos

**Atualizado:**
- `authenticate.ts`
  - Usa `authService.verifyToken()`
  - Valida formato "Bearer <token>"
  - Anexa payload completo em `req.user`

---

## 🌱 Seed - Dados Iniciais

**Criado:** `prisma/seed.ts`

Popula o banco com:
- 1 organização (Hospital Santa Luzia)
- 1 profissional (Dra. Ana Silva)
- 1 paciente completo (Maria Oliveira Santos)
  - CPF: 12345678910
  - Senha: 12345
- 2 encontros (consulta de rotina, exames)
- 4 observações (glicose, triglicerídeos, PA, FC)
- 2 alergias (dipirona, crustáceos)
- 1 condição (hiperlipidemia)
- 1 procedimento (hemograma)
- 1 medicamento (sinvastatina)
- 1 evento de auditoria

**Scripts package.json:**
- `npm run seed` - popula banco
- `npm run db:reset` - reseta e popula

---

## 📡 API - Mudanças de Endpoints

### Novos Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/fhir/patient/:cpf` | Busca paciente por CPF |
| GET | `/fhir/patient/:id/history` | Histórico completo (RAC) |
| GET | `/fhir/encounters/:patientId` | Atendimentos |
| GET | `/fhir/observations/:patientId` | Exames e sinais vitais |
| GET | `/fhir/conditions/:patientId` | Problemas de saúde |
| GET | `/fhir/allergies/:patientId` | Alergias |
| GET | `/fhir/procedures/:patientId` | Procedimentos |
| GET | `/fhir/medications/:patientId` | Medicamentos |
| GET | `/auth/me` | Dados do usuário autenticado |

### Endpoints Deprecados

| Antigo | Novo |
|--------|------|
| `GET /patients/:id/summary` | `GET /fhir/patient/:id/history` |

---

## 📚 Documentação Criada

1. **README.md** (root) - Visão geral do projeto completo
2. **backend/README.md** - Documentação da API
3. **docs/RNDS-SIMULATION.md** - Como a simulação funciona
4. **docs/MIGRATION-GUIDE.md** - Guia de migração
5. **docs/CHANGELOG-RNDS.md** - Este arquivo

---

## 🔄 Formato de Respostas

### Antes

Respostas customizadas:

```json
{
  "patient": { /* ... */ },
  "encounters": [],
  "observations": []
}
```

### Depois (FHIR Bundle)

Todas as respostas são FHIR Bundles:

```json
{
  "resourceType": "Bundle",
  "type": "collection",
  "timestamp": "2024-11-25T12:00:00Z",
  "total": 15,
  "entry": [
    {
      "fullUrl": "Patient/patient-123",
      "resource": { /* FHIR Patient completo */ }
    },
    // ... mais recursos
  ]
}
```

---

## 🔒 Segurança - Melhorias

1. ✅ JWT com payload completo (`sub`, `fhirId`, `cpf`)
2. ✅ Validação de formato "Bearer <token>"
3. ✅ Autorização granular (paciente vs patientId)
4. ✅ Erros padronizados com AppError
5. ✅ AsyncHandler para tratamento de erros
6. ✅ Validação Zod em todos os inputs
7. ✅ Auditoria de eventos

---

## 🧪 Testes e Desenvolvimento

### Modo Mock

Mantido e melhorado:
- `ENABLE_MOCK_AUTH=true` no `.env`
- Mock integrado em `authService`
- Credenciais: CPF `12345678910`, senha `12345`

### Prisma Studio

Visualize o banco:
```bash
npm run studio
```

---

## 📦 Dependências

Nenhuma nova dependência adicionada. O projeto continua usando:
- express, cors, helmet, morgan
- prisma, @prisma/client
- jsonwebtoken, bcryptjs
- zod, dotenv
- typescript, tsx

---

## ⚡ Performance

### Índices Adicionados

- `Patient`: cpf, cns
- `Organization`: cnes
- `Practitioner`: cpf, cns
- `Encounter`: [patientId, start], status
- `Observation`: [patientId, effectiveDateTime], categoryCode, code
- `Condition`: patientId, code, clinicalStatus
- `AllergyIntolerance`: patientId, clinicalStatusCode
- `Procedure`: patientId, code
- `MedicationStatement`: patientId, status

Esses índices otimizam consultas em `findPatientHistory()` e endpoints de busca.

---

## 🚀 Como Atualizar

1. **Pull do repositório**
   ```bash
   git pull origin main
   ```

2. **Instalar dependências** (se houver novas)
   ```bash
   cd backend
   npm install
   ```

3. **Gerar cliente Prisma**
   ```bash
   npm run generate
   ```

4. **Rodar migrations**
   ```bash
   npm run migrate
   ```

5. **Popular banco**
   ```bash
   npm run seed
   ```

6. **Iniciar servidor**
   ```bash
   npm run dev
   ```

---

## ✅ Status Final

**Todos os objetivos foram atingidos:**

- ✅ Schema do banco alinhado ao RAC da RNDS
- ✅ Clean Architecture implementada
- ✅ FHIRMapper unificado para BR Core
- ✅ Endpoints FHIR padronizados (`/fhir/*`)
- ✅ Autenticação e autorização robustas
- ✅ Seed com dados realistas
- ✅ Documentação completa

**Próximos passos sugeridos:**

- [ ] Testes automatizados (unitários + integração)
- [ ] CI/CD pipeline
- [ ] Deploy em ambiente cloud
- [ ] Atualizar frontend para novos endpoints
- [ ] Implementar mais recursos FHIR (DocumentReference, etc)

---

**Esta reestruturação torna o projeto mais robusto, modular, padronizado e alinhado às boas práticas de interoperabilidade em saúde digital (FHIR BR Core / RNDS).**

