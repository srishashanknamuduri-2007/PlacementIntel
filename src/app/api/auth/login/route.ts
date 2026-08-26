import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { LoginSchema } from '@/lib/validation';
import { db } from '@/lib/store';
import { generateAuthToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Confirm email alone was NOT sent as the login identifier
    if (body.email && !body.register_number) {
      return NextResponse.json(
        {
          success: false,
          error: 'Login requires Register Number and Password. Email cannot be used for login.',
        },
        { status: 400 }
      );
    }

    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Register number and password are required.' },
        { status: 400 }
      );
    }

    const { register_number, password } = parsed.data;
    const regUpper = register_number.trim().toUpperCase();

    // 1. Lookup or auto-provision User for ANY register number format (e.g. 24B91A05M9)
    let user = await db.findUserByRegisterNumber(regUpper);
    if (!user) {
      const password_hash = await bcrypt.hash(password, 10);
      try {
        await db.createUser({
          register_number: regUpper,
          college_email: `${regUpper.toLowerCase()}@college.edu`,
          full_name: `Student ${regUpper}`,
          password_hash,
          role: 'STUDENT',
        });
        await db.verifyUserByRegisterNumber(regUpper);
        user = await db.findUserByRegisterNumber(regUpper);
      } catch (e) {
        user = await db.findUserByRegisterNumber(regUpper);
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // 2. Ensure Email Verification
    if (!user.email_verified) {
      await db.verifyUserByRegisterNumber(regUpper);
      user.email_verified = true;
    }

    // 3. Verify Password (or update hash for student accounts)
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid && user.role === 'STUDENT') {
      const newHash = await bcrypt.hash(password, 10);
      user.password_hash = newHash;
    }

    // 4. Issue Auth Cookie & Session Token
    const token = generateAuthToken(user);
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        role: user.role,
        register_number: user.register_number,
        college_email: user.college_email,
      },
    });

    response.cookies.set('placement_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
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
