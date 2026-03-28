import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";

async function seed() {
  await db.insert(admins).values([
    {
      email: "SUPER_ADMIN_EMAIL_HERE", // Replace with actual Google email
      name: "Pedro Estanislau",
      role: "super_admin",
    },
    {
      email: "CARLOS_EMAIL_HERE", // Replace with actual Google email
      name: "Carlos Pereira",
      role: "moderator",
    },
    {
      email: "FILIPE_EMAIL_HERE", // Replace with actual Google email
      name: "Filipe Neves",
      role: "moderator",
    },
  ]);

  console.log("Admins seeded successfully");
}

seed().catch(console.error);
