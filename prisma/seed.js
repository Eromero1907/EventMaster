const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de base de datos...");

  // Crear Administrador Inicial
  const adminPasswordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.admin.upsert({
    where: { email: "admin@eventos.com" },
    update: {},
    create: {
      email: "admin@eventos.com",
      passwordHash: adminPasswordHash,
      name: "Administrador Principal",
      role: "SUPERADMIN",
    },
  });

  console.log("✅ Administrador creado:", admin.email);
  console.log("   Contraseña: admin123");
  console.log("");
  console.log("🎉 Base de datos lista. No se crearon eventos ni registros de ejemplo.");
  console.log("   Ingresa al panel en /admin/login para crear tu primer evento.");
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
