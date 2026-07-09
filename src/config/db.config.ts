import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log("Connected to DB");
  } catch (error: any) {
    console.log(error.message);
  }
}

export default prisma;
