import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create two Supabase clients:
    // 1. Auth client for authentication
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey);
    
    // 2. Admin client for database operations (bypasses RLS)
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const { data: authData, error: authError } = await supabaseAuthClient.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = authData.user.id;

    // Fetch user data using admin client to bypass RLS
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("first_name, last_name, company_id, position_id, rating_points")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      return new Response(JSON.stringify({ error: "User data not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch position data (contains rules) using admin client
    let position = null;
    let rules = null;
    if (userData.position_id) {
      const { data: positionData } = await supabaseAdmin
        .from("positions")
        .select("name, rules")
        .eq("id", userData.position_id)
        .single();

      position = positionData?.name || null;
      rules = positionData?.rules || null;
    }

    // Fetch company data using admin client to bypass RLS
    let company = null;
    if (userData.company_id) {
      console.log("Fetching company with ID:", userData.company_id);
      const { data: companyData, error: companyError } = await supabaseAdmin
        .from("users")
        .select("first_name, last_name")
        .eq("id", userData.company_id)
        .single();

      if (companyError) {
        console.error("Error fetching company:", companyError);
      }

      if (companyData) {
        console.log("Company data found:", companyData);
        company = `${companyData.first_name} ${companyData.last_name}`;
      } else {
        console.log("No company data found for ID:", userData.company_id);
      }
    }

    // Return formatted response
    const response = {
      name: `${userData.first_name} ${userData.last_name}`,
      company,
      position,
      rules,
      score: userData.rating_points,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in get-user-rules:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
