import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "TECHNICIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, quantity } = await req.json();

    if (!name || quantity === undefined) {
      return NextResponse.json({ error: "Name and quantity are required" }, { status: 400 });
    }

    const updatedItem = await prisma.inventoryItem.update({
      where: { id: params.id },
      data: { name, quantity: parseInt(quantity) },
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error: any) {
    console.error("Inventory update error:", error);
    return NextResponse.json({ error: "Failed to update inventory item" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "TECHNICIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.inventoryItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Inventory delete error:", error);
    try {
      fs.writeFileSync('delete-error.txt', error.stack || error.message || String(error));
    } catch (e) {}
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
