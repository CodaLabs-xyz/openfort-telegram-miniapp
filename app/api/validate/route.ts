import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramInitData, parseInitDataUser, isInitDataExpired } from '@/lib/telegram';

export const runtime = 'nodejs';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function POST(request: NextRequest) {
  try {
    if (!BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { initData } = await request.json();

    if (!initData) {
      return NextResponse.json(
        { error: 'Missing initData' },
        { status: 400 }
      );
    }

    // Check if initData has expired (prevent replay attacks)
    if (isInitDataExpired(initData)) {
      return NextResponse.json(
        { error: 'InitData has expired' },
        { status: 401 }
      );
    }

    // Validate the cryptographic signature
    if (!validateTelegramInitData(initData, BOT_TOKEN)) {
      return NextResponse.json(
        { error: 'Invalid initData signature' },
        { status: 401 }
      );
    }

    // Parse user data
    const user = parseInitDataUser(initData);

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to parse user data' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      userId: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
