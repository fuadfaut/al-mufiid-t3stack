import { PrismaClient, UserRole, ApprovalStatus } from "@prisma/client";
// Using a simple hash for seeding purposes
const simpleHash = (str: string) => {
  return Buffer.from(`${str}_hashed`).toString('base64');
};

const prisma = new PrismaClient();

async function main() {
  // Check if admin already exists
  const adminExists = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN },
  });

  if (!adminExists) {
    // Create admin user
    await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@almufid.com",
        password: simpleHash("admin123"),
        role: UserRole.ADMIN,
        approvalStatus: ApprovalStatus.APPROVED,
      },
    });
    console.log("Admin user created successfully");
  } else {
    console.log("Admin user already exists");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
