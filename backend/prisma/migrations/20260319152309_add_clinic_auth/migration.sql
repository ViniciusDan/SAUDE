-- CreateTable
CREATE TABLE "Clinic" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tradeName" TEXT,
    "cnpj" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicCredential" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_identifier_key" ON "Clinic"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_cnpj_key" ON "Clinic"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicCredential_clinicId_key" ON "ClinicCredential"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicCredential_username_key" ON "ClinicCredential"("username");

-- AddForeignKey
ALTER TABLE "ClinicCredential" ADD CONSTRAINT "ClinicCredential_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
