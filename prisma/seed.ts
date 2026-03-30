import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({ url: "file:/Users/ezequielagradnik/Documents/GitHub/crm-ventas-operaciones-NODO/dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding NODO CRM...");

  const ezePassword = await bcrypt.hash("nodo2024!", 12);
  const tomiPassword = await bcrypt.hash("nodo2024!", 12);

  const eze = await prisma.user.upsert({
    where: { email: "eagradnik@gmail.com" },
    update: {},
    create: {
      email: "eagradnik@gmail.com",
      name: "Eze Agradnik",
      password: ezePassword,
      role: "admin",
    },
  });

  const tomi = await prisma.user.upsert({
    where: { email: "tomhan.mp@gmail.com" },
    update: {},
    create: {
      email: "tomhan.mp@gmail.com",
      name: "Tomi Han",
      password: tomiPassword,
      role: "admin",
    },
  });

  console.log("✅ Users created");

  const lead1 = await prisma.lead.create({
    data: {
      name: "Martina García",
      company: "TiendaNube MX",
      email: "martina@tiendanube.com",
      phone: "+5491155552341",
      origin: "LinkedIn",
      vertical: "E-commerce",
      status: "Calificado",
      notes: "Tiene 3 tiendas online. Busca automatizar atención al cliente.",
      ownerId: tomi.id,
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      name: "Carlos Rueda",
      company: "Academia Lean",
      email: "carlos@academialean.com",
      origin: "Referido",
      vertical: "Educación",
      status: "En conversación",
      notes: "Referido por Martina. Quiere agente de ventas para cursos.",
      ownerId: tomi.id,
    },
  });

  const lead3 = await prisma.lead.create({
    data: {
      name: "Sofía Molina",
      company: "Inmobiliaria Sur",
      email: "sofia@inmobi.com.ar",
      origin: "Inbound",
      vertical: "Servicios",
      status: "Nuevo",
      ownerId: eze.id,
    },
  });

  await prisma.lead.create({
    data: {
      name: "Pablo Suárez",
      company: "EduTech Solutions",
      email: "pablo@edutech.io",
      origin: "LinkedIn",
      vertical: "Educación",
      status: "Contactado",
      notes: "Interesado en automatización de onboarding de estudiantes.",
      ownerId: tomi.id,
    },
  });

  console.log("✅ Leads created");

  const deal1 = await prisma.deal.create({
    data: {
      company: "TiendaNube MX",
      value: 2500,
      service: "Agente de atención",
      stage: "Propuesta enviada",
      ownerId: tomi.id,
      leadId: lead1.id,
      notes: "Propuesta de agente de atención al cliente. 3 meses de implementación.",
      stageMovedAt: new Date(Date.now() - 5 * 86400000),
    },
  });

  const deal2 = await prisma.deal.create({
    data: {
      company: "Academia Lean",
      value: 1800,
      service: "Agente de ventas",
      stage: "Discovery call agendada",
      ownerId: tomi.id,
      leadId: lead2.id,
      stageMovedAt: new Date(Date.now() - 2 * 86400000),
    },
  });

  console.log("✅ Deals created");

  await prisma.client.create({
    data: {
      company: "Driv Studios",
      contact: "Andrés Driv",
      email: "andres@drivstudios.com",
      plan: "Starter",
      mrr: 500,
      status: "Activo",
      services: "Agente de atención",
      nextReview: new Date(Date.now() + 30 * 86400000),
      notes: "Primer cliente. Agente de atención para e-commerce de ropa.",
    },
  });

  console.log("✅ Client created");

  await prisma.task.createMany({
    data: [
      {
        title: "Preparar demo para TiendaNube MX",
        description: "Demo del agente de atención, mostrar casos de uso reales",
        priority: "Alta",
        status: "Pendiente",
        dueDate: new Date(Date.now() + 2 * 86400000),
        ownerId: eze.id,
        dealId: deal1.id,
      },
      {
        title: "Enviar follow-up a Carlos Rueda",
        description: "Recordar la call de discovery del jueves",
        priority: "Alta",
        status: "Pendiente",
        dueDate: new Date(Date.now() + 86400000),
        ownerId: tomi.id,
        dealId: deal2.id,
      },
      {
        title: "Review mensual con Driv Studios",
        description: "Revisar métricas del agente, NPS, y próximos pasos",
        priority: "Media",
        status: "Pendiente",
        dueDate: new Date(Date.now() + 7 * 86400000),
        ownerId: eze.id,
      },
      {
        title: "Documentar proceso de onboarding",
        priority: "Baja",
        status: "En progreso",
        ownerId: eze.id,
      },
    ],
  });

  console.log("✅ Tasks created");

  await prisma.activity.createMany({
    data: [
      { type: "lead_created", message: "Lead creado: Martina García (TiendaNube MX)", leadId: lead1.id, userId: tomi.id },
      { type: "deal_created", message: "Deal creado: TiendaNube MX", dealId: deal1.id, userId: tomi.id },
      { type: "deal_moved", message: 'Deal movido a "Propuesta enviada"', dealId: deal1.id, userId: tomi.id },
      { type: "lead_created", message: "Lead creado: Carlos Rueda (Academia Lean)", leadId: lead2.id, userId: tomi.id },
      { type: "deal_created", message: "Deal creado: Academia Lean", dealId: deal2.id, userId: tomi.id },
      { type: "lead_created", message: "Lead creado: Sofía Molina (Inmobiliaria Sur)", leadId: lead3.id, userId: eze.id },
    ],
  });

  console.log("✅ Activities created");
  console.log("\n🎉 Seed completado!");
  console.log("📧 Eze: eagradnik@gmail.com / nodo2024!");
  console.log("📧 Tomi: tomhan.mp@gmail.com / nodo2024!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
