import { useState, useRef, useEffect } from "react";
import { FiSend, FiMenu, FiX, FiRefreshCw } from "react-icons/fi";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const API_URL = "https://your-deployed-server.com/api/chat"; // Update with actual deployment URL

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll chat to the bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a2a] to-[#1a1a4a] flex flex-col">
      {/* Navbar */}
      <nav className="p-4 fixed top-0 w-full bg-[#0a0a2a]/90 backdrop-blur-md shadow-lg border-b border-[#00f2ff] flex justify-between items-center z-10">
        <h1 className="text-2xl font-bold text-[#00f2ff]">⌬ E.D.I.T.H.</h1>

        <button className="sm:hidden text-[#00f2ff]" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
        </button>
      </nav>

      {/* Chat Box */}
      <div className="flex flex-col flex-1 mt-16 p-4 sm:p-6">
        <div className="flex-1 overflow-y-auto p-4 bg-[#0a0a2a]/80 border-2 border-[#00f2ff] rounded-xl shadow-lg max-h-[70vh] sm:max-h-[80vh] space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`p-3 rounded-lg max-w-[85%] break-words sm:max-w-[70%] ${message.role === "user" ? "bg-[#00f2ff] text-[#0a0a2a]" : "bg-[#0a0a2a] text-[#e6f6ff] border border-[#00f2ff]"}`}>
                <ReactMarkdown
                  children={message.content}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      return !inline ? (
                        <SyntaxHighlighter style={atomDark} language="javascript" PreTag="div" {...props}>
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-gray-700 px-1 py-0.5 rounded" {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                />
              </div>
            </div>
          ))}
          {isLoading && <p className="text-center text-[#e6f6ff]">EDITH is thinking...</p>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Section */}
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2 flex-wrap">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 p-3 rounded-lg bg-[#0a0a2a] border border-[#00f2ff] text-[#e6f6ff]" placeholder="Type a message..." disabled={isLoading} />
          <button type="submit" className="p-3 bg-[#00f2ff] text-[#0a0a2a] rounded-lg"><FiSend size={20} /></button>
          <button type="button" onClick={clearChat} className="p-3 bg-[#ffd700] text-[#0a0a2a] rounded-lg"><FiRefreshCw size={20} /></button>
        </form>
      </div>
    </div>
  );
}

export default App;





