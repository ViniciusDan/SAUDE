import { prisma } from "../lib/prisma";

type CreateClinicalDocumentInput = {
  patientId: string;
  clinicId: string;
  title: string;
  documentType?: string;
  description?: string;
  fileName: string;
  filePath: string;
  mimeType?: string;
  issuedAt?: Date;
};

export const clinicalDocumentRepository = {
  async create(data: CreateClinicalDocumentInput) {
    return prisma.clinicalDocument.create({
      data: {
        patientId: data.patientId,
        clinicId: data.clinicId,
        title: data.title,
        documentType: data.documentType || null,
        description: data.description || null,
        fileName: data.fileName,
        filePath: data.filePath,
        mimeType: data.mimeType || null,
        source: "CLINIC_UPLOAD",
        issuedAt: data.issuedAt || null
      },
      include: {
        clinic: true,
        patient: true
      }
    });
  },

  async listByPatient(patientId: string) {
    return prisma.clinicalDocument.findMany({
      where: {
        patientId,
        isVisibleToPatient: true,
        source: "CLINIC_UPLOAD"
      },
      include: {
        clinic: true
      },
      orderBy: {
        uploadedAt: "desc"
      }
    });
  },

  async listByClinic(clinicId: string) {
    return prisma.clinicalDocument.findMany({
      where: {
        clinicId
      },
      include: {
        patient: true
      },
      orderBy: {
        uploadedAt: "desc"
      }
    });
  },

  async showToPatient(clinicId: string, documentId: string) {
    const document = await prisma.clinicalDocument.findFirst({
      where: {
        id: documentId,
        clinicId
      }
    });

    if (!document) {
      return null;
    }

    return prisma.clinicalDocument.update({
      where: {
        id: documentId
      },
      data: {
        isVisibleToPatient: true
      }
    });
  },

async createPatientDocument(data: {
  patientId: string;
  title: string;
  documentType?: string;
  description?: string;
  fileName: string;
  filePath: string;
  mimeType?: string;
}) {
  return prisma.clinicalDocument.create({
    data: {
      patientId: data.patientId,
      title: data.title,
      documentType: data.documentType || null,
      description: data.description || null,
      fileName: data.fileName,
      filePath: data.filePath,
      mimeType: data.mimeType || null,
      source: "PATIENT_UPLOAD",
      isVisibleToPatient: true
    }
  });
},

  async updateMetadata(
  clinicId: string,
  documentId: string,
  data: {
    title: string;
    documentType?: string;
    description?: string;
    issuedAt?: Date;
  }
) {
  const document = await prisma.clinicalDocument.findFirst({
    where: {
      id: documentId,
      clinicId
    }
  });

  if (!document) {
    return null;
  }

  return prisma.clinicalDocument.update({
    where: {
      id: documentId
    },
    data: {
      title: data.title,
      documentType: data.documentType || null,
      description: data.description || null,
      issuedAt: data.issuedAt || null
    }
  });
},

  async updatePatientDocument(
  patientId: string,
  documentId: string,
  data: {
    title: string;
    documentType?: string;
    description?: string;
    fileName?: string;
    filePath?: string;
    mimeType?: string;
  }
) {
  const document = await prisma.clinicalDocument.findFirst({
    where: {
      id: documentId,
      patientId,
      source: "PATIENT_UPLOAD"
    }
  });

  if (!document) {
    return null;
  }

  return prisma.clinicalDocument.update({
    where: {
      id: documentId
    },
    data: {
      title: data.title,
      documentType: data.documentType || null,
      description: data.description || null,
      ...(data.fileName && data.filePath
        ? {
            fileName: data.fileName,
            filePath: data.filePath,
            mimeType: data.mimeType || null
          }
        : {})
    }
  });
},


  async listPersonalDocumentsByPatient(patientId: string) {
    return prisma.clinicalDocument.findMany({
      where: {
        patientId,
        source: "PATIENT_UPLOAD"
      },
      orderBy: {
        uploadedAt: "desc"
      }
    });
  },

  async listByClinicAndPatient(clinicId: string, patientId: string) {
    return prisma.clinicalDocument.findMany({
      where: {
        clinicId,
        patientId
      },
      orderBy: {
        uploadedAt: "desc"
      }
    });
  },

  async hideFromPatient(clinicId: string, documentId: string) {
    const document = await prisma.clinicalDocument.findFirst({
      where: {
        id: documentId,
        clinicId
      }
    });

    if (!document) {
      return null;
    }

    return prisma.clinicalDocument.update({
      where: {
        id: documentId
      },
      data: {
        isVisibleToPatient: false
      }
    });
  }
  
  
};