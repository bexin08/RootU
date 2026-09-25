import { Link, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { LogOut, Home, MessageSquare, Calendar, Map, User, Settings as SettingsIcon } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const path = location.pathname;

  const NavItem = ({ to, icon: Icon, label }: any) => {
    const active = path.startsWith(to);
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ease-out ${
          active 
            ? "bg-slate-900 text-white shadow-md transform scale-[1.02]" 
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <Icon size={20} className={active ? "text-blue-400" : "text-slate-400"} />
        <span className="font-medium text-sm">{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="w-72 bg-white/70 backdrop-blur-xl border-r border-slate-200/60 flex flex-col shadow-sm relative z-10">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-bold text-lg leading-none">R</span>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">RootU</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">CAMPUS COPILOT</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <NavItem to="/dashboard" icon={Home} label="Dashboard" />
          <NavItem to="/chat" icon={MessageSquare} label="Local Insider" />
          <NavItem to="/schedule" icon={Calendar} label="Schedule" />
          <NavItem to="/explore" icon={Map} label="Explore" />
          
          <div className="pt-6 pb-2">
            <div className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Account</div>
          </div>
          <NavItem to="/profile" icon={User} label="Profile" />
          <NavItem to="/settings" icon={SettingsIcon} label="Settings" />
        </nav>
        
        <div className="p-4 border-t border-slate-100 bg-white/50">
          <button 
            onClick={() => supabase.auth.signOut()} 
            className="flex items-center gap-3 w-full p-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors duration-200 group"
          >
            <LogOut size={20} className="group-hover:text-red-500 transition-colors" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto relative animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-violet-50/50 pointer-events-none -z-10" />
        {children}
      </div>
    </div>
  );
}
