## Visão Geral da Arquitetura

### Objetivo
Entregar um portal web que permita ao paciente consultar, de forma autenticada, o histórico clínico registrado segundo os perfis nacionais BR Core FHIR.

### Camadas
1. **Frontend (`frontend/`)**
   - Aplicação React + TypeScript com Vite.
   - Gestão de estado leve com Context API/Zustand para sessão e dados FHIR.
   - Componentes focados em acessibilidade e internacionalização.
   - Comunicação com o backend via REST/JSON utilizando o padrão FHIR (bundle e resources).

2. **Backend (`backend/`)**
   - Node.js + Express + TypeScript.
   - Prisma ORM conectado a banco PostgreSQL (compatível com MySQL caso necessário).
   - Serviços encapsulados que produzem/consomem modelos FHIR R4 BR Core.
   - Autenticação baseada em OAuth2 password/PKCE (prototipado com JWT).
   - Validação com Zod e camada de mapeamento entre schema relacional e JSON FHIR.

3. **Banco de Dados (`backend/prisma/schema.prisma`)**
   - Estrutura relacional orientada aos principais perfis BR Core:
     - `BRCorePatient`, `BRCorePractitioner`, `BREncounter`, `BRProcedure`, `BRObservationLab`, `BRAllergyIntolerance`, `BRMedicationStatement`, `BRCondition`.
   - Utilização de tabelas auxiliares para `Identifier`, `HumanName`, `Address`, `Telecom` e `Attachment`.
   - Chaves estrangeiras espelhando referências FHIR (ex.: `Observation.subject -> Patient`).

### Fluxo Alto Nível
1. Paciente acessa a SPA React e executa login (CPF + senha inicial).
2. O frontend chama `/auth/login`. Backend valida credenciais e retorna JWT + `patient_id`.
3. Na inicialização o frontend solicita `/patients/:id/summary`.
4. O backend agrega dados em consultas SQL (ou via Prisma) e devolve um Bundle com Observations (exames), Encounters (visitas), AllergyIntolerance (alergias) etc.
5. O frontend renderiza abas usando os elementos normalizados em FHIR e atualiza dinamicamente.

### Segurança
- Transporte HTTPS obrigatório.
- Tokens JWT com expiração curta e refresh token opcional.
- Camada de autorização garantido que o paciente só acessa seus próprios dados.
- Log de acesso (`AuditEvent`) persistido para accountability.

### Próximos Passos
1. Configurar ambientes (`.env`) para frontend e backend.
2. Executar `npm install` nas duas aplicações.
3. Provisionar banco PostgreSQL e rodar `npx prisma migrate dev`.
4. Implementar integrações com provedores externos FHIR (se houver).
5. Escrever cenários de teste (unitário, integração e e2e).


