import { NextRequest, NextResponse } from 'next/server';
import { readJSON } from '@/lib/api/fileUtils';
import { verifyToken } from '@/lib/api/jwt';

/**
 * GET /api/menu/user-menus
 * Get menus accessible to the current user based on their role
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

    // Read all menus
    const allMenus = (await readJSON<any[]>('menus.json')) || [];

    // Filter menus based on user role
    // Admin can see all menus, regular users see non-admin menus
    const userMenus = allMenus.filter((menu) => {
      // If user is admin, show all menus
      if (decoded.role === 'admin') {
        return true;
      }

      // For non-admin users, filter out admin-only menus
      // Check if menu requires admin role
      if (menu.roles && Array.isArray(menu.roles)) {
        return menu.roles.includes('user') || menu.roles.includes(decoded.role);
      }

      // If no role restriction, show to all users
      return true;
    });

    return NextResponse.json({
      menus: userMenus,
      total: userMenus.length,
    });
  } catch (error) {
    console.error('Get user menus error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user menus' },
      { status: 500 }
    );
  }
}
