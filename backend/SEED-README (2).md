# 🌱 Seed do Banco de Dados

Este arquivo explica como usar o seed para popular o banco de dados com dados de exemplo.

## 📊 O que o Seed Cria

O seed cria uma população completa de dados simulando um ambiente real de RNDS:

### Organizações (6)
- Hospital Santa Luzia
- Clínica Vida Nova
- Hospital Municipal Esperança
- Centro Médico Saúde Total
- Hospital Regional Norte
- Clínica Especializada Sul

### Profissionais (6)
- Dra. Ana Silva (Clínico Geral)
- Dr. Carlos Mendes (Cardiologista)
- Dra. Beatriz Santos (Endocrinologista)
- Dr. Fernando Costa (Ortopedista)
- Dra. Juliana Lima (Pediatra)
- Dr. Roberto Alves (Neurologista)

### Pacientes (1000)
Cada paciente possui:
- **Dados pessoais completos**: Nome gerado aleatoriamente, CPF único, CNS único, data de nascimento (1950-2005), gênero
- **Contatos**: Telefone celular e e-mail únicos
- **Endereço completo**: Rua, bairro, cidade, estado, CEP (todos em São Paulo)
- **Credenciais de login**: CPF como username, senha padrão: `12345`

### Histórico Clínico por Paciente

Para cada paciente, o seed gera aleatoriamente:

- **2-5 Encontros** (atendimentos) em diferentes datas
- **3-8 Observações** (exames laboratoriais) com valores realistas
- **0-2 Alergias** variadas
- **1-3 Condições** de saúde (CID-10)
- **1-4 Procedimentos** realizados
- **1-3 Medicamentos** em uso ou já utilizados

## 🚀 Como Executar

### Opção 1: Seed Completo (Recomendado)

```bash
cd backend
npm run seed
```

**⚠️ ATENÇÃO:** Este seed cria **1000 pacientes** e pode levar alguns minutos para completar.

Isso irá:
1. Limpar todos os dados existentes
2. Criar 6 organizações
3. Criar 6 profissionais
4. Criar **1000 pacientes** com histórico completo (processados em lotes de 50)
5. Gerar aproximadamente:
   - 2000-5000 encontros
   - 3000-8000 observações
   - 0-2000 alergias
   - 1000-3000 condições
   - 1000-4000 procedimentos
   - 1000-3000 medicamentos

### Opção 2: Reset Completo do Banco

Se você quiser resetar o banco completamente (apaga tudo e recria):

```bash
cd backend
npm run db:reset
```

Isso irá:
1. Apagar todas as tabelas
2. Rodar todas as migrations novamente
3. Executar o seed automaticamente

## 📝 Credenciais de Acesso

Todos os pacientes podem fazer login usando:
- **Username**: O CPF do paciente (11 dígitos, sem formatação)
- **Senha**: `12345`

### CPFs Gerados

Os CPFs são gerados sequencialmente começando de `10000000000` até `10000000999`.

**Exemplos de CPFs válidos:**
- `10000000000`
- `10000000001`
- `10000000002`
- ... até `10000000999`

Após executar o seed, os primeiros 10 CPFs serão exibidos no console.

## 🔍 Visualizar os Dados

### Prisma Studio

Para visualizar todos os dados criados:

```bash
cd backend
npm run studio
```

Acesse: http://localhost:5555

### Via API

Após fazer login com qualquer CPF acima, você poderá ver:
- Dashboard com todas as abas (Exames, Visitas, Alergias, Condições, Procedimentos, Medicamentos)
- Perfil completo do paciente

## 📊 Estatísticas Esperadas

Após executar o seed, você terá aproximadamente:

- **1000 Pacientes**
- **6 Organizações**
- **6 Profissionais**
- **2000-5000 Encontros** (distribuídos entre os pacientes)
- **3000-8000 Observações** (exames laboratoriais)
- **0-2000 Alergias**
- **1000-3000 Condições** de saúde
- **1000-4000 Procedimentos**
- **1000-3000 Medicamentos**
- **1000 Eventos de Auditoria**

### Performance

O seed é otimizado para processar os dados em **lotes de 50 pacientes** para melhor performance. O tempo total de execução pode variar de 5 a 15 minutos dependendo do hardware.

## ⚠️ Avisos

1. **O seed apaga todos os dados existentes** antes de criar novos
2. **Não execute em produção** sem revisar o código
3. **As senhas são todas iguais** (`12345`) - apenas para desenvolvimento
4. **Os dados são gerados aleatoriamente** - cada execução pode gerar resultados diferentes

## 🔧 Personalizar o Seed

Se você quiser criar mais ou menos dados, edite o arquivo `backend/prisma/seed.ts`:

- **Alterar número de pacientes**: Modifique a constante `TOTAL_PACIENTES` (linha ~100)
- **Alterar tamanho do lote**: Modifique a constante `BATCH_SIZE` (linha ~101) - valores menores usam menos memória, mas são mais lentos
- **Mais organizações**: Adicione mais itens no array `organizacoes`
- **Mais profissionais**: Adicione mais itens no array `profissionais`
- **Ajustar quantidade de histórico**: Modifique os valores em `randomValue(min, max)` nas seções de criação de histórico clínico

## 🐛 Problemas?

Se encontrar erros ao executar o seed:

1. Verifique se o banco de dados está rodando
2. Verifique se as migrations foram executadas: `npm run migrate`
3. Verifique se o Prisma Client está atualizado: `npm run generate`
4. Verifique os logs de erro no console

