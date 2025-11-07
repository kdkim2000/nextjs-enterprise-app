/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/api/fileUtils';
import { verifyToken } from '@/lib/api/jwt';

// GET /api/help - Get help content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');
    const language = searchParams.get('language') || 'en';
    const status = searchParams.get('status');

    const helpContents = (await readJSON<any[]>('help.json')) || [];

    let filteredHelp = helpContents;

    // Filter by pageId if provided
    if (pageId) {
      filteredHelp = filteredHelp.filter((h) => h.pageId === pageId);
    }

    // Filter by language
    filteredHelp = filteredHelp.filter((h) => h.language === language);

    // Filter by status if provided
    if (status) {
      filteredHelp = filteredHelp.filter((h) => h.status === status);
    } else {
      // Default: only show published content for non-admin users
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        try {
          const token = authHeader.split(' ')[1];
          const decoded = verifyToken(token);
          if (decoded.role !== 'admin') {
            filteredHelp = filteredHelp.filter((h) => h.status === 'published');
          }
        } catch {
          filteredHelp = filteredHelp.filter((h) => h.status === 'published');
        }
      } else {
        filteredHelp = filteredHelp.filter((h) => h.status === 'published');
      }
    }

    // If pageId is provided, return single object, otherwise return array
    if (pageId && filteredHelp.length > 0) {
      return NextResponse.json({ help: filteredHelp[0] });
    }

    return NextResponse.json({ helps: filteredHelp });
  } catch (error) {
    console.error('Get help error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch help content' },
      { status: 500 }
    );
  }
}

// POST /api/help - Create new help content
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Only admin can create help content
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const helpData = await request.json();

    const helpContents = (await readJSON<any[]>('help.json')) || [];

    // Generate new ID
    const newHelp = {
      id: `help-${Date.now()}`,
      ...helpData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: decoded.username || decoded.userId,
      version: 1,
    };

    helpContents.push(newHelp);
    await writeJSON('help.json', helpContents);

    return NextResponse.json({ help: newHelp }, { status: 201 });
  } catch (error) {
    console.error('Create help error:', error);
    return NextResponse.json(
      { error: 'Failed to create help content' },
      { status: 500 }
    );
  }
}

// PUT /api/help - Update help content
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Only admin can update help content
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Help ID required' }, { status: 400 });
    }

    const helpContents = (await readJSON<any[]>('help.json')) || [];
    const helpIndex = helpContents.findIndex((h) => h.id === id);

    if (helpIndex === -1) {
      return NextResponse.json({ error: 'Help content not found' }, { status: 404 });
    }

    helpContents[helpIndex] = {
      ...helpContents[helpIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
      version: (helpContents[helpIndex].version || 1) + 1,
    };

    await writeJSON('help.json', helpContents);

    return NextResponse.json({ help: helpContents[helpIndex] });
  } catch (error) {
    console.error('Update help error:', error);
    return NextResponse.json(
      { error: 'Failed to update help content' },
      { status: 500 }
    );
  }
}

// DELETE /api/help - Delete help content
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Only admin can delete help content
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Help ID required' }, { status: 400 });
    }

    const helpContents = (await readJSON<any[]>('help.json')) || [];
    const filteredHelp = helpContents.filter((h) => h.id !== id);

    if (filteredHelp.length === helpContents.length) {
      return NextResponse.json({ error: 'Help content not found' }, { status: 404 });
    }

    await writeJSON('help.json', filteredHelp);

    return NextResponse.json({ message: 'Help content deleted successfully' });
  } catch (error) {
    console.error('Delete help error:', error);
    return NextResponse.json(
      { error: 'Failed to delete help content' },
      { status: 500 }
    );
  }
}
