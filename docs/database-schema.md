## Modelo Relacional alinhado ao BR Core FHIR

### Entidades Principais
- **Patient (`Patient`)** – corresponde ao perfil `BRCorePatient`. Campos:
  - `fhirId`, `gender`, `birthDate`, `maritalStatus`, `language`, flags de atividade.
  - Relações com identificadores (CPF, CNS), nomes, telecom, endereços, encontros, observações e alergias.
- **Practitioner (`Practitioner`)** – implementa `BRCorePractitioner`, armazenando qualificações, gênero e vínculos com encontros/observações.
- **Organization (`Organization`)** – espelha `BROrganization`, utilizada como provedor de serviço (`Encounter.serviceProvider`).
- **Encounter (`Encounter`)** – perfil `BREncounter`. Registra status, classe (ambulatório, emergência), motivo e período.
- **Observation (`Observation`)** – perfil `BRObservationLab`. Valores numéricos e textuais em colunas dedicadas (`valueQuantity`, `valueString`, `valueCode`).
- **AllergyIntolerance (`AllergyIntolerance`)** – perfil nacional de alergias, com criticidade e status.
- **Condition, Procedure, MedicationStatement** – estruturados para permitir evolução do prontuário longitudinal.
- **AuditEvent (`AuditEvent`)** – trilha de auditoria exigida pela LGPD.

### Componentes Compartilhados
- **Identifier (`Identifier`)** – guarda combinações sistema/valor (ex.: CPF, CNS, cartão SUS). `resourceType` identifica onde é utilizado.
- **HumanName, ContactPoint, Address** – elementos repetíveis do FHIR (lista controlada via relação 1:N).
- **ObservationComponent** – suporte a componentes laboratoriais, como frações de hemograma.
- **PatientCredential** – autenticação do paciente (usuário = CPF). Senhas devem ser armazenadas com `bcrypt`.

### Convenções
- Todas as tabelas possuem `createdAt` / `updatedAt`.
- Datas FHIR do tipo `date` são mapeadas para `Date` (sem hora) e `dateTime` para `timestamp(6)`.
- Enumerações FHIR não foram rigidamente tipadas para facilitar futuras extensões; recomenda-se aplicar validação na camada de serviço.
- Índices em `Identifier` permitem localizar pacientes por CPF/CNS rapidamente.

### Migrações & Seeds
1. `npx prisma migrate dev --name init` – gera as tabelas base.
2. Criar script em `prisma/seed.ts` populando:
   - Paciente BR Core com:
     - `Identifier` (CPF com sistema `BRCPFCidadao`, CNS, etc.).
     - `Encounter`, `Observation`, `AllergyIntolerance`.
   - Profissionais, organizações e credenciais.

### Compatibilidade com BR Core
- `Identifier.system` aceita URIs oficiais:  
  - CPF: `http://www.saude.gov.br/fhir/r4/StructureDefinition/BRCPFCidadao`  
  - CNS: `http://www.saude.gov.br/fhir/r4/StructureDefinition/BRRegistroNacionalSaude`  
- Campos textuais livres (`typeCode`, `categoryCode`, etc.) podem ser ligados aos sistemas de codificação nacionais (TUSS, SIGTAP, CID-10, etc.).
- As estruturas foram pensadas para suportar exportação direta em formato Bundle FHIR através dos mapeadores existentes.


