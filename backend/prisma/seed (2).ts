/**
 * Seed - Dados iniciais simulando RAC da RNDS
 * Cria 1000 pacientes com histórico clínico completo
 * Otimizado para performance com batch inserts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Arrays de dados para geração realista
const primeirosNomes = [
  'Maria', 'Ana', 'Juliana', 'Fernanda', 'Patricia', 'Mariana', 'Camila', 'Beatriz',
  'João', 'Carlos', 'Pedro', 'Roberto', 'Fernando', 'Ricardo', 'Eduardo', 'Marcos',
  'Lucas', 'Gabriel', 'Rafael', 'Bruno', 'Thiago', 'Felipe', 'André', 'Gustavo'
];

const sobrenomes = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Costa', 'Pereira', 'Rodrigues', 'Almeida',
  'Nascimento', 'Lima', 'Araújo', 'Ferreira', 'Carvalho', 'Gomes', 'Martins', 'Rocha',
  'Ribeiro', 'Alves', 'Monteiro', 'Mendes', 'Barros', 'Freitas', 'Dias', 'Cavalcanti'
];

const organizacoes = [
  { nome: 'Hospital Santa Luzia', cnes: '1234567', alias: 'HSL', cidade: 'São Paulo', estado: 'SP' },
  { nome: 'Clínica Vida Nova', cnes: '2345678', alias: 'CVN', cidade: 'São Paulo', estado: 'SP' },
  { nome: 'Hospital Municipal Esperança', cnes: '3456789', alias: 'HME', cidade: 'São Paulo', estado: 'SP' },
  { nome: 'Centro Médico Saúde Total', cnes: '4567890', alias: 'CMST', cidade: 'São Paulo', estado: 'SP' },
  { nome: 'Hospital Regional Norte', cnes: '5678901', alias: 'HRN', cidade: 'São Paulo', estado: 'SP' },
  { nome: 'Clínica Especializada Sul', cnes: '6789012', alias: 'CES', cidade: 'São Paulo', estado: 'SP' },
];

const profissionais = [
  { nome: 'Dra. Ana Silva', cpf: '98765432100', cns: '123456789012345', genero: 'female', crm: '123456', especialidade: 'Médico Clínico Geral' },
  { nome: 'Dr. Carlos Mendes', cpf: '87654321000', cns: '234567890123456', genero: 'male', crm: '234567', especialidade: 'Cardiologista' },
  { nome: 'Dra. Beatriz Santos', cpf: '76543210000', cns: '345678901234567', genero: 'female', crm: '345678', especialidade: 'Endocrinologista' },
  { nome: 'Dr. Fernando Costa', cpf: '65432100000', cns: '456789012345678', genero: 'male', crm: '456789', especialidade: 'Ortopedista' },
  { nome: 'Dra. Juliana Lima', cpf: '54321000000', cns: '567890123456789', genero: 'female', crm: '567890', especialidade: 'Pediatra' },
  { nome: 'Dr. Roberto Alves', cpf: '43210000000', cns: '678901234567890', genero: 'male', crm: '678901', especialidade: 'Neurologista' },
];

const medicamentos = [
  { nome: 'Sinvastatina 20mg', codigo: 'sinvastatina', dosagem: '1 comprimido à noite', via: 'oral' },
  { nome: 'Metformina 500mg', codigo: 'metformina', dosagem: '1 comprimido 2x ao dia', via: 'oral' },
  { nome: 'Losartana 50mg', codigo: 'losartana', dosagem: '1 comprimido pela manhã', via: 'oral' },
  { nome: 'Omeprazol 20mg', codigo: 'omeprazol', dosagem: '1 cápsula em jejum', via: 'oral' },
  { nome: 'Dipirona 500mg', codigo: 'dipirona', dosagem: '1 comprimido quando necessário', via: 'oral' },
  { nome: 'AAS 100mg', codigo: 'aas', dosagem: '1 comprimido pela manhã', via: 'oral' },
  { nome: 'Atorvastatina 10mg', codigo: 'atorvastatina', dosagem: '1 comprimido à noite', via: 'oral' },
];

const alergias = [
  { nome: 'Dipirona', categoria: 'medication', criticidade: 'high' },
  { nome: 'Crustáceos', categoria: 'food', criticidade: 'high' },
  { nome: 'Penicilina', categoria: 'medication', criticidade: 'high' },
  { nome: 'Lactose', categoria: 'food', criticidade: 'low' },
  { nome: 'Iodo', categoria: 'medication', criticidade: 'medium' },
  { nome: 'Amendoim', categoria: 'food', criticidade: 'high' },
];

const condicoes = [
  { codigo: 'E78.5', nome: 'Hiperlipidemia não especificada', gravidade: 'mild' },
  { codigo: 'E11.9', nome: 'Diabetes mellitus tipo 2 sem complicações', gravidade: 'moderate' },
  { codigo: 'I10', nome: 'Hipertensão essencial', gravidade: 'moderate' },
  { codigo: 'M79.3', nome: 'Paniculite', gravidade: 'mild' },
  { codigo: 'J44.1', nome: 'Doença pulmonar obstrutiva crônica', gravidade: 'moderate' },
  { codigo: 'K21.9', nome: 'Doença do refluxo gastroesofágico', gravidade: 'mild' },
  { codigo: 'M54.5', nome: 'Dor lombar', gravidade: 'mild' },
];

const procedimentos = [
  { codigo: '0202010430', nome: 'Hemograma completo', categoria: 'diagnostic' },
  { codigo: '0202010449', nome: 'Glicemia de jejum', categoria: 'diagnostic' },
  { codigo: '0202010457', nome: 'Colesterol total', categoria: 'diagnostic' },
  { codigo: '0202010465', nome: 'Triglicerídeos', categoria: 'diagnostic' },
  { codigo: '0202010473', nome: 'Urina tipo I', categoria: 'diagnostic' },
  { codigo: '0202010481', nome: 'Raio-X de tórax', categoria: 'diagnostic' },
  { codigo: '0202010490', nome: 'Eletrocardiograma', categoria: 'diagnostic' },
  { codigo: '0202010500', nome: 'Ultrassonografia abdominal', categoria: 'diagnostic' },
];

const exames = [
  { codigo: '2339-0', nome: 'Glicose', unidade: 'mg/dL', normal: { min: 70, max: 100 } },
  { codigo: '2571-8', nome: 'Triglicerídeos', unidade: 'mg/dL', normal: { min: 0, max: 150 } },
  { codigo: '2093-3', nome: 'Colesterol Total', unidade: 'mg/dL', normal: { min: 0, max: 200 } },
  { codigo: '2085-9', nome: 'HDL Colesterol', unidade: 'mg/dL', normal: { min: 40, max: 100 } },
  { codigo: '2089-1', nome: 'LDL Colesterol', unidade: 'mg/dL', normal: { min: 0, max: 100 } },
  { codigo: '718-7', nome: 'Hemoglobina', unidade: 'g/dL', normal: { min: 12, max: 16 } },
  { codigo: '789-8', nome: 'Hematócrito', unidade: '%', normal: { min: 36, max: 48 } },
  { codigo: '6690-2', nome: 'Leucócitos', unidade: '/mm³', normal: { min: 4000, max: 11000 } },
];

const bairros = ['Centro', 'Bela Vista', 'Vila Nova', 'Jardim Paulista', 'Moema', 'Pinheiros', 'Vila Madalena', 'Butantã'];
const ruas = ['das Flores', 'Principal', 'da Paz', 'Central', 'Nova', 'São Paulo', 'Brasil', 'Independência'];

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

function randomValue(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCPF(index: number): string {
  // Gera CPF único baseado no índice
  const base = 10000000000 + index;
  return base.toString().padStart(11, '0');
}

function generateCNS(index: number): string {
  // Gera CNS único baseado no índice
  const base = 700000000000000 + index;
  return base.toString().padStart(15, '0');
}

function generateName(): { nome: string; primeiroNome: string; sobrenome: string } {
  const primeiroNome = randomItem(primeirosNomes);
  const sobrenome1 = randomItem(sobrenomes);
  const sobrenome2 = randomItem(sobrenomes);
  const nome = `${primeiroNome} ${sobrenome1} ${sobrenome2}`;
  return { nome, primeiroNome, sobrenome: `${sobrenome1} ${sobrenome2}` };
}

function generateBirthDate(): Date {
  const year = randomValue(1950, 2005);
  const month = randomValue(0, 11);
  const day = randomValue(1, 28);
  return new Date(year, month, day);
}

async function main() {
  const TOTAL_PACIENTES = 1000;
  const BATCH_SIZE = 50; // Processa em lotes para melhor performance

  console.log('🌱 Iniciando seed do banco de dados...');
  console.log(`📊 Serão criados ${TOTAL_PACIENTES} pacientes\n`);

  // Limpa dados existentes
  console.log('🧹 Limpando dados existentes...');
  await prisma.auditEvent.deleteMany();
  await prisma.observationComponent.deleteMany();
  await prisma.observation.deleteMany();
  await prisma.procedure.deleteMany();
  await prisma.medicationStatement.deleteMany();
  await prisma.condition.deleteMany();
  await prisma.allergyIntolerance.deleteMany();
  await prisma.encounter.deleteMany();
  await prisma.patientCredential.deleteMany();
  await prisma.identifier.deleteMany();
  await prisma.humanName.deleteMany();
  await prisma.contactPoint.deleteMany();
  await prisma.address.deleteMany();
  await prisma.practitioner.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.patient.deleteMany();
  console.log('✅ Dados antigos removidos\n');

  // Cria organizações
  console.log('🏥 Criando organizações...');
  const orgs = [];
  for (const orgData of organizacoes) {
    const org = await prisma.organization.create({
      data: {
        fhirId: `org-${orgData.cnes}`,
        cnes: orgData.cnes,
        name: orgData.nome,
        alias: orgData.alias,
        typeCode: 'hosp',
        typeDisplay: 'Hospital',
        active: true,
        identifiers: {
          create: [{
            use: 'official',
            system: 'http://www.saude.gov.br/fhir/r4/NamingSystem/cnes',
            value: orgData.cnes,
            resourceType: 'Organization',
          }],
        },
        addresses: {
          create: [{
            use: 'work',
            type: 'physical',
            line1: `Rua ${randomItem(ruas)}, ${randomValue(100, 999)}`,
            district: randomItem(bairros),
            city: orgData.cidade,
            state: orgData.estado,
            postalCode: `${randomValue(10000, 99999)}-${randomValue(100, 999)}`,
            country: 'BR',
          }],
        },
      },
    });
    orgs.push(org);
  }
  console.log(`✅ ${orgs.length} organizações criadas\n`);

  // Cria profissionais
  console.log('👨‍⚕️ Criando profissionais...');
  const practitioners = [];
  for (const profData of profissionais) {
    const [titulo, ...nomeParts] = profData.nome.split(' ');
    const nome = nomeParts.join(' ');
    const [primeiroNome, ...resto] = nome.split(' ');
    const sobrenome = resto.join(' ') || 'Silva';

    const practitioner = await prisma.practitioner.create({
      data: {
        fhirId: `pract-${profData.cpf}`,
        cpf: profData.cpf,
        cns: profData.cns,
        active: true,
        gender: profData.genero,
        qualificationCode: '225100',
        qualificationText: profData.especialidade,
        councilType: 'CRM',
        councilNumber: profData.crm,
        councilUF: 'SP',
        names: {
          create: [{
            use: 'official',
            text: profData.nome,
            family: sobrenome,
            given: primeiroNome,
          }],
        },
        identifiers: {
          create: [{
            use: 'official',
            system: 'http://www.saude.gov.br/fhir/r4/NamingSystem/cpf',
            value: profData.cpf,
            resourceType: 'Practitioner',
          }],
        },
      },
    });
    practitioners.push(practitioner);
  }
  console.log(`✅ ${practitioners.length} profissionais criados\n`);

  // Hash da senha padrão (uma vez para todos)
  const senhaPadrao = await bcrypt.hash('12345', 10);

  // Cria pacientes em lotes
  console.log(`👥 Criando ${TOTAL_PACIENTES} pacientes (em lotes de ${BATCH_SIZE})...`);
  const pacientes = [];
  let totalEncontros = 0;
  let totalObservacoes = 0;
  let totalAlergias = 0;
  let totalCondicoes = 0;
  let totalProcedimentos = 0;
  let totalMedicamentos = 0;

  for (let batchStart = 0; batchStart < TOTAL_PACIENTES; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE, TOTAL_PACIENTES);
    const batchPacientes = [];

    // Cria pacientes do lote
    for (let i = batchStart; i < batchEnd; i++) {
      const { nome, primeiroNome, sobrenome } = generateName();
      const cpf = generateCPF(i);
      const cns = generateCNS(i);
      const nascimento = generateBirthDate();
      const genero = randomItem(['male', 'female']);

      const patient = await prisma.patient.create({
        data: {
          fhirId: `patient-${cpf}`,
          cpf,
          cns,
          active: true,
          gender: genero,
          birthDate: nascimento,
          maritalStatus: randomItem(['S', 'M', 'D', 'W']),
          deceased: false,
          language: 'pt-BR',
          names: {
            create: [{
              use: 'official',
              text: nome,
              family: sobrenome,
              given: primeiroNome,
            }],
          },
          identifiers: {
            create: [
              {
                use: 'official',
                system: 'http://www.saude.gov.br/fhir/r4/NamingSystem/cpf',
                value: cpf,
                resourceType: 'Patient',
              },
              {
                use: 'official',
                system: 'http://www.saude.gov.br/fhir/r4/NamingSystem/cns',
                value: cns,
                resourceType: 'Patient',
              },
            ],
          },
          telecoms: {
            create: [
              {
                system: 'phone',
                value: `(11) ${randomValue(90000, 99999)}-${randomValue(1000, 9999)}`,
                use: 'mobile',
              },
              {
                system: 'email',
                value: `${primeiroNome.toLowerCase()}.${sobrenome.split(' ')[0].toLowerCase()}${i}@email.com`,
                use: 'home',
              },
            ],
          },
          addresses: {
            create: [{
              use: 'home',
              type: 'physical',
              line1: `Rua ${randomItem(ruas)} ${randomValue(100, 9999)}`,
              line2: randomValue(0, 1) ? `Apto ${randomValue(101, 999)}` : null,
              district: randomItem(bairros),
              city: 'São Paulo',
              state: 'SP',
              postalCode: `${randomValue(10000, 99999)}-${randomValue(100, 999)}`,
              country: 'BR',
            }],
          },
        },
      });

      // Cria credenciais
      await prisma.patientCredential.create({
        data: {
          patientId: patient.id,
          username: cpf,
          passwordHash: senhaPadrao,
        },
      });

      batchPacientes.push(patient);
      pacientes.push(patient);
    }

    // Cria histórico clínico para cada paciente do lote
    for (const paciente of batchPacientes) {
      // Encontros (2-5 por paciente)
      const numEncontros = randomValue(2, 5);
      const encontros = [];
      for (let i = 0; i < numEncontros; i++) {
        const dataEncontro = randomDate(new Date('2023-01-01'), new Date());
        const org = randomItem(orgs);
        const practitioner = randomItem(practitioners);

        const encounter = await prisma.encounter.create({
          data: {
            fhirId: `enc-${paciente.cpf}-${i + 1}`,
            status: randomItem(['finished', 'in-progress', 'cancelled']),
            classCode: randomItem(['AMB', 'EMER', 'IMP']),
            classDisplay: randomItem(['Ambulatorial', 'Emergência', 'Internação']),
            typeCode: randomItem(['rotina', 'exame', 'emergencia', 'consulta']),
            typeDisplay: randomItem(['Consulta de Rotina', 'Realização de Exames', 'Atendimento de Emergência', 'Consulta Especializada']),
            reasonCode: randomItem(['checkup', 'dor', 'exame', 'consulta']),
            reasonDisplay: randomItem(['Check-up anual', 'Dor abdominal', 'Exames de rotina', 'Consulta de acompanhamento']),
            start: dataEncontro,
            end: new Date(dataEncontro.getTime() + randomValue(30, 120) * 60000),
            patientId: paciente.id,
            practitionerId: practitioner.id,
            serviceProviderId: org.id,
          },
        });
        encontros.push(encounter);
        totalEncontros++;
      }

      // Observações (3-8 por paciente) - batch insert
      const numObservacoes = randomValue(3, 8);
      const observacoesData = [];
      for (let i = 0; i < numObservacoes; i++) {
        const exame = randomItem(exames);
        const valor = randomValue(exame.normal.min - 20, exame.normal.max + 20);
        const dataExame = randomDate(new Date('2023-01-01'), new Date());
        const encounter = randomItem(encontros);
        const practitioner = randomItem(practitioners);

        observacoesData.push({
          fhirId: `obs-${paciente.cpf}-${i + 1}`,
          status: 'final',
          categoryCode: 'laboratory',
          categoryDisplay: 'Laboratório',
          codeSystem: 'http://loinc.org',
          code: exame.codigo,
          codeDisplay: exame.nome,
          effectiveDateTime: dataExame,
          issued: new Date(dataExame.getTime() + 86400000),
          valueQuantity: valor,
          valueQuantityUnit: exame.unidade,
          interpretationCode: valor >= exame.normal.min && valor <= exame.normal.max ? 'N' : 'H',
          interpretationText: valor >= exame.normal.min && valor <= exame.normal.max ? 'Normal' : 'Alterado',
          patientId: paciente.id,
          encounterId: encounter.id,
          performerId: practitioner.id,
        });
      }
      if (observacoesData.length > 0) {
        await prisma.observation.createMany({ data: observacoesData });
        totalObservacoes += observacoesData.length;
      }

      // Alergias (0-2 por paciente)
      const numAlergias = randomValue(0, 2);
      if (numAlergias > 0) {
        const alergiasPaciente = randomItems(alergias, numAlergias);
        const alergiasData = alergiasPaciente.map((alergia) => ({
          fhirId: `allergy-${paciente.cpf}-${alergia.nome}`,
          clinicalStatusCode: 'active',
          clinicalStatusText: 'Ativa',
          verificationStatus: 'confirmed',
          type: alergia.categoria === 'medication' ? 'allergy' : 'intolerance',
          category: alergia.categoria,
          criticality: alergia.criticidade,
          code: alergia.nome.toLowerCase(),
          codeDisplay: alergia.nome,
          recordedDate: randomDate(new Date('2020-01-01'), new Date('2023-01-01')),
          patientId: paciente.id,
          recorderId: randomItem(practitioners).id,
        }));
        await prisma.allergyIntolerance.createMany({ data: alergiasData });
        totalAlergias += alergiasData.length;
      }

      // Condições (1-3 por paciente)
      const numCondicoes = randomValue(1, 3);
      const condicoesPaciente = randomItems(condicoes, numCondicoes);
      const condicoesData = condicoesPaciente.map((condicao) => ({
        fhirId: `cond-${paciente.cpf}-${condicao.codigo}`,
        clinicalStatus: randomItem(['active', 'inactive', 'resolved']),
        verificationStatus: 'confirmed',
        categoryCode: 'problem-list-item',
        severity: condicao.gravidade,
        codeSystem: 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRCID10',
        code: condicao.codigo,
        codeDisplay: condicao.nome,
        onsetDateTime: randomDate(new Date('2020-01-01'), new Date('2023-01-01')),
        recordedDate: randomDate(new Date('2020-01-01'), new Date('2023-01-01')),
        patientId: paciente.id,
        recorderId: randomItem(practitioners).id,
      }));
      if (condicoesData.length > 0) {
        await prisma.condition.createMany({ data: condicoesData });
        totalCondicoes += condicoesData.length;
      }

      // Procedimentos (1-4 por paciente)
      const numProcedimentos = randomValue(1, 4);
      const procedimentosPaciente = randomItems(procedimentos, numProcedimentos);
      const procedimentosData = procedimentosPaciente.map((procedimento, idx) => {
        const dataProcedimento = randomDate(new Date('2023-01-01'), new Date());
        return {
          fhirId: `proc-${paciente.cpf}-${idx + 1}`,
          status: 'completed',
          categoryCode: procedimento.categoria,
          codeSystem: 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRTUSS',
          code: procedimento.codigo,
          codeDisplay: procedimento.nome,
          performedStart: dataProcedimento,
          performedEnd: new Date(dataProcedimento.getTime() + randomValue(15, 60) * 60000),
          patientId: paciente.id,
          performerId: randomItem(practitioners).id,
          encounterId: randomItem(encontros).id,
        };
      });
      if (procedimentosData.length > 0) {
        await prisma.procedure.createMany({ data: procedimentosData });
        totalProcedimentos += procedimentosData.length;
      }

      // Medicamentos (1-3 por paciente)
      const numMedicamentos = randomValue(1, 3);
      const medicamentosPaciente = randomItems(medicamentos, numMedicamentos);
      const medicamentosData = medicamentosPaciente.map((medicamento) => {
        const dataInicio = randomDate(new Date('2022-01-01'), new Date('2023-06-01'));
        const dataFim = randomValue(0, 1) ? new Date(dataInicio.getTime() + randomValue(30, 365) * 86400000) : null;
        return {
          fhirId: `med-${paciente.cpf}-${medicamento.codigo}`,
          status: dataFim ? 'completed' : 'active',
          categoryCode: 'outpatient',
          medicationCode: medicamento.codigo,
          medicationDisplay: medicamento.nome,
          dosage: medicamento.dosagem,
          route: medicamento.via,
          effectiveStart: dataInicio,
          effectiveEnd: dataFim,
          taken: 'y',
          patientId: paciente.id,
          recorderId: randomItem(practitioners).id,
        };
      });
      if (medicamentosData.length > 0) {
        await prisma.medicationStatement.createMany({ data: medicamentosData });
        totalMedicamentos += medicamentosData.length;
      }
    }

    // Progresso
    const progress = ((batchEnd / TOTAL_PACIENTES) * 100).toFixed(1);
    console.log(`   Progresso: ${batchEnd}/${TOTAL_PACIENTES} pacientes (${progress}%)`);
  }

  console.log(`\n✅ ${pacientes.length} pacientes criados\n`);

  // Cria eventos de auditoria em batch
  console.log('📝 Criando eventos de auditoria...');
  const auditData = pacientes.map((paciente) => ({
    action: 'read',
    outcome: 'success',
    agentUserId: paciente.id,
    sourceName: 'seed-script',
    patientId: paciente.id,
    details: {
      message: 'Dados iniciais carregados via seed',
    },
  }));
  await prisma.auditEvent.createMany({ data: auditData });
  console.log(`✅ ${auditData.length} eventos de auditoria criados\n`);

  console.log('📊 Resumo do seed:');
  console.log(`   - ${pacientes.length} pacientes`);
  console.log(`   - ${orgs.length} organizações`);
  console.log(`   - ${practitioners.length} profissionais`);
  console.log(`   - ${totalEncontros} encontros`);
  console.log(`   - ${totalObservacoes} observações`);
  console.log(`   - ${totalAlergias} alergias`);
  console.log(`   - ${totalCondicoes} condições`);
  console.log(`   - ${totalProcedimentos} procedimentos`);
  console.log(`   - ${totalMedicamentos} medicamentos\n`);

  console.log('🎉 Seed concluído com sucesso!\n');
  console.log('📝 Dados de acesso:');
  console.log('   Todos os pacientes podem fazer login com:');
  console.log('   - Username: CPF do paciente (11 dígitos)');
  console.log('   - Senha: 12345');
  console.log('\n   Exemplos de CPFs:');
  for (let i = 0; i < Math.min(10, pacientes.length); i++) {
    console.log(`   ${i + 1}. CPF: ${pacientes[i].cpf}`);
  }
  if (pacientes.length > 10) {
    console.log(`   ... e mais ${pacientes.length - 10} pacientes`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
