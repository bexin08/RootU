import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { fetchApi } from "../lib/apiClient";

export default function Explore() {
  const [items, setItems] = useState<any[]>([]);
  const [category, setCategory] = useState<string>("");

  useEffect(() => {
    fetchApi(`/local/search${category ? `?category=${category}` : ''}`)
      .then(setItems)
      .catch(console.error);
  }, [category]);

  return (
    <Layout>
      <div className="p-10 max-w-7xl mx-auto animate-fade-in flex flex-col h-screen">
        <header className="mb-8 flex-shrink-0">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Explore the City</h1>
          <p className="text-slate-500 mt-2 text-lg">Discover local transit, food, and culture spots.</p>
        </header>
        
        <div className="flex gap-3 mb-8 overflow-x-auto pb-4 flex-shrink-0 scrollbar-hide">
          {['', 'transit', 'food', 'housing', 'community_culture', 'health_emergency', 'academic'].map(cat => (
            <button 
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-2.5 rounded-full whitespace-nowrap font-medium transition-all duration-300 ${
                category === cat 
                  ? 'bg-slate-900 text-white shadow-md transform scale-[1.02]' 
                  : 'bg-white text-slate-600 border border-slate-200/60 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
              }`}
            >
              {cat === '' ? 'All Categories' : cat.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 flex-1 min-h-0 pb-10">
          <div className="lg:col-span-2 overflow-y-auto space-y-4 pr-2">
            {items.map((item, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg shadow-slate-200/40 border border-slate-100 transition-transform hover:-translate-y-1 hover:shadow-xl duration-300">
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">{item.category.replace('_', ' ')}</span>
                <h3 className="font-bold text-slate-900 text-xl mt-3">{item.title}</h3>
                <p className="text-slate-600 mt-2 leading-relaxed">{item.content}</p>
              </div>
            ))}
            {items.length === 0 && (
              <div className="bg-white/60 p-8 rounded-2xl border border-slate-200 border-dashed text-center text-slate-500">
                No local insights found for this category.
              </div>
            )}
          </div>
          
          <div className="lg:col-span-3 bg-white/50 p-2 rounded-3xl h-[600px] lg:h-auto lg:flex-1 relative shadow-inner border border-slate-200/60 overflow-hidden">
            <div className="absolute inset-2 w-[calc(100%-1rem)] h-[calc(100%-1rem)] rounded-2xl shadow-md overflow-hidden pointer-events-none">
              <iframe 
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d124424.36398910813!2d74.79379659021206!3d12.923101569766922!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba35a4c37bf488f%3A0x827bbc7a74fcfe64!2sMangaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1714545233663!5m2!1sen!2sin"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
