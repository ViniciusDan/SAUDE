import type { RequestHandler } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middlewares/authenticate";
import { AppError } from "../errors/AppError";
import { clinicalDocumentRepository } from "../repositories/clinicalDocumentRepository";

const uploadParamsSchema = z.object({
  patientId: z.string().min(1)
});

const uploadBodySchema = z.object({
  title: z.string().min(2, "Informe o título do documento"),
  documentType: z.string().optional(),
  description: z.string().optional(),
  issuedAt: z.string().optional()
});

const hideDocumentParamsSchema = z.object({
  documentId: z.string().min(1)
});

const patientDocumentBodySchema = z.object({
  title: z.string().min(2, "Informe o título do documento"),
  documentType: z.string().optional(),
  description: z.string().optional()
});

const patientDocumentParamsSchema = z.object({
  patientId: z.string().min(1),
  documentId: z.string().min(1)
});

const updateDocumentBodySchema = z.object({
  title: z.string().min(2, "Informe o título do documento"),
  documentType: z.string().optional(),
  description: z.string().optional(),
  issuedAt: z.string().optional()
});

export const uploadDocumentToPatientController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsedParams = uploadParamsSchema.parse(req.params);
    const parsedBody = uploadBodySchema.parse(req.body);

    if (!authReq.user || authReq.user.role !== "clinic") {
      throw new AppError("Acesso permitido apenas para clínicas", 403);
    }

    if (!req.file) {
      throw new AppError("Arquivo não enviado", 400);
    }

    const publicFilePath = `uploads/clinical-documents/${req.file.filename}`;

    const document = await clinicalDocumentRepository.create({
      patientId: parsedParams.patientId,
      clinicId: authReq.user.sub,
      title: parsedBody.title,
      documentType: parsedBody.documentType,
      description: parsedBody.description,
      fileName: req.file.originalname,
      filePath: publicFilePath,
      mimeType: req.file.mimetype,
      issuedAt: parsedBody.issuedAt ? new Date(parsedBody.issuedAt) : undefined
    });

    return res.status(201).json({
      id: document.id,
      title: document.title,
      fileName: document.fileName,
      uploadedAt: document.uploadedAt
    });
  } catch (error) {
    next(error);
  }
};

export const listPatientDocumentsController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsedParams = uploadParamsSchema.parse(req.params);

    if (!authReq.user || authReq.user.sub !== parsedParams.patientId) {
      throw new AppError("Acesso negado", 403);
    }

    const documents = await clinicalDocumentRepository.listByPatient(parsedParams.patientId);

    return res.json(
      documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        documentType: doc.documentType,
        description: doc.description,
        fileName: doc.fileName,
        fileUrl: `http://localhost:3333/${doc.filePath.replace(/\\/g, "/")}`,
        uploadedAt: doc.uploadedAt,
        issuedAt: doc.issuedAt,
        clinicName: doc.clinic?.tradeName || doc.clinic?.name || undefined
      }))
    );
  } catch (error) {
    next(error);
  }
};

export const updateClinicDocumentController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsedParams = hideDocumentParamsSchema.parse(req.params);
    const parsedBody = updateDocumentBodySchema.parse(req.body);

    if (!authReq.user || authReq.user.role !== "clinic") {
      throw new AppError("Acesso permitido apenas para clínicas", 403);
    }

    const document = await clinicalDocumentRepository.updateMetadata(
      authReq.user.sub,
      parsedParams.documentId,
      {
        title: parsedBody.title,
        documentType: parsedBody.documentType,
        description: parsedBody.description,
        issuedAt: parsedBody.issuedAt ? new Date(parsedBody.issuedAt) : undefined
      }
    );

    if (!document) {
      throw new AppError("Documento não encontrado", 404);
    }

    return res.json({
      message: "Documento atualizado com sucesso.",
      document: {
        id: document.id,
        title: document.title,
        documentType: document.documentType,
        description: document.description,
        issuedAt: document.issuedAt,
        uploadedAt: document.uploadedAt,
        isVisibleToPatient: document.isVisibleToPatient
      }
    });
  } catch (error) {
    next(error);
  }
};

