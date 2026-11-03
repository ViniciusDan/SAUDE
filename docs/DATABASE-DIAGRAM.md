# 🗄️ Diagrama do Banco de Dados - RAC FHIR

## Estrutura Relacional Simplificada

```
┌─────────────────────────────────────────────────────────────────┐
│                          PATIENT (Paciente)                      │
│  ─────────────────────────────────────────────────────────────  │
│  id, fhirId, cpf, cns, active, gender, birthDate               │
│  maritalStatus, deceased, language, photo                        │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ 1:N (Um paciente tem múltiplos registros)
                  │
    ┌─────────────┼─────────────┬──────────────┬─────────────┐
    │             │             │              │             │
    ▼             ▼             ▼              ▼             ▼
┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐
│HumanName│  │Identifier│  │Telecom   │  │Address  │  │Credential│
│         │  │          │  │          │  │         │  │          │
│ -text   │  │ -system  │  │ -phone   │  │ -city   │  │ -username│
│ -family │  │ -value   │  │ -email   │  │ -state  │  │ -password│
│ -given  │  │ -CPF/CNS │  │          │  │         │  │          │
└─────────┘  └──────────┘  └──────────┘  └─────────┘  └──────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    ENCOUNTER (Atendimento)                       │
│  ─────────────────────────────────────────────────────────────  │
│  id, fhirId, status, classCode, typeCode                        │
│  start, end, reasonCode                                          │
│  patientId → PATIENT                                             │
│  practitionerId → PRACTITIONER                                   │
│  organizationId → ORGANIZATION                                   │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ 1:N
                  │
    ┌─────────────┴─────────────┐
    ▼                           ▼
┌──────────────┐          ┌──────────┐
│ OBSERVATION  │          │PROCEDURE │
│ (Exames)     │          │          │
│              │          │ -code    │
│ -code        │          │ -status  │
│ -category    │          │ -date    │
│ -value       │          │          │
│ -laboratory  │          └──────────┘
│ -vital-signs │
└──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              ALLERGYINTOLERANCE (Alergias)                       │
│  ─────────────────────────────────────────────────────────────  │
│  id, fhirId, clinicalStatus, verificationStatus                 │
│  type, category, code, criticality                               │
│  patientId → PATIENT                                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 CONDITION (Problemas de Saúde)                   │
│  ─────────────────────────────────────────────────────────────  │
│  id, fhirId, clinicalStatus, code (CID-10)                      │
│  severity, onsetDate, abatementDate                              │
│  patientId → PATIENT                                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│            MEDICATIONSTATEMENT (Medicamentos)                    │
│  ─────────────────────────────────────────────────────────────  │
│  id, fhirId, status, medicationCode                             │
│  dosage, route, effectiveStart, effectiveEnd                     │
│  patientId → PATIENT                                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 PRACTITIONER (Profissional)                      │
│  ─────────────────────────────────────────────────────────────  │
│  id, fhirId, cpf, cns, active, gender                           │
│  qualificationCode (CBO), councilType (CRM/COREN)                │
│  councilNumber, councilUF                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              ORGANIZATION (Estabelecimento)                      │
│  ─────────────────────────────────────────────────────────────  │
│  id, fhirId, cnes, name, alias, typeCode                        │
│  active                                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Cardinalidades

| Relacionamento | Tipo | Descrição |
|----------------|------|-----------|
| Patient ↔ HumanName | 1:N | Um paciente pode ter múltiplos nomes |
| Patient ↔ Identifier | 1:N | Um paciente tem CPF, CNS, etc |
| Patient ↔ Encounter | 1:N | Um paciente tem vários atendimentos |
| Patient ↔ Observation | 1:N | Um paciente tem vários exames |
| Patient ↔ AllergyIntolerance | 1:N | Um paciente pode ter várias alergias |
| Patient ↔ Condition | 1:N | Um paciente pode ter várias condições |
| Patient ↔ MedicationStatement | 1:N | Um paciente pode ter vários medicamentos |
| Encounter ↔ Observation | 1:N | Um atendimento gera vários exames |
| Encounter ↔ Procedure | 1:N | Um atendimento tem vários procedimentos |
| Encounter → Practitioner | N:1 | Atendimento realizado por um profissional |
| Encounter → Organization | N:1 | Atendimento em um estabelecimento |

---

## Principais Tabelas e Campos

### Patient (Núcleo do Sistema)
```sql
CREATE TABLE "Patient" (
  id              TEXT PRIMARY KEY,
  fhirId          TEXT UNIQUE NOT NULL,
  cpf             TEXT UNIQUE,           -- BR Core: CPF
  cns             TEXT UNIQUE,           -- BR Core: CNS
  active          BOOLEAN DEFAULT true,
  gender          TEXT,                  -- male|female|other|unknown
  birthDate       DATE,
  maritalStatus   TEXT,
  deceased        BOOLEAN DEFAULT false,
  language        TEXT DEFAULT 'pt-BR',
  photo           TEXT,
  createdAt       TIMESTAMP DEFAULT now(),
  updatedAt       TIMESTAMP
);

