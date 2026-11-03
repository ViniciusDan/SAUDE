# 📖 Guia de Migração - Backend Reestruturado

Este documento explica as mudanças realizadas na reestruturação do backend para simular a RNDS/RAC.

## 🎯 O Que Mudou

O backend foi completamente reestruturado seguindo **Clean Architecture** e padrões FHIR BR Core.

### Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Rotas** | `/patients/:id/summary` | `/fhir/patient/:id/history` |
| **Estrutura** | Controllers + Services misturados | Domain → Repositories → Services → Controllers |
| **Mapeadores** | `utils/fhirMappers.ts` | `domain/fhir/mapper.ts` (unificado) |
| **Tipos FHIR** | Poucos tipos | `domain/fhir/types.ts` (completo) |
| **Autenticação** | Middleware simples | `services/auth/authService.ts` + middleware |
| **Banco** | Schema básico | Schema enriquecido (CPF, CNS, CNES, CBO, etc) |

## 📁 Nova Estrutura de Arquivos

### Arquivos Criados

```
backend/src/
├── domain/fhir/                    [NOVO]
│   ├── types.ts                    # Tipos FHIR BR Core completos
│   ├── mapper.ts                   # Conversores Prisma → FHIR unificados
│   └── index.ts
│
├── repositories/                   [NOVO]
│   ├── patientRepository.ts        # Consultas ao banco
│   └── authRepository.ts           # Credenciais e autenticação
│
├── services/
│   ├── fhir/                       [NOVO]
│   │   └── patientService.ts       # Lógica FHIR + montagem de Bundles
│   └── auth/                       [NOVO]
│       └── authService.ts          # Login, JWT, validação
│
├── controllers/
│   ├── fhir/                       [NOVO]
│   │   └── patientController.ts    # Endpoints FHIR
│   └── auth/                       [NOVO]
│       └── authController.ts       # Login, /me
│
├── routes/
│   ├── fhir.routes.ts              [NOVO]
│   └── auth.routes.ts              [ATUALIZADO]
│
└── middlewares/
    ├── asyncHandler.ts             [NOVO]
    └── authenticate.ts             [ATUALIZADO]
```

### Arquivos Removidos/Substituídos

Estes arquivos **não são mais usados** na nova estrutura:

```
backend/src/
├── controllers/
│   ├── authController.ts           ❌ → auth/authController.ts
│   └── patientController.ts        ❌ → fhir/patientController.ts
│
├── services/
│   ├── authService.ts              ❌ → auth/authService.ts
│   ├── patientSummaryService.ts    ❌ → fhir/patientService.ts
│   └── mockData.ts                 ❌ (mock integrado em authService)
│
├── routes/
│   └── patient.routes.ts           ❌ → fhir.routes.ts
│
├── types/
│   └── fhir.ts                     ❌ → domain/fhir/types.ts
│
└── utils/
    └── fhirMappers.ts              ❌ → domain/fhir/mapper.ts
```

**Importante:** Você pode deletar esses arquivos antigos com segurança.

## 🔄 Mudanças na API

### Endpoints Antigos → Novos

| Antigo | Novo | Mudança |
|--------|------|---------|
| `POST /auth/login` | `POST /auth/login` | ✅ Mantido (resposta alterada) |
| `GET /patients/:id/summary` | `GET /fhir/patient/:id/history` | 🔄 Caminho e formato |
| - | `GET /fhir/patient/:cpf` | ✨ Novo |
| - | `GET /fhir/encounters/:patientId` | ✨ Novo |
| - | `GET /fhir/observations/:patientId` | ✨ Novo |
| - | `GET /fhir/conditions/:patientId` | ✨ Novo |
| - | `GET /fhir/allergies/:patientId` | ✨ Novo |
| - | `GET /fhir/procedures/:patientId` | ✨ Novo |
| - | `GET /fhir/medications/:patientId` | ✨ Novo |

### Mudanças no Schema do Banco

O schema Prisma foi enriquecido com campos alinhados ao BR Core:

**Patient:**
- ✨ Adicionado: `cpf`, `cns`, `photo`
- ✨ Índices em `cpf` e `cns`

**Organization:**
- ✨ Adicionado: `cnes`, `alias`, `active`
- ✨ Índice em `cnes`

**Practitioner:**
- ✨ Adicionado: `cpf`, `cns`, `councilType`, `councilNumber`, `councilUF`
- ✨ Índices em `cpf` e `cns`

**Encounter:**
- ✨ Índices em `[patientId, start]` e `status`

**Observation:**
- ✨ Adicionado: `note`
- ✨ Índices em `[patientId, effectiveDateTime]`, `categoryCode`, `code`

