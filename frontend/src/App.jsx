import { useState, useRef, useEffect } from "react";
import { FiSend, FiRefreshCw, FiMenu } from "react-icons/fi";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

const API_URL = "http://localhost:8080/api/chat";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Try again!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ========================== NAVBAR ========================== */}
      <nav className="p-6 px-10 fixed top-0 w-full bg-gradient-to-r from-black via-black/90 to-black flex justify-between items-center z-50 shadow-lg">
        <h1 className="text-3xl font-bold text-white tracking-widest">FRIDAY</h1>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center space-x-6">
          <div className="text-sm px-3 py-1 bg-white text-black rounded-lg">v1.0.0</div>
          <a href="https://www.linkedin.com/in/your-profile" target="_blank" rel="noopener noreferrer" className="text-lg text-white hover:text-gray-300">
            <FaLinkedin size={24} />
          </a>
          <a href="https://github.com/your-profile" target="_blank" rel="noopener noreferrer" className="text-lg text-white hover:text-gray-300">
            <FaGithub size={24} />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button className="sm:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
          <FiMenu size={28} />
        </button>
      </nav>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-16 left-0 w-full bg-gray-900 p-4 flex flex-col items-center space-y-4 sm:hidden"
        >
          <div className="text-sm px-3 py-1 bg-white text-black rounded-lg">v1.0.0</div>
          <a href="https://www.linkedin.com/in/your-profile" target="_blank" rel="noopener noreferrer" className="text-lg text-white hover:text-gray-300">
            <FaLinkedin size={24} />
          </a>
          <a href="https://github.com/your-profile" target="_blank" rel="noopener noreferrer" className="text-lg text-white hover:text-gray-300">
            <FaGithub size={24} />
          </a>
        </motion.div>
      )}

      {/* ========================== CHAT SECTION ========================== */}
      <div className="flex from-white via-white/90 to-white flex-col flex-1 mt-24 px-6 sm:px-16 py-6"
    >
        {/* Chatbox with Fancy Gradient */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 p-6 sm:p-8 bg-gradient-to-r from-black via-gray-950 to-black  border-2 border-black rounded-lg shadow-xl overflow-y-auto max-h-[50vh] sm:max-h-[60vh] space-y-4"
          
        >
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ x: message.role === "user" ? 50 : -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} px-4`}
            >
              <div className={`p-3 rounded-lg max-w-[60%] break-words shadow-md 
                  ${message.role === "user" ? "bg-white text-black" : "bg-white text-black"}`}>
                <ReactMarkdown children={message.content} />
              </div>
            </motion.div>
          ))}

          {isLoading && <p className="text-center text-white">FRIDAY is thinking...</p>}
          <div ref={messagesEndRef} />
        </motion.div>

        {/* Input Section */}
        <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-3 rounded-lg bg-white text-black border border-black shadow-sm focus:ring-2 focus:ring-black"
            placeholder="Type a message..."
            disabled={isLoading}
          />

          <motion.button type="submit" whileHover={{ scale: 1.1 }} className="p-3 bg-black text-white rounded-lg shadow-md">
            <FiSend size={20} />
          </motion.button>

          <motion.button type="button" onClick={() => setMessages([])} whileHover={{ scale: 1.1 }} className="p-3 bg-white text-black border-black border shadow-md">
            <FiRefreshCw size={20} />
          </motion.button>
        </form>
      </div>
    
      <footer className="p-6 px-10 text-white fixed bottom-0 w-full bg-gradient-to-r from-black via-black/90 to-black flex justify-center items-center z-50 shadow-lg">
  <h2 >
    Powered by PORTGAS
    <span className="text-lime-500"> U!</span>
  </h2>
</footer>

    </div>
  );
}

export default App;

