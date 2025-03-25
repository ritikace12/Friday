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
