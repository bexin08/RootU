import { Router } from "express";
import { requireCronSecret } from "../middleware/requireCronSecret";
import { generateBriefingsJob } from "../jobs/generateBriefings";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { embedText } from "../lib/embed";

const router = Router();

router.post("/cron/generate-briefings", requireCronSecret, async (req, res) => {
  try {
    await generateBriefingsJob();
    res.json({ success: true });
  } catch (err) {
    console.error("Cron job error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/knowledge", requireCronSecret, async (req, res) => {
  try {
    const { city, category, title, content, source } = req.body;
    
    if (!city || !category || !title || !content) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const embedding = await embedText(content);

    const { data, error } = await supabaseAdmin.from("local_knowledge").insert({
      city, category, title, content, source, embedding
    }).select().single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
