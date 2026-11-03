/**
 * Script de diagnóstico de conexão com banco de dados
 * Rode: node check-connection.js
 */

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

console.log('🔍 Verificando conexão com banco de dados...\n');

// Extrai info da DATABASE_URL
const dbUrl = process.env.DATABASE_URL || '';
const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

if (!match) {
  console.error('❌ DATABASE_URL inválida ou não configurada!');
  console.log('\nFormato esperado:');
  console.log('postgresql://usuario:senha@host:porta/database\n');
  process.exit(1);
}

const [, user, , host, port, database] = match;

console.log('📋 Configuração detectada:');
console.log(`   Host: ${host}`);
console.log(`   Porta: ${port}`);
console.log(`   Database: ${database.split('?')[0]}`);
console.log(`   Usuário: ${user}`);

// Verifica porta
if (port === '6543') {
  console.log('\n⚠️  ATENÇÃO: Você está usando porta 6543 (Session Pooler)');
  console.log('   Isso causa travamento em migrations!');
  console.log('\n✅ Solução:');
  console.log('   1. No Supabase Dashboard, vá em Settings → Database');
  console.log('   2. Em Connection string, escolha "Direct connection"');
  console.log('   3. Copie a URL (porta 5432)');
  console.log('   4. Atualize seu .env\n');
} else if (port === '5432') {
  console.log('✅ Porta correta para migrations (5432)\n');
} else {
  console.log(`⚠️  Porta incomum: ${port}\n`);
}

// Testa conexão
console.log('🔌 Testando conexão...');

try {
  await prisma.$connect();
  console.log('✅ Conexão estabelecida com sucesso!\n');

  // Testa query simples
  console.log('📊 Testando query...');
  const result = await prisma.$queryRaw`SELECT current_database(), version()`;
  console.log('✅ Query executada!\n');
  console.log('Banco:', result[0].current_database);
  console.log('Versão:', result[0].version.split(' ').slice(0, 2).join(' '));

  // Lista tabelas
  console.log('\n📁 Listando tabelas...');
  const tables = await prisma.$queryRaw`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;

  if (tables.length === 0) {
    console.log('⚠️  Nenhuma tabela encontrada. Rode as migrations:');
    console.log('   npm run migrate\n');
  } else {
    console.log(`✅ ${tables.length} tabela(s) encontrada(s):`);
    tables.forEach((t) => console.log(`   - ${t.table_name}`));
  }

  console.log('\n🎉 Diagnóstico completo! Tudo funcionando.\n');
} catch (error) {
  console.error('\n❌ Erro ao conectar:', error.message);

  if (error.message.includes('timeout')) {
    console.log('\n💡 Possíveis causas:');
    console.log('   1. Porta incorreta (use 5432, não 6543)');
    console.log('   2. Firewall bloqueando conexão');
    console.log('   3. Projeto Supabase pausado');
    console.log('   4. Senha incorreta\n');
  } else if (error.message.includes('password')) {
    console.log('\n💡 Senha incorreta!');
    console.log('   1. Vá em Supabase → Settings → Database');
    console.log('   2. Clique em "Reset database password"');
    console.log('   3. Copie a nova senha');
    console.log('   4. Atualize DATABASE_URL no .env\n');
  } else if (error.message.includes('does not exist')) {
    console.log('\n💡 Banco de dados não existe!');
    console.log('   Crie o banco ou use DATABASE_URL correto.\n');
  }

  process.exit(1);
} finally {
  await prisma.$disconnect();
}

