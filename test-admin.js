const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const admin = await prisma.admin.findUnique({ where: { email: "admin@eventos.com" }});
  console.log(admin);
}
main().finally(() => prisma.$disconnect());
