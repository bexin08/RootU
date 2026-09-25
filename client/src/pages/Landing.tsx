import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-blue-600 mb-6">RootU</h1>
        <p className="text-xl text-gray-700 mb-8">Your Agentic Campus Relocation & Local-Life Copilot.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/login" className="px-6 py-3 rounded-lg bg-white text-blue-600 font-semibold shadow hover:bg-gray-50">Log In</Link>
          <Link to="/signup" className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
