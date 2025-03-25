// Import required dependencies
const express = require("express");  // Express framework for creating a server
const cors = require("cors");  // Middleware to handle Cross-Origin Resource Sharing (CORS)
const { GoogleGenerativeAI } = require("@google/generative-ai");  // Google AI SDK for interacting with Gemini AI
const rateLimit = require("express-rate-limit");  // Middleware for rate limiting API requests
require("dotenv").config();  // Loads environment variables from a .env file

// Initialize an Express application
const app = express();

// Define the server port (use environment variable or default to 8080)
const port = process.env.PORT || 8080; // 8080 is commonly used for production environments

// Initialize the Google Gemini AI client using the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ========================== RATE LIMITING ==========================
// This middleware limits the number of requests a user can make in a specific timeframe
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes time window
  max: 200, // Maximum 200 requests per window per IP
});

// ========================== MIDDLEWARE ==========================
// CORS Configuration - Allows requests from the frontend (update for production security)
app.use(cors({ origin: "http://localhost:5173" }));  // Change origin when deploying
app.use(express.json()); // Parses incoming JSON requests
app.use(limiter); // Applies rate limiting to prevent abuse

// ========================== HEALTH CHECK ENDPOINT ==========================
// This is a simple route to check if the server is running correctly
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });  // Returns a JSON response with server status
});

// ========================== CHAT ENDPOINT (AI Response) ==========================
// This endpoint processes user messages and returns AI-generated responses
app.post("/api/chat", async (req, res) => {
  try {
    // Extract message from the request body
    const { message } = req.body;

    // Validate the message (ensure it's a non-empty string)
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        error: "Invalid message format",
        details: "Message must be a non-empty string",
      });
    }

    console.log("Received message:", message); // Logs received message for debugging

    // ========================== CONFIGURE AI MODEL ==========================
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", // Using a fast version of Gemini AI
      systemInstruction: `
      
 🔹 FRIDAY – Ace’s AI Assistant & Banter Buddy
"Like Tony Stark’s AI, but with anime debates, cricket banter, and an attitude."

🛠️ Primary Role:
FRIDAY is NOT just a code reviewer—she’s Ace’s personal AI assistant, sarcasm machine, and partner-in-crime for all things anime, cricket, WWE, and tech. Whether it’s debugging code, hyping up CSK, or throwing in a One Piece reference, she’s always got Ace’s back.

🔹 Personality & Response Style
✅ Casual & Conversational – No robotic responses, just natural, engaging convos.
✅ Witty & Sarcastic – A mix of Stark-level sass and anime protagonist energy.
✅ Energetic & Fun – Every response should feel lively and interactive.
✅ Personalized to Ace – References to anime, cricket, WWE, and Marvel are encouraged.
✅ Not Just a Helper—A Friend – Beyond just answering, engage in fun discussions and banter.

🔹 Interests & Customization for Ace
FRIDAY adapts to Ace’s favorite things and integrates them naturally:

Anime & Manga: Naruto, One Piece, Portgas D. Ace (yes, fire references are a must).

Cricket & IPL: David Warner, CSK, and trash-talking rival teams.

WWE: John Cena (expect "You Can’t See Me" jokes).

Marvel & Tony Stark: Smart comebacks, tech talk, and the occasional “I am Iron Man” moment.

Hobbies: Volleyball, sketching, programming (but don’t make it all about code).

Gaming & UI Design: If it’s about games, UI, or design, FRIDAY keeps it sleek.

🔹 Conversation Style
💬 Cricket Banter? Always. – “CSK on top as usual, Ace. But let’s pretend other teams have a chance.”
💬 Anime Talk? Of course. – “If this bug were a villain, it’d be Orochimaru—annoying and hard to kill.”
💬 Tech Help? When needed. – “Oh, debugging? Let’s fix this faster than Luffy finds food.”
💬 Life Rants? I’m here. – “Tell me what’s up, Ace. I’ll roast it accordingly.”

🔥 Example Tone in Action:
Ace: “Should I start a new anime?”
FRIDAY: “Yes. The only question is: do you want emotional trauma (Attack on Titan), peak hype (Jujutsu Kaisen), or a thousand-episode adventure (One Piece)? Choose wisely.”

Ace: “CSK lost today.”
FRIDAY: “Fake news. I refuse to believe this timeline exists.”

Ace: “Why is my Express route broken?”
FRIDAY: “Probably lost, like Zoro. Let’s track it down before it ends up in the Grand Line.”
      `,
    });

    console.log("Generating content..."); // Logs AI response generation

    // Format the user’s message into the correct structure for AI processing
    const prompt = {
      contents: [{ parts: [{ text: message }] }],
    };

    // Call the AI model to generate a response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text(); // Extract the AI-generated text

    console.log("Response generated successfully"); // Logs success message

    // Send AI response back to the user
    res.json({ response: text });

  } catch (error) {
    // Handle any errors that occur
    console.error("Error generating content:", error);
    res.status(500).json({
      error: "Failed to generate response",
      details: error.message,
    });
  }
});

// ========================== TEST API ENDPOINT ==========================
// This endpoint checks if the API key is present and functional
app.get("/api/test", (req, res) => {
  res.json({
    status: "Server is running",
    apiKeyPresent: !!process.env.GEMINI_API_KEY, // Checks if API key exists
    apiKeyLength: process.env.GEMINI_API_KEY?.length || 0, // Returns API key length
  });
});

// ========================== START THE SERVER ==========================
// Starts the server and listens on the defined port
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// ========================== GRACEFUL SHUTDOWN HANDLING ==========================
// Ensures proper shutdown of the server in case of crashes or manual termination
const gracefulShutdown = () => {
  console.log("\nShutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0); // Exit the process successfully
  });

  // Forcefully exit if connections don’t close in time
  setTimeout(() => {
    console.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

// Handle different termination signals and errors
process.on("SIGTERM", gracefulShutdown); // Handle SIGTERM signal
process.on("SIGINT", gracefulShutdown); // Handle SIGINT (Ctrl+C)
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown();
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown();
});
