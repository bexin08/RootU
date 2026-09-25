import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { fetchApi } from "../lib/apiClient";

export default function Settings() {
  const [prefs, setPrefs] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchApi("/preferences").then(setPrefs).catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchApi("/preferences", {
        method: "PUT",
        body: JSON.stringify({
          commute_mode: prefs.commute_mode,
          briefing_time: prefs.briefing_time,
          weather_alert_threshold: prefs.weather_alert_threshold,
          traffic_check_enabled: prefs.traffic_check_enabled,
          notify_in_app: prefs.notify_in_app,
          notify_email: prefs.notify_email
        })
      });
      alert("Settings updated!");
    } catch (err) {
      alert("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  if (!prefs) return <Layout><div className="p-8 text-center">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Advisory Settings</h1>
        <form onSubmit={handleSave} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commute Mode</label>
            <select className="w-full p-2 border rounded" value={prefs.commute_mode} onChange={e => setPrefs({...prefs, commute_mode: e.target.value})}>
              <option value="bus">Bus</option>
              <option value="auto">Auto</option>
              <option value="walk">Walk</option>
              <option value="bike">Bike</option>
              <option value="own_vehicle">Own Vehicle</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Briefing Time</label>
            <input type="time" className="w-full p-2 border rounded" value={prefs.briefing_time} onChange={e => setPrefs({...prefs, briefing_time: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weather Alert Threshold</label>
            <select className="w-full p-2 border rounded" value={prefs.weather_alert_threshold} onChange={e => setPrefs({...prefs, weather_alert_threshold: e.target.value})}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" id="traffic" checked={prefs.traffic_check_enabled} onChange={e => setPrefs({...prefs, traffic_check_enabled: e.target.checked})} />
            <label htmlFor="traffic">Enable Traffic Checks</label>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="notify" checked={prefs.notify_in_app} onChange={e => setPrefs({...prefs, notify_in_app: e.target.checked})} />
            <label htmlFor="notify">In-App Notifications</label>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="email" checked={prefs.notify_email} onChange={e => setPrefs({...prefs, notify_email: e.target.checked})} />
            <label htmlFor="email">Email Notifications</label>
          </div>

          <div className="pt-4 border-t">
            <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
