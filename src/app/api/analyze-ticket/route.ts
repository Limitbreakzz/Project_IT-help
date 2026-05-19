import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import Pusher from "pusher";
import { sendLineNotification } from "@/lib/line";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.PUSHER_CLUSTER || "ap1",
  useTLS: true,
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { description, image, deviceId, location } = body;

    let geminiContent: any[] = [];
    const promptText = `
      คุณคือ AI "Senior IT Support Specialist" ประจำองค์กร
      หน้าที่ของคุณคือวิเคราะห์ปัญหาการแจ้งซ่อมอุปกรณ์ IT (ฮาร์ดแวร์, ซอฟต์แวร์, เน็ตเวิร์ค) จากคำอธิบายและรูปภาพที่ผู้ใช้ส่งมา
      
      คำอธิบายปัญหาจากผู้ใช้: "${description || 'ไม่มีคำอธิบาย'}"
      
      ตอบกลับมาเป็น JSON format ตามรูปแบบนี้เท่านั้น (ห้ามมีข้อความอื่นปนเด็ดขาด):
      {
        "isValid": boolean (true ถ้าเป็นปัญหา IT เช่น คอมพัง เน็ตหลุด ปริ้นเตอร์เสีย, false ถ้าเป็นรูปคน สัตว์ อาหาร หรือข้อความก่อกวน),
        "invalidReason": "เหตุผลที่ไม่อนุมัติ (ถ้า isValid เป็น false) เช่น 'ไม่พบปัญหาเกี่ยวกับอุปกรณ์ IT'",
        "category": "หมวดหมู่ของปัญหา (Hardware, Software, Network, Printer, Server, ทั่วไป) (เว้นว่างถ้า isValid = false)",
        "cause": "สาเหตุเชิงลึกที่เป็นไปได้ เช่น RAM หลวม, Driver Error, HDD เสีย, สาย LAN ขาด (เว้นว่างถ้า isValid = false)",
        "priority": "ระดับความรุนแรง (CRITICAL, HIGH, MEDIUM, LOW) 
                    กฎ: ปัญหาที่กระทบคนหมู่มาก (เช่น เน็ตดาวน์, Server ล่ม, ไฟไหม้ห้องเซิร์ฟเวอร์) = CRITICAL
                    กฎ: งานด่วนของผู้บริหาร หรือ อุปกรณ์หลักพัง = HIGH
                    กฎ: คอมพิวเตอร์พนักงาน 1 เครื่องใช้งานไม่ได้ = MEDIUM
                    กฎ: ติดตั้งโปรแกรมทั่วไป, เมาส์พัง = LOW",
        "timeEstimate": "คาดการณ์เวลาซ่อม เช่น '30 นาที', '1-2 ชั่วโมง', 'รอเบิกอะไหล่ 1 วัน' (เว้นว่างถ้า isValid = false)",
        "costEstimateMin": ตัวเลขประเมินราคาซ่อมขั้นต่ำ (เช่น 0 ถ้าใช้ของในสต๊อก หรือประกัน, 500 ถ้าต้องซื้อใหม่) (ใส่ 0 ถ้า isValid = false),
        "costEstimateMax": ตัวเลขราคาขั้นสูง (ใส่ 0 ถ้า isValid = false)
      }
    `;

    geminiContent.push({ text: promptText });

    if (image) {
      // image is a data URL: data:image/jpeg;base64,...
      const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        geminiContent.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        });
      }
    }

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: geminiContent,
      config: {
        responseMimeType: "application/json",
      }
    });

    const aiText = response.text || "{}";
    let aiResult;
    try {
      // In case Gemini wraps it in ```json ... ``` we try to clean it
      const cleanJson = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
      aiResult = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse Gemini output:", aiText);
      aiResult = {
        isValid: false,
        invalidReason: "ไม่สามารถประมวลผลข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
      };
    }

    if (aiResult.isValid === false) {
      return NextResponse.json({ 
        success: false, 
        error: "ข้อมูลไม่ถูกต้อง",
        reason: aiResult.invalidReason || "ภาพหรือข้อความไม่เกี่ยวข้องกับการแจ้งซ่อม"
      }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Map AI priority to enum
    const validPriorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    let priority = validPriorities.includes(aiResult.priority?.toUpperCase()) 
      ? aiResult.priority.toUpperCase() 
      : "MEDIUM";

    let finalImageUrl = null;
    if (image) {
      // Store the image directly in the database as base64 string to support cloud serverless deployments (Vercel/etc.)
      finalImageUrl = image;
    }

    const finalDescription = deviceId 
      ? `[รหัสอุปกรณ์: ${deviceId}] [ห้อง: ${location || "ไม่ระบุ"}]\n${description || "ไม่มีคำอธิบายเพิ่มเติม"}`
      : (description || "ไม่มีคำอธิบายเพิ่มเติม");

    // Save ticket to DB
    const ticket = await prisma.ticket.create({
      data: {
        title: `แจ้งซ่อม: ${aiResult.category}`,
        description: finalDescription,
        imageUrl: finalImageUrl,
        priority: priority,
        category: aiResult.category,
        aiAnalysis: aiResult,
        costEstimateMin: aiResult.costEstimateMin,
        costEstimateMax: aiResult.costEstimateMax,
        timeEstimate: aiResult.timeEstimate,
        userId: userId,
      },
      include: {
        user: true
      }
    });

    // Send LINE Notify
    try {
      const lineMsg = `\n🔔 มีงานแจ้งซ่อมใหม่!\nหัวข้อ: ${ticket.title}\nความรุนแรง: ${ticket.priority}\nประเมินเวลา: ${ticket.timeEstimate || 'ไม่ระบุ'}\nงบประมาณ: ฿${ticket.costEstimateMin || 0} - ฿${ticket.costEstimateMax || 0}\nรายละเอียด: ${description || 'ไม่มีคำอธิบาย'}`;
      await sendLineNotification(lineMsg);
    } catch (lineErr) {
      console.error("LINE Notify send error:", lineErr);
    }

    // Notify Dashboard Realtime
    if (process.env.PUSHER_APP_ID) {
      try {
        const pusherTicket = { ...ticket };
        if (pusherTicket.imageUrl && pusherTicket.imageUrl.startsWith("data:") && pusherTicket.imageUrl.length > 500) {
          pusherTicket.imageUrl = "base64_image_too_large_for_pusher";
        }
        await pusher.trigger("admin-channel", "new-ticket", pusherTicket);
      } catch (pusherErr) {
        console.error("Pusher trigger error:", pusherErr);
      }
    }

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    console.error("Error analyzing ticket:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
