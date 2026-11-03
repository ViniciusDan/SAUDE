-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "fhirId" TEXT NOT NULL,
    "cpf" TEXT,
    "cns" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "gender" TEXT,
    "birthDate" DATE,
    "maritalStatus" TEXT,
    "deceased" BOOLEAN DEFAULT false,
    "language" TEXT DEFAULT 'pt-BR',
    "photo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Identifier" (
    "id" TEXT NOT NULL,
    "use" TEXT,
    "system" TEXT,
    "value" TEXT NOT NULL,
    "typeCode" TEXT,
    "typeDisplay" TEXT,
    "assigner" TEXT,
    "resourceType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "patientId" TEXT,
    "practitionerId" TEXT,
    "organizationId" TEXT,
    "encounterId" TEXT,

    CONSTRAINT "Identifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HumanName" (
    "id" TEXT NOT NULL,
    "use" TEXT,
    "family" TEXT,
    "given" TEXT,
    "text" TEXT,
    "periodStart" DATE,
    "periodEnd" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "patientId" TEXT,
    "practitionerId" TEXT,

    CONSTRAINT "HumanName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactPoint" (
    "id" TEXT NOT NULL,
    "system" TEXT,
    "value" TEXT,
    "use" TEXT,
    "rank" INTEGER,
    "periodStart" DATE,
    "periodEnd" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "patientId" TEXT,
    "practitionerId" TEXT,
    "organizationId" TEXT,

    CONSTRAINT "ContactPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "use" TEXT,
    "type" TEXT,
    "text" TEXT,
    "line1" TEXT,
    "line2" TEXT,
    "district" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "periodStart" DATE,
    "periodEnd" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "patientId" TEXT,
    "organizationId" TEXT,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "fhirId" TEXT NOT NULL,
    "cnes" TEXT,
    "name" TEXT NOT NULL,
    "alias" TEXT,
    "typeCode" TEXT,
    "typeDisplay" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Practitioner" (
    "id" TEXT NOT NULL,
    "fhirId" TEXT NOT NULL,
    "cpf" TEXT,
    "cns" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "gender" TEXT,
    "birthDate" DATE,
    "qualificationCode" TEXT,
    "qualificationText" TEXT,
    "councilType" TEXT,
    "councilNumber" TEXT,
    "councilUF" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Practitioner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Encounter" (
    "id" TEXT NOT NULL,
    "fhirId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "classCode" TEXT,
    "classDisplay" TEXT,
    "typeCode" TEXT,
    "typeDisplay" TEXT,
    "reasonCode" TEXT,
    "reasonDisplay" TEXT,
    "start" TIMESTAMP(6),
    "end" TIMESTAMP(6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,
    "organizationId" TEXT,
    "serviceProviderId" TEXT,
    "practitionerId" TEXT,

    CONSTRAINT "Encounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Observation" (
    "id" TEXT NOT NULL,
    "fhirId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "categoryCode" TEXT,
    "categoryDisplay" TEXT,
    "codeSystem" TEXT,
    "code" TEXT,
    "codeDisplay" TEXT,
    "issued" TIMESTAMP(6),
    "effectiveDateTime" TIMESTAMP(6),
    "valueQuantity" DECIMAL(12,4),
    "valueQuantityUnit" TEXT,
    "valueString" TEXT,
    "valueCodeSystem" TEXT,
    "valueCode" TEXT,
    "valueCodeDisplay" TEXT,
    "interpretationCode" TEXT,
    "interpretationText" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,
    "encounterId" TEXT,
    "performerId" TEXT,

    CONSTRAINT "Observation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObservationComponent" (
    "id" TEXT NOT NULL,
    "codeSystem" TEXT,
    "code" TEXT,
    "codeDisplay" TEXT,
    "valueQuantity" DECIMAL(12,4),
    "valueQuantityUnit" TEXT,
    "valueString" TEXT,
    "valueCodeSystem" TEXT,
    "valueCode" TEXT,
    "valueCodeDisplay" TEXT,
    "observationId" TEXT NOT NULL,

    CONSTRAINT "ObservationComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllergyIntolerance" (
    "id" TEXT NOT NULL,
    "fhirId" TEXT NOT NULL,
    "clinicalStatusCode" TEXT,
    "clinicalStatusText" TEXT,
    "verificationStatus" TEXT,
    "type" TEXT,
    "category" TEXT,
    "codeSystem" TEXT,
    "code" TEXT,
    "codeDisplay" TEXT,
    "criticality" TEXT,
    "recordedDate" TIMESTAMP(6),
    "lastOccurrence" TIMESTAMP(6),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,
    "recorderId" TEXT,

    CONSTRAINT "AllergyIntolerance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Condition" (
    "id" TEXT NOT NULL,
    "fhirId" TEXT NOT NULL,
    "clinicalStatus" TEXT,
    "verificationStatus" TEXT,
    "categoryCode" TEXT,
    "severity" TEXT,
    "codeSystem" TEXT,
    "code" TEXT,
    "codeDisplay" TEXT,
    "onsetDateTime" TIMESTAMP(6),
    "abatementDateTime" TIMESTAMP(6),
    "recordedDate" TIMESTAMP(6),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,
    "recorderId" TEXT,

    CONSTRAINT "Condition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Procedure" (
    "id" TEXT NOT NULL,
    "fhirId" TEXT NOT NULL,
    "status" TEXT,
    "categoryCode" TEXT,
    "codeSystem" TEXT,
    "code" TEXT,
    "codeDisplay" TEXT,
    "performedStart" TIMESTAMP(6),
    "performedEnd" TIMESTAMP(6),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,
    "performerId" TEXT,
    "encounterId" TEXT,

    CONSTRAINT "Procedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationStatement" (
    "id" TEXT NOT NULL,
    "fhirId" TEXT NOT NULL,
    "status" TEXT,
    "categoryCode" TEXT,
    "medicationCode" TEXT,
    "medicationDisplay" TEXT,
    "dosage" TEXT,
    "route" TEXT,
    "effectiveStart" TIMESTAMP(6),
    "effectiveEnd" TIMESTAMP(6),
    "taken" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT NOT NULL,
    "recorderId" TEXT,

    CONSTRAINT "MedicationStatement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "outcome" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agentUserId" TEXT,
    "sourceName" TEXT,
    "patientId" TEXT,
    "details" JSONB,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientCredential" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_fhirId_key" ON "Patient"("fhirId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_cpf_key" ON "Patient"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_cns_key" ON "Patient"("cns");

-- CreateIndex
CREATE INDEX "Patient_cpf_idx" ON "Patient"("cpf");

-- CreateIndex
CREATE INDEX "Patient_cns_idx" ON "Patient"("cns");

-- CreateIndex
CREATE INDEX "Identifier_resourceType_value_idx" ON "Identifier"("resourceType", "value");

-- CreateIndex
CREATE INDEX "Identifier_system_value_idx" ON "Identifier"("system", "value");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_fhirId_key" ON "Organization"("fhirId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_cnes_key" ON "Organization"("cnes");

-- CreateIndex
CREATE INDEX "Organization_cnes_idx" ON "Organization"("cnes");

-- CreateIndex
CREATE UNIQUE INDEX "Practitioner_fhirId_key" ON "Practitioner"("fhirId");

-- CreateIndex
CREATE UNIQUE INDEX "Practitioner_cpf_key" ON "Practitioner"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Practitioner_cns_key" ON "Practitioner"("cns");

-- CreateIndex
CREATE INDEX "Practitioner_cpf_idx" ON "Practitioner"("cpf");

-- CreateIndex
CREATE INDEX "Practitioner_cns_idx" ON "Practitioner"("cns");

-- CreateIndex
CREATE UNIQUE INDEX "Encounter_fhirId_key" ON "Encounter"("fhirId");

-- CreateIndex
CREATE INDEX "Encounter_patientId_start_idx" ON "Encounter"("patientId", "start");

-- CreateIndex
CREATE INDEX "Encounter_status_idx" ON "Encounter"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Observation_fhirId_key" ON "Observation"("fhirId");

-- CreateIndex
CREATE INDEX "Observation_patientId_effectiveDateTime_idx" ON "Observation"("patientId", "effectiveDateTime");

-- CreateIndex
CREATE INDEX "Observation_categoryCode_idx" ON "Observation"("categoryCode");

-- CreateIndex
CREATE INDEX "Observation_code_idx" ON "Observation"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AllergyIntolerance_fhirId_key" ON "AllergyIntolerance"("fhirId");

-- CreateIndex
CREATE INDEX "AllergyIntolerance_patientId_idx" ON "AllergyIntolerance"("patientId");

-- CreateIndex
CREATE INDEX "AllergyIntolerance_clinicalStatusCode_idx" ON "AllergyIntolerance"("clinicalStatusCode");

-- CreateIndex
CREATE UNIQUE INDEX "Condition_fhirId_key" ON "Condition"("fhirId");

-- CreateIndex
CREATE INDEX "Condition_patientId_idx" ON "Condition"("patientId");

-- CreateIndex
CREATE INDEX "Condition_code_idx" ON "Condition"("code");

-- CreateIndex
CREATE INDEX "Condition_clinicalStatus_idx" ON "Condition"("clinicalStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Procedure_fhirId_key" ON "Procedure"("fhirId");

-- CreateIndex
CREATE INDEX "Procedure_patientId_idx" ON "Procedure"("patientId");

-- CreateIndex
CREATE INDEX "Procedure_code_idx" ON "Procedure"("code");

-- CreateIndex
CREATE UNIQUE INDEX "MedicationStatement_fhirId_key" ON "MedicationStatement"("fhirId");

-- CreateIndex
CREATE INDEX "MedicationStatement_patientId_idx" ON "MedicationStatement"("patientId");

-- CreateIndex
CREATE INDEX "MedicationStatement_status_idx" ON "MedicationStatement"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PatientCredential_patientId_key" ON "PatientCredential"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientCredential_username_key" ON "PatientCredential"("username");

-- AddForeignKey
ALTER TABLE "Identifier" ADD CONSTRAINT "Identifier_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Identifier" ADD CONSTRAINT "Identifier_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "Practitioner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Identifier" ADD CONSTRAINT "Identifier_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Identifier" ADD CONSTRAINT "Identifier_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HumanName" ADD CONSTRAINT "HumanName_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HumanName" ADD CONSTRAINT "HumanName_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "Practitioner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactPoint" ADD CONSTRAINT "ContactPoint_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactPoint" ADD CONSTRAINT "ContactPoint_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "Practitioner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactPoint" ADD CONSTRAINT "ContactPoint_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_serviceProviderId_fkey" FOREIGN KEY ("serviceProviderId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "Practitioner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_performerId_fkey" FOREIGN KEY ("performerId") REFERENCES "Practitioner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObservationComponent" ADD CONSTRAINT "ObservationComponent_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "Observation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllergyIntolerance" ADD CONSTRAINT "AllergyIntolerance_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllergyIntolerance" ADD CONSTRAINT "AllergyIntolerance_recorderId_fkey" FOREIGN KEY ("recorderId") REFERENCES "Practitioner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_recorderId_fkey" FOREIGN KEY ("recorderId") REFERENCES "Practitioner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_performerId_fkey" FOREIGN KEY ("performerId") REFERENCES "Practitioner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationStatement" ADD CONSTRAINT "MedicationStatement_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationStatement" ADD CONSTRAINT "MedicationStatement_recorderId_fkey" FOREIGN KEY ("recorderId") REFERENCES "Practitioner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientCredential" ADD CONSTRAINT "PatientCredential_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
