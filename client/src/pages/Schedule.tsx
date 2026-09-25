import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { fetchApi } from "../lib/apiClient";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function Schedule() {
  const [events, setEvents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("class");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [saving, setSaving] = useState(false);

  const loadEvents = () => {
    fetchApi("/schedule")
      .then(data => {
        const mapped = data.map((e: any) => ({
          id: e.id,
          title: e.title,
          start: e.start_time,
          end: e.end_time,
          extendedProps: { type: e.event_type, location: e.location }
        }));
        setEvents(mapped);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchApi("/schedule", {
        method: "POST",
        body: JSON.stringify({
          title,
          event_type: eventType,
          location,
          start_time: new Date(startTime).toISOString(),
          end_time: new Date(endTime).toISOString()
        })
      });
      setShowModal(false);
      setTitle("");
      setLocation("");
      setStartTime("");
      setEndTime("");
      loadEvents();
    } catch (err) {
      alert("Error adding event");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="p-10 max-w-6xl mx-auto animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Academic Schedule</h1>
            <p className="text-slate-500 mt-2 text-lg">Manage your classes, labs, and exams.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="mt-4 sm:mt-0 bg-gradient-to-tr from-blue-600 to-violet-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all"
          >
            + Add Event
          </button>
        </div>
        
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100/60">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            height="auto"
            slotMinTime="07:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={false}
          />
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Add Schedule Event</h2>
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Event Type</label>
                  <select value={eventType} onChange={e => setEventType(e.target.value)} className="w-full p-2 border rounded">
                    <option value="class">Class</option>
                    <option value="lab">Lab</option>
                    <option value="exam">Exam</option>
                    <option value="assignment_due">Assignment Due</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input type="datetime-local" required value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input type="datetime-local" required value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full p-2 border rounded" />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50">
                    Save Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
