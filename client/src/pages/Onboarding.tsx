import { useState, useRef, useEffect } from "react";
import { fetchApi } from "../lib/apiClient";

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string}[]>([
    { role: 'assistant', content: "Hi! I'm RootU. Let's get you set up. What's your full name?" }
  ]);
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
      const data = await fetchApi("/onboarding/message", {
        method: "POST",
        body: JSON.stringify({ content: userMessage.content })
      });

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      if (data.onboarding_complete) {
        setTimeout(onComplete, 1500); // Wait a bit then refresh profile
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had an error processing that. Could you repeat?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Onboarding</h1>
      <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 rounded-lg p-4 shadow-inner">
        {messages.map((m, i) => (
          <div key={i} className={`mb-4 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-xl max-w-[80%] ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-800'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-gray-500 italic">Typing...</div>}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          className="flex-1 p-3 border rounded-lg"
          placeholder="Type your answer..."
        />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 rounded-lg font-semibold disabled:opacity-50">
          Send
        </button>
      </form>
    </div>
  );
}
