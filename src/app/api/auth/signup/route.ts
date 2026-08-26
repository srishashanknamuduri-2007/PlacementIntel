import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignupSchema } from '@/lib/validation';
import { db } from '@/lib/store';
import { generateAuthToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = SignupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { register_number, college_email, full_name, password } = parsed.data;

    // Check register number uniqueness
    const existingReg = await db.findUserByRegisterNumber(register_number);
    if (existingReg) {
      return NextResponse.json(
        {
          success: false,
          error: `Register number '${register_number.toUpperCase()}' is already registered. Please check or log in.`,
        },
        { status: 409 }
      );
    }

    // Check college email uniqueness
    const existingEmail = await db.findUserByEmail(college_email);
    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          error: `College email '${college_email.toLowerCase()}' is already registered.`,
        },
        { status: 409 }
      );
    }

    const password_hash = await bcrypt.hash(password, 10);
    const { user } = await db.createUser({
      register_number,
      college_email,
      full_name,
      password_hash,
      role: 'STUDENT',
    });

    // Auto-verify email for instant access
    await db.verifyUserByRegisterNumber(user.register_number);
    user.email_verified = true;

    // Issue Auth Cookie & Session Token immediately
    const token = generateAuthToken(user);
    const response = NextResponse.json({
      success: true,
      message: 'Account registered and verified successfully!',
      user: {
        id: user.id,
        register_number: user.register_number,
        college_email: user.college_email,
        email_verified: true,
      },
    });

    response.cookies.set('placement_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
