import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { hashPassword } from "@/utils/hash";
import bcrypt from "bcryptjs";

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
  const { studentId, password, ...rest } = await req.json().then((data) => {
    return { ...data } as {
      studentId: string;
      courseCode?: string;
      email?: string;
      firstName?: string;
      middleName?: string;
      lastName?: string;
      year?: number;
      section?: string;
      contactNo?: string;
      gender?: "MALE" | "FEMALE";
      password?: string;
    };
  });

  let passwordData = {};

  if (password) {
    const hashedPassword = await hashPassword(password);
    const user = await db.students.findUnique({
      where: { id: studentId },
    });
    if (!user)
      return NextResponse.json({ message: "user_not_found" }, { status: 401 });

    const passwordMatch = await bcrypt.compare(
      password as string,
      user.password,
    );

    if (!passwordMatch)
      return NextResponse.json({ message: "wrong_password" }, { status: 401 });
    
    passwordData = { password: hashedPassword };
  }

  try {
    const student = await db.students.update({
      where: { id: studentId },
      data: {
        ...rest,
        ...passwordData,
      },
    });
    const response = NextResponse.json({ student }, { status: 200 });
    return response;
  } catch (error) {
    return NextResponse.json({ error: "Error logging in" }, { status: 500 });
  }
}
