import { supabaseAdmin } from "../lib/supabaseAdmin";
import { genAI, MODELS, systemInstruction } from "../lib/gemini";
import { DailyBriefingSchema } from "../schemas";

export async function generateBriefingsJob() {
  const today = new Date().toISOString().split('T')[0];
  
  // Find users who have completed onboarding
  const { data: users, error } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, major, university")
    .eq("onboarding_completed", true);

  if (error || !users) return;

  for (const user of users) {
    // Check if already generated
    const { data: existing } = await supabaseAdmin
      .from("daily_briefings")
      .select("id")
      .eq("user_id", user.id)
      .eq("briefing_date", today)
      .single();
      
    if (existing) continue;

    const { data: prefs } = await supabaseAdmin.from("user_preferences").select("*").eq("user_id", user.id).single();
    
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);
    
    const { data: events } = await supabaseAdmin
      .from("schedule_events")
      .select("*")
      .eq("user_id", user.id)
      .gte("start_time", startOfDay.toISOString())
      .lte("start_time", endOfDay.toISOString());

    const weatherSnapshot = { condition: "Clear", temp: "25C", alert: false };
    const trafficSnapshot = { status: "Normal", delay_minutes: 0 };

    const prompt = `
Student: ${user.full_name}, ${user.major} at ${user.university}.
Commute mode: ${prefs?.commute_mode}.
Today's schedule: ${JSON.stringify(events)}
Weather snapshot: ${JSON.stringify(weatherSnapshot)}
Traffic/commute snapshot: ${JSON.stringify(trafficSnapshot)}

Write one short morning briefing. Call out anything that should change the student's normal routine today (leave earlier, bring an umbrella, a class moved location) — only if the data actually supports it. If nothing is unusual, say so briefly and positively.
`;

    try {
      const response = await genAI.models.generateContent({
        model: MODELS.background,
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              headline: { type: "STRING" },
              content: { type: "STRING" },
              weather_alert: { type: "BOOLEAN" },
              traffic_alert: { type: "BOOLEAN" },
              recommended_action: { type: "STRING", nullable: true }
            },
            required: ["headline", "content", "weather_alert", "traffic_alert"]
          } as any,
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      const validated = DailyBriefingSchema.parse(parsed);

      await supabaseAdmin.from("daily_briefings").insert({
        user_id: user.id,
        briefing_date: today,
        headline: validated.headline,
        content: validated.content,
        weather_snapshot: weatherSnapshot,
        traffic_snapshot: trafficSnapshot,
        schedule_snapshot: events
      });
    } catch (err) {
      console.error(`Error generating briefing for ${user.id}:`, err);
    }
  }
}
