import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ success: false, error: 'Verification token is required' }, { status: 400 });
  }

  const user = await db.verifyEmailToken(token);
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Invalid or expired verification token' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'College email successfully verified! You can now log in with your register number and password.',
    register_number: user.register_number,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { register_number } = body;

    if (!register_number) {
      return NextResponse.json({ success: false, error: 'Register number is required' }, { status: 400 });
    }

    const user = await db.verifyUserByRegisterNumber(register_number);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Register number not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Account for ${user.register_number} successfully verified! You can now log in immediately.`,
      register_number: user.register_number,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
