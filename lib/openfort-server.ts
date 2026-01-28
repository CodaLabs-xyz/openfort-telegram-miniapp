import Openfort from '@openfort/openfort-node';

/**
 * Server-side Openfort client
 * Only use in API routes - never expose to client
 */

const secretKey = process.env.OPENFORT_SECRET_KEY;

if (!secretKey) {
  console.warn('Warning: OPENFORT_SECRET_KEY is not set');
}

export const openfort = new Openfort(secretKey || '');

/**
 * Default chain ID for wallet creation
 * 137 = Polygon Mainnet
 * 80002 = Polygon Amoy (testnet)
 */
export const DEFAULT_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '80002', 10);

/**
 * Creates or retrieves a player for a Telegram user
 */
export async function getOrCreatePlayer(telegramUserId: number, username?: string) {
  try {
    // Try to find existing player by listing with metadata filter
    const players = await openfort.players.list({
      limit: 100,
    });

    // Check if player with this Telegram ID exists
    const existingPlayer = players.data.find(
      (p) => p.metadata?.telegramId === telegramUserId.toString()
    );

    if (existingPlayer) {
      return existingPlayer;
    }

    // Create new player if not found
    const player = await openfort.players.create({
      name: username || `tg_${telegramUserId}`,
      metadata: {
        telegramId: telegramUserId.toString(),
        source: 'telegram_miniapp',
        createdAt: new Date().toISOString(),
      },
    });

    return player;
  } catch (error) {
    console.error('Player creation error:', error);
    throw error;
  }
}

/**
 * Gets or creates an account (wallet) for a player
 */
export async function getOrCreateAccount(playerId: string, chainId = DEFAULT_CHAIN_ID) {
  try {
    // List existing accounts for this player
    const accounts = await openfort.accounts.list({
      player: playerId,
    });

    // Find account on the target chain
    const existingAccount = accounts.data.find(
      (a) => a.chainId === chainId
    );

    if (existingAccount) {
      return existingAccount;
    }

    // Create new account if not found
    const account = await openfort.accounts.create({
      player: playerId,
      chainId,
    });

    return account;
  } catch (error) {
    console.error('Account creation error:', error);
    throw error;
  }
}
