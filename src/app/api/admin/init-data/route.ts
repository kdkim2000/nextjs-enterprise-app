import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/api/jwt';
import { resetAllData } from '@/lib/api/fileUtils';

/**
 * POST /api/admin/init-data
 * Initialize/Reset all data to defaults
 * Admin only - use with caution!
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Only admin can initialize data
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Reset all data
    const success = await resetAllData();

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to initialize data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Data initialized successfully',
      initialized: [
        'users.json',
        'menus.json',
        'userPreferences.json',
        'mfaCodes.json',
        'logs.json',
      ],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Init data error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize data' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/init-data
 * Get initialization status
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Only admin can check status
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    return NextResponse.json({
      message: 'Data initialization endpoint',
      usage: {
        method: 'POST',
        endpoint: '/api/admin/init-data',
        description: 'Reset all data to default values',
        warning: 'This will DELETE all existing data!',
        requires: 'Admin authentication',
      },
      defaultData: {
        users: 3,
        menus: 8,
        userPreferences: 2,
        mfaCodes: 0,
        logs: 0,
      },
    });
  } catch (error) {
    console.error('Get init data error:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}
