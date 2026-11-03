# 🐘 PostgreSQL Local - Setup Completo para TCC

## Por Que Esta é a Melhor Opção para TCC

- ✅ **Gratuito:** Não precisa pagar nada
- ✅ **Offline:** Funciona sem internet
- ✅ **Controle total:** Você gerencia tudo
- ✅ **Performance:** Mais rápido que cloud
- ✅ **Apresentação:** Pode mostrar o Prisma Studio ao vivo
- ✅ **Profissional:** Demonstra conhecimento em DevOps

---

## 🐳 Opção A: Docker (Mais Fácil)

### Pré-requisitos

Instale o Docker Desktop:
- Windows: https://www.docker.com/products/docker-desktop/
- Instale e reinicie o computador

### Passo 1: Subir PostgreSQL no Docker

Abra o PowerShell ou CMD e rode:

```bash
docker run --name fhir-postgres ^
  -e POSTGRES_PASSWORD=senha123 ^
  -e POSTGRES_USER=postgres ^
  -e POSTGRES_DB=fhir_rac ^
  -p 5432:5432 ^
  -d postgres:14
```

**Explicação:**
- `--name fhir-postgres` - Nome do container
- `-e POSTGRES_PASSWORD=senha123` - Senha do banco
- `-e POSTGRES_DB=fhir_rac` - Cria o banco automaticamente
- `-p 5432:5432` - Expõe a porta 5432
- `postgres:14` - Versão do PostgreSQL

### Passo 2: Verificar se Está Rodando

```bash
docker ps
```

Você deve ver o container `fhir-postgres` rodando.

### Passo 3: Configure o `.env`

No `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:senha123@localhost:5432/fhir_rac"
JWT_SECRET="chave-super-secreta-para-meu-tcc-minimo-32-caracteres"
PORT=3333
ENABLE_MOCK_AUTH=false
NODE_ENV=development
```

### Passo 4: Rode as Migrations

```bash
cd backend
npm install
npm run generate
npm run migrate
```

Quando pedir nome da migration, digite: `init`

### Passo 5: Popule com Dados

```bash
npm run seed
```

### Passo 6: Inicie o Servidor

```bash
npm run dev
```

### Passo 7: Visualize o Banco

Abra o Prisma Studio (interface visual do banco):

```bash
npm run studio
```

Abre em: http://localhost:5555

Aqui você pode:
- ✅ Ver todas as tabelas
- ✅ Ver os dados inseridos
- ✅ Fazer queries visuais
- ✅ **Mostrar na apresentação do TCC!**

---

## 💻 Opção B: Instalar PostgreSQL Direto no Windows

Se não quiser usar Docker:

### Passo 1: Download e Instalação

1. Baixe: https://www.postgresql.org/download/windows/
2. Escolha a versão 14 ou superior
3. Durante instalação:
   - Senha: `senha123` (ou outra que você lembrar)
   - Porta: `5432` (padrão)
   - Locale: Portuguese, Brazil

### Passo 2: Criar o Banco

Abra o **pgAdmin** (instalado junto) ou **SQL Shell (psql)**:

```sql
CREATE DATABASE fhir_rac;
```

### Passo 3: Configure o `.env`

```env
DATABASE_URL="postgresql://postgres:senha123@localhost:5432/fhir_rac"
JWT_SECRET="chave-super-secreta-para-meu-tcc-minimo-32-caracteres"
PORT=3333
ENABLE_MOCK_AUTH=false
NODE_ENV=development
```

### Passo 4: Migrations e Seed

```bash
cd backend
npm run generate
npm run migrate
npm run seed
npm run dev
```

---

## 📊 Comandos Úteis do Docker

### Iniciar o Container (se parou)
```bash
docker start fhir-postgres
```

### Parar o Container
```bash
docker stop fhir-postgres
```

### Ver Logs do Banco
```bash
docker logs fhir-postgres
```

### Conectar no Banco via Terminal
```bash
docker exec -it fhir-postgres psql -U postgres -d fhir_rac
```

Comandos SQL úteis:
```sql
-- Ver todas as tabelas
\dt

-- Ver estrutura de uma tabela
\d "Patient"

-- Contar registros
SELECT COUNT(*) FROM "Patient";

-- Ver pacientes
SELECT * FROM "Patient";

-- Sair
\q
```

### Backup do Banco (Para TCC)
```bash
docker exec -it fhir-postgres pg_dump -U postgres fhir_rac > backup-tcc.sql
```

### Restaurar Backup
```bash
cat backup-tcc.sql | docker exec -i fhir-postgres psql -U postgres -d fhir_rac
```

### Remover Container (Cuidado!)
```bash
docker stop fhir-postgres
docker rm fhir-postgres
```

---

## 🎓 Para Apresentação do TCC

### 1. Demonstrar o Banco Funcionando

Mostre o Prisma Studio:
```bash
npm run studio
```

