# HangOut & Hangman: Where Words Connect 🎮

> [!NOTE]
> **Disclaimer:** This project assignment is intended solely for educational purposes. All names, characters, images, and related trademarks are the property of their respective owners. This assignment does not claim ownership or affiliation with any official entities.
>
> **Important Notice for Interview Candidates:** By accepting to participate in the interview process and this assignment, you agree to conduct yourself ethically and honorably throughout the interview process. This includes providing truthful information and asserting that you are the primary originator of the code and project submitted. Submitting code that is not your own constitutes misrepresentation and will disqualify your candidacy. By submitting the assignment, you agree not to claim any Intellectual Property (IP) or copyright over the work created, as it is solely for interview evaluation purposes. You waive Covert Eye Technologies Private Limited and any of its subsidiaries of any future claims relating to this work and your participation in the interview process.
>
> **Image Usage:** The screenshots contained in the assignment are for reference purposes only. Covert Eye Technologies Private Limited does not claim any ownership or related rights to the content used here.

---

## 🎯 Project Objective

The objective of this project is to demonstrate advanced skills in backend development, real-time communication, and creative problem-solving by constructing the core logic of a multiplayer Hangman game with a premium minimalist aesthetic.

## 🛠️ Architecture & Approach

My approach was to build a loosely coupled, event-driven system that ensures real-time consistency while maintaining a clean separation of concerns.

### Key Design Choices & Justifications

- **NestJS (Backend)**: Chosen for its highly structured, modular architecture. I justified this choice because it provides out-of-the-box support for **WebSockets (Socket.io Gateways)** and **Validation Pipes**, which are critical for real-time game integrity.
- **Angular 19 (Frontend)**: I selected Angular for its **Signal-based state management**, which significantly reduces UI re-renders compared to traditional change detection. This is ideal for a fast-paced game where the word display and timer update frequently.
- **PostgreSQL & Prisma**: Instead of a simple JSON file, I used a relational database to ensure **data persistence** and **referential integrity** between Users, Rooms, and Game States. Prisma was chosen to provide a type-safe layer, catching errors at compile-time rather than runtime.
- **Minimalist UX**: I intentionally avoided heavy CSS frameworks like Bootstrap to create a **custom, high-contrast visual identity**. This demonstrates the ability to write clean, maintainable vanilla CSS that feels premium.

## ✨ Implementation Features

### 1. State Management

The game state is managed centrally on the backend and broadcasted to clients. We track:

- **Active Word**: Hidden on the server and revealed letter-by-letter as guesses are made.
- **Guessed Letters**: Tracked to prevent duplicates and update the UI.
- **Turn Logic**: A round-robin system that cycles through room members fairly.
- **Game status**: Managed via a `GameStatus` enum (WAITING, PLAYING, WON, LOST).

### 2. Real-Time Communication

Using Socket.io Gateways, we broadcast:

- Changes in the word display (displayWord).
- Incorrect guesses remaining.
- Real-time player joins/leaves/kicks.
- Game start/end results with score updates.

### 3. Security & Data Handling

- **Password Hashing**: User passwords are encrypted using **bcrypt**.
- **JWT Authentication**: Secure stateless authentication ensures only authorized users can join rooms and make guesses.
- **Validation**: Strict DTO validation (class-validator) prevents malicious input and ensures data integrity.

## 🎁 Bonus Features

- **Premium Aesthetics**: A custom-designed minimalist white theme with a focus on typography and spacing.
- **Centralized Config**: All game logic (max mistakes, colors, alphabets) is managed via centralized constants and enums for high maintainability.
- **Error Handling**: Graceful handling of edge cases, such as "Port in use" conflicts and Prisma "Record not found" errors during disconnects.

## 📖 API Documentation

The backend provides a comprehensive **Swagger/OpenAPI** documentation.

- Once the backend is running, visit: `http://localhost:3000/api`
- This interactive UI allows you to explore all endpoints for Auth, Room Management, and Game Logic.

## 🧪 How to Test & Verify

To ensure the core requirements are met, you can follow these testing steps:

1. **Authentication**: Register two separate users. Log in with both to verify the **JWT + Bcrypt** security layer is working.
2. **Multiplayer Lobby**: Create a room with User A. Verify that the room instantly appears in User B's lobby via **WebSockets**.
3. **Gameplay**: Start a game with 2 players. Verify that guessing a letter on User A's screen immediately updates the word display and "Incorrect Guesses" count for both players.
4. **Validation**: Attempt to guess the same letter twice or guess when it's not your turn. The system should block these actions and provide feedback.
5. **API Documentation**: Visit `http://localhost:3000/api` while the backend is running to test individual REST endpoints via the interactive **Swagger** UI.

## 📦 Getting Started

### Local Setup

1. **Backend**:

   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma db push
   npm run start:dev
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Hosting on Render

For full deployment instructions (utilizing Neon DB), please refer to the **[HOSTING.md](./HOSTING.md)** guide.

---

_Good luck with the evaluation!_
