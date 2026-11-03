# 🏥 Simulação RNDS/RAC - Documentação Técnica

## Visão Geral

Este projeto implementa uma simulação simplificada da **RNDS (Rede Nacional de Dados em Saúde)** e seu componente **RAC (Repositório Assistencial Clínico)**, seguindo o padrão **FHIR R4** com perfis **BR Core**.

## O que é a RNDS?

A **Rede Nacional de Dados em Saúde (RNDS)** é a plataforma nacional de integração de dados em saúde do Brasil, gerenciada pelo Ministério da Saúde. Ela centraliza informações de saúde dos cidadãos brasileiros de forma segura e padronizada.

### RAC - Repositório Assistencial Clínico

O **RAC** é o componente da RNDS responsável por armazenar o histórico clínico dos pacientes. Ele organiza os dados em recursos FHIR:

- **Patient** (Paciente)
- **Encounter** (Atendimento)
- **Observation** (Observações clínicas: exames, sinais vitais)
- **Condition** (Problemas de saúde/diagnósticos)
- **AllergyIntolerance** (Alergias e reações adversas)
- **Procedure** (Procedimentos realizados)
- **MedicationStatement** (Medicamentos em uso)
- **Practitioner** (Profissionais de saúde)
- **Organization** (Estabelecimentos de saúde)

## Como Nossa Simulação Funciona

### Arquitetura

```
┌─────────────┐
│   Frontend  │  (React)
│   Portal    │
└──────┬──────┘
       │ HTTPS
       │
┌──────▼──────────────────────┐
│   Backend FHIR API          │
│   (Simulação RNDS/RAC)      │
│                             │
│  ┌──────────────────────┐   │
│  │  Endpoints FHIR      │   │
│  │  /fhir/*             │   │
│  └──────────────────────┘   │
│                             │
│  ┌──────────────────────┐   │
│  │  FHIR Mapper         │   │
│  │  (Prisma → FHIR)     │   │
│  └──────────────────────┘   │
│                             │
│  ┌──────────────────────┐   │
│  │  PostgreSQL          │   │
│  │  (RAC local)         │   │
│  └──────────────────────┘   │
└─────────────────────────────┘
```

### Fluxo de Dados

1. **Autenticação**
   - Paciente faz login com CPF + senha
   - Backend valida credenciais e gera JWT
   - Token é usado em todas as requisições

2. **Consulta de Dados**
   - Frontend requisita histórico: `GET /fhir/patient/:id/history`
   - Backend consulta banco relacional (PostgreSQL)
   - Dados são convertidos para FHIR Bundle pelo mapper
   - Bundle é retornado ao frontend

3. **Segurança e Autorização**
   - JWT valida identidade do paciente
   - Middleware verifica se paciente acessa apenas seus dados
   - Todas as transações são auditadas

## Diferenças entre Simulação e RNDS Real

| Aspecto | RNDS Real | Nossa Simulação |
|---------|-----------|-----------------|
| **Autenticação** | Gov.br (OAuth2) | JWT simples (CPF + senha) |
| **Certificados** | ICP-Brasil obrigatório | Não requerido |
| **Base de dados** | Nacional centralizada | PostgreSQL local |
| **Escala** | Milhões de pacientes | Dados de exemplo (seed) |
| **Interoperabilidade** | Conecta sistemas nacionais | Sistema isolado |
| **Conformidade** | 100% BR Core + validações | Subset simplificado |
| **Ambiente** | Produção + Homologação | Desenvolvimento local |

## Perfis BR Core Implementados

### 1. Patient (BR Core Indivíduo)

```typescript
{
  resourceType: "Patient",
  meta: {
    profile: ["http://www.saude.gov.br/fhir/r4/StructureDefinition/BRIndividuo-1.0"]
  },
  identifier: [
    {
      system: "http://www.saude.gov.br/fhir/r4/NamingSystem/cpf",
      value: "12345678910"
    },
    {
      system: "http://www.saude.gov.br/fhir/r4/NamingSystem/cns",
      value: "987654321098765"
    }
  ],
  name: [...],
  gender: "female",
  birthDate: "1985-03-15"
}
```

