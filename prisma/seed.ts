import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create technician
  const technician = await prisma.user.upsert({
    where: { email: "technician@example.com" },
    update: {},
    create: {
      email: "technician@example.com",
      name: "Mr. Technician",
      password: hashedPassword,
      role: "TECHNICIAN",
    },
  });

  // Create Admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Super Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      name: "Demo User",
      password: hashedPassword,
      role: "USER",
    },
  });

  console.log("Database seeded successfully!");
  console.log({ admin, technician, user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
