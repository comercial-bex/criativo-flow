// ========================================
// HEALTH CHECK ENDPOINT - FASE 3 MONITORING
// ========================================
// Endpoint para uptime monitoring (UptimeRobot, Pingdom, etc.)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: { status: string; latency?: number; error?: string };
    auth: { status: string; error?: string };
    storage: { status: string; error?: string };
  };
  uptime: number;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: 'bex-v4.0.7',
    checks: {
      database: { status: 'unknown' },
      auth: { status: 'unknown' },
      storage: { status: 'unknown' },
    },
    uptime: 0,
  };

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ========================================
    // CHECK 1: Database Connection
    // ========================================
    try {
      const dbStart = Date.now();
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      const dbLatency = Date.now() - dbStart;

      if (error) {
        result.checks.database = {
          status: 'unhealthy',
          error: error.message,
          latency: dbLatency,
        };
        result.status = 'degraded';
      } else {
        result.checks.database = {
          status: 'healthy',
          latency: dbLatency,
        };
      }
    } catch (error) {
      result.checks.database = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      result.status = 'unhealthy';
    }

    // ========================================
    // CHECK 2: Auth Service
    // ========================================
    try {
      const { data, error } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1,
      });

      if (error) {
        result.checks.auth = {
          status: 'unhealthy',
          error: error.message,
        };
        result.status = 'degraded';
      } else {
        result.checks.auth = { status: 'healthy' };
      }
    } catch (error) {
      result.checks.auth = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      result.status = 'degraded';
    }

    // ========================================
    // CHECK 3: Storage Service
    // ========================================
    try {
      const { data, error } = await supabase.storage.listBuckets();

      if (error) {
        result.checks.storage = {
          status: 'unhealthy',
          error: error.message,
        };
        result.status = 'degraded';
      } else {
        result.checks.storage = { status: 'healthy' };
      }
    } catch (error) {
      result.checks.storage = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      result.status = 'degraded';
    }

    // ========================================
    // CALCULATE TOTAL UPTIME
    // ========================================
    result.uptime = Date.now() - startTime;

    // ========================================
    // LOG TO SYSTEM HEALTH
    // ========================================
    await supabase.from('system_health_logs').insert({
      check_type: 'health_endpoint',
      status: result.status === 'healthy' ? 'ok' : result.status === 'degraded' ? 'warning' : 'error',
      details: result.checks,
    });

    // ========================================
    // RETURN RESPONSE
    // ========================================
    const statusCode = result.status === 'healthy' ? 200 : result.status === 'degraded' ? 207 : 503;

    return new Response(
      JSON.stringify(result, null, 2),
      {
        status: statusCode,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('❌ Health check failed:', error);
    
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 503,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