### 2. Encounter (BR Core Encontro)

Representa um atendimento clínico.

```typescript
{
  resourceType: "Encounter",
  status: "finished",
  class: {
    code: "AMB",  // Ambulatorial
    display: "Ambulatorial"
  },
  subject: {
    reference: "Patient/patient-123"
  },
  period: {
    start: "2024-10-02T09:00:00Z",
    end: "2024-10-02T10:00:00Z"
  },
  serviceProvider: {
    reference: "Organization/org-hosp-santa-luzia"
  }
}
```

### 3. Observation (BR Core Observação)

Exames laboratoriais, sinais vitais, etc.

```typescript
{
  resourceType: "Observation",
  status: "final",
  category: [{
    coding: [{
      code: "laboratory"
    }]
  }],
  code: {
    coding: [{
      system: "http://loinc.org",
      code: "2339-0",
      display: "Glicose"
    }]
  },
  valueQuantity: {
    value: 97,
    unit: "mg/dL"
  }
}
```

### 4. Condition (BR Core Problema/Condição)

Problemas de saúde, diagnósticos (CID-10).

```typescript
{
  resourceType: "Condition",
  clinicalStatus: {
    coding: [{
      code: "active"
    }]
  },
  code: {
    coding: [{
      system: "http://www.saude.gov.br/fhir/r4/CodeSystem/BRCID10",
      code: "E78.5",
      display: "Hiperlipidemia não especificada"
    }]
  }
}
```

### 5. AllergyIntolerance (BR Core Alergia)

```typescript
{
  resourceType: "AllergyIntolerance",
  clinicalStatus: {
    coding: [{ code: "active" }]
  },
  type: "allergy",
  category: ["medication"],
  criticality: "high",
  code: {
    coding: [{
      code: "dipirona",
      display: "Dipirona"
    }]
  }
}
```

## Identificadores Nacionais

O sistema usa os seguintes sistemas de identificação brasileiros:

- **CPF:** `http://www.saude.gov.br/fhir/r4/NamingSystem/cpf`
- **CNS:** `http://www.saude.gov.br/fhir/r4/NamingSystem/cns`
- **CNES:** `http://www.saude.gov.br/fhir/r4/NamingSystem/cnes`
- **CBO:** `http://www.saude.gov.br/fhir/r4/CodeSystem/BRCategoriaProfissional`

## Modelo de Dados Relacional → FHIR

### Mapeamento

O backend usa Prisma ORM para gerenciar um banco PostgreSQL relacional, que é então convertido para FHIR:

```
┌──────────────────┐         ┌─────────────────┐
│  Tabela Patient  │  ───►   │  FHIR Patient   │
│  + names         │         │  + name[]       │
│  + identifiers   │         │  + identifier[] │
│  + telecoms      │         │  + telecom[]    │
└──────────────────┘         └─────────────────┘

┌──────────────────┐         ┌─────────────────┐
│ Tabela Encounter │  ───►   │ FHIR Encounter  │
└──────────────────┘         └─────────────────┘

┌───────────────────┐        ┌──────────────────┐
│ Tabela Observation│  ───►  │ FHIR Observation │
│ + components      │        │ + component[]    │
└───────────────────┘        └──────────────────┘
```

### FHIRMapper

O módulo `src/domain/fhir/mapper.ts` contém todas as funções de conversão:

- `mapPatientToFHIR()`
- `mapEncounterToFHIR()`
- `mapObservationToFHIR()`
- `mapConditionToFHIR()`
- `mapAllergyIntoleranceToFHIR()`
- `mapProcedureToFHIR()`
- `mapMedicationStatementToFHIR()`

## Bundles FHIR

Todas as respostas da API são **FHIR Bundles** do tipo `collection` ou `searchset`.

