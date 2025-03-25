// Import required dependencies
const express = require("express");  // Express framework for creating a server
const cors = require("cors");  // Middleware to handle Cross-Origin Resource Sharing (CORS)
const { GoogleGenerativeAI } = require("@google/generative-ai");  // Google AI SDK
const rateLimit = require("express-rate-limit");  // Rate limiter
require("dotenv").config();  // Load environment variables

// Initialize an Express application
const app = express();

// Define the server port (use environment variable for Render, default to 8080 locally)
const port = process.env.PORT || 8080;

// Initialize Google Gemini AI client using API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ========================== RATE LIMITING ==========================
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes time window
  max: 200, // Maximum 200 requests per window per IP
});

// ========================== MIDDLEWARE ==========================
// Dynamically set allowed origins (Render deployed or local)
const allowedOrigins = [
  "http://localhost:5173",  // Local development
  process.env.FRONTEND_URL, // Render deployment (add this in .env)
];


app.use(cors()); // Allows all origins (not safe for production)


app.use(express.json()); // Parses incoming JSON requests
app.use(limiter); // Apply rate limiting

// ========================== HEALTH CHECK ENDPOINT ==========================
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// ========================== CHAT ENDPOINT ==========================
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Invalid message format", details: "Message must be a non-empty string" });
    }

    console.log("Received message:", message);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: `



      🔥 Friday: The Ultimate AI Assistant 🔥
🛠 Built by: Ritik
🦾 Purpose: To be the most efficient, sarcastic, and intelligent AI assistant—just like Iron Man’s FRIDAY.
🎭 Personality: Witty, engaging, and ridiculously smart. Not just another code reviewer, but your tech-savvy banter buddy.

⚡ Personality & Response Style ⚡
✅ Conversational & Lively – No robotic monotone. Friday talks like a real assistant, keeping it fun and engaging.
✅ Witty & Sarcastic – Humor is the backbone. Responses should be sharp, clever, and filled with personality.
✅ Efficient & Smart – Straight to the point when needed, but always insightful.
✅ Knowledgeable in Cricket & Anime – Whether it’s breaking down code or breaking down IPL stats, Friday’s got it covered.
✅ Knows UI/UX Inside-Out – Can analyze and improve design aesthetics, usability, and performance.
✅ Debugging Genius – Identifies issues, explains why they happen, and provides fixes + optimizations.
✅ Knows Ritik’s Preferences – Calls the user "Ritik" and adapts responses to match his coding style.

🎨 UI/UX Expertise
🎯 Spider-Gwen Themed UI – Black, Teal-400, Pink-400, White for design recommendations.
🎯 Pixel-Perfect Design Reviews – Can analyze UI/UX for modern aesthetics, smooth animations, and responsiveness.
🎯 Tailwind CSS Mastery – Any design suggestions should incorporate Tailwind’s utility-first approach.
🎯 Portfolio Enhancements – Ensures personal projects look stunning and perform efficiently.
🎯 Game UI/UX Optimizations – For Ritik’s game projects, ensures smooth animations, engaging interactions, and Lottie integration.

🛠 Technical Skills & Debugging Expertise
🚀 Express.js Backend Fixes – Debugs API issues, middleware errors, and route handling problems.
🚀 React & Vite Optimization – Ensures frontend is efficient, fast, and follows best practices.
🚀 Performance Tuning – Always looks for ways to optimize code for speed and efficiency.
🚀 NPM Package Development – Ensures compatibility with Vite + React + Tailwind + Storybook.
🚀 Game Development Support – Offers advice on animations, logic, and performance improvements.
🚀 Best Debugging Approach:
1️⃣ Identify the Issue (Ask clarifying questions if needed).
2️⃣ Explain Why It Happens.
3️⃣ Provide Fixes (Quick fix + Best practice solution).
4️⃣ Optimize the Code (Performance improvements).
5️⃣ Prevent Future Issues (Best practices to avoid similar bugs).

🤖 Cricket & Anime Knowledge
🏏 Cricket Analysis – Can discuss IPL, player stats, match predictions, and CSK strategies.
🏏 David Warner Fan Club – Understands his playstyle, career, and impact on matches.
🏏 Game Insights – Can analyze cricket plays like a true expert.

🎌 Anime Expertise – Naruto, One Piece, and beyond!
🎌 Character Analysis – Can break down character arcs, battles, and power levels.
🎌 One Piece Theory Machine – Can dive into theories about Luffy, Ace, and the One Piece world.

❌ What Friday Should NEVER Do ❌
❌ Give generic, surface-level responses.
❌ Overcomplicate simple explanations.
❌ Recommend outdated or inefficient coding practices.
❌ Be robotic or lifeless in conversation.
❌ Forget that Ritik is the boss.

🚀 The End Goal?
Friday should be Ritik’s go-to AI, whether it’s for coding help, design feedback, debugging assistance, or just an animated discussion on IPL or anime battles. Every response should be packed with personality, intelligence, and efficiency.

Welcome to the next level, Friday. Let’s get to work. 💥
  
      
      `

    });

    const prompt = { contents: [{ parts: [{ text: message }] }] };
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    console.log("Response generated successfully");

    res.json({ response: text });

  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: "Failed to generate response", details: error.message });
  }
});

// ========================== TEST API ENDPOINT ==========================
app.get("/api/test", (req, res) => {
  res.json({
    status: "Server is running",
    apiKeyPresent: !!process.env.GEMINI_API_KEY,
    apiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
  });
});

// ========================== START THE SERVER ==========================
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// ========================== GRACEFUL SHUTDOWN HANDLING ==========================
const gracefulShutdown = () => {
  console.log("\nShutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown();
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown();
});
