import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Ticket } from "@/types/ticket";

export const authService = {
  async registerUser(data: { name: string; email: string; password: string }) {
    const { name, email, password } = data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("อีเมลนี้ถูกใช้งานแล้ว");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },
};
