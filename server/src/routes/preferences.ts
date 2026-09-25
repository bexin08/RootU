import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { PreferencesSchema, ProfileSchema } from "../schemas";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data: prefs, error } = await supabaseAdmin
      .from("user_preferences")
      .select("*")
      .eq("user_id", req.userId!)
      .single();
    
    if (error) throw error;
    res.json(prefs);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const validated = PreferencesSchema.parse(req.body);
    const { data: prefs, error } = await supabaseAdmin
      .from("user_preferences")
      .update(validated)
      .eq("user_id", req.userId!)
      .select()
      .single();
    
    if (error) throw error;
    res.json(prefs);
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
});

router.get("/profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", req.userId!)
      .single();
    
    if (error) throw error;
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const validated = ProfileSchema.parse(req.body);
    const updates: any = { ...validated };
    for (const key in updates) {
      if (updates[key] === "") {
        updates[key] = null;
      }
    }
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .update(updates)
      .eq("id", req.userId!)
      .select()
      .single();
    
    if (error) throw error;
    res.json(profile);
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
});

export default router;
