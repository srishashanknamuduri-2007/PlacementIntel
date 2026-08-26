import { NextResponse } from 'next/server';
import { ForgotPasswordSchema } from '@/lib/validation';
import { db } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ForgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Valid college email is required' }, { status: 400 });
    }

    const { college_email } = parsed.data;
    const resetToken = await db.createPasswordResetToken(college_email);

    if (!resetToken) {
      // Don't leak existence of email for security, return generic message or explicit notice
      return NextResponse.json({
        success: true,
        message: 'If the provided college email is registered, password reset instructions have been sent.',
      });
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const resetLink = `${origin}/reset-password?token=${resetToken}`;

    return NextResponse.json({
      success: true,
      message: 'Password reset link generated.',
      resetLink, // Included in payload for immediate testing
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