Navegue pelas tabelas mostrando:
- Patient (paciente com CPF, CNS)
- Encounter (atendimentos)
- Observation (exames laboratoriais)
- AllergyIntolerance (alergias)
- Etc.

### 2. Mostrar Relacionamentos

No Prisma Studio, clique em uma linha do Patient e mostre:
- Suas observações (exames)
- Seus encontros (atendimentos)
- Suas alergias

Isso demonstra o **modelo relacional** funcionando!

### 3. Executar Query ao Vivo

No terminal:
```bash
docker exec -it fhir-postgres psql -U postgres -d fhir_rac
```

Execute:
```sql
-- Buscar paciente com suas alergias
SELECT 
  p."fhirId" as paciente_id,
  n."text" as nome_paciente,
  a."codeDisplay" as alergia
FROM "Patient" p
JOIN "HumanName" n ON n."patientId" = p.id
JOIN "AllergyIntolerance" a ON a."patientId" = p.id
WHERE p."cpf" = '12345678910';
```

Isso mostra que você entende SQL e modelagem relacional!

### 4. Explicar o Schema

Mostre o arquivo `backend/prisma/schema.prisma` e explique:
- Como modelou seguindo BR Core FHIR
- Relacionamentos (1:N, Patient → Observations)
- Índices para performance

### 5. Demonstrar API Retornando FHIR

```bash
# Faça login
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"cpf\":\"12345678910\",\"password\":\"12345\"}"

# Copie o token e busque histórico
curl http://localhost:3333/fhir/patient/[ID]/history \
  -H "Authorization: Bearer [TOKEN]"
```

Mostre o JSON do Bundle FHIR e explique que segue o padrão BR Core.

---

## 📸 Screenshots para Documentação do TCC

Capture screenshots de:

1. **Prisma Studio** mostrando tabelas populadas
2. **pgAdmin** ou terminal mostrando estrutura do banco
3. **Postman/Insomnia** mostrando requisição e resposta FHIR
4. **Diagrama ER** do banco (use ferramentas como dbdiagram.io)

---

## 🎯 Vantagens para o TCC

| Aspecto | Com Banco Real | Só Mock |
|---------|---------------|---------|
| **Modelagem de dados** | ✅ Demonstra | ❌ Não demonstra |
| **SQL e queries** | ✅ Pode mostrar | ❌ Não tem |
| **Relacionamentos** | ✅ Implementados | ❌ Simulados |
| **Performance** | ✅ Com índices | ❌ N/A |
| **Persistência** | ✅ Real | ❌ Memória |
| **Escalabilidade** | ✅ Discutível | ❌ Limitado |
| **Profissionalismo** | ✅ Maior | ⚠️ Menor |

---

## 📝 Estrutura Sugerida para TCC

### Capítulo: Implementação do Banco de Dados

**3.1 Modelagem Relacional Baseada em FHIR**
- Descrever o schema Prisma
- Explicar mapeamento FHIR → Relacional
- Mostrar relacionamentos (Patient 1:N Observation)

**3.2 Tecnologias Utilizadas**
- PostgreSQL 14
- Prisma ORM
- Docker (containerização)

**3.3 Índices e Performance**
- Explicar índices criados (cpf, cns, patientId)
- Justificar escolhas

**3.4 Seed e Dados de Teste**
- Mostrar script de seed
- Dados alinhados ao BR Core FHIR

**3.5 Conversão para FHIR**
- FHIRMapper (Prisma → FHIR Bundle)
- Garantir conformidade BR Core

---

## 🐛 Troubleshooting

### Erro: "port is already allocated"

A porta 5432 já está em uso.

**Solução 1:** Pare outro PostgreSQL rodando
```bash
# Windows
services.msc
# Procure "postgresql" e pare o serviço
```

**Solução 2:** Use outra porta
```bash
docker run --name fhir-postgres ^
  -e POSTGRES_PASSWORD=senha123 ^
  -p 5433:5432 ^
  -d postgres:14
```

Atualize `.env`:
```env
DATABASE_URL="postgresql://postgres:senha123@localhost:5433/fhir_rac"
```

### Docker não inicia

**Verifique:**
1. Docker Desktop está rodando?
2. Hyper-V está ativado? (Windows)
3. WSL 2 está instalado? (Windows 11)

---

## ✅ Checklist Final

- [ ] Docker instalado e rodando
- [ ] Container PostgreSQL criado (`docker run...`)
- [ ] `.env` configurado com `localhost:5432`
- [ ] `npm run generate` executado
- [ ] `npm run migrate` executado (migrations aplicadas)
- [ ] `npm run seed` executado (dados populados)
- [ ] `npm run studio` abre e mostra tabelas com dados
- [ ] `npm run dev` inicia servidor sem erros
- [ ] Testei login e busca de histórico
- [ ] Tirei screenshots para o TCC

---

**Com PostgreSQL local, você tem um banco de dados profissional, gratuito e perfeito para demonstrar no TCC!** 🎓✨

