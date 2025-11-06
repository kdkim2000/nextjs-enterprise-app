import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/api/fileUtils';
import { verifyToken } from '@/lib/api/jwt';
import { hashPassword } from '@/lib/api/password';

// GET /api/user - Get users (with pagination and filtering)
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const users = (await readJSON<any[]>('users.json')) || [];

    // Remove sensitive data
    const sanitizedUsers = users.map(({ password, ...user }) => user);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    // Apply filters if provided
    let filteredUsers = sanitizedUsers;

    const username = searchParams.get('username');
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const role = searchParams.get('role');
    const department = searchParams.get('department');
    const status = searchParams.get('status');

    if (username) {
      filteredUsers = filteredUsers.filter((u) =>
        u.username?.toLowerCase().includes(username.toLowerCase())
      );
    }
    if (name) {
      filteredUsers = filteredUsers.filter((u) =>
        u.name?.toLowerCase().includes(name.toLowerCase())
      );
    }
    if (email) {
      filteredUsers = filteredUsers.filter((u) =>
        u.email?.toLowerCase().includes(email.toLowerCase())
      );
    }
    if (role) {
      filteredUsers = filteredUsers.filter((u) => u.role === role);
    }
    if (department) {
      filteredUsers = filteredUsers.filter((u) => u.department === department);
    }
    if (status) {
      filteredUsers = filteredUsers.filter((u) => u.status === status);
    }

    // Pagination
    const start = page * pageSize;
    const end = start + pageSize;
    const paginatedUsers = filteredUsers.slice(start, end);

    return NextResponse.json({
      users: paginatedUsers,
      total: filteredUsers.length,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/user - Create new user
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Only admin can create users
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userData = await request.json();

    if (!userData.username || !userData.password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    const users = (await readJSON<any[]>('users.json')) || [];

    // Check if username already exists
    if (users.find((u) => u.username === userData.username)) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Generate new user
    const newUser = {
      id: `user-${Date.now()}`,
      username: userData.username,
      password: hashedPassword,
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'user',
      department: userData.department || '',
      mfaEnabled: userData.mfaEnabled || false,
      ssoEnabled: userData.ssoEnabled || false,
      status: userData.status || 'active',
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };

    users.push(newUser);
    await writeJSON('users.json', users);

    // Remove password from response
    const { password, ...safeUser } = newUser;

    return NextResponse.json(safeUser, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PUT /api/user - Update user
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Only admin can update users
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, password, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const users = (await readJSON<any[]>('users.json')) || [];
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Hash new password if provided
    if (password) {
      updates.password = await hashPassword(password);
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
    };

    await writeJSON('users.json', users);

    // Remove password from response
    const { password: _, ...safeUser } = users[userIndex];

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/user - Delete user
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Only admin can delete users
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const users = (await readJSON<any[]>('users.json')) || [];
    const filteredUsers = users.filter((u) => u.id !== id);

    if (filteredUsers.length === users.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await writeJSON('users.json', filteredUsers);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