### Exemplo: Histórico Completo

```json
{
  "resourceType": "Bundle",
  "type": "collection",
  "timestamp": "2024-11-25T12:00:00Z",
  "total": 15,
  "entry": [
    {
      "fullUrl": "Patient/patient-123",
      "resource": { /* FHIR Patient */ }
    },
    {
      "fullUrl": "Encounter/enc-001",
      "resource": { /* FHIR Encounter */ }
    },
    {
      "fullUrl": "Observation/obs-001",
      "resource": { /* FHIR Observation */ }
    },
    // ... mais recursos
  ]
}
```

## Segurança e Auditoria

### Autenticação

- **JWT** com payload contendo `patientId`, `fhirId`, `cpf`
- Tokens expiram em 1 hora
- Senhas armazenadas com bcrypt (salt=10)

### Autorização

- Middleware `authenticate` valida token em todas as rotas `/fhir/*`
- Cada controller verifica se `req.user.sub === patientId`
- Paciente só pode acessar seus próprios dados

### Auditoria

Tabela `AuditEvent` registra:
- Ação realizada (read, create, update, delete)
- Usuário/agente
- Paciente afetado
- Timestamp
- Detalhes adicionais (JSON)

## Testes e Desenvolvimento

### Modo Mock

Com `ENABLE_MOCK_AUTH=true`, o sistema usa dados mockados:

```typescript
{
  cpf: "12345678910",
  password: "12345",
  patient: {
    id: "patient-mock-123",
    fhirId: "patient-123",
    name: "Maria Oliveira"
  }
}
```

Útil para desenvolvimento do frontend sem configurar banco.

### Seed de Dados

O arquivo `prisma/seed.ts` cria:

- 1 estabelecimento de saúde (Hospital Santa Luzia)
- 1 profissional de saúde (Dra. Ana Silva)
- 1 paciente completo (Maria Oliveira Santos)
- 2 encontros/atendimentos
- 4 observações (glicose, triglicerídeos, PA, FC)
- 2 alergias (dipirona, crustáceos)
- 1 condição (hiperlipidemia)
- 1 procedimento (hemograma)
- 1 medicamento (sinvastatina)

Rode com: `npm run seed`

## Limitações da Simulação

Esta é uma **simulação simplificada** para fins acadêmicos. Não inclui:

- ❌ Certificados ICP-Brasil
- ❌ Autenticação Gov.br
- ❌ Validação completa de perfis BR Core
- ❌ Suporte a todos os recursos FHIR
- ❌ Integração com sistemas nacionais reais
- ❌ Alta disponibilidade e escalabilidade da RNDS real
- ❌ Conformidade com LGPD em ambiente produtivo

## Próximos Passos para Produção

Se você quiser evoluir esta simulação para um sistema real conectado à RNDS:

1. **Autenticação Gov.br**: implementar OAuth2 com Gov.br
2. **Certificados digitais**: integrar ICP-Brasil
3. **Validação FHIR**: usar FHIR Validator para garantir conformidade 100%
4. **Conectividade RNDS**: estudar [documentação oficial](https://rnds-guia.saude.gov.br/)
5. **LGPD**: implementar políticas de privacidade, consentimento, anonimização
6. **Testes**: criar suite completa de testes unitários e integração
7. **Infraestrutura**: deploy em cloud com alta disponibilidade

## Referências

- [RNDS - Guia do Desenvolvedor](https://rnds-guia.saude.gov.br/)
- [RNDS - Objetivo do RAC](https://rnds-guia.saude.gov.br/docs/rac/objetivo-rac)
- [BR Core FHIR Profiles](http://www.saude.gov.br/fhir/r4/)
- [FHIR R4 Specification](https://hl7.org/fhir/R4/)
- [Repositório kyriosdata/rnds](https://github.com/kyriosdata/rnds)

---

**Este documento descreve uma simulação acadêmica. Para uso em produção, consulte a documentação oficial da RNDS.**

