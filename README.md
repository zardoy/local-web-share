# 📁 LOCAL WEB SHARE

The **simplest and most straightforward way** to share files in your current network without any 3rd party services. Just drag & drop files or click from context menu and a **QR code** will pop up to quickly download from your phone. Simply scan with your camera and that's it! **No internet connection required.**

## 🚀 Key Features

### ✨ **Bidirectional File Transfer** (Extremely Useful!)
- **PC → Phone**: Share files from your computer to your phone instantly
- **Phone → PC**: Send files from your phone back to your PC - they automatically appear in your Downloads folder! 📱💻

### 🔄 **Seamless Sharing**
- **Drag & Drop**: Simply drag files onto the app window
- **Context Menu**: Right-click any file and share directly
- **QR Code**: Instant mobile access - just scan and download
- **No Internet Required**: Works entirely on your local network

### 📱 **Mobile Remote Control** (Optional, Windows only)
- Enable mouse remote control from your phone
- Perfect for presentations or when you need to control your PC remotely

### 🛡️ **Privacy & Security**
- **No cloud storage** - files never leave your network
- **No third-party services** - complete privacy
- **Local network only** - secure and fast

## 🏗️ Build EXE

> [Node.js](https://nodejs.org/) and pnpm (`npm i -g pnpm`) must be installed.

- Clone this via git / download ZIP
- Install dependencies (just run `pnpm i` in terminal) and then run `pnpm build-app`
- If everything is okay, you will find installer in `release` folder

## 🎯 Use Cases

- **Quick file sharing** between devices on the same network
- **Backup photos** from phone to PC instantly
- **Share documents** during meetings without USB drives
- **Transfer large files** without cloud storage limits
- **Remote presentations** with mobile control
- **Emergency file access** when internet is down

## 🔧 Technical Features

- **Fast and stable** performance
- **Modern UI/UX** with intuitive design
- **Cross-platform** support (Windows, macOS)
- **Real-time** file transfer
- **Automatic Downloads folder** integration
- **Network discovery** for easy setup

## 📋 Requirements

- **Node.js** 18+ and **pnpm**
- **Local network** connection between devices
- **Modern browser** on mobile device (for QR code scanning)

## 🚀 Getting Started

1. **Install** the application on your PC
2. **Launch** the app - it will start a local web server
3. **Drag files** or use context menu to share
4. **Scan QR code** with your phone's camera
5. **Download files** directly to your phone
6. **Send files back** to PC - they'll appear in Downloads!

## 🔄 Development

```bash
# Install dependencies
pnpm install

# Start development mode
pnpm start

# Build for production
pnpm build-app

# Build Windows executable
pnpm electron-pack-win

# Build macOS DMG
pnpm electron-pack-mac
```

## 📱 Mobile Features

- **QR Code Scanning**: Use your phone's camera to access shared files
- **File Upload**: Send files from phone to PC
- **Remote Control**: Optional mouse control from phone
- **Responsive Design**: Works on all mobile devices

## 🛠️ Architecture

- **Electron** for cross-platform desktop app
- **React** for modern UI
- **WebSocket** for real-time communication
- **Local HTTP Server** for file sharing
- **QR Code Generation** for mobile access

## 🔒 Privacy

- **No data collection** - your files stay private
- **No analytics** - we don't track your usage
- **No cloud storage** - everything stays local
- **Open source** - transparent and auditable

## 🤝 Contributing

This project is open source! Feel free to contribute by:
- Reporting bugs
- Suggesting features
- Submitting pull requests
- Improving documentation

## 📄 License

MIT License - feel free to use, modify, and distribute!

---

**Made with ❤️ for seamless local file sharing**
