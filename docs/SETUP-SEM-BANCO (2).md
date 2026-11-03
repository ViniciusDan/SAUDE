# 🚀 Setup Rápido - SEM Banco de Dados

## Para Quem é Este Guia

- ✅ Você quer testar a API rapidamente
- ✅ Não quer configurar PostgreSQL/Supabase agora
- ✅ Está desenvolvendo o frontend
- ✅ Supabase free não tem Direct Connection

## 🎯 Modo Mock - Funcionamento Imediato

O sistema já vem com **dados mockados em memória**. Você não precisa de banco de dados!

### Passo 1: Configure o `.env`

```bash
cd backend
copy env.template .env
```

O `.env` já vem configurado para modo mock:

```env
DATABASE_URL="postgresql://mock:mock@localhost:5432/mock"
JWT_SECRET="chave-de-desenvolvimento-nao-usar-em-producao-123456"
PORT=3333
ENABLE_MOCK_AUTH=true    # ← Esta linha é a chave!
NODE_ENV=development
```

**Não mude nada!** Já está pronto.

### Passo 2: Instale as Dependências

```bash
npm install
```

### Passo 3: Inicie o Servidor

```bash
npm run dev
```

**Pronto!** 🎉 Servidor rodando em `http://localhost:3333`

### Passo 4: Teste a API

#### Health Check

```bash
curl http://localhost:3333/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "service": "FHIR BR Core API (RNDS/RAC Simulation)",
  "timestamp": "2024-11-26T..."
}
```

#### Login

```bash
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"cpf\":\"12345678910\",\"password\":\"12345\"}"
```

Resposta esperada:
```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "patient-mock-123",
    "fhirId": "patient-123",
    "name": "Maria Oliveira",
    "cpf": "12345678910"
  }
}
```

#### Buscar Histórico do Paciente

```bash
curl http://localhost:3333/fhir/patient/patient-mock-123/history \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 📦 O Que Está Incluso no Mock

O modo mock retorna:

- ✅ **1 Paciente:** Maria Oliveira (CPF: 12345678910)
- ✅ **2 Atendimentos:** Consulta de rotina, exames
- ✅ **4 Exames:** Glicose, triglicerídeos, pressão arterial, frequência cardíaca
- ✅ **2 Alergias:** Dipirona, crustáceos
- ✅ **1 Condição:** Hiperlipidemia
- ✅ **1 Procedimento:** Hemograma
- ✅ **1 Medicamento:** Sinvastatina

Todos os dados seguem o padrão **FHIR BR Core**.

---

## 🔄 Quando Migrar para Banco Real?

Você pode usar o modo mock durante todo o desenvolvimento do frontend. 

**Migre para banco real quando:**
- ❌ Precisar de múltiplos pacientes
- ❌ Quiser persistir dados entre restarts
- ❌ Precisar testar consultas complexas
- ❌ For fazer deploy em produção

---

## 🐳 Alternativa: PostgreSQL Local com Docker

Se você tem Docker instalado, é super rápido:

### 1. Suba o PostgreSQL

```bash
docker run --name fhir-postgres \
  -e POSTGRES_PASSWORD=senha123 \
  -p 5432:5432 \
  -d postgres:14
```

### 2. Crie o Banco

```bash
docker exec -it fhir-postgres createdb -U postgres fhir_rac
```

### 3. Atualize o `.env`

```env
DATABASE_URL="postgresql://postgres:senha123@localhost:5432/fhir_rac"
JWT_SECRET="sua-chave-secreta-aqui"
PORT=3333
ENABLE_MOCK_AUTH=false    # ← Agora usa banco real
NODE_ENV=development
```

### 4. Rode Migrations e Seed

```bash
npm run generate
npm run migrate
npm run seed
npm run dev
```

Agora você tem um banco completo com dados realistas! ✅

---

## 🆚 Mock vs Banco Real

| Característica | Modo Mock | Banco Real |
|----------------|-----------|------------|
| **Setup** | Imediato | 5-10 minutos |
| **Dependências** | Nenhuma | PostgreSQL/Docker |
| **Dados** | Fixos (1 paciente) | Personalizáveis |
| **Persistência** | Não (memória) | Sim (disco) |
| **Performance** | Rápido | Normal |
| **Desenvolvimento** | ✅ Perfeito | ✅ Ideal para testes |
| **Produção** | ❌ Não usar | ✅ Obrigatório |

---

## ❓ FAQ

### O mock tem todos os endpoints?

✅ Sim! Todos os endpoints funcionam:
- `POST /auth/login`
- `GET /fhir/patient/:id/history`
- `GET /fhir/encounters/:patientId`
- `GET /fhir/observations/:patientId`
- `GET /fhir/conditions/:patientId`
- `GET /fhir/allergies/:patientId`
- `GET /fhir/procedures/:patientId`
- `GET /fhir/medications/:patientId`

### Posso usar no frontend?

✅ Sim! O frontend não precisa saber se é mock ou banco real. A API retorna os mesmos formatos FHIR.

### Os dados são perdidos ao reiniciar?

✅ Sim, mas isso é intencional. O mock sempre retorna os mesmos dados iniciais.

### Posso adicionar mais pacientes no mock?

Sim! Edite `backend/src/services/auth/authService.ts`:

```typescript
const MOCK_USER = {
  id: 'patient-mock-123',
  fhirId: 'patient-123',
  cpf: '12345678910',
  name: 'Maria Oliveira',
  password: '12345',
};
```

Adicione outro objeto para outro usuário.

### Posso desligar o mock depois?

✅ Sim! Quando tiver banco configurado, só mude no `.env`:

```env
ENABLE_MOCK_AUTH=false
```

---

## ✅ Checklist de Setup (Modo Mock)

- [ ] `cd backend`
- [ ] `copy env.template .env`
- [ ] Confirmar que `ENABLE_MOCK_AUTH=true` no `.env`
- [ ] `npm install`
- [ ] `npm run dev`
- [ ] Testar `http://localhost:3333/health`
- [ ] Testar login com CPF `12345678910` e senha `12345`
- [ ] ✨ Começar a desenvolver o frontend!

---

**Pronto! Você não precisa de banco de dados para desenvolver. Use o modo mock e foque no frontend primeiro!** 🚀

