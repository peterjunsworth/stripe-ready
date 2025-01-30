import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import NextAuth from 'next-auth';

export async function POST(req: NextRequest) {
    const { username, password } = await req.json();

    if (!username || !password) {
        return NextResponse.json({ success: false, error: 'Username and password are required' }, { status: 400 });
    }

    try {
        const user = await NextAuth(authOptions).authorize({ username, password });
        if (user) {
            return NextResponse.json({ success: true, user });
        } else {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
        }
    } catch (error: any) {
        console.error('Error during authentication:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
