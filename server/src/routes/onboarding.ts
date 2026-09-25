import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { genAI, MODELS, systemInstruction } from "../lib/gemini";
import { OnboardingExtractionSchema } from "../schemas";
import { z } from "zod";

const router = Router();

router.post("/message", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Missing content" });
    }

    // 1. Fetch user's profile to see what's missing
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileErr || !profile) {
      return res.status(500).json({ error: "Profile not found" });
    }

    // Determine missing fields (required fields only for completion, but try to collect all if possible, prompt rules say capture whatever is not yet had)
    const requiredFields = ["full_name", "origin_city", "destination_city", "university", "major", "program_level"];
    const allFields = [...requiredFields, "dietary_preferences", "move_in_date", "housing_type"];
    
    const knownFields: Record<string, any> = {};
    const missingFields: string[] = [];
    
    for (const f of allFields) {
      if (profile[f] && (Array.isArray(profile[f]) ? profile[f].length > 0 : true)) {
        knownFields[f] = profile[f];
      } else {
        missingFields.push(f);
      }
    }

    // 2. Fetch or create onboarding conversation
    let { data: conv } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("user_id", userId)
      .eq("type", "onboarding")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!conv) {
      const { data: newConv, error: convErr } = await supabaseAdmin
        .from("conversations")
        .insert({ user_id: userId, type: "onboarding", title: "Onboarding" })
        .select()
        .single();
      if (convErr) throw convErr;
      conv = newConv;
    }

    // 3. Save user message
    await supabaseAdmin.from("messages").insert({
      conversation_id: conv!.id,
      user_id: userId,
      role: "user",
      content
    });

    // 4. Get recent conversation transcript
    const { data: history } = await supabaseAdmin
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conv!.id)
      .order("created_at", { ascending: true })
      .limit(20);

    const transcript = history?.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n") || "";

    // 5. Call Gemini
    const prompt = `
Conversation so far:
${transcript}

Fields already confirmed: ${JSON.stringify(knownFields)}
Fields still missing: ${missingFields.join(", ")}

Extract any of the missing fields the student just provided, and write the next thing to say to them (one short, friendly message asking for the next missing field, or a wrap-up message if nothing is missing).
    `;

    const response = await genAI.models.generateContent({
      model: MODELS.chat,
      contents: [
        { role: "user", parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            extracted_fields: {
              type: "OBJECT",
              properties: {
                full_name: { type: "STRING", nullable: true },
                origin_city: { type: "STRING", nullable: true },
                destination_city: { type: "STRING", nullable: true },
                university: { type: "STRING", nullable: true },
                major: { type: "STRING", nullable: true },
                program_level: { type: "STRING", enum: ["undergraduate","postgraduate","diploma","other"], nullable: true },
                dietary_preferences: { type: "ARRAY", items: { type: "STRING" }, nullable: true },
                move_in_date: { type: "STRING", nullable: true },
                housing_type: { type: "STRING", enum: ["hostel","pg","apartment","other"], nullable: true }
              }
            },
            assistant_reply: { type: "STRING" },
            onboarding_complete: { type: "BOOLEAN" }
          },
          required: ["extracted_fields", "assistant_reply", "onboarding_complete"]
        } as any,
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error("No response from Gemini");
    
    const parsed = JSON.parse(responseText);
    const validated = OnboardingExtractionSchema.parse(parsed);

    // 6. Update profile with extracted fields
    let onboardingComplete = validated.onboarding_complete;
    
    if (validated.extracted_fields && Object.keys(validated.extracted_fields).length > 0) {
      const updates: any = {};
      for (const [k, v] of Object.entries(validated.extracted_fields)) {
        if (v !== null && v !== undefined) updates[k] = v;
      }
      
      // Re-evaluate if complete based on required fields
      const updatedProfile = { ...profile, ...updates };
      const nowMissing = requiredFields.filter(f => !updatedProfile[f] || (Array.isArray(updatedProfile[f]) && updatedProfile[f].length === 0));
      if (nowMissing.length === 0) {
        onboardingComplete = true;
      }

      updates.onboarding_completed = onboardingComplete;
      
      await supabaseAdmin.from("profiles").update(updates).eq("id", userId);
    } else if (onboardingComplete && !profile.onboarding_completed) {
       await supabaseAdmin.from("profiles").update({ onboarding_completed: true }).eq("id", userId);
    }

    // 7. Save assistant message
    await supabaseAdmin.from("messages").insert({
      conversation_id: conv!.id,
      user_id: userId,
      role: "assistant",
      content: validated.assistant_reply,
      extracted_entities: validated.extracted_fields
    });

    res.json({
      reply: validated.assistant_reply,
      onboarding_complete: onboardingComplete,
      extracted_fields: validated.extracted_fields
    });
  } catch (err) {
    console.error("Onboarding message error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
