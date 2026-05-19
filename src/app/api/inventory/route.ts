import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Seed function to insert default IT parts if empty
async function seedDefaultInventory() {
  const count = await prisma.inventoryItem.count();
  if (count === 0) {
    const defaults = [
      { name: "RAM DDR4 8GB (Kingston)", quantity: 15 },
      { name: "SSD SATA 480GB (Crucial)", quantity: 10 },
      { name: "SSD NVMe M.2 500GB", quantity: 8 },
      { name: "Mouse USB (Standard)", quantity: 25 },
      { name: "Keyboard USB (Standard)", quantity: 20 },
      { name: "สาย LAN CAT6 (3 เมตร)", quantity: 30 },
      { name: "Power Supply 600W (Dtech)", quantity: 5 },
    ];
    
    for (const item of defaults) {
      await prisma.inventoryItem.create({ data: item });
    }
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Seed defaults first if needed
    await seedDefaultInventory();

    const items = await prisma.inventoryItem.findMany({
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error("Inventory fetch error:", error);
    return NextResponse.json({ error: "Failed to load inventory" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "TECHNICIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, quantity } = await req.json();
    if (!name || quantity === undefined) {
      return NextResponse.json({ error: "Name and quantity are required" }, { status: 400 });
    }

    // Upsert inventory item
    const item = await prisma.inventoryItem.upsert({
      where: { name },
      update: { quantity: parseInt(quantity) },
      create: { name, quantity: parseInt(quantity) },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error("Inventory update error:", error);
    return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
  }
}
