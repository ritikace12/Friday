const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8080; // Use 8080 for production

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Rate limiting (adjusted for production)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 200, // Increase request limit for real users
});

// Middleware
app.use(cors({ origin: "*" })); // Allow all origins for now (Update for security)
app.use(express.json());
app.use(limiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        error: "Invalid message format",
        details: "Message must be a non-empty string",
      });
    }

    console.log("Received message:", message);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    console.log("Generating content...");

    const prompt = {
      contents: [{ parts: [{ text: message }] }],
    };

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Response generated successfully");
    res.json({ response: text });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({
      error: "Failed to generate response",
      details: error.message,
    });
  }
});

// Test API endpoint
app.get("/api/test", (req, res) => {
  res.json({
    status: "Server is running",
    apiKeyPresent: !!process.env.GEMINI_API_KEY,
    apiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
  });
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log("\nShutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Could not close connections in time, forcefully shutting down");
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
