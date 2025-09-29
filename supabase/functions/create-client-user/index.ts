import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateClientUserRequest {
  email: string;
  password: string;
  nome: string;
  cliente_id: string;
  role: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { email, password, nome, cliente_id, role }: CreateClientUserRequest = await req.json();

    console.log('Creating client user:', { email, nome, cliente_id, role });

    // Validate required fields
    if (!email || !password || !nome || !cliente_id || !role) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Todos os campos são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already exists by checking profiles table first
    let existingUser = null;
    try {
      // First check if profile with this email exists
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, cliente_id, nome, email')
        .eq('email', email)
        .single();

      if (!profileError && profileData) {
        console.log('Profile found for email:', email, 'User ID:', profileData.id);
        
        // Get user from auth
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(profileData.id);
        if (!userError && userData.user) {
          existingUser = userData.user;
          
          if (profileData.cliente_id === cliente_id) {
            // User already linked to this client, just return credentials
            console.log('User already linked to this client, returning success');
            return new Response(
              JSON.stringify({ 
                user: existingUser,
                email: email,
                password: password, // Return the provided password
                success: true,
                message: 'Usuário já vinculado ao cliente!'
              }),
              { 
                status: 200, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          } else if (profileData.cliente_id) {
            // User linked to different client
            return new Response(
              JSON.stringify({ error: `Email ${email} já está vinculado a outro cliente` }),
              { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          // User exists but not linked to any client, we'll link them below
          console.log('User exists but not linked to client, will link them');
        }
      } else {
        console.log('No profile found for email:', email);
      }
    } catch (error) {
      console.log('No existing user found or error checking:', error);
    }

    let userData;
    
    if (existingUser) {
      // Use existing user
      userData = { user: existingUser };
      console.log('Using existing user:', existingUser.id);
      
      // Reset password for existing user
      const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id, 
        { password }
      );
      
      if (passwordError) {
        console.error('Error updating password:', passwordError);
        return new Response(
          JSON.stringify({ error: 'Erro ao atualizar senha do usuário existente' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('Password updated for existing user');
    } else {
      // Create new user in Supabase Auth (without email confirmation)
      const { data: newUserData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Skip email confirmation
        user_metadata: { nome }
      });

      if (userError) {
        console.error('Error creating user:', userError);
        return new Response(
          JSON.stringify({ 
            error: userError.message === 'Database error creating new user' 
              ? `Erro ao criar usuário: Email ${email} pode já estar em uso`
              : userError.message 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      userData = newUserData;
      console.log('New user created successfully:', userData.user?.id);
    }

    // Insert user role (only if not exists)
    const { data: existingRole, error: checkRoleError } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('user_id', userData.user!.id)
      .eq('role', role)
      .single();

    if (checkRoleError && checkRoleError.code !== 'PGRST116') {
      console.error('Error checking existing role:', checkRoleError);
    }

    if (!existingRole) {
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: userData.user!.id,
          role: role
        });

      if (roleError) {
        console.error('Error creating user role:', roleError);
        return new Response(
          JSON.stringify({ error: roleError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('User role created');
    } else {
      console.log('User role already exists');
    }

    // Update or create profile with cliente_id
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        cliente_id,
        nome: nome // Update name as well
      })
      .eq('id', userData.user!.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Client user created successfully');

    return new Response(
      JSON.stringify({ 
        user: userData.user,
        email: email,
        password: password,
        success: true,
        message: 'Cliente criado com sucesso!'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in create-client-user function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});