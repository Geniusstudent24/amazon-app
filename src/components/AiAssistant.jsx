import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hello! Main Meet ke Amazon Clone ka official assistant hoon. Main aapki kya madad kar sakta hoon?",
    },
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const formattedHistory = messages.slice(1).map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));

      const response = await axios.post(
        "https://amazon-app-mid8.onrender.com/api/chat",
        {
          message: userMessage,
          history: formattedHistory,
        },
        { withCredentials: true }
      );

      if (response.data && response.data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "model", text: response.data.reply },
        ]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Maaf kijiye, server se connect karne mein dikkat aa rahi hai. Baad mein try karein.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-[60px] height-[60px] h-[60px] rounded-full bg-[#232f3e] color-[#febd69] text-[#febd69] border-none shadow-lg cursor-pointer flex items-center justify-center text-2xl transition-transform duration-200 hover:scale-105"
        >
          <i className="fas fa-comments"></i>
        </button>
      )}

      <div
        className={`${
          isOpen ? "flex" : "hidden"
        } flex-col w-[360px] h-[480px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200`}
      >
        <div className="bg-[#232f3e] text-white p-4 flex justify-between items-center border-b border-[#131921]">
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#2ed573]"></div>
            <span className="font-bold text-base text-[#febd69]">Amazon Assistant</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="background-none border-none text-white cursor-pointer text-lg hover:text-gray-300"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-[#f3f3f3] flex flex-col gap-3">
          {messages.map((msg, index) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={index}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] p-2.5 px-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                    isUser
                      ? "bg-[#febd69] text-[#111111] rounded-tr-none"
                      : "bg-white text-[#333333] rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-500 p-2.5 px-3.5 rounded-2xl rounded-tl-none text-sm shadow-sm flex items-center gap-1.5">
                <i className="fas fa-spinner fa-spin"></i> Typing...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="flex p-2.5 bg-white border-t border-gray-200 gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1 p-2.5 px-4 rounded-full border border-gray-300 outline-none text-sm focus:border-gray-400 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#febd69] border-none text-[#111111] w-[38px] h-[38px] rounded-full cursor-pointer flex items-center justify-center text-base transition-colors duration-200 hover:bg-[#f3a847] disabled:bg-gray-200"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  );
}

export default AiAssistant;