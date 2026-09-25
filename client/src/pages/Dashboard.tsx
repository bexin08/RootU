import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { fetchApi } from "../lib/apiClient";

export default function Dashboard() {
  const [briefing, setBriefing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi("/dashboard/briefing")
      .then(data => {
        setBriefing(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  return (
    <Layout>
      <div className="p-10 max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Good Morning!</h1>
          <p className="text-slate-500 mt-2 text-lg">Here's your campus brief for today.</p>
        </header>
        
        {loading ? (
          <div className="animate-pulse bg-white/80 backdrop-blur p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          </div>
        ) : briefing ? (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-200/50">
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-violet-500 rounded-l-3xl"></div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">{briefing.headline}</h2>
              <p className="text-slate-600 text-lg leading-relaxed">{briefing.content}</p>
              
              <div className="mt-6 flex flex-wrap gap-3">
                {briefing.weather_alert && (
                  <span className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide border border-orange-100 shadow-sm">
                    ⚠️ Weather Alert
                  </span>
                )}
                {briefing.traffic_alert && (
                  <span className="bg-rose-50 text-rose-600 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide border border-rose-100 shadow-sm">
                    🚗 Traffic Alert
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-100 transition-transform hover:-translate-y-1 hover:shadow-xl duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">Today's Schedule</h3>
                </div>
                {briefing.schedule_snapshot?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                    <p>No events today. Enjoy your free time!</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {briefing.schedule_snapshot?.map((ev: any, i: number) => (
                      <li key={i} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                        <div>
                          <span className="font-semibold text-slate-800 block">{ev.title}</span>
                          {ev.location && <span className="text-xs text-slate-500 mt-1 block">{ev.location}</span>}
                        </div>
                        <span className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1.5 rounded-full">
                          {new Date(ev.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-blue-600 to-violet-600 p-8 rounded-3xl shadow-lg shadow-blue-500/30 text-white transition-transform hover:-translate-y-1 hover:shadow-blue-500/40 duration-300">
                  <h3 className="font-semibold text-blue-100 uppercase tracking-wider text-sm mb-4">Weather Snapshot</h3>
                  <div className="flex items-end gap-4">
                    <span className="text-5xl font-black">{briefing.weather_snapshot?.temp}</span>
                    <span className="text-xl text-blue-100 mb-1">{briefing.weather_snapshot?.condition}</span>
                  </div>
                </div>
                
                <div className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-100 transition-transform hover:-translate-y-1 hover:shadow-xl duration-300">
                  <h3 className="font-semibold text-slate-400 uppercase tracking-wider text-sm mb-4">Commute Status</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-slate-800">{briefing.traffic_snapshot?.status}</div>
                    {briefing.traffic_snapshot?.delay_minutes > 0 ? (
                      <div className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm font-bold">
                        +{briefing.traffic_snapshot.delay_minutes} min delay
                      </div>
                    ) : (
                      <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
                        On Time
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-3xl shadow-sm text-slate-500 text-center">
            Could not load your briefing for today.
          </div>
        )}
      </div>
    </Layout>
  );
}
