-- AlterTable
ALTER TABLE "AllergyIntolerance" ADD COLUMN     "patientEditable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "source" TEXT DEFAULT 'SYSTEM';

-- AlterTable
ALTER TABLE "Condition" ADD COLUMN     "patientEditable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "source" TEXT DEFAULT 'SYSTEM';

-- AlterTable
ALTER TABLE "MedicationStatement" ADD COLUMN     "patientEditable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "source" TEXT DEFAULT 'SYSTEM';
