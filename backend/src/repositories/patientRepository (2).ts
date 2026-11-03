/**
 * PatientRepository - Repositório de dados de pacientes
 */

import { prisma } from '../lib/prisma';

export const patientRepository = {
  /**
   * Busca paciente por CPF
   */
  async findByCPF(cpf: string) {
    return prisma.patient.findFirst({
      where: {
        OR: [
          { cpf },
          {
            identifiers: {
              some: {
                system: 'http://www.saude.gov.br/fhir/r4/NamingSystem/cpf',
                value: cpf,
              },
            },
          },
        ],
      },
      include: {
        identifiers: true,
        names: true,
        telecoms: true,
        addresses: true,
      },
    });
  },

  /**
   * Busca paciente por ID interno
   */
  async findById(id: string) {
    return prisma.patient.findUnique({
      where: { id },
      include: {
        identifiers: true,
        names: true,
        telecoms: true,
        addresses: true,
      },
    });
  },

  /**
   * Busca paciente por FHIR ID
   */
  async findByFhirId(fhirId: string) {
    return prisma.patient.findUnique({
      where: { fhirId },
      include: {
        identifiers: true,
        names: true,
        telecoms: true,
        addresses: true,
      },
    });
  },

  /**
   * Busca encontros (encounters) do paciente
   */
  async findEncounters(patientId: string, limit = 10) {
    return prisma.encounter.findMany({
      where: { patientId },
      include: {
        identifiers: true,
        practitioner: {
          include: {
            names: true,
          },
        },
        serviceProvider: {
          include: {
            identifiers: true,
          },
        },
      },
      orderBy: {
        start: 'desc',
      },
      take: limit,
    });
  },

  /**
   * Busca observações (exames, sinais vitais) do paciente
   */
  async findObservations(patientId: string, categoryCode?: string, limit = 50) {
    return prisma.observation.findMany({
      where: {
        patientId,
        ...(categoryCode && { categoryCode }),
      },
      include: {
        components: true,
        performer: {
          include: {
            names: true,
          },
        },
      },
      orderBy: {
        effectiveDateTime: 'desc',
      },
      take: limit,
    });
  },

  /**
   * Busca condições/problemas do paciente
   */
  async findConditions(patientId: string) {
    return prisma.condition.findMany({
      where: { patientId },
      orderBy: {
        recordedDate: 'desc',
      },
    });
  },

  /**
   * Busca alergias do paciente
   */
  async findAllergies(patientId: string) {
    return prisma.allergyIntolerance.findMany({
      where: { patientId },
      orderBy: {
        recordedDate: 'desc',
      },
    });
  },

  /**
   * Busca procedimentos do paciente
   */
  async findProcedures(patientId: string, limit = 20) {
    return prisma.procedure.findMany({
      where: { patientId },
      orderBy: {
        performedStart: 'desc',
      },
      take: limit,
    });
  },

  /**
   * Busca medicamentos do paciente
   */
  async findMedications(patientId: string) {
    return prisma.medicationStatement.findMany({
      where: { patientId },
      orderBy: {
        effectiveStart: 'desc',
      },
    });
  },

  /**
   * Busca histórico completo do paciente (summary)
   */
  async findPatientHistory(patientId: string) {
    const [patient, encounters, observations, conditions, allergies, procedures, medications] = await Promise.all([
      prisma.patient.findUnique({
        where: { id: patientId },
        include: {
          identifiers: true,
          names: true,
          telecoms: true,
          addresses: true,
        },
      }),
      prisma.encounter.findMany({
        where: { patientId },
        include: {
          identifiers: true,
          practitioner: { include: { names: true } },
          serviceProvider: true,
        },
        orderBy: { start: 'desc' },
        take: 10,
      }),
      prisma.observation.findMany({
        where: { patientId },
        include: {
          components: true,
          performer: { include: { names: true } },
        },
        orderBy: { effectiveDateTime: 'desc' },
        take: 50,
      }),
      prisma.condition.findMany({
        where: { patientId },
        orderBy: { recordedDate: 'desc' },
      }),
      prisma.allergyIntolerance.findMany({
        where: { patientId },
        orderBy: { recordedDate: 'desc' },
      }),
      prisma.procedure.findMany({
        where: { patientId },
        orderBy: { performedStart: 'desc' },
        take: 20,
      }),
      prisma.medicationStatement.findMany({
        where: { patientId },
        orderBy: { effectiveStart: 'desc' },
      }),
    ]);

    return {
      patient,
      encounters,
      observations,
      conditions,
      allergies,
      procedures,
      medications,
    };
  },
};

