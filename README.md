# HangOut & Hangman 🎮

A premium, minimalist multiplayer Hangman game built with NestJS, Angular, and Socket.io. Experience real-time word guessing with a clean, high-contrast design.

## 🚀 Features

- **Multiplayer Lobby**: Create or join password-protected rooms.
- **Real-time Gameplay**: Synchronization via Socket.io for instant guesses and player list updates.
- **Premium Design**: Minimalist white theme with sharp borders and smooth micro-animations.
- **Dynamic Scoring**: Earn points for winning games and compete with others.
- **Robust Backend**: Built with NestJS, Prisma, and PostgreSQL for maximum performance and stability.

## 🛠️ Tech Stack

- **Frontend**: Angular (Latest), Socket.io-client, Lucide Icons.
- **Backend**: NestJS, Socket.io, Prisma ORM, JWT Authentication.
- **Database**: PostgreSQL.
- **Design System**: Vanilla CSS with a focus on minimalist aesthetics.

## 📦 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL Database
- npm or yarn

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd HangMan
   ```

2. **Backend Setup**:

   ```bash
   cd backend
   npm install
   # Create a .env file based on .env.example
   npx prisma generate
   npx prisma db push
   npm run start:dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

## 🌐 Deployment

For detailed instructions on how to host this application on Render, see the [Hosting Guide](./HOSTING.md).

## 📄 License

This project is unlicensed. Feel free to use and modify it.