export const listClinicPatientDocumentsController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsedParams = uploadParamsSchema.parse(req.params);

    if (!authReq.user || authReq.user.role !== "clinic") {
      throw new AppError("Acesso permitido apenas para clínicas", 403);
    }

    const documents = await clinicalDocumentRepository.listByClinicAndPatient(
      authReq.user.sub,
      parsedParams.patientId
    );

    return res.json(
      documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        documentType: doc.documentType,
        description: doc.description,
        fileName: doc.fileName,
        fileUrl: `http://localhost:3333/${doc.filePath.replace(/\\/g, "/")}`,
        uploadedAt: doc.uploadedAt,
        issuedAt: doc.issuedAt,
        isVisibleToPatient: doc.isVisibleToPatient
      }))
    );
  } catch (error) {
    next(error);
  }
};

export const hideDocumentFromPatientController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsedParams = hideDocumentParamsSchema.parse(req.params);

    if (!authReq.user || authReq.user.role !== "clinic") {
      throw new AppError("Acesso permitido apenas para clínicas", 403);
    }

    const document = await clinicalDocumentRepository.hideFromPatient(
      authReq.user.sub,
      parsedParams.documentId
    );

    if (!document) {
      throw new AppError("Documento não encontrado", 404);
    }

    return res.json({
      message: "Documento ocultado do portal do paciente com sucesso."
    });
  } catch (error) {
    next(error);
  }
};

export const showDocumentToPatientController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsedParams = hideDocumentParamsSchema.parse(req.params);

    if (!authReq.user || authReq.user.role !== "clinic") {
      throw new AppError("Acesso permitido apenas para clínicas", 403);
    }

    const document = await clinicalDocumentRepository.showToPatient(
      authReq.user.sub,
      parsedParams.documentId
    );

    if (!document) {
      throw new AppError("Documento não encontrado", 404);
    }

    return res.json({
      message: "Documento exibido novamente no portal do paciente com sucesso."
    });
  } catch (error) {
    next(error);
  }
};

export const uploadPersonalDocumentController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsedParams = uploadParamsSchema.parse(req.params);
    const parsedBody = patientDocumentBodySchema.parse(req.body);

    if (!authReq.user || authReq.user.sub !== parsedParams.patientId) {
      throw new AppError("Acesso negado", 403);
    }

    if (!req.file) {
      throw new AppError("Arquivo não enviado", 400);
    }

    const publicFilePath = `uploads/clinical-documents/${req.file.filename}`;

    const document = await clinicalDocumentRepository.createPatientDocument({
      patientId: parsedParams.patientId,
      title: parsedBody.title,
      documentType: parsedBody.documentType,
      description: parsedBody.description,
      fileName: req.file.originalname,
      filePath: publicFilePath,
      mimeType: req.file.mimetype
    });

    return res.status(201).json({
      id: document.id,
      title: document.title,
      fileName: document.fileName,
      uploadedAt: document.uploadedAt
    });
  } catch (error) {
    next(error);
  }
};

export const listPersonalDocumentsController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsedParams = uploadParamsSchema.parse(req.params);

    if (!authReq.user || authReq.user.sub !== parsedParams.patientId) {
      throw new AppError("Acesso negado", 403);
    }

    const documents = await clinicalDocumentRepository.listPersonalDocumentsByPatient(parsedParams.patientId);

    return res.json(
      documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        documentType: doc.documentType,
        description: doc.description,
        fileName: doc.fileName,
        fileUrl: `http://localhost:3333/${doc.filePath.replace(/\\/g, "/")}`,
        uploadedAt: doc.uploadedAt,
        source: doc.source
      }))
    );
  } catch (error) {
    next(error);
  }
};

export const updatePersonalDocumentController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsedParams = patientDocumentParamsSchema.parse(req.params);
    const parsedBody = patientDocumentBodySchema.parse(req.body);

    if (!authReq.user || authReq.user.sub !== parsedParams.patientId) {
      throw new AppError("Acesso negado", 403);
    }

    const fileData = req.file
      ? {
          fileName: req.file.originalname,
          filePath: `uploads/clinical-documents/${req.file.filename}`,
          mimeType: req.file.mimetype
        }
      : {};

    const document = await clinicalDocumentRepository.updatePatientDocument(
      parsedParams.patientId,
      parsedParams.documentId,
      {
        title: parsedBody.title,
        documentType: parsedBody.documentType,
        description: parsedBody.description,
        ...fileData
      }
    );

    if (!document) {
      throw new AppError("Documento pessoal não encontrado", 404);
    }

    return res.json({
      message: "Documento pessoal atualizado com sucesso.",
      document: {
        id: document.id,
        title: document.title,
        documentType: document.documentType,
        description: document.description,
        fileName: document.fileName,
        uploadedAt: document.uploadedAt,
        source: document.source
      }
    });
  } catch (error) {
    next(error);
  }
};