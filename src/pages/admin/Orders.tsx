import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Loader2, ChevronDown, ExternalLink, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  payment_method: string;
  user_id: string;
  tracking_id: string | null;
  delivery_partner: string | null;
  tracking_url: string | null;
  delivered_at: string | null;
  return_deadline: string | null;
  return_status: string | null;
  notes: string | null;
  address_id: string | null;
  addresses?: {
    full_name: string;
    city: string;
    state: string;
    phone: string;
  } | null;
  profiles?: {
    full_name: string | null;
  } | null;
}

const STATUS_OPTIONS = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "refunded"];

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-indigo-100 text-indigo-800",
    shipped: "bg-purple-100 text-purple-800",
    out_for_delivery: "bg-orange-100 text-orange-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };
  return map[status] || "bg-muted text-muted-foreground";
};

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formStatus, setFormStatus] = useState("");
  const [formTrackingId, setFormTrackingId] = useState("");
  const [formDeliveryPartner, setFormDeliveryPartner] = useState("");
  const [formTrackingUrl, setFormTrackingUrl] = useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, addresses(full_name, city, state, phone)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: {
      id: string;
      status: string;
      tracking_id: string | null;
      delivery_partner: string | null;
      tracking_url: string | null;
      delivered_at: string | null;
      return_deadline: string | null;
    }) => {
      const { error } = await supabase
        .from("orders")
        .update({
          status: updates.status,
          tracking_id: updates.tracking_id,
          delivery_partner: updates.delivery_partner,
          tracking_url: updates.tracking_url,
          delivered_at: updates.delivered_at,
          return_deadline: updates.return_deadline,
        })
        .eq("id", updates.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Order updated successfully");
      setEditingOrder(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const openEdit = (order: Order) => {
    setEditingOrder(order);
    setFormStatus(order.status);
    setFormTrackingId(order.tracking_id || "");
    setFormDeliveryPartner(order.delivery_partner || "");
    setFormTrackingUrl(order.tracking_url || "");
  };

  const handleSave = () => {
    if (!editingOrder) return;
    const isNowDelivered = formStatus === "delivered" && editingOrder.status !== "delivered";
    const deliveredAt = isNowDelivered ? new Date().toISOString() : editingOrder.delivered_at;
    const returnDeadline = isNowDelivered
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      : editingOrder.return_deadline;

    updateMutation.mutate({
      id: editingOrder.id,
      status: formStatus,
      tracking_id: formTrackingId || null,
      delivery_partner: formDeliveryPartner || null,
      tracking_url: formTrackingUrl || null,
      delivered_at: deliveredAt,
      return_deadline: returnDeadline,
    });
  };

  const filtered = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.addresses?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Orders Management</h1>
        <p className="text-muted-foreground">Manage orders, update status, and add tracking info</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-soft overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      {order.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{order.addresses?.full_name || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.addresses?.city}, {order.addresses?.state}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(order.created_at).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell className="font-semibold">₹{Number(order.total).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(order.status)} border-0`}>
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.tracking_id ? (
                        <div className="flex items-center gap-1">
                          <Truck className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-mono">{order.tracking_id}</span>
                          {order.tracking_url && (
                            <a href={order.tracking_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 text-primary" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => openEdit(order)}>
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingOrder} onOpenChange={(o) => !o && setEditingOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Order Status</Label>
              <Select value={formStatus} onValueChange={setFormStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Delivery Partner</Label>
              <Input
                placeholder="e.g. BlueDart, Delhivery, DTDC"
                value={formDeliveryPartner}
                onChange={(e) => setFormDeliveryPartner(e.target.value)}
              />
            </div>
            <div>
              <Label>Tracking ID</Label>
              <Input
                placeholder="e.g. AWB123456789"
                value={formTrackingId}
                onChange={(e) => setFormTrackingId(e.target.value)}
              />
            </div>
            <div>
              <Label>Tracking URL</Label>
              <Input
                placeholder="https://tracking.example.com/..."
                value={formTrackingUrl}
                onChange={(e) => setFormTrackingUrl(e.target.value)}
              />
            </div>
            {editingOrder?.delivered_at && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Delivered: {new Date(editingOrder.delivered_at).toLocaleDateString("en-IN")}</p>
                {editingOrder.return_deadline && (
                  <p>Return deadline: {new Date(editingOrder.return_deadline).toLocaleDateString("en-IN")}</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingOrder(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
