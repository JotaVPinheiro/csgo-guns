import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()

import { guns } from "./guns";
import { users } from "./users";

(async function() {
  await prisma.gun.createMany({ data: guns })
  await prisma.user.createMany({ data: users })
})()