CREATE INDEX idx_patient_cpf ON "Patient"(cpf);
CREATE INDEX idx_patient_cns ON "Patient"(cns);
```

### Observation (Exames e Sinais Vitais)
```sql
CREATE TABLE "Observation" (
  id                 TEXT PRIMARY KEY,
  fhirId             TEXT UNIQUE NOT NULL,
  status             TEXT NOT NULL,      -- final|preliminary|amended
  categoryCode       TEXT,               -- laboratory|vital-signs
  codeSystem         TEXT,               -- http://loinc.org
  code               TEXT,               -- Código LOINC
  codeDisplay        TEXT,
  effectiveDateTime  TIMESTAMP,
  issued             TIMESTAMP,
  valueQuantity      DECIMAL(12,4),
  valueQuantityUnit  TEXT,
  valueString        TEXT,
  interpretationCode TEXT,
  note               TEXT,
  patientId          TEXT NOT NULL,      -- FK → Patient
  encounterId        TEXT,               -- FK → Encounter
  performerId        TEXT,               -- FK → Practitioner
  createdAt          TIMESTAMP DEFAULT now(),
  
  FOREIGN KEY (patientId) REFERENCES "Patient"(id),
  FOREIGN KEY (encounterId) REFERENCES "Encounter"(id),
  FOREIGN KEY (performerId) REFERENCES "Practitioner"(id)
);

CREATE INDEX idx_obs_patient ON "Observation"(patientId, effectiveDateTime);
CREATE INDEX idx_obs_category ON "Observation"(categoryCode);
CREATE INDEX idx_obs_code ON "Observation"(code);
```

### Encounter (Atendimento)
```sql
CREATE TABLE "Encounter" (
  id                TEXT PRIMARY KEY,
  fhirId            TEXT UNIQUE NOT NULL,
  status            TEXT NOT NULL,      -- finished|in-progress
  classCode         TEXT,               -- AMB|EMER|IMP
  typeCode          TEXT,
  reasonCode        TEXT,
  start             TIMESTAMP,
  end               TIMESTAMP,
  patientId         TEXT NOT NULL,      -- FK → Patient
  organizationId    TEXT,               -- FK → Organization
  practitionerId    TEXT,               -- FK → Practitioner
  createdAt         TIMESTAMP DEFAULT now(),
  
  FOREIGN KEY (patientId) REFERENCES "Patient"(id),
  FOREIGN KEY (organizationId) REFERENCES "Organization"(id),
  FOREIGN KEY (practitionerId) REFERENCES "Practitioner"(id)
);

CREATE INDEX idx_enc_patient ON "Encounter"(patientId, start);
CREATE INDEX idx_enc_status ON "Encounter"(status);
```

---

## Identificadores Brasileiros (BR Core)

O sistema usa os identificadores nacionais:

| Sistema | URL | Exemplo | Uso |
|---------|-----|---------|-----|
| **CPF** | `http://www.saude.gov.br/fhir/r4/NamingSystem/cpf` | 12345678910 | Paciente, Profissional |
| **CNS** | `http://www.saude.gov.br/fhir/r4/NamingSystem/cns` | 123456789012345 | Paciente, Profissional |
| **CNES** | `http://www.saude.gov.br/fhir/r4/NamingSystem/cnes` | 1234567 | Estabelecimento |
| **CBO** | `http://www.saude.gov.br/fhir/r4/CodeSystem/BRCategoriaProfissional` | 225100 | Qualificação Profissional |

