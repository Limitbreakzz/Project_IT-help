import { NextResponse } from "next/server";
import { authService } from "@/services/authService";
import { createApiResponse, createApiErrorResponse } from "@/types/api/response";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(createApiErrorResponse("Missing required fields"), { status: 400 });
    }

    const user = await authService.registerUser({ name, email, password });
    return NextResponse.json(createApiResponse(user, "User registered successfully"), { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(createApiErrorResponse(error.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก"), { status: 400 });
  }
}
