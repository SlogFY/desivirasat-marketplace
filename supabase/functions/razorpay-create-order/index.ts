import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) throw new Error("Not authenticated");

    const { amount, currency, order_id } = await req.json();

    // Fetch payment settings (using service role to bypass RLS for secret)
    const { data: settings, error: settingsError } = await supabase
      .from("payment_settings")
      .select("*")
      .limit(1)
      .single();

    if (settingsError || !settings) throw new Error("Payment settings not found");
    if (!settings.enabled) throw new Error("Online payment is not enabled");
    if (!settings.key_id || !settings.key_secret) throw new Error("Payment credentials not configured");

    const baseUrl = settings.mode === "live"
      ? "https://api.razorpay.com/v1"
      : "https://api.razorpay.com/v1";

    // Create Razorpay order
    const rzpResponse = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(`${settings.key_id}:${settings.key_secret}`),
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Razorpay expects paise
        currency: currency || settings.currency || "INR",
        receipt: order_id,
      }),
    });

    if (!rzpResponse.ok) {
      const errBody = await rzpResponse.text();
      throw new Error(`Razorpay error: ${errBody}`);
    }

    const rzpOrder = await rzpResponse.json();

    // Update our order with razorpay_order_id
    await supabase
      .from("orders")
      .update({ razorpay_order_id: rzpOrder.id, payment_status: "created" })
      .eq("id", order_id);

    return new Response(
      JSON.stringify({
        razorpay_order_id: rzpOrder.id,
        razorpay_key_id: settings.key_id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
