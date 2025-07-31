import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function POST(req: NextRequest) {
    const { studentId, password } = await req.json().then((data) => {
        return { ...data } as { studentId: string, password: string }
    })
    if (!studentId || !password) {
        return NextResponse.json({ error: 'Missing Required Fields' }, { status: 400 });
    }
    console.log("sean", studentId, password)

    try {
        const user = await db.students.findUnique({
            where: { studentId },
        });

        if (!user) {
            return NextResponse.json({ message: "user_not_found", error: 'Invalid credentials', status: 401 }, { status: 200 });
        }
        const passwordMatch = password === user.password

        if (!passwordMatch) {
            return NextResponse.json({ message: "wrong_password", error: 'Invalid credentials', status: 401 }, { status: 200 });
        }
        const response = NextResponse.json({ status: 200, user : { 
            role: "customer", 
            ...user
        } }, { status: 200 });
        return response

    } catch (error) {
        return NextResponse.json({ error: 'Error logging in' }, { status: 500 });
    }

}