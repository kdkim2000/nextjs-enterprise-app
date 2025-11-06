import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/api/fileUtils';
import { verifyToken } from '@/lib/api/jwt';

// GET /api/menu - Get all menus for user
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const menus = (await readJSON<any[]>('menus.json')) || [];

    // Filter menus based on user role if needed
    // For now, return all menus
    return NextResponse.json(menus);
  } catch (error) {
    console.error('Get menus error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menus' },
      { status: 500 }
    );
  }
}

// POST /api/menu - Create new menu
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Only admin can create menus
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const menuData = await request.json();

    const menus = (await readJSON<any[]>('menus.json')) || [];

    // Generate new ID
    const newMenu = {
      id: `menu-${Date.now()}`,
      ...menuData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    menus.push(newMenu);
    await writeJSON('menus.json', menus);

    return NextResponse.json(newMenu, { status: 201 });
  } catch (error) {
    console.error('Create menu error:', error);
    return NextResponse.json(
      { error: 'Failed to create menu' },
      { status: 500 }
    );
  }
}

// PUT /api/menu - Update menu
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Only admin can update menus
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Menu ID required' }, { status: 400 });
    }

    const menus = (await readJSON<any[]>('menus.json')) || [];
    const menuIndex = menus.findIndex((m) => m.id === id);

    if (menuIndex === -1) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
    }

    menus[menuIndex] = {
      ...menus[menuIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await writeJSON('menus.json', menus);

    return NextResponse.json(menus[menuIndex]);
  } catch (error) {
    console.error('Update menu error:', error);
    return NextResponse.json(
      { error: 'Failed to update menu' },
      { status: 500 }
    );
  }
}

// DELETE /api/menu - Delete menu
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Only admin can delete menus
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Menu ID required' }, { status: 400 });
    }

    const menus = (await readJSON<any[]>('menus.json')) || [];
    const filteredMenus = menus.filter((m) => m.id !== id);

    if (filteredMenus.length === menus.length) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
    }

    await writeJSON('menus.json', filteredMenus);

    return NextResponse.json({ message: 'Menu deleted successfully' });
  } catch (error) {
    console.error('Delete menu error:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu' },
      { status: 500 }
    );
  }
}
