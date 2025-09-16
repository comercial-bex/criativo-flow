import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header is required')
    }

    // Parse request body
    const { postId, newDate, oldDate, userId } = await req.json()

    if (!postId || !newDate || !userId) {
      throw new Error('Missing required fields: postId, newDate, userId')
    }

    console.log('Rescheduling post:', { postId, newDate, oldDate, userId })

    // Validate that the new date is not in the past (considering timezone America/Belem)
    const now = new Date()
    const belomTimezone = 'America/Belem'
    const newDateObj = new Date(newDate)
    
    // Create formatter for timezone comparison
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: belomTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    
    const todayInBelem = formatter.format(now)
    const newDateFormatted = formatter.format(newDateObj)
    
    if (newDateFormatted < todayInBelem) {
      return new Response(
        JSON.stringify({ 
          error: 'Não é possível reagendar para uma data no passado',
          code: 'INVALID_DATE'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get current post data for audit log
    const { data: currentPost, error: fetchError } = await supabase
      .from('posts_planejamento')
      .select('*')
      .eq('id', postId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch current post: ${fetchError.message}`)
    }

    // Check if post is already published (prevent rescheduling)
    if (currentPost.status === 'published') {
      return new Response(
        JSON.stringify({ 
          error: 'Posts publicados não podem ser reagendados',
          code: 'POST_PUBLISHED'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check for conflicts on the new date (optional - for basic conflict detection)
    const { data: conflictPosts, error: conflictError } = await supabase
      .from('posts_planejamento')
      .select('id, titulo')
      .eq('planejamento_id', currentPost.planejamento_id)
      .eq('data_postagem', newDate)
      .neq('id', postId)

    if (conflictError) {
      console.warn('Could not check for conflicts:', conflictError.message)
    }

    // Update post date
    const { data: updatedPost, error: updateError } = await supabase
      .from('posts_planejamento')
      .update({ 
        data_postagem: newDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update post: ${updateError.message}`)
    }

    // Create audit log entry
    const auditData = {
      user_id: userId,
      post_id: postId,
      action: 'reschedule',
      before: {
        data_postagem: currentPost.data_postagem,
        titulo: currentPost.titulo
      },
      after: {
        data_postagem: newDate,
        titulo: updatedPost.titulo
      }
    }

    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert(auditData)

    if (auditError) {
      console.warn('Failed to create audit log:', auditError.message)
      // Don't fail the request for audit log issues
    }

    // Prepare response
    const response = {
      success: true,
      post: updatedPost,
      conflicts: conflictPosts?.length > 0 ? {
        count: conflictPosts.length,
        posts: conflictPosts
      } : null,
      message: conflictPosts?.length > 0 
        ? `Post reagendado com sucesso. Atenção: há ${conflictPosts.length} outro(s) post(s) agendado(s) para a mesma data.`
        : 'Post reagendado com sucesso!'
    }

    console.log('Post rescheduled successfully:', { postId, newDate, conflicts: conflictPosts?.length })

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in reschedule-post function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})