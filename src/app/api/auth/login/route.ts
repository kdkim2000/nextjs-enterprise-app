import { NextRequest, NextResponse } from 'next/server';
import { generateToken, generateRefreshToken } from '@/lib/api/jwt';
import { comparePassword } from '@/lib/api/password';
import { readJSON, writeJSON } from '@/lib/api/fileUtils';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    // Read users from file
    const users = await readJSON<any[]>('users.json');

    if (!users) {
      return NextResponse.json(
        { error: 'Unable to load users' },
        { status: 500 }
      );
    }

    const user = users.find((u) => u.username === username);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (user.status !== 'active') {
      return NextResponse.json(
        { error: 'Account is not active' },
        { status: 403 }
      );
    }

    // Check if MFA is enabled
    if (user.mfaEnabled) {
      // Generate MFA code
      const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();

      const mfaCodes = (await readJSON<any[]>('mfaCodes.json')) || [];

      // Remove old codes for this user
      const filteredCodes = mfaCodes.filter((c) => c.userId !== user.id);

      // Add new code
      filteredCodes.push({
        userId: user.id,
        code: mfaCode,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      });

      await writeJSON('mfaCodes.json', filteredCodes);

      // In development, return the code
      const devCode = process.env.NODE_ENV === 'development' ? mfaCode : undefined;

      return NextResponse.json({
        mfaRequired: true,
        userId: user.id,
        email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email
        devCode, // Only in development
      });
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
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
