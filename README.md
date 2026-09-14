# GitWall 🧱

> **Transform your GitHub activity into a living, ambient wallpaper for Windows.**  
> Built with **Tauri v2**, **Rust**, **React 19**, and **Tailwind CSS v4**.

---

## Overview

**GitWall** is a native Windows desktop application that bridges the GitHub GraphQL API with the Windows Desktop Window Manager (DWM). Rather than generating a static image file, GitWall hooks directly behind desktop icons into the Windows Explorer `WorkerW` hierarchy, rendering an interactive, typography-first dashboard with smooth animations, accessible tooltips, and real-time streak tracking.

---

## ✨ Features

- **Living Wallpaper Engine:** Integrates natively behind Windows desktop icons using low-level Win32 API calls (`Progman` message `0x052C` & `WorkerW` reparenting).
- **Secure by Default:** Zero plaintext credentials. GitHub Personal Access Tokens (PAT) and usernames are stored in the encrypted **Windows Credential Manager** via native OS APIs.
- **Offline-First & Resilient:** Instant boot-up loading the last known contribution state from local cache, updating gracefully in the background when connectivity is available.
- **Midnight Rollover & Live Streaks:** Automatically recalculates current and longest streaks at local midnight without requiring an application restart.
- **Multi-Monitor Aware:** Handles Windows Virtual Screen coordinates (including negative offsets from secondary displays to the left/top).
- **Editorial Design System:** Minimalist aesthetic featuring Georgia serif typography, slate/cyan contribution heatmaps, and warm amber accent counters.
- **Interactive Contribution Calendar:** 53-week Sunday-to-Saturday layout with localized tooltips and subtle cell hover scaling.
- **System Tray & Autostart Integration:** Toggle wallpaper mode, open settings, or configure Windows boot auto-launch right from the system tray.

---

## 🏛️ Architecture

GitWall separates concerns between a native Rust system layer and an isolated pure-domain frontend engine:

```
┌─────────────────────────────────────────────────────────────┐
│                      GitWall Runtime                        │
├──────────────────────────────┬──────────────────────────────┤
│       Rust Nativo (Tauri v2) │       Frontend (React 19)    │
│  - Win32 WorkerW Hooking     │  - Editorial Wallpaper Grid  │
│  - Windows Credential Manager│  - Contribution Calendar     │
│  - GraphQL Client (Reqwest)  │  - Interactive Tooltips      │
│  - Offline Cache & Autostart │  - Pure Streak Domain Engine │
└──────────────┬───────────────┴──────────────┬───────────────┘
               │                              │
               ▼                              ▼
      ┌─────────────────┐            ┌─────────────────┐
      │ Windows Explorer│            │ GitHub GraphQL  │
      │ (Desktop DWM)   │            │ API (v4)        │
      └─────────────────┘            └─────────────────┘
```

### Pure Domain Logic (`src/domain/`)
The streak calculation engine is completely decoupled from UI frameworks and third-party libraries:
- `calculateCurrentStreak`: Backwards daily traversal anchoring on today or yesterday.
- `calculateLongestStreak`: Chronological scan accounting for month boundaries and leap years.
- `aggregateStats`: Sliding 30-day window aggregation and total count verification.
- **100% Test Coverage:** Verified by 34 unit tests running on Vitest.

---

## 🚀 Getting Started

### Prerequisites

1. **Node.js:** v20+ and **pnpm** (`npm i -g pnpm`)
2. **Rust:** Latest stable toolchain (`rustup default stable`)
3. **Windows 10/11** with Visual Studio C++ Build Tools installed

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/vtzada/gitwall.git
cd gitwall

# Install dependencies
pnpm install

# Run frontend tests
pnpm test

# Launch desktop app in development mode
pnpm tauri dev
```

### Production Build

```bash
# Verify TypeScript and compile frontend
pnpm run build

# Build Windows installer and portable binary
pnpm tauri build
```

---

## 🔒 Security

GitWall does not track telemetry or store your GitHub tokens in plain text configuration files. All tokens are securely delegated to Windows Credential Manager using the `keyring` crate with native DPAPI protection.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

