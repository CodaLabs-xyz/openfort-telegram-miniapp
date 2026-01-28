import { NextRequest, NextResponse } from 'next/server';
import { getOrCreatePlayer, getOrCreateAccount, DEFAULT_CHAIN_ID } from '@/lib/openfort-server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { telegramUserId, username } = await request.json();

    if (!telegramUserId) {
      return NextResponse.json(
        { error: 'Missing telegramUserId' },
        { status: 400 }
      );
    }

    // Get or create player (prevents duplicates)
    const player = await getOrCreatePlayer(telegramUserId, username);

    // Get or create account/wallet for the player
    const account = await getOrCreateAccount(player.id, DEFAULT_CHAIN_ID);

    return NextResponse.json({
      playerId: player.id,
      accountId: account.id,
      address: account.address,
      chainId: account.chainId,
    });
  } catch (error) {
    console.error('Wallet creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create wallet' },
      { status: 500 }
    );
  }
}
