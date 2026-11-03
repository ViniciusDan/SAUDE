/**
 * PatientRepository - Repositório de dados de pacientes
 */

import { randomUUID } from "crypto";
import { prisma } from "../lib/prisma";

type UpdatePatientProfileInput = {
  fullName: string;
  gender?: string;
  birthDate?: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  district?: string;
  city?: string;
  state?: string;
  postalCode?: string;
};

type EditableAllergyInput = {
  substance: string;
  criticality?: string;
  note?: string;
};

type EditableConditionInput = {
  name: string;
  clinicalStatus?: string;
  severity?: string;
  note?: string;
};

type EditableMedicationInput = {
  name: string;
  status?: string;
  dosage?: string;
  route?: string;
  note?: string;
};

export const patientRepository = {
  async findByCPF(cpf: string) {
    return prisma.patient.findFirst({
      where: {
        OR: [
          { cpf },
          {
            identifiers: {
              some: {
                system: "http://www.saude.gov.br/fhir/r4/NamingSystem/cpf",
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

  async updateProfile(patientId: string, data: UpdatePatientProfileInput) {
    const existingPatient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!existingPatient) {
      return null;
    }

    const fullName = data.fullName.trim();
    const nameParts = fullName.split(/\s+/).filter(Boolean);
    const family = nameParts.length > 1 ? nameParts[nameParts.length - 1] : fullName;
    const given = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : fullName;

    await prisma.$transaction(async (tx) => {
      await tx.patient.update({
        where: { id: patientId },
        data: {
          gender: data.gender || null,
          birthDate: data.birthDate ? new Date(`${data.birthDate}T00:00:00.000Z`) : null,
        },
      });

      const officialName = await tx.humanName.findFirst({
        where: {
          patientId,
          OR: [{ use: "official" }, { use: null }],
        },
        orderBy: { createdAt: "asc" },
      });

      if (officialName) {
        await tx.humanName.update({
          where: { id: officialName.id },
          data: {
            use: officialName.use ?? "official",
            text: fullName,
            family,
            given,
          },
        });
      } else {
        await tx.humanName.create({
          data: {
            patientId,
            use: "official",
            text: fullName,
            family,
            given,
          },
        });
      }

      const currentTelecoms = await tx.contactPoint.findMany({
        where: { patientId },
      });

      const phoneEntry = currentTelecoms.find((item) => item.system === "phone");
      const emailEntry = currentTelecoms.find((item) => item.system === "email");

      if (data.phone?.trim()) {
        if (phoneEntry) {
          await tx.contactPoint.update({
            where: { id: phoneEntry.id },
            data: {
              value: data.phone.trim(),
              use: phoneEntry.use ?? "mobile",
            },
          });
        } else {
          await tx.contactPoint.create({
            data: {
              patientId,
              system: "phone",
              value: data.phone.trim(),
              use: "mobile",
              rank: 1,
            },
          });
        }
      }

      if (data.email?.trim()) {
        if (emailEntry) {
          await tx.contactPoint.update({
            where: { id: emailEntry.id },
            data: {
              value: data.email.trim(),
              use: emailEntry.use ?? "home",
            },
          });
        } else {
          await tx.contactPoint.create({
            data: {
              patientId,
              system: "email",
              value: data.email.trim(),
              use: "home",
              rank: 2,
            },
          });
        }
      }

      const primaryAddress = await tx.address.findFirst({
        where: { patientId },
        orderBy: { createdAt: "asc" },
      });

      const addressData = {
        use: primaryAddress?.use ?? "home",
        type: primaryAddress?.type ?? "both",
        line1: data.addressLine1?.trim() || null,
        line2: data.addressLine2?.trim() || null,
        district: data.district?.trim() || null,
        city: data.city?.trim() || null,
        state: data.state?.trim() || null,
        postalCode: data.postalCode?.trim() || null,
        country: "BR",
        text: [
          data.addressLine1,
          data.addressLine2,
          data.district,
          data.city,
          data.state,
          data.postalCode,
        ]
          .filter(Boolean)
          .join(", "),
      };

      if (primaryAddress) {
        await tx.address.update({
          where: { id: primaryAddress.id },
          data: addressData,
        });
      } else {
        await tx.address.create({
          data: {
            patientId,
            ...addressData,
          },
        });
      }
    });

    return this.findById(patientId);
  },

  async listEditableAllergies(patientId: string) {
    return prisma.allergyIntolerance.findMany({
      where: { patientId },
      orderBy: {
        recordedDate: "desc",
      },
    });
  },

 async createEditableCondition(patientId: string, data: EditableConditionInput) {
  return prisma.condition.create({
    data: {
      patientId,
      fhirId: `patient-condition-${randomUUID()}`,
      codeDisplay: data.name.trim(),
      clinicalStatus:
        data.clinicalStatus === "inactive"
          ? "Inativa"
          : data.clinicalStatus === "resolved"
            ? "Resolvida"
            : "Ativa",
      severity:
        data.severity === "mild"
          ? "Leve"
          : data.severity === "moderate"
            ? "Moderada"
            : data.severity === "severe"
              ? "Grave"
              : null,
      verificationStatus: "unconfirmed",
      note: data.note?.trim() || null,
      recordedDate: new Date(),
      source: "PATIENT",
      patientEditable: true
    },
  });
},
async createEditableAllergy(patientId: string, data: EditableAllergyInput) {
  return prisma.allergyIntolerance.create({
    data: {
      patientId,
      fhirId: `patient-allergy-${randomUUID()}`,
      codeDisplay: data.substance.trim(),
      criticality: data.criticality || "unable-to-assess",
      clinicalStatusCode: "active",
      clinicalStatusText: "Ativa",
      verificationStatus: "unconfirmed",
      note: data.note?.trim() || null,
      recordedDate: new Date(),
      source: "PATIENT",
      patientEditable: true,
    },
  });
},


  async updateEditableAllergy(patientId: string, allergyId: string, data: EditableAllergyInput) {
    const allergy = await prisma.allergyIntolerance.findFirst({
      where: {
        id: allergyId,
        patientId,
      },
    });

    if (!allergy) {
      return null;
    }

    return prisma.allergyIntolerance.update({
      where: { id: allergyId },
      data: {
        codeDisplay: data.substance.trim(),
        criticality: data.criticality || "unable-to-assess",
        note: data.note?.trim() || null,
        source: allergy.source ?? "PATIENT",
        patientEditable: true,
      },
    });
  },

  async deleteEditableAllergy(patientId: string, allergyId: string) {
    const allergy = await prisma.allergyIntolerance.findFirst({
      where: {
        id: allergyId,
        patientId,
      },
    });

    if (!allergy) {
      return false;
    }

    await prisma.allergyIntolerance.delete({
      where: { id: allergyId },
    });

    return true;
  },

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
        start: "desc",
      },
      take: limit,
    });
  },

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
        effectiveDateTime: "desc",
      },
      take: limit,
    });
  },

  async findConditions(patientId: string) {
    return prisma.condition.findMany({
      where: { patientId },
      orderBy: {
        recordedDate: "desc",
      },
    });
  },

  async findAllergies(patientId: string) {
    return prisma.allergyIntolerance.findMany({
      where: { patientId },
      orderBy: {
        recordedDate: "desc",
      },
    });
  },

  async findProcedures(patientId: string, limit = 20) {
    return prisma.procedure.findMany({
      where: { patientId },
      orderBy: {
        performedStart: "desc",
      },
      take: limit,
    });
  },

  async findMedications(patientId: string) {
    return prisma.medicationStatement.findMany({
      where: { patientId },
      orderBy: {
        effectiveStart: "desc",
      },
    });
  },

  async findPatientHistory(patientId: string) {
    const [patient, encounters, observations, conditions, allergies, procedures, medications] =
      await Promise.all([
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
          orderBy: { start: "desc" },
          take: 10,
        }),
        prisma.observation.findMany({
          where: { patientId },
          include: {
            components: true,
            performer: { include: { names: true } },
          },
          orderBy: { effectiveDateTime: "desc" },
          take: 50,
        }),
        prisma.condition.findMany({
          where: { patientId },
          orderBy: { recordedDate: "desc" },
        }),
        prisma.allergyIntolerance.findMany({
          where: { patientId },
          orderBy: { recordedDate: "desc" },
        }),
        prisma.procedure.findMany({
          where: { patientId },
          orderBy: { performedStart: "desc" },
          take: 20,
        }),
        prisma.medicationStatement.findMany({
          where: { patientId },
          orderBy: { effectiveStart: "desc" },
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
    async listEditableConditions(patientId: string) {
    return prisma.condition.findMany({
      where: { patientId },
      orderBy: {
        recordedDate: "desc",
      },
    });
  },



  async updateEditableCondition(patientId: string, conditionId: string, data: EditableConditionInput) {
  const condition = await prisma.condition.findFirst({
    where: {
      id: conditionId,
      patientId,
    },
  });

  if (!condition) {
    return null;
  }

  return prisma.condition.update({
    where: { id: conditionId },
    data: {
      codeDisplay: data.name.trim(),
      clinicalStatus:
        data.clinicalStatus === "inactive"
          ? "Inativa"
          : data.clinicalStatus === "resolved"
            ? "Resolvida"
            : "Ativa",
      severity:
        data.severity === "mild"
          ? "Leve"
          : data.severity === "moderate"
            ? "Moderada"
            : data.severity === "severe"
              ? "Grave"
              : null,
      note: data.note?.trim() || null,
      source: condition.source ?? "PATIENT",
      patientEditable: true
    },
  });
},

  async deleteEditableCondition(patientId: string, conditionId: string) {
    const condition = await prisma.condition.findFirst({
      where: {
        id: conditionId,
        patientId,
      },
    });

    if (!condition) {
      return false;
    }

    await prisma.condition.delete({
      where: { id: conditionId },
    });

    return true;
  },

    async listEditableMedications(patientId: string) {
    return prisma.medicationStatement.findMany({
      where: { patientId },
      orderBy: {
        effectiveStart: "desc",
      },
    });
  },

  async createEditableMedication(patientId: string, data: EditableMedicationInput) {
    return prisma.medicationStatement.create({
      data: {
        patientId,
        fhirId: `patient-medication-${randomUUID()}`,
        medicationDisplay: data.name.trim(),
        status:
          data.status === "completed"
            ? "completed"
            : data.status === "stopped"
              ? "stopped"
              : "active",
        dosage: data.dosage?.trim() || null,
        route: data.route?.trim() || null,
        note: data.note?.trim() || null,
        effectiveStart: new Date(),
        source: "PATIENT",
        patientEditable: true
      },
    });
  },

  async updateEditableMedication(patientId: string, medicationId: string, data: EditableMedicationInput) {
    const medication = await prisma.medicationStatement.findFirst({
      where: {
        id: medicationId,
        patientId,
      },
    });

    if (!medication) {
      return null;
    }

    return prisma.medicationStatement.update({
      where: { id: medicationId },
      data: {
        medicationDisplay: data.name.trim(),
        status:
          data.status === "completed"
            ? "completed"
            : data.status === "stopped"
              ? "stopped"
              : "active",
        dosage: data.dosage?.trim() || null,
        route: data.route?.trim() || null,
        note: data.note?.trim() || null,
        source: medication.source ?? "PATIENT",
        patientEditable: true
      },
    });
  },

  async deleteEditableMedication(patientId: string, medicationId: string) {
    const medication = await prisma.medicationStatement.findFirst({
      where: {
        id: medicationId,
        patientId,
      },
    });

    if (!medication) {
      return false;
    }

    await prisma.medicationStatement.delete({
      where: { id: medicationId },
    });

    return true;
  },
};

