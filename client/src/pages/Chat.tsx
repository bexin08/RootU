import { useState, useRef, useEffect } from "react";
import Layout from "../components/Layout";
import { fetchApi } from "../lib/apiClient";

export default function Chat() {
  const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string, sources?: string[]}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const data = await fetchApi("/chat/message", {
        method: "POST",
        body: JSON.stringify({ content: userMessage.content })
      });

      setMessages(prev => [...prev, { role: 'assistant', content: data.answer, sources: data.sources }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had an error processing that." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-screen max-w-4xl mx-auto px-4 py-8 relative">
        <header className="mb-6 flex-shrink-0">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Local Insider</h1>
          <p className="text-slate-500 mt-1">Ask anything about your new city.</p>
        </header>

        <div className="flex-1 overflow-y-auto mb-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-200/50 p-6 border border-slate-100/60 relative">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-700">How can I help?</h3>
              <p className="text-slate-400 max-w-sm">Ask about transit, local food, housing customs, or any unwritten rules of your campus.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`mb-8 flex flex-col animate-fade-in ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-4 rounded-2xl max-w-[85%] text-[15px] leading-relaxed shadow-sm ${
                m.role === 'user' 
                  ? 'bg-gradient-to-tr from-blue-600 to-violet-600 text-white rounded-br-sm' 
                  : 'bg-slate-100 text-slate-800 rounded-bl-sm border border-slate-200/60'
              }`}>
                {m.content}
              </div>
              {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 max-w-[85%] pl-2">
                  {m.sources.map((s, idx) => (
                    <span key={idx} className="text-[11px] font-semibold tracking-wider uppercase bg-blue-50 border border-blue-100 text-blue-600 px-2.5 py-1 rounded-full shadow-sm">
                      Source: {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-2 p-4 max-w-[85%] bg-slate-100 rounded-2xl rounded-bl-sm w-24 shadow-sm animate-fade-in items-center justify-center">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
            </div>
          )}
          <div ref={bottomRef} className="h-4" />
        </div>
        
        <form onSubmit={handleSend} className="flex gap-3 flex-shrink-0 animate-fade-in">
          <input 
            type="text" 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            className="flex-1 p-4 border-2 border-slate-200 rounded-2xl bg-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none text-slate-800 text-lg"
            placeholder="Type your question..."
          />
          <button type="submit" disabled={loading} className="bg-gradient-to-tr from-blue-600 to-violet-600 text-white px-8 rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none">
            Send
          </button>
        </form>
      </div>
    </Layout>
  );
}
