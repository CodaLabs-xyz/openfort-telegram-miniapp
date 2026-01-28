'use client';

import { Copy, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface TelegramWalletProps {
  address: string;
  chainId?: number;
}

const CHAIN_EXPLORERS: Record<number, { name: string; url: string }> = {
  1: { name: 'Ethereum', url: 'https://etherscan.io/address/' },
  137: { name: 'Polygon', url: 'https://polygonscan.com/address/' },
  80002: { name: 'Polygon Amoy', url: 'https://amoy.polygonscan.com/address/' },
  42161: { name: 'Arbitrum', url: 'https://arbiscan.io/address/' },
  8453: { name: 'Base', url: 'https://basescan.org/address/' },
};

export function TelegramWallet({ address, chainId = 137 }: TelegramWalletProps) {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);

      // Trigger haptic feedback if available
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const explorer = CHAIN_EXPLORERS[chainId];
  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Your Wallet</h2>
        {explorer && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {explorer.name}
          </span>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <label className="text-xs text-gray-500 uppercase tracking-wide">
          Address
        </label>
        <div className="flex items-center justify-between mt-1">
          <p className="font-mono text-sm text-gray-900">
            {truncatedAddress}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={copyAddress}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label="Copy address"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-600" />
              )}
            </button>
            {explorer && (
              <a
                href={`${explorer.url}${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="View on explorer"
              >
                <ExternalLink className="w-4 h-4 text-gray-600" />
              </a>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        This is your smart wallet address. You can receive tokens and NFTs here.
      </p>
    </div>
  );
}