---

## Exemplo de Dados Relacionados

### Paciente Maria Oliveira

```
Patient
├─ id: "clxxx"
├─ fhirId: "patient-123"
├─ cpf: "12345678910"
├─ cns: "987654321098765"
│
├─ HumanName
│  └─ text: "Maria Oliveira Santos"
│
├─ Identifier
│  ├─ CPF: "12345678910"
│  └─ CNS: "987654321098765"
│
├─ Encounter #1 (02/10/2024)
│  ├─ type: "Consulta de Rotina"
│  ├─ practitioner: "Dra. Ana Silva"
│  ├─ organization: "Hospital Santa Luzia"
│  └─ Observation
│     ├─ Pressão Arterial: 120/80 mmHg
│     └─ Frequência Cardíaca: 72 bpm
│
├─ Encounter #2 (20/09/2024)
│  ├─ type: "Exames"
│  └─ Observation
│     ├─ Glicose: 97 mg/dL
│     └─ Triglicerídeos: 145 mg/dL
│
├─ AllergyIntolerance
│  ├─ Dipirona (alta criticidade)
│  └─ Crustáceos (baixa criticidade)
│
├─ Condition
│  └─ Hiperlipidemia (E78.5)
│
└─ MedicationStatement
   └─ Sinvastatina 20mg (uso contínuo)
```

---

## Mapeamento FHIR → Relacional

### Patient FHIR → Tabelas SQL

```json
{
  "resourceType": "Patient",
  "identifier": [...]     → Tabela Identifier
  "name": [...]           → Tabela HumanName
  "telecom": [...]        → Tabela ContactPoint
  "address": [...]        → Tabela Address
  "gender": "female"      → Patient.gender
  "birthDate": "1985-03-15" → Patient.birthDate
}
```

### Observation FHIR → Tabela SQL

```json
{
  "resourceType": "Observation",
  "status": "final"       → Observation.status
  "code": {...}           → Observation.code, codeSystem
  "subject": {...}        → Observation.patientId
  "valueQuantity": {...}  → Observation.valueQuantity
  "component": [...]      → Tabela ObservationComponent
}
```

---

## Índices para Performance

```sql
-- Buscas por CPF (login)
CREATE INDEX idx_patient_cpf ON "Patient"(cpf);

-- Histórico do paciente
CREATE INDEX idx_obs_patient_date 
  ON "Observation"(patientId, effectiveDateTime DESC);

-- Filtros de categoria
CREATE INDEX idx_obs_category ON "Observation"(categoryCode);

-- Buscas de atendimento
CREATE INDEX idx_enc_patient_date 
  ON "Encounter"(patientId, start DESC);
```

---

## Script para Gerar Diagrama ER Visual

Você pode usar ferramentas online para gerar diagramas:

### dbdiagram.io

Cole este código em https://dbdiagram.io:

```dbml
Table Patient {
  id varchar [pk]
  fhirId varchar [unique]
  cpf varchar [unique]
  cns varchar [unique]
  active boolean
  gender varchar
  birthDate date
}

Table Encounter {
  id varchar [pk]
  fhirId varchar [unique]
  status varchar
  start timestamp
  patientId varchar [ref: > Patient.id]
  practitionerId varchar [ref: > Practitioner.id]
  organizationId varchar [ref: > Organization.id]
}

Table Observation {
  id varchar [pk]
  fhirId varchar [unique]
  code varchar
  valueQuantity decimal
  patientId varchar [ref: > Patient.id]
  encounterId varchar [ref: > Encounter.id]
}

Table AllergyIntolerance {
  id varchar [pk]
  fhirId varchar [unique]
  code varchar
  criticality varchar
  patientId varchar [ref: > Patient.id]
}

Table Practitioner {
  id varchar [pk]
  fhirId varchar [unique]
  cpf varchar
  qualificationCode varchar
}

Table Organization {
  id varchar [pk]
  fhirId varchar [unique]
  cnes varchar
  name varchar
}
```

Gera um diagrama ER profissional automaticamente!

---

**Use este diagrama na documentação do seu TCC para demonstrar a modelagem relacional baseada em FHIR BR Core.** 📊

