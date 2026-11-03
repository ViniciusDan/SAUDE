import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const identifier = "CLINICA001";
  const password = "12345";

  const clinic = await prisma.clinic.findFirst({
    where: { identifier }
  });

  if (!clinic) {
    throw new Error(`Clínica com identifier ${identifier} não encontrada.`);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.clinicCredential.deleteMany({
    where: { clinicId: clinic.id }
  });

  await prisma.clinicCredential.create({
    data: {
      clinicId: clinic.id,
      username: identifier,
      passwordHash
    }
  });

  console.log("Credencial da clínica recriada com sucesso.");
  console.log("identifier:", identifier);
  console.log("password:", password);
  console.log("clinicId:", clinic.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });