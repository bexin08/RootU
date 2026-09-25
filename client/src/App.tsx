import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Schedule from "./pages/Schedule";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data);
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const requireAuth = (Component: React.FC) => {
    if (!session) return <Navigate to="/login" />;
    return <Component />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={session ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={session ? <Navigate to="/dashboard" /> : <Signup />} />
        
        <Route path="/dashboard" element={requireAuth(Dashboard)} />
        <Route path="/chat" element={requireAuth(Chat)} />
        <Route path="/schedule" element={requireAuth(Schedule)} />
        <Route path="/explore" element={requireAuth(Explore)} />
        <Route path="/profile" element={requireAuth(Profile)} />
        <Route path="/settings" element={requireAuth(Settings)} />
        
        <Route path="*" element={<div className="p-8">404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
