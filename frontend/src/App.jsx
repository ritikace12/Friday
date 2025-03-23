import { useState, useRef, useEffect } from 'react';
import { FiSend, FiMic, FiStopCircle, FiRefreshCw } from 'react-icons/fi';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

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
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Implement voice recording logic here
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a2a] to-[#1a1a4a] flex flex-col">
      {/* Navbar */}
      <nav className="p-4 fixed top-0 w-full bg-[#0a0a2a]/90 backdrop-blur-md shadow-lg border-b border-[#00f2ff] flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#00f2ff]">J.A.R.V.I.S</h1>
        <div className="space-x-6">
          <a href="#" className="text-[#e6f6ff] hover:text-[#00f2ff] transition">Home</a>
          <a href="#" className="text-[#e6f6ff] hover:text-[#00f2ff] transition">Chat</a>
          <a href="#" className="text-[#e6f6ff] hover:text-[#00f2ff] transition">About</a>
        </div>
      </nav>

      {/* Chat Box */}
      <div className="flex flex-col flex-1 mt-16 p-6">
        <div className="flex-1 overflow-y-auto p-4 bg-[#0a0a2a]/80 border-2 border-[#00f2ff] rounded-xl shadow-lg">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-[70%] ${message.role === 'user' ? 'bg-[#00f2ff] text-[#0a0a2a]' : 'bg-[#0a0a2a] text-[#e6f6ff] border border-[#00f2ff]'}`}>
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && <p className="text-center text-[#e6f6ff]">JARVIS is thinking...</p>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-3 rounded-lg bg-[#0a0a2a] border border-[#00f2ff] text-[#e6f6ff]"
            placeholder="Type a message..."
            disabled={isLoading}
          />
          <button type="submit" className="p-3 bg-[#00f2ff] text-[#0a0a2a] rounded-lg">
            <FiSend size={20} />
          </button>
          <button type="button" onClick={toggleRecording} className="p-3 bg-[#ff00ff] text-[#0a0a2a] rounded-lg">
            {isRecording ? <FiStopCircle size={20} /> : <FiMic size={20} />}
          </button>
          <button type="button" onClick={clearChat} className="p-3 bg-[#ffd700] text-[#0a0a2a] rounded-lg">
            <FiRefreshCw size={20} />
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer className="p-4 mt-auto bg-[#0a0a2a]/90 border-t border-[#00f2ff] flex justify-between">
        <p className="text-[#e6f6ff]">© 2025 J.A.R.V.I.S AI</p>
        <div className="flex gap-4">
          <a href="https://github.com/your-github" target="_blank" className="text-[#00f2ff] hover:text-[#ff00ff]">
            <FaGithub size={20} />
          </a>
          <a href="https://linkedin.com/in/your-profile" target="_blank" className="text-[#00f2ff] hover:text-[#ff00ff]">
            <FaLinkedin size={20} />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
