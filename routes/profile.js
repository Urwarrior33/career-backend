/**
 * Profile Routes
 * 
 * Handles user profile creation and retrieval.
 * POST /api/profile - Create or update user profile
 */

import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * POST /api/profile
 * Create or update a user profile
 * 
 * Expected request body:
 * {
 *   email: "student@example.com",
 *   branch: "CSE",
 *   year: 2,
 *   interest: "Web Dev",
 *   daily_time: 45
 * }
 */
router.post('/', async (req, res) => {
  try {
    const { email, branch, year, interest, daily_time } = req.body;

    // Validation
    if (!email || !branch || !year || !interest || !daily_time) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, branch, year, interest, daily_time' 
      });
    }

    // Validate branch
    const validBranches = ['CSE', 'IT', 'Other'];
    if (!validBranches.includes(branch)) {
      return res.status(400).json({ error: 'Invalid branch. Must be CSE, IT, or Other' });
    }

    // Validate year
    if (year < 1 || year > 4) {
      return res.status(400).json({ error: 'Year must be between 1 and 4' });
    }

    // Validate interest
    const validInterests = ['Web Dev', 'Data', 'AI', 'Govt', 'Software Engineering', 'Cybersecurity', 'Cloud Computing', 'DevOps Engineering', 'Mobile App Development'];
    if (!validInterests.includes(interest)) {
      return res.status(400).json({ error: 'Invalid interest. Must be one of: Web Dev, Data, AI, Govt, Software Engineering, Cybersecurity, Cloud Computing, DevOps Engineering, Mobile App Development' });
    }

    // Validate daily_time
    if (daily_time < 30 || daily_time > 60) {
      return res.status(400).json({ error: 'Daily study time must be between 30 and 60 minutes' });
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single();

    let result;

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          branch,
          year,
          interest,
          daily_time,
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          email,
          branch,
          year,
          interest,
          daily_time,
          progress_status: 'not_started'
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    res.status(200).json({
      message: existingProfile ? 'Profile updated successfully' : 'Profile created successfully',
      profile: result
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to save profile', details: error.message });
  }
});

/**
 * GET /api/profile/:email
 * Get user profile by email
 */
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Profile not found' });
      }
      throw error;
    }

    res.json({ profile: data });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
  }
});

export default router;
