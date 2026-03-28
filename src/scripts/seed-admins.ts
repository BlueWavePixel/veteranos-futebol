import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";

async function seed() {
  await db.insert(admins).values([
    {
      email: "pmmestanislau@gmail.com",
      name: "Pedro Estanislau",
      role: "super_admin",
    },
    {
      email: "cmshp@hotmail.com",
      name: "Carlos Pereira",
      role: "moderator",
    },
    {
      email: "filipe.fcar@gmail.com",
      name: "Filipe Neves",
      role: "moderator",
    },
  ]);

  console.log("Admins seeded successfully");
}

seed().catch(console.error);
