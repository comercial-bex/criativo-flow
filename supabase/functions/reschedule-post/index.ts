import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Utility to check if date is in the past (timezone America/Belem)
const isPastDate = (dateString: string): boolean => {
  const targetDate = new Date(dateString);
  const now = new Date();
  
  // Convert to America/Belem timezone (UTC-3)
  const belemOffset = -3 * 60; // minutes
  const belemNow = new Date(now.getTime() + (belemOffset * 60000));
  
  return targetDate < belemNow;
};

// Utility to get next available slot (30min intervals)
const getNextAvailableSlot = (date: string, posts: any[]): string => {
  const baseDate = new Date(date);
  const baseHour = 9; // Start at 9:00 AM
  const intervals = [9, 9.5, 10, 10.5, 11, 11.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18]; // Available time slots
  
  // Get existing times for this date
  const existingTimes = posts
    .filter(p => p.data_postagem === baseDate.toISOString().split('T')[0])
    .map(p => {
      const postDate = new Date(p.data_postagem + 'T' + (p.hora_postagem || '09:00') + ':00-03:00');
      return postDate.getHours() + (postDate.getMinutes() / 60);
    });
  
  // Find first available slot
  for (const interval of intervals) {
    if (!existingTimes.includes(interval)) {
      const hours = Math.floor(interval);
      const minutes = (interval % 1) * 60;
      return `${baseDate.toISOString().split('T')[0]}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00-03:00`;
    }
  }
  
  // If all slots taken, return last slot + 30min
  return `${baseDate.toISOString().split('T')[0]}T18:30:00-03:00`;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const postId = pathParts[pathParts.length - 2]; // Get post ID from URL

    if (req.method !== 'PATCH') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { scheduled_date } = await req.json();

    if (!scheduled_date) {
      return new Response(JSON.stringify({ error: 'scheduled_date is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get current post data
    const { data: currentPost, error: postError } = await supabase
      .from('posts_planejamento')
      .select('*')
      .eq('id', postId)
      .single();

    if (postError || !currentPost) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if post is published (can't reschedule)
    if (currentPost.status === 'published') {
      return new Response(JSON.stringify({ 
        code: 'PUBLISHED_LOCKED',
        error: 'Cannot reschedule published posts' 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if target date is in the past
    if (isPastDate(scheduled_date)) {
      return new Response(JSON.stringify({ 
        code: 'PAST_DATE',
        error: 'Cannot schedule posts in the past' 
      }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all posts for the planning to check conflicts
    const { data: allPosts, error: allPostsError } = await supabase
      .from('posts_planejamento')
      .select('*')
      .eq('planejamento_id', currentPost.planejamento_id);

    if (allPostsError) {
      console.error('Error fetching posts:', allPostsError);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for time conflicts (same date and time)
    const targetDate = new Date(scheduled_date);
    const targetDateStr = targetDate.toISOString().split('T')[0];
    const targetTime = targetDate.toTimeString().split(' ')[0];

    const conflictingPost = allPosts?.find(p => 
      p.id !== postId &&
      p.data_postagem === targetDateStr &&
      p.hora_postagem === targetTime
    );

    if (conflictingPost) {
      const nextAvailable = getNextAvailableSlot(scheduled_date, allPosts || []);
      return new Response(JSON.stringify({ 
        code: 'SLOT_CONFLICT',
        error: 'Time slot already occupied',
        next_available: nextAvailable
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Store original data for audit
    const beforeData = {
      data_postagem: currentPost.data_postagem,
      hora_postagem: currentPost.hora_postagem || '09:00'
    };

    // Update the post
    const newDate = targetDate.toISOString().split('T')[0];
    const newTime = targetDate.toTimeString().split(' ')[0];

    const { data: updatedPost, error: updateError } = await supabase
      .from('posts_planejamento')
      .update({
        data_postagem: newDate,
        hora_postagem: newTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating post:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update post' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create audit log
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        post_id: postId,
        action: 'reschedule',
        before: beforeData,
        after: {
          data_postagem: newDate,
          hora_postagem: newTime
        },
        user_id: user.id
      });

    if (auditError) {
      console.error('Error creating audit log:', auditError);
      // Don't fail the request if audit fails, just log it
    }

    return new Response(JSON.stringify({
      id: updatedPost.id,
      scheduled_date: `${newDate}T${newTime}-03:00`,
      status: 'scheduled',
      message: 'Post rescheduled successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in reschedule-post function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});