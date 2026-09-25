import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { fetchApi } from "../lib/apiClient";

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchApi("/preferences/profile").then(setProfile).catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchApi("/preferences/profile", {
        method: "PUT",
        body: JSON.stringify(profile)
      });
      alert("Profile updated!");
    } catch (err) {
      alert("Error saving profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <Layout><div className="p-8 text-center">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="p-10 max-w-3xl mx-auto animate-fade-in">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Your Profile</h1>
          <p className="text-slate-500 mt-2 text-lg">Manage your academic and relocation details.</p>
        </header>

        <form onSubmit={handleSave} className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100/60 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 tracking-wide">Full Name</label>
              <input type="text" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-800" value={profile.full_name || ''} onChange={e => setProfile({...profile, full_name: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 tracking-wide">Program Level</label>
              <select className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-800" value={profile.program_level || ''} onChange={e => setProfile({...profile, program_level: e.target.value})}>
                <option value="">Select...</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="postgraduate">Postgraduate</option>
                <option value="diploma">Diploma</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 tracking-wide">Origin City</label>
              <input type="text" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-800" value={profile.origin_city || ''} onChange={e => setProfile({...profile, origin_city: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 tracking-wide">Destination City</label>
              <input type="text" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-800" value={profile.destination_city || ''} onChange={e => setProfile({...profile, destination_city: e.target.value})} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 tracking-wide">University</label>
              <input type="text" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-800" value={profile.university || ''} onChange={e => setProfile({...profile, university: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 tracking-wide">Major</label>
              <input type="text" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-800" value={profile.major || ''} onChange={e => setProfile({...profile, major: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 tracking-wide">Housing Type</label>
              <select className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-800" value={profile.housing_type || ''} onChange={e => setProfile({...profile, housing_type: e.target.value})}>
                <option value="">Select...</option>
                <option value="hostel">Hostel</option>
                <option value="pg">PG</option>
                <option value="apartment">Apartment</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-100 flex justify-end">
            <button type="submit" disabled={saving} className="bg-gradient-to-tr from-blue-600 to-violet-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
