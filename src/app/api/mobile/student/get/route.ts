import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

// Helper to add CORS headers
function withCORS(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*"); // ⚠️ allow all (change later)
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  return response;
}

// Handle preflight requests (OPTIONS)
export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 204 }));
}

export async function POST(req: NextRequest) {
  const { studentId } = await req.json().then((data) => {
    console.log(data);
    return { ...data } as { studentId: string };
  });
  console.log(studentId);

  try {
    const student = await db.students.findUnique({
      where: { studentId },
    });
    const response = NextResponse.json({ student }, { status: 200 });
    return response;
  } catch (error) {
    return NextResponse.json({ error: "Error logging in" }, { status: 500 });
  }
}