**Condition:**
- ✨ Adicionado: `severity`, `abatementDateTime`
- ✨ Índices em `patientId`, `code`, `clinicalStatus`

**AllergyIntolerance:**
- ✨ Adicionado: `type`, `category`
- ✨ Índices em `patientId`, `clinicalStatusCode`

**Procedure:**
- ✨ Adicionado: `note`
- ✨ Índices em `patientId`, `code`

**MedicationStatement:**
- ✨ Adicionado: `dosage`, `route`
- ✨ Índices em `patientId`, `status`

## 🔧 Como Migrar

### 1. Gerar Nova Migration

Após atualizar o `schema.prisma`:

```bash
cd backend
npm run generate
npm run migrate
```

Isso criará uma nova migration com todas as alterações.

### 2. Popular com Dados de Exemplo

```bash
npm run seed
```

Cria um paciente completo com histórico clínico.

### 3. Atualizar Frontend (se necessário)

Se o frontend ainda usa os endpoints antigos, atualize para os novos:

**Antes:**
```typescript
// services/fhirClient.ts
const response = await fetch(`/api/patients/${patientId}/summary`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

**Depois:**
```typescript
// services/fhirClient.ts
const response = await fetch(`/api/fhir/patient/${patientId}/history`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### 4. Limpar Arquivos Antigos (Opcional)

Você pode deletar os arquivos marcados com ❌ na seção "Arquivos Removidos/Substituídos".

## 📊 Comparação de Respostas

### Login Response

**Antes:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "patient-123",
    "name": "Maria"
  }
}
```

**Depois:**
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "clxxx",
    "fhirId": "patient-123",
    "name": "Maria Oliveira Santos",
    "cpf": "12345678910"
  }
}
```

### Patient Summary Response

**Antes:**
```json
{
  "patient": { /* Patient simples */ },
  "encounters": [ /* Array */ ],
  "observations": [ /* Array */ ]
}
```

**Depois (FHIR Bundle):**
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
    {
      "fullUrl": "Encounter/enc-001",
      "resource": { /* FHIR Encounter */ }
    },
    // ... mais recursos
  ]
}
```

## 🆕 Novos Conceitos

### 1. FHIRMapper Unificado

Todas as conversões Prisma → FHIR estão centralizadas:

```typescript
import { mapPatientToFHIR, mapEncounterToFHIR } from './domain/fhir';

const fhirPatient = mapPatientToFHIR(prismaPatient);
const fhirEncounter = mapEncounterToFHIR(prismaEncounter);
```

### 2. Repositories

Camada de acesso a dados isolada:

```typescript
import { patientRepository } from './repositories/patientRepository';

const history = await patientRepository.findPatientHistory(patientId);
```

### 3. FHIR Bundles

Toda resposta é um Bundle:

```typescript
import { createBundle } from './domain/fhir';

const bundle = createBundle('collection');
bundle.entry.push({ fullUrl: '...', resource: fhirResource });
```

### 4. AsyncHandler

Wrapper para capturar erros assíncronos:

```typescript
import { asyncHandler } from './middlewares/asyncHandler';

router.get('/endpoint', authenticate, asyncHandler(controller.method));
```

## ✅ Checklist de Migração

- [ ] Rodar `npm install` no backend
- [ ] Atualizar `.env` com novas variáveis (se necessário)
- [ ] Rodar `npm run generate`
- [ ] Rodar `npm run migrate`
- [ ] Rodar `npm run seed`
- [ ] Testar login: `POST /auth/login`
- [ ] Testar histórico: `GET /fhir/patient/:id/history`
- [ ] Atualizar frontend para novos endpoints
- [ ] Deletar arquivos antigos (opcional)
- [ ] Atualizar testes (se houver)

## 🐛 Troubleshooting

### Erro: "relation does not exist"

**Solução:** Rode as migrations
```bash
npm run migrate
```

### Erro: "Cannot find module 'domain/fhir'"

**Solução:** Recompile TypeScript
```bash
npm run generate
```

### Erro: "Patient não encontrado"

**Solução:** Rode o seed
```bash
npm run seed
```

### Erro: "Token inválido"

**Solução:** Verifique se `JWT_SECRET` está configurado no `.env`

## 📞 Suporte

Consulte os READMEs:
- [Backend README](../backend/README.md)
- [Simulação RNDS](./RNDS-SIMULATION.md)

---

**A migração deve ser transparente após rodar as migrations e seed. O novo sistema é mais robusto, modular e alinhado aos padrões FHIR BR Core!**

