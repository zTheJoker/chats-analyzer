# WhatsApp Chat Analyzer

![WhatsApp Chat Analyzer](public/logo.png)

A powerful tool for analyzing and visualizing WhatsApp chat exports, providing insightful statistics and visualizations of your conversations. All processing happens in your browser - your data never leaves your device.

🔗 **Live Website**: [www.convoanalyzer.com](https://www.convoanalyzer.com)

## Features

- **Chat Statistics**: Total messages, participants, media counts
- **User Activity Analysis**: Most active users, message length distribution
- **Time-based Analysis**: Activity by weekday, time of day
- **Message Content Analysis**: Longest messages, emoji usage stats
- **Conversation Patterns**: Response times, conversation starters, longest threads
- **Media Support**: View and analyze images and other media from chat exports
- **Privacy-Focused**: All processing happens locally in your browser
- **Export Options**: Download analysis as PDF

## How It Works

1. **Export your WhatsApp chat**: Follow the step-by-step guide in the app
2. **Upload the .txt file or ZIP**: The app processes your chat data in your browser
3. **Get instant insights**: View detailed statistics and visualizations of your conversations

## Privacy

We take your privacy seriously:

- All processing happens entirely in your browser
- Your chat data never leaves your device
- No server-side processing or data storage
- No registration or account required

## Technology Stack

- **Framework**: Next.js with React
- **Styling**: Tailwind CSS, Radix UI
- **Data Processing**: Custom chat parser and analysis engine
- **Data Visualization**: Recharts
- **Storage**: IndexedDB for temporary local storage
- **PDF Export**: html2pdf.js

## Running Locally

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/whatsapp-chat-analyzer.git
   cd whatsapp-chat-analyzer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm run start
```

## Contributing

Contributions are welcome! Feel free to open issues or pull requests.

## License

This project is proprietary software.

## Contact

For support or inquiries, please contact us at support@convoanalyzer.com. 