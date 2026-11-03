# 🚀 Configuração Supabase - Guia Completo

## Problema: Migration Travando (Session Pooler)

Se `npm run migrate` está **carregando infinitamente**, o problema é que você está usando a **Session Pooler connection** (porta 6543) que não é compatível com migrations do Prisma.

## ✅ Solução: Use Direct Connection

### 1. Encontre a Direct Connection no Supabase

1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Settings** (engrenagem) → **Database**
3. Role até **Connection string**
4. Clique em **Direct connection** (não Session pooler!)
5. Escolha **URI** e copie a string

Exemplo:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Diferenças importantes:**

| Tipo | Porta | Quando Usar |
|------|-------|-------------|
| **Direct Connection** | 5432 | ✅ Migrations, Seed, Desenvolvimento |
| **Session Pooler** | 6543 | ⚠️ Produção (com pgBouncer) |
| **Transaction Pooler** | 6543 | ❌ Não funciona com Prisma |

### 2. Configure o `.env`

Copie o template:

```bash
cd backend
copy env.template .env
```

Edite `backend/.env` com a **Direct Connection**:

```env
# Use a Direct Connection (porta 5432)
DATABASE_URL="postgresql://postgres.xxxxx:SUA_SENHA@db.xxxxx.supabase.co:5432/postgres"

# JWT Secret (mude para algo único)
JWT_SECRET="minha-chave-super-secreta-unica-com-32-caracteres-minimo"

# Porta do servidor
PORT=3333

# Modo mock para desenvolvimento (não precisa do banco)
ENABLE_MOCK_AUTH=true

# Ambiente
NODE_ENV=development
```

### 3. Rode as Migrations

Agora sim:

```bash
npm run generate
npm run migrate
```

Se pedir um nome para a migration, digite algo como: `init`

### 4. Popule com Dados de Exemplo

```bash
npm run seed
```

### 5. Inicie o Servidor

```bash
npm run dev
```

---

## 🔒 Modo Mock (Desenvolvimento Rápido)

Se você quer **testar sem configurar o banco**, deixe:

```env
ENABLE_MOCK_AUTH=true
```

Com isso, a API funciona com dados mockados:
- CPF: `12345678910`
- Senha: `12345`

Você **não precisa rodar migrations** neste modo!

---

## 🐛 Troubleshooting

### Erro: "Can't reach database server"

**Causa:** URL de conexão incorreta ou banco não acessível.

**Soluções:**
1. Verifique se copiou a **Direct Connection** (porta 5432)
2. Confirme que a senha está correta
3. Verifique se o projeto Supabase está ativo (não pausado)
4. Teste conectividade:
   ```bash
   npm run studio
   ```

### Erro: "Migration engine timed out"

**Causa:** Usando Session Pooler (porta 6543).

**Solução:** Troque para Direct Connection (porta 5432).

### Erro: "password authentication failed"

**Causa:** Senha incorreta no DATABASE_URL.

**Solução:**
1. No Supabase Dashboard, vá em **Settings** → **Database**
2. Role até **Database password**
3. Clique em **Reset database password**
4. Copie a nova senha e atualize o `.env`

### Migration continua travando

**Solução alternativa - Create-Only Migration:**

```bash
# Cria a migration sem aplicar
npx prisma migrate dev --create-only

# Aplica manualmente no Supabase SQL Editor
# Copie o SQL de: prisma/migrations/[timestamp]_init/migration.sql
# Cole no Supabase SQL Editor e execute
```

---

## 📊 Verificar se Funcionou

### 1. Abra Prisma Studio

```bash
npm run studio
```

Se abrir o navegador mostrando as tabelas, funcionou! ✅

### 2. Teste a API

```bash
# Health check
curl http://localhost:3333/health

# Login
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"cpf\":\"12345678910\",\"password\":\"12345\"}"
```

---

## 🔄 Alternativa: Usar PostgreSQL Local

Se continuar tendo problemas com Supabase, use PostgreSQL local:

### Windows (via Docker)

```bash
docker run --name fhir-postgres -e POSTGRES_PASSWORD=senha123 -p 5432:5432 -d postgres:14
```

### Ou instale PostgreSQL localmente

[Download PostgreSQL](https://www.postgresql.org/download/)

### Configure o .env

```env
DATABASE_URL="postgresql://postgres:senha123@localhost:5432/fhir_rac"
JWT_SECRET="sua-chave-secreta"
PORT=3333
ENABLE_MOCK_AUTH=false
NODE_ENV=development
```

### Crie o banco

```bash
# Via psql
createdb fhir_rac

# Ou via SQL
psql -U postgres -c "CREATE DATABASE fhir_rac;"
```

### Rode migrations

```bash
npm run generate
npm run migrate
npm run seed
```

---

## ✅ Checklist de Configuração

- [ ] Copiei a **Direct Connection** (porta 5432) do Supabase
- [ ] Colei no `backend/.env` como `DATABASE_URL`
- [ ] Configurei `JWT_SECRET` único
- [ ] Rodei `npm install` no backend
- [ ] Rodei `npm run generate`
- [ ] Rodei `npm run migrate` (não travou!)
- [ ] Rodei `npm run seed`
- [ ] Testei `npm run dev`
- [ ] API responde em `http://localhost:3333/health`

---

## 📞 Ainda com Problemas?

1. **Verifique os logs:** O que aparece no terminal quando roda `npm run migrate`?
2. **Teste a conexão:**
   ```bash
   npm run studio
   ```
3. **Use modo mock temporariamente:**
   ```env
   ENABLE_MOCK_AUTH=true
   ```
4. **Verifique a versão do Node:** Precisa ser 18+
   ```bash
   node --version
   ```

---

**Lembre-se:** Para migrations do Prisma com Supabase, **sempre use Direct Connection (porta 5432)**, nunca Session Pooler (porta 6543)!

