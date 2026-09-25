import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Log In to RootU</h2>
        <input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4" 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-6" 
          required 
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-semibold hover:bg-blue-700">
          Log In
        </button>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/signup" className="text-blue-600">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}
