// ========================== IMPORTS ==========================
// Import necessary React hooks and utilities
import { useState, useRef, useEffect } from "react"; 

// Import icons from react-icons library
import { FiSend, FiMenu, FiX, FiRefreshCw } from "react-icons/fi"; 
import { FaGithub, FaLinkedin } from "react-icons/fa"; 

// Import Markdown support for displaying AI responses with formatting
import ReactMarkdown from "react-markdown"; 

// Import SyntaxHighlighter for formatting code snippets inside responses
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// API endpoint for AI chat backend (update when deploying)
const API_URL = "http://localhost:8080/api/chat"; 

// ========================== MAIN COMPONENT ==========================
function App() {
  // ========================== STATE MANAGEMENT ==========================
  // Stores the conversation history (messages from user & AI)
  const [messages, setMessages] = useState([]);
  
  // Stores the user's current input in the text box
  const [input, setInput] = useState("");
  
  // Loading state to indicate when AI is processing
  const [isLoading, setIsLoading] = useState(false);

  // Controls the visibility of the mobile menu
  const [menuOpen, setMenuOpen] = useState(false);

  // Reference to the last message element for automatic scrolling
  const messagesEndRef = useRef(null);

  // ========================== AUTO-SCROLL FUNCTION ==========================
  // Ensures the chat automatically scrolls to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Runs every time messages are updated, keeping chat at the bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ========================== HANDLE MESSAGE SUBMISSION ==========================
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing on form submission

    // Ignore empty messages or prevent sending while loading
    if (!input.trim() || isLoading) return; 

    const userMessage = input.trim(); // Trim extra spaces
    setInput(""); // Clear input field after sending message

    // Add user's message to the chat history
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    
    setIsLoading(true); // Set loading state while AI processes

    try {
      // Send message to the AI backend
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      // Parse the response as JSON
      const data = await response.json();

      // Add AI's response to the chat history
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
        },
      ]);
    } catch (error) {
      // If an error occurs, log it and show an error message in the chat
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  // ========================== CLEAR CHAT FUNCTION ==========================
  const clearChat = () => {
    setMessages([]); // Reset chat history
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ========================== NAVBAR ========================== */}
      <nav className="p-6 px-6 fixed top-0 w-full bg-[linear-gradient(to_right,#000000,#111111,#222222,#111111,#000000)] flex justify-between items-center z-10">


     
      <h1 className="text-4xl ml-10 font-bold text-black text-border">
   FRIDAY
</h1>

   



        {/* Mobile Menu Toggle Button */}
        <button className="sm:hidden mr-4 text-white" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
        </button>
      </nav>

      {/* ========================== CHAT BOX ========================== */}
      <div className="flex flex-col flex-1 mt-20 p-6 sm:p-6">
        <div className="flex-1 overflow-y-auto p-4 bg-white border-2 border-black rounded-xl shadow-lg max-h-[70vh] sm:max-h-[80vh] space-y-4">
          {/* Loop through messages and render them */}
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`p-3 rounded-lg max-w-[85%] break-words sm:max-w-[70%] 
                  ${message.role === "user" ? "bg-white border-black border text-black" : "bg-black text-white "}`}>
                
                {/* Display message content using Markdown (for better formatting) */}
                <ReactMarkdown
                  children={message.content}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      return !inline ? (
                        // If it's a code block, use syntax highlighter
                        <SyntaxHighlighter style={atomDark} language="javascript" PreTag="div" {...props}>
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        // If it's inline code, use simple styling
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

          {/* Show loading message when AI is generating a response */}
          {isLoading && <p className="text-center text-black">FRIDAY is thinking...</p>}
          
          {/* Invisible div to maintain auto-scroll */}
          <div ref={messagesEndRef} />
        </div>

        {/* ========================== INPUT SECTION ========================== */}
        <form onSubmit={handleSubmit} className="mt-6 flex gap-2 flex-wrap">
          {/* Input field for user messages */}
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            className="flex-1 p-3 rounded-lg bg-white border border-black text-black" 
            placeholder="Type a message..." 
            disabled={isLoading} 
          />
          
          {/* Send Message Button */}
          <button type="submit" className="p-3 bg-black text-white rounded-lg">
            <FiSend size={20} />
          </button>

          {/* Clear Chat Button */}
          <button type="button" onClick={clearChat} className="p-3 bg-black text-white rounded-lg">
            <FiRefreshCw size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
