import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-razorpay-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function hmacSha256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const msgData = encoder.encode(message);
  const cryptoKey = await crypto.subtle.importKey(
    "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    // Fetch webhook secret (using key_secret for now)
    const { data: settings } = await supabase
      .from("payment_settings")
      .select("key_secret")
      .limit(1)
      .single();

    if (!settings?.key_secret) {
      return new Response("Settings not found", { status: 500 });
    }

    // Verify webhook signature
    if (signature) {
      const expectedSig = await hmacSha256(settings.key_secret, body);
      if (expectedSig !== signature) {
        return new Response("Invalid signature", { status: 400 });
      }
    }

    const event = JSON.parse(body);
    const eventType = event.event;

    if (eventType === "payment.captured") {
      const payment = event.payload.payment.entity;
      const rzpOrderId = payment.order_id;

      await supabase
        .from("orders")
        .update({
          razorpay_payment_id: payment.id,
          payment_status: "paid",
          transaction_date: new Date().toISOString(),
          status: "confirmed",
        })
        .eq("razorpay_order_id", rzpOrderId);
    } else if (eventType === "payment.failed") {
      const payment = event.payload.payment.entity;
      const rzpOrderId = payment.order_id;

      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("razorpay_order_id", rzpOrderId);
    } else if (eventType === "refund.created" || eventType === "refund.processed") {
      const refund = event.payload.refund.entity;
      const paymentId = refund.payment_id;

      await supabase
        .from("orders")
        .update({ refund_status: refund.status })
        .eq("razorpay_payment_id", paymentId);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
