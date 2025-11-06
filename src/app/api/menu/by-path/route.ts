import { NextRequest, NextResponse } from 'next/server';
import { readJSON } from '@/lib/api/fileUtils';
import { verifyToken } from '@/lib/api/jwt';

/**
 * GET /api/menu/by-path?path=/dashboard
 * Get menu information by path
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

    // Get path from query parameters
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json({ error: 'Path parameter required' }, { status: 400 });
    }

    // Read all menus
    const allMenus = (await readJSON<any[]>('menus.json')) || [];

    // Find menu by path
    const menu = allMenus.find((m) => m.path === path);

    if (!menu) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
    }

    // Check if user has access to this menu
    if (menu.roles && Array.isArray(menu.roles)) {
      if (!menu.roles.includes(decoded.role) && decoded.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({
      menu,
    });
  } catch (error) {
    console.error('Get menu by path error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}
