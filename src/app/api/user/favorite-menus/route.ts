import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/api/fileUtils';
import { verifyToken } from '@/lib/api/jwt';

/**
 * GET /api/user/favorite-menus
 * Get user's favorite menus
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

    // Read user preferences to get favorite menus
    const userPreferences = (await readJSON<any[]>('userPreferences.json')) || [];
    const userPref = userPreferences.find((pref) => pref.userId === decoded.userId);

    // Get all menus
    const allMenus = (await readJSON<any[]>('menus.json')) || [];

    // Get favorite menu IDs
    const favoriteMenuIds = userPref?.favoriteMenus || [];

    // Find full menu objects for favorite menus
    const favoriteMenus = favoriteMenuIds
      .map((menuId: string) => allMenus.find((menu) => menu.id === menuId))
      .filter((menu: any) => menu !== undefined); // Remove undefined entries

    return NextResponse.json({
      menus: favoriteMenus,
      total: favoriteMenus.length,
    });
  } catch (error) {
    console.error('Get favorite menus error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorite menus' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/favorite-menus
 * Add a menu to user's favorites
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

    const { menuId } = await request.json();

    if (!menuId) {
      return NextResponse.json({ error: 'Menu ID required' }, { status: 400 });
    }

    // Read user preferences
    const userPreferences = (await readJSON<any[]>('userPreferences.json')) || [];
    const userPrefIndex = userPreferences.findIndex(
      (pref) => pref.userId === decoded.userId
    );

    if (userPrefIndex === -1) {
      // Create new user preferences
      userPreferences.push({
        userId: decoded.userId,
        favoriteMenus: [menuId],
        recentMenus: [],
        language: 'en',
        theme: 'light',
      });
    } else {
      // Add to existing favorites (if not already present)
      const favoriteMenus = userPreferences[userPrefIndex].favoriteMenus || [];
      if (!favoriteMenus.includes(menuId)) {
        userPreferences[userPrefIndex].favoriteMenus = [...favoriteMenus, menuId];
      }
    }

    await writeJSON('userPreferences.json', userPreferences);

    return NextResponse.json({
      message: 'Menu added to favorites',
      menuId,
    });
  } catch (error) {
    console.error('Add favorite menu error:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite menu' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/favorite-menus/[menuId]
 * Remove a menu from user's favorites
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Extract menuId from URL
    const { searchParams } = new URL(request.url);
    const menuId = searchParams.get('menuId');

    if (!menuId) {
      return NextResponse.json({ error: 'Menu ID required' }, { status: 400 });
    }

    // Read user preferences
    const userPreferences = (await readJSON<any[]>('userPreferences.json')) || [];
    const userPrefIndex = userPreferences.findIndex(
      (pref) => pref.userId === decoded.userId
    );

    if (userPrefIndex === -1) {
      return NextResponse.json(
        { error: 'User preferences not found' },
        { status: 404 }
      );
    }

    // Remove from favorites
    const favoriteMenus = userPreferences[userPrefIndex].favoriteMenus || [];
    userPreferences[userPrefIndex].favoriteMenus = favoriteMenus.filter(
      (id: string) => id !== menuId
    );

    await writeJSON('userPreferences.json', userPreferences);

    return NextResponse.json({
      message: 'Menu removed from favorites',
      menuId,
    });
  } catch (error) {
    console.error('Remove favorite menu error:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite menu' },
      { status: 500 }
    );
  }
}
