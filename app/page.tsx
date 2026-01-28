'use client';

import { useEffect, useState } from 'react';
import { TelegramWallet } from '@/components/telegram-wallet';

interface WalletData {
  address: string;
  playerId: string;
  accountId: string;
  chainId: number;
}

interface UserData {
  userId: number;
  username?: string;
  firstName: string;
}

export default function Home() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initApp = async () => {
      // Check if running in Telegram
      const tg = window.Telegram?.WebApp;

      if (!tg) {
        setError('Please open this app in Telegram');
        setLoading(false);
        return;
      }

      // Tell Telegram the app is ready and expand to full height
      tg.ready();
      tg.expand();

      // Apply Telegram theme colors
      if (tg.themeParams.bg_color) {
        document.body.style.backgroundColor = tg.themeParams.bg_color;
      }

      const initData = tg.initData;

      if (!initData) {
        setError('No authentication data available');
        setLoading(false);
        return;
      }

      try {
        // Step 1: Validate initData with backend
        const validateRes = await fetch('/api/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData }),
        });

        if (!validateRes.ok) {
          const errorData = await validateRes.json();
          throw new Error(errorData.error || 'Validation failed');
        }

        const userData = await validateRes.json();
        setUser({
          userId: userData.userId,
          username: userData.username,
          firstName: userData.firstName,
        });

        // Step 2: Create or get wallet
        const walletRes = await fetch('/api/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telegramUserId: userData.userId,
            username: userData.username,
          }),
        });

        if (!walletRes.ok) {
          const errorData = await walletRes.json();
          throw new Error(errorData.error || 'Wallet creation failed');
        }

        const walletData = await walletRes.json();
        setWallet(walletData);

        // Haptic feedback on success
        tg.HapticFeedback?.notificationOccurred('success');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(message);

        // Haptic feedback on error
        tg.HapticFeedback?.notificationOccurred('error');
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
        <p className="mt-4 text-gray-600">Setting up your wallet...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-red-50 to-white">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h2 className="text-lg font-semibold text-center text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 text-center text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      {/* Header with user greeting */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome{user?.firstName ? `, ${user.firstName}` : ''}!
        </h1>
        {user?.username && (
          <p className="text-gray-500 text-sm">@{user.username}</p>
        )}
      </div>

      {/* Wallet Card */}
      <div className="flex justify-center">
        {wallet && (
          <TelegramWallet
            address={wallet.address}
            chainId={wallet.chainId}
          />
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-gray-400">
          Powered by Openfort
        </p>
      </div>
    </div>
  );
}
