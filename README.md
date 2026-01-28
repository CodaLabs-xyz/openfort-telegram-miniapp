# Openfort Telegram Mini App Demo

Build Telegram Mini Apps with automatic Web3 wallet creation using Openfort.

## Features

- InitData validation for secure authentication
- Automatic embedded wallet creation
- Works on iOS, Android, and Desktop Telegram
- Zero wallet UX friction

## Prerequisites

1. **Telegram Bot**: Create via [@BotFather](https://t.me/BotFather)
2. **ngrok**: For local HTTPS ([ngrok.com](https://ngrok.com))
3. **Openfort Account**: [openfort.io](https://openfort.io)

## Setup

### 1. Create Telegram Bot

```
1. Open @BotFather in Telegram
2. Send /newbot
3. Follow prompts to name your bot
4. Save the bot token
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Add your keys:
```env
TELEGRAM_BOT_TOKEN=your_bot_token
OPENFORT_SECRET_KEY=sk_your_key
```

### 4. Start Development

```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000
```

### 5. Configure Mini App URL

1. Copy ngrok HTTPS URL
2. In BotFather: `/setmenubutton`
3. Select your bot
4. Paste ngrok URL

### 6. Test

Open your bot in Telegram and tap the menu button!

## Project Structure

```
├── app/
│   ├── page.tsx              # Mini App frontend
│   ├── layout.tsx            # Root layout
│   └── api/
│       ├── validate/route.ts # InitData validation
│       └── wallet/route.ts   # Wallet creation
├── components/
│   └── telegram-wallet.tsx   # Wallet display
├── lib/
│   ├── telegram.ts          # Telegram utilities
│   └── openfort-server.ts   # Openfort server config
└── .env.example
```

## Security Notes

- **Never expose BOT_TOKEN in frontend**
- **Never expose OPENFORT_SECRET_KEY**
- **Always validate initData server-side**

## Learn More

- [Telegram Mini Apps Docs](https://core.telegram.org/bots/webapps)
- [Openfort Documentation](https://openfort.io/docs)
- [Video Tutorial](link)

## License

MIT
