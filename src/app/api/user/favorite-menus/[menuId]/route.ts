import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/api/fileUtils';
import { verifyToken } from '@/lib/api/jwt';

/**
 * DELETE /api/user/favorite-menus/[menuId]
 * Remove a menu from user's favorites
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const { menuId } = await params;

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
