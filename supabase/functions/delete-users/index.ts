import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const userIds = [
    '821da37c-1836-49b7-8da1-3239b1383157',
    '5d81c73c-d63b-4370-92c4-5578a5b2cf65',
  ];

  const results = [];
  for (const uid of userIds) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(uid);
    results.push({ uid, error: error?.message || null });
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
