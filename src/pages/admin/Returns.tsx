import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const getReturnStatusColor = (status: string) => {
  const map: Record<string, string> = {
    requested: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    rejected: "bg-red-100 text-red-800",
    completed: "bg-green-100 text-green-800",
  };
  return map[status] || "bg-muted text-muted-foreground";
};

const AdminReturns = () => {
  const queryClient = useQueryClient();

  const { data: returns = [], isLoading } = useQuery({
    queryKey: ["admin-returns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, addresses(full_name, city, state, phone)")
        .not("return_status", "is", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Also fetch orders eligible for return (delivered, return_deadline not passed, no return requested yet)
  const { data: eligible = [] } = useQuery({
    queryKey: ["admin-return-eligible"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, addresses(full_name, city, state, phone)")
        .eq("status", "delivered")
        .is("return_status", null)
        .gte("return_deadline", new Date().toISOString())
        .order("delivered_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const updateReturn = useMutation({
    mutationFn: async ({ id, return_status }: { id: string; return_status: string }) => {
      const updates: Record<string, any> = { return_status };
      if (return_status === "completed") {
        updates.status = "refunded";
      }
      const { error } = await supabase.from("orders").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-returns"] });
      queryClient.invalidateQueries({ queryKey: ["admin-return-eligible"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Return status updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <RotateCcw className="h-6 w-6" /> Return Items
        </h1>
        <p className="text-muted-foreground">Manage product returns and refunds</p>
      </div>

      {/* Active Returns */}
      <div className="mb-8">
        <h2 className="font-semibold text-lg mb-4">Active Returns ({returns.length})</h2>
        <div className="bg-card rounded-xl shadow-soft overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Return Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No return requests
                  </TableCell>
                </TableRow>
              ) : (
                returns.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                    <TableCell>{order.addresses?.full_name || "N/A"}</TableCell>
                    <TableCell className="font-semibold">₹{Number(order.total).toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{order.return_reason || "—"}</TableCell>
                    <TableCell>
                      <Badge className={`${getReturnStatusColor(order.return_status)} border-0`}>
                        {order.return_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.return_status !== "completed" && order.return_status !== "rejected" && (
                        <Select
                          value={order.return_status}
                          onValueChange={(val) => updateReturn.mutate({ id: order.id, return_status: val })}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="requested">Requested</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Eligible for Return */}
      <div>
        <h2 className="font-semibold text-lg mb-4">Eligible for Return ({eligible.length})</h2>
        <p className="text-sm text-muted-foreground mb-4">
          These orders are delivered and still within the 7-day return window
        </p>
        <div className="bg-card rounded-xl shadow-soft overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>Return Deadline</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eligible.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No eligible orders
                  </TableCell>
                </TableRow>
              ) : (
                eligible.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                    <TableCell>{order.addresses?.full_name || "N/A"}</TableCell>
                    <TableCell className="text-sm">
                      {order.delivered_at ? new Date(order.delivered_at).toLocaleDateString("en-IN") : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {order.return_deadline ? new Date(order.return_deadline).toLocaleDateString("en-IN") : "—"}
                    </TableCell>
                    <TableCell className="font-semibold">₹{Number(order.total).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminReturns;
