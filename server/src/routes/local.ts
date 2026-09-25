import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { supabaseAdmin } from "../lib/supabaseAdmin";

const router = Router();

router.get("/search", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { category } = req.query;
    
    // Get user's city
    const { data: profile } = await supabaseAdmin.from("profiles").select("destination_city").eq("id", req.userId!).single();
    
    let query = supabaseAdmin
      .from("local_knowledge")
      .select("*")
      .eq("city", profile?.destination_city || "Unknown City");
      
    if (category) {
      query = query.eq("category", category);
    }
    
    const { data, error } = await query.limit(20);
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
