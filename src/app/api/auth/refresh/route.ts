import { NextRequest, NextResponse } from 'next/server';
import { generateToken, verifyRefreshToken } from '@/lib/api/jwt';
import { readJSON } from '@/lib/api/fileUtils';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token required' },
        { status: 400 }
      );
    }

    const decoded = verifyRefreshToken(refreshToken);

    const users = await readJSON<any[]>('users.json');

    if (!users) {
      return NextResponse.json(
        { error: 'Unable to load users' },
        { status: 500 }
      );
    }

    const user = users.find((u) => u.id === decoded.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate new access token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Invalid refresh token' },
      { status: 403 }
    );
  }
}
