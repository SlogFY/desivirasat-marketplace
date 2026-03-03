import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, CreditCard, Eye, EyeOff, Shield, Globe } from "lucide-react";

const AdminPaymentSettings = () => {
  const queryClient = useQueryClient();
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [mode, setMode] = useState("test");
  const [currency, setCurrency] = useState("INR");
  const [enabled, setEnabled] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["payment-settings"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("payment_settings")
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setKeyId(settings.key_id || "");
      setKeySecret(settings.key_secret || "");
      setMode(settings.mode || "test");
      setCurrency(settings.currency || "INR");
      setEnabled(settings.enabled || false);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any)
        .from("payment_settings")
        .update({
          key_id: keyId,
          key_secret: keySecret,
          mode,
          currency,
          enabled,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-settings"] });
      toast.success("Payment settings saved successfully");
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          Payment Settings
        </h1>
        <p className="text-muted-foreground">Configure Razorpay payment gateway</p>
      </div>

      <div className="bg-card rounded-xl shadow-soft p-6 space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${enabled ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}>
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Enable Razorpay</p>
              <p className="text-sm text-muted-foreground">
                {enabled ? "Online payments are active" : "Online payments are disabled"}
              </p>
            </div>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {/* Mode Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Mode
          </Label>
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="test">Test Mode</SelectItem>
              <SelectItem value="live">Live Mode</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {mode === "test"
              ? "Use test credentials. No real payments will be processed."
              : "⚠️ Live mode - Real payments will be processed!"}
          </p>
        </div>

        {/* Razorpay Key ID */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Razorpay Key ID
          </Label>
          <Input
            placeholder={mode === "test" ? "rzp_test_xxxxxxxxxx" : "rzp_live_xxxxxxxxxx"}
            value={keyId}
            onChange={(e) => setKeyId(e.target.value)}
          />
        </div>

        {/* Razorpay Key Secret */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Razorpay Key Secret
          </Label>
          <div className="relative">
            <Input
              type={showSecret ? "text" : "password"}
              placeholder="Enter your Razorpay Key Secret"
              value={keySecret}
              onChange={(e) => setKeySecret(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            🔒 This secret is stored securely and never exposed on the frontend.
          </p>
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INR">INR (₹)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Webhook Info */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
          <p className="font-medium text-sm">Webhook URL (for Razorpay Dashboard)</p>
          <code className="text-xs bg-background p-2 rounded block break-all">
            {`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-webhook`}
          </code>
          <p className="text-xs text-muted-foreground">
            Add this URL in your Razorpay Dashboard → Settings → Webhooks. Select events: payment.captured, payment.failed, refund.created
          </p>
        </div>

        {/* Save Button */}
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full"
          size="lg"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default AdminPaymentSettings;
