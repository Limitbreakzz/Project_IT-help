import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const technicians = await prisma.user.findMany({
      where: { role: "TECHNICIAN" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(technicians);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch technicians" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "อีเมลนี้มีอยู่ในระบบแล้ว" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newTechnician = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "TECHNICIAN"
      }
    });

    const { password: _, ...techWithoutPass } = newTechnician;
    return NextResponse.json(techWithoutPass, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างข้อมูลช่าง" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, name, password } = await req.json();
    if (!id || !name) {
      return NextResponse.json({ error: "กรุณาระบุข้อมูลที่ต้องการแก้ไข" }, { status: 400 });
    }

    const dataToUpdate: any = { name };
    if (password && password.trim() !== "") {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลช่าง" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "กรุณาระบุ ID ของช่างที่ต้องการลบ" }, { status: 400 });
    }

    // 1. Disconnect this technician from any assigned tickets first to prevent DB foreign key constraint failure
    await prisma.ticket.updateMany({
      where: { technicianId: id },
      data: { technicianId: null }
    });

    // 2. Delete the technician user account
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "ลบข้อมูลช่างซ่อมเรียบร้อยแล้ว" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบข้อมูลช่าง" }, { status: 500 });
  }
}

