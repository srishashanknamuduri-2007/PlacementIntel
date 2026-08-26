import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ResetPasswordSchema } from '@/lib/validation';
import { db } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ResetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Valid reset token and new password (min 6 chars) required' }, { status: 400 });
    }

    const { reset_token, new_password } = parsed.data;
    const newHash = await bcrypt.hash(new_password, 10);
    const success = await db.resetPasswordWithToken(reset_token, newHash);

    if (!success) {
      return NextResponse.json({ success: false, error: 'Invalid or expired password reset token' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Password successfully reset! You can now log in with your new password.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
