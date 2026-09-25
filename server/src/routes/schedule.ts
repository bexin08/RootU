import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { ScheduleEventSchema } from "../schemas";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data: events, error } = await supabaseAdmin
      .from("schedule_events")
      .select("*")
      .eq("user_id", req.userId!);
    
    if (error) throw error;
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const validated = ScheduleEventSchema.parse(req.body);
    const { data: event, error } = await supabaseAdmin
      .from("schedule_events")
      .insert({
        user_id: req.userId!,
        ...validated
      })
      .select()
      .single();
    
    if (error) throw error;
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
});

router.put("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const validated = ScheduleEventSchema.parse(req.body);
    const { data: event, error } = await supabaseAdmin
      .from("schedule_events")
      .update(validated)
      .eq("id", req.params.id)
      .eq("user_id", req.userId!)
      .select()
      .single();
    
    if (error) throw error;
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin
      .from("schedule_events")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.userId!);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
