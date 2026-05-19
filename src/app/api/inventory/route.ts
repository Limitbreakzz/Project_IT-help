import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { inventoryService } from "@/services/inventoryService";
import { createApiResponse, createApiErrorResponse } from "@/types/api/response";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(createApiErrorResponse("Unauthorized"), { status: 401 });
    }

    const items = await inventoryService.getInventory();
    return NextResponse.json(createApiResponse(items, "Inventory fetched successfully"));
  } catch (error: any) {
    console.error("Inventory fetch error:", error);
    return NextResponse.json(createApiErrorResponse("Failed to load inventory", error), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    
    if (!session || (userRole !== "ADMIN" && userRole !== "TECHNICIAN")) {
      return NextResponse.json(createApiErrorResponse("Unauthorized access"), { status: 401 });
    }

    const { name, quantity } = await req.json();
    if (!name || quantity === undefined) {
      return NextResponse.json(createApiErrorResponse("Name and quantity are required"), { status: 400 });
    }

    const item = await inventoryService.updateInventory(name, parseInt(quantity));
    return NextResponse.json(createApiResponse(item, "Inventory updated successfully"));
  } catch (error: any) {
    console.error("Inventory update error:", error);
    return NextResponse.json(createApiErrorResponse("Failed to update inventory", error), { status: 500 });
  }
}
