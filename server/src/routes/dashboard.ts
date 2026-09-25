import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { genAI, MODELS, systemInstruction } from "../lib/gemini";
import { DailyBriefingSchema } from "../schemas";

const router = Router();

router.get("/briefing", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    
    // Check if we have today's briefing
    const today = new Date().toISOString().split('T')[0];
    const { data: briefing, error } = await supabaseAdmin
      .from("daily_briefings")
      .select("*")
      .eq("user_id", userId)
      .eq("briefing_date", today)
      .single();

    if (briefing && !error) {
      return res.json(briefing);
    }

    // Generate on demand if missing
    // Get profile and preferences
    const { data: profile } = await supabaseAdmin.from("profiles").select("*").eq("id", userId).single();
    const { data: prefs } = await supabaseAdmin.from("user_preferences").select("*").eq("user_id", userId).single();
    
    // Get today's schedule
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);
    
    const { data: events } = await supabaseAdmin
      .from("schedule_events")
      .select("*")
      .eq("user_id", userId)
      .gte("start_time", startOfDay.toISOString())
      .lte("start_time", endOfDay.toISOString());

    // Mock weather and traffic for on-demand generation
    // In a real app we'd call OpenWeatherMap and Google Maps API here
    const weatherSnapshot = { condition: "Clear", temp: "25C", alert: false };
    const trafficSnapshot = { status: "Normal", delay_minutes: 0 };

    const prompt = `
Student: ${profile?.full_name}, ${profile?.major} at ${profile?.university}.
Commute mode: ${prefs?.commute_mode}.
Today's schedule: ${JSON.stringify(events)}
Weather snapshot: ${JSON.stringify(weatherSnapshot)}
Traffic/commute snapshot: ${JSON.stringify(trafficSnapshot)}

Write one short morning briefing. Call out anything that should change the student's normal routine today (leave earlier, bring an umbrella, a class moved location) — only if the data actually supports it. If nothing is unusual, say so briefly and positively.
`;

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

    const { data: newBriefing, error: insertErr } = await supabaseAdmin.from("daily_briefings").insert({
      user_id: userId,
      briefing_date: today,
      headline: validated.headline,
      content: validated.content,
      weather_snapshot: weatherSnapshot,
      traffic_snapshot: trafficSnapshot,
      schedule_snapshot: events
    }).select().single();

    if (insertErr) throw insertErr;

    res.json(newBriefing);
  } catch (err) {
    console.error("Dashboard briefing error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
