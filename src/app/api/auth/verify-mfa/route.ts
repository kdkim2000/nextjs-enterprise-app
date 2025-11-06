import { NextRequest, NextResponse } from 'next/server';
import { generateToken, generateRefreshToken } from '@/lib/api/jwt';
import { readJSON, writeJSON } from '@/lib/api/fileUtils';

export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json();

    if (!userId || !code) {
      return NextResponse.json(
        { error: 'UserId and code required' },
        { status: 400 }
      );
    }

    const mfaCodes = (await readJSON<any[]>('mfaCodes.json')) || [];
    const mfaEntry = mfaCodes.find((c) => c.userId === userId);

    if (!mfaEntry) {
      return NextResponse.json(
        { error: 'MFA code not found' },
        { status: 404 }
      );
    }

    if (new Date(mfaEntry.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'MFA code expired' }, { status: 400 });
    }

    if (mfaEntry.code !== code) {
      return NextResponse.json({ error: 'Invalid MFA code' }, { status: 401 });
    }

    // Get user
    const users = await readJSON<any[]>('users.json');

    if (!users) {
      return NextResponse.json(
        { error: 'Unable to load users' },
        { status: 500 }
      );
    }

    const user = users.find((u) => u.id === userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
    });

    // Update last login
    user.lastLogin = new Date().toISOString();
    await writeJSON('users.json', users);

    // Remove used MFA code
    const filteredCodes = mfaCodes.filter((c) => c.userId !== userId);
    await writeJSON('mfaCodes.json', filteredCodes);

    return NextResponse.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    console.error('MFA verification error:', error);
    return NextResponse.json(
      { error: 'MFA verification failed' },
      { status: 500 }
    );
  }
}
