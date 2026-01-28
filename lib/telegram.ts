import crypto from 'crypto';

/**
 * Validates Telegram initData using HMAC-SHA256
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramInitData(initData: string, botToken: string): boolean {
  if (!initData || !botToken) {
    return false;
  }

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');

    if (!hash) {
      return false;
    }

    params.delete('hash');

    // Sort parameters alphabetically and create data-check-string
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key: HMAC-SHA256(bot_token, "WebAppData")
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate hash: HMAC-SHA256(data_check_string, secret_key)
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return calculatedHash === hash;
  } catch (error) {
    console.error('InitData validation error:', error);
    return false;
  }
}

/**
 * Parses user data from validated initData
 */
export function parseInitDataUser(initData: string): {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  isPremium?: boolean;
} | null {
  try {
    const params = new URLSearchParams(initData);
    const userJson = params.get('user');

    if (!userJson) {
      return null;
    }

    const user = JSON.parse(userJson);

    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      languageCode: user.language_code,
      isPremium: user.is_premium,
    };
  } catch (error) {
    console.error('Parse user error:', error);
    return null;
  }
}

/**
 * Checks if initData has expired (older than 24 hours by default)
 */
export function isInitDataExpired(initData: string, maxAgeSeconds = 86400): boolean {
  try {
    const params = new URLSearchParams(initData);
    const authDate = params.get('auth_date');

    if (!authDate) {
      return true;
    }

    const authTimestamp = parseInt(authDate, 10);
    const currentTimestamp = Math.floor(Date.now() / 1000);

    return (currentTimestamp - authTimestamp) > maxAgeSeconds;
  } catch {
    return true;
  }
}
