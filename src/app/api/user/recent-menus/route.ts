import { NextRequest, NextResponse } from 'next/server';
import { readJSON } from '@/lib/api/fileUtils';
import { verifyToken } from '@/lib/api/jwt';

/**
 * GET /api/user/recent-menus
 * Get user's recent accessed menus
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

    // Read user preferences to get recent menus
    const userPreferences = (await readJSON<any[]>('userPreferences.json')) || [];
    const userPref = userPreferences.find((pref) => pref.userId === decoded.userId);

    // Get all menus
    const allMenus = (await readJSON<any[]>('menus.json')) || [];

    // Get recent menu IDs (last 10)
    const recentMenuIds = userPref?.recentMenus || [];

    // Find full menu objects for recent menus
    const recentMenus = recentMenuIds
      .map((menuId: string) => allMenus.find((menu) => menu.id === menuId))
      .filter((menu: any) => menu !== undefined) // Remove undefined entries
      .slice(0, 10); // Limit to 10 most recent

    return NextResponse.json({
      menus: recentMenus,
      total: recentMenus.length,
    });
  } catch (error) {
    console.error('Get recent menus error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent menus' },
      { status: 500 }
    );
  }
}
