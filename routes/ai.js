/**
 * AI Career Routes
 * Robust handler for n8n AI responses (JSON OR plain text)
 */

import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

router.post("/career", async (req, res) => {
  try {
    console.log("📥 POST /api/ai/career");

    const { email } = req.body;

    // 1️⃣ Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    // 2️⃣ Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({
        success: false,
        error: "Profile not found",
      });
    }

    // 3️⃣ Validate profile fields
    const requiredFields = ["branch", "year", "interest", "daily_time"];
    for (const field of requiredFields) {
      if (!profile[field] && profile[field] !== 0) {
        return res.status(400).json({
          success: false,
          error: "Profile is incomplete. Please update your profile.",
        });
      }
    }

    // 4️⃣ Prepare payload for n8n
    const payload = {
      email: profile.email,
      branch: profile.branch,
      year: profile.year,
      interest: profile.interest,
      daily_time: profile.daily_time,
      current_status: profile.progress_status || "not_started",
    };

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      return res.status(500).json({
        success: false,
        error: "N8N_WEBHOOK_URL not configured",
      });
    }

    // 5️⃣ Call n8n
    const n8nRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!n8nRes.ok) {
      const errorText = await n8nRes.text();
      console.error("❌ n8n error:", errorText);
      return res.status(502).json({
        success: false,
        error: "AI service failed",
      });
    }

    // 6️⃣ READ RESPONSE AS TEXT (IMPORTANT)
    const rawText = await n8nRes.text();

    if (!rawText || rawText.trim() === "") {
      return res.status(502).json({
        success: false,
        error: "AI returned empty response",
      });
    }

    console.log("📥 Raw AI response preview:", rawText.slice(0, 200));

    // 7️⃣ Try JSON → fallback to text
    let roadmap = "";
    let careerPath = "Recommended Career Path";
    let message = "";

    try {
      const parsed = JSON.parse(rawText);
      roadmap =
        parsed.roadmap ||
        parsed.roadmap_text ||
        parsed.result ||
        "";
      careerPath = parsed.career_path || careerPath;
      message = parsed.message || "";
    } catch {
      // 🟢 Plain text / markdown response (MOST COMMON)
      roadmap = rawText;
    }

    if (!roadmap || roadmap.trim() === "") {
      return res.status(502).json({
        success: false,
        error: "AI roadmap missing",
      });
    }

    // 8️⃣ Save roadmap (non-blocking)
    await supabase
      .from("user_profiles")
      .update({
        career_path: careerPath,
        roadmap,
        progress_status: "in_progress",
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);

    // 9️⃣ Return clean JSON to frontend
    return res.json({
      success: true,
      career_path: careerPath,
      roadmap,
      message,
    });
  } catch (err) {
    console.error("❌ AI career error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to get career recommendation",
    });
  }
});

export default router;
