/**
 * Progress Routes
 * 
 * Handles progress updates and agentic AI behavior.
 * POST /api/progress - Update user progress and get adjusted roadmap
 */

import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * POST /api/progress
 * Update user progress and get AI-adjusted roadmap
 * 
 * Expected request body:
 * {
 *   email: "student@example.com",
 *   month_completed: 1,  // or null if not completed
 *   is_completed: true   // true if completed, false if not
 * }
 * 
 * This endpoint:
 * 1. Updates progress status in database
 * 2. Sends progress data to n8n webhook
 * 3. Gets updated roadmap from AI agent
 * 4. Updates database with new roadmap
 * 5. Returns feedback and updated roadmap
 */
router.post('/', async (req, res) => {
  try {
    const { email, month_completed, is_completed } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Step 1: Fetch current profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Profile not found. Please create a profile first.' });
    }

    // Step 2: Prepare progress data for n8n
    const progressPayload = {
      email: profile.email,
      branch: profile.branch,
      year: profile.year,
      interest: profile.interest,
      daily_time: profile.daily_time,
      current_roadmap: profile.roadmap || '',
      month_completed: month_completed || null,
      is_completed: is_completed || false,
      progress_status: profile.progress_status || 'in_progress'
    };

    // Step 3: Send to n8n webhook for AI adjustment
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (!n8nWebhookUrl) {
      return res.status(500).json({ 
        error: 'n8n webhook URL not configured' 
      });
    }

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...progressPayload,
        action: 'progress_update' // Tell n8n this is a progress update
      })
    });

    if (!n8nResponse.ok) {
      throw new Error(`n8n webhook failed: ${n8nResponse.statusText}`);
    }

    const aiResponse = await n8nResponse.json();

    // Step 4: Extract AI response
    const updatedRoadmap = aiResponse.roadmap || aiResponse.roadmap_text || profile.roadmap;
    const feedbackMessage = aiResponse.message || aiResponse.feedback || 'Progress updated successfully';
    const newStatus = is_completed ? 'in_progress' : 'needs_help';

    // Step 5: Update database with new roadmap and status
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        roadmap: updatedRoadmap,
        progress_status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('email', email);

    if (updateError) {
      console.error('Failed to update profile:', updateError);
      // Continue anyway
    }

    // Step 6: Return response to frontend
    res.json({
      success: true,
      message: feedbackMessage,
      roadmap: updatedRoadmap,
      progress_status: newStatus,
      month_completed: month_completed
    });

  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({ 
      error: 'Failed to update progress', 
      details: error.message 
    });
  }
});

export default router;
