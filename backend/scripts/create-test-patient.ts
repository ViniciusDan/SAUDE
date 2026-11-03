import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const passwordHash = await bcrypt.hash("12345", 10);

  const patient = await prisma.patient.create({
    data: {
      fhirId: "patient-caio-004",
      cpf: "24244859314",
      cns: "806543219876544",
      gender: "male",
      birthDate: new Date("2003-08-01"),
      names: {
        create: [
          {
            use: "official",
            text: "Caio Cesar da Silva Martins",
            family: "Martins",
            given: "Caio Cesar da Silva"
          }
        ]
      },
      identifiers: {
        create: [
          {
            use: "official",
            system: "http://www.saude.gov.br/fhir/r4/NamingSystem/cpf",
            value: "04244859314",
            resourceType: "Patient"
          },
          {
            use: "official",
            system: "http://www.saude.gov.br/fhir/r4/NamingSystem/cns",
            value: "706543219876544",
            resourceType: "Patient"
          }
        ]
      },
      telecoms: {
        create: [
          {
            system: "phone",
            value: "(11) 91234-5678",
            use: "mobile"
          },
          {
            system: "email",
            value: "caio.martins@example.com",
            use: "home"
          }
        ]
      },
      addresses: {
        create: [
          {
            use: "home",
            line1: "Rua dos Desenvolvedores, 1020",
            line2: "Apto 82",
            city: "São Paulo",
            state: "SP",
            district: "Vila Mariana",
            postalCode: "04105-000",
            country: "BR"
          }
        ]
      },
      credential: {
        create: {
          username: "24244859314",
          passwordHash
        }
      }
    }
  });

  const encounterLocations = [
    { name: "Hospital Horizonte", reason: "Check-up e avaliação preventiva" },
    { name: "Clínica Vida Nova", reason: "Consulta cardiológica" },
    { name: "Laboratório Alfa", reason: "Coleta de exames laboratoriais" },
    { name: "Centro Médico Aurora", reason: "Retorno hipertensão" },
    { name: "Unidade Saúde Integral", reason: "Vacinação anual" },
    { name: "Hospital São Gabriel", reason: "Pronto atendimento" },
    { name: "Clínica Respirar", reason: "Avaliação respiratória" },
    { name: "Laboratório Bio+ ", reason: "Exames de rotina" },
    { name: "Centro Ortopédico Norte", reason: "Avaliação pós exercício" },
    { name: "Hospital São Lucas", reason: "Acompanhamento geral" }
  ];

  await prisma.encounter.createMany({
    data: encounterLocations.map((loc, index) => ({
        fhirId: `encounter-caio-${(index + 1).toString().padStart(3, "0")}-${patient.id.slice(-4)}`,
      patientId: patient.id,
      status: "finished",
      classCode: "AMB",
      classDisplay: "Ambulatorial",
      start: new Date(`2023-${(index % 12) + 1}-15T10:00:00-03:00`),
      end: new Date(`2023-${(index % 12) + 1}-15T10:30:00-03:00`),
      typeCode: "CONS",
      typeDisplay: "Consulta",
      reasonCode: "Z00.0",
      reasonDisplay: loc.reason,
      serviceProviderId: null,
      organizationId: null
    }))
  });

  const observationList = [
    ["Hemograma completo", "laboratory", "Resultados dentro da normalidade"],
    ["Colesterol total", "laboratory", "190 mg/dL"],
    ["HDL", "laboratory", "55 mg/dL"],
    ["LDL", "laboratory", "110 mg/dL"],
    ["Triglicérides", "laboratory", "130 mg/dL"],
    ["Glicemia em jejum", "laboratory", "98 mg/dL"],
    ["Hemoglobina glicada", "laboratory", "5.4%"],
    ["Pressão arterial", "vital-signs", "120/80 mmHg"],
    ["Frequência cardíaca", "vital-signs", "72 bpm"],
    ["Temperatura corporal", "vital-signs", "36.4 ºC"],
    ["Saturação de O2", "vital-signs", "98%"],
    ["Vitamina D", "laboratory", "34 ng/mL"],
    ["TSH", "laboratory", "2.1 µIU/mL"],
    ["Creatinina sérica", "laboratory", "0.9 mg/dL"],
    ["Ácido úrico", "laboratory", "5.8 mg/dL"]
  ];

  await prisma.observation.createMany({
    data: observationList.map((obs, index) => ({
        fhirId: `obs-caio-${(index + 1).toString().padStart(3, "0")}-${patient.id.slice(-4)}`,
      patientId: patient.id,
      status: "final",
      categoryCode: obs[1],
      codeDisplay: obs[0],
      valueString: obs[2],
      issued: new Date(`2024-${(index % 12) + 1}-10T09:30:00-03:00`)
    }))
  });

  await prisma.condition.createMany({
    data: [
      {
        fhirId: `cond-caio-has-${patient.id.slice(-4)}`,
        patientId: patient.id,
        clinicalStatus: "active",
        verificationStatus: "confirmed",
        codeDisplay: "Hipertensão arterial sistêmica",
        codeSystem: "CID-10",
        code: "I10",
        onsetDateTime: new Date("2022-02-10T00:00:00-03:00"),
        recordedDate: new Date("2022-02-15T00:00:00-03:00"),
        note: "Acompanhamento regular"
      },
      {
        fhirId: `cond-caio-asma-${patient.id.slice(-4)}`,
        patientId: patient.id,
        clinicalStatus: "active",
        verificationStatus: "confirmed",
        codeDisplay: "Asma leve persistente",
        codeSystem: "CID-10",
        code: "J45.3",
        onsetDateTime: new Date("2015-11-05T00:00:00-03:00"),
        recordedDate: new Date("2015-11-10T00:00:00-03:00"),
        note: "Controlada com broncodilatador"
      }
    ]
  });

  await prisma.procedure.create({
    data: {
      fhirId: `proc-caio-ecg-${patient.id.slice(-4)}`,
      patientId: patient.id,
      status: "completed",
      codeSystem: "TUSS",
      code: "40301334",
      codeDisplay: "Eletrocardiograma",
      performedStart: new Date("2024-05-10T09:00:00-03:00"),
      performedEnd: new Date("2024-05-10T09:20:00-03:00"),
      note: "Resultado dentro da normalidade"
    }
  });

  await prisma.medicationStatement.createMany({
    data: [
      {
      fhirId: `med-caio-losartana-${patient.id.slice(-4)}`,
        patientId: patient.id,
        status: "active",
        medicationDisplay: "Losartana 50mg",
        dosage: "1 comprimido ao dia",
        route: "Oral",
        effectiveStart: new Date("2023-01-01T00:00:00-03:00"),
        note: "Uso contínuo"
      },
      {
        fhirId: `med-caio-salbutamol-${patient.id.slice(-4)}`,
        patientId: patient.id,
        status: "active",
        medicationDisplay: "Salbutamol spray",
        dosage: "2 jatos quando necessário",
        route: "Inalatória",
        effectiveStart: new Date("2016-01-01T00:00:00-03:00"),
        note: "Uso conforme necessidade em crises de asma"
      }
    ]
  });

  await prisma.allergyIntolerance.create({
    data: {
      fhirId: `allergy-caio-dipirona-${patient.id.slice(-4)}`,
      patientId: patient.id,
      clinicalStatusCode: "active",
      clinicalStatusText: "Ativa",
      verificationStatus: "confirmed",
      codeDisplay: "Dipirona",
      criticality: "high",
      lastOccurrence: new Date("2020-03-12T00:00:00-03:00")
    }
  });

  console.log("Paciente criado:", patient.id);
}

main()
  .catch((error) => {
    console.error("Erro ao criar paciente de teste:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

