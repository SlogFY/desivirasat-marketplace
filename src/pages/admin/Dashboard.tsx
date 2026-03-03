import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingCart, TrendingUp, Clock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type TimeFilter = "all" | "week" | "month" | "year";

const getDateFilter = (filter: TimeFilter): string | null => {
  const now = new Date();
  switch (filter) {
    case "week": {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d.toISOString();
    }
    case "month": {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      return d.toISOString();
    }
    case "year": {
      const d = new Date(now.getFullYear(), 0, 1);
      return d.toISOString();
    }
    default:
      return null;
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  const { data: totalProducts } = useQuery({
    queryKey: ["admin-total-products"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Orders & Revenue: only count orders that are delivered AND return_deadline has passed
  const { data: ordersStats } = useQuery({
    queryKey: ["admin-orders-stats", timeFilter],
    queryFn: async () => {
      const dateFrom = getDateFilter(timeFilter);
      let query = supabase
        .from("orders")
        .select("id, total, status, delivered_at, return_deadline, return_status");

      if (dateFrom) {
        query = query.gte("created_at", dateFrom);
      }

      const { data, error } = await query;
      if (error) throw error;

      const allOrders = data || [];
      const now = new Date();

      // Only count in total/revenue if delivered + return deadline passed + not returned
      const confirmedOrders = allOrders.filter((o) => {
        if (o.status !== "delivered") return false;
        if (o.return_status === "completed" || o.return_status === "approved") return false;
        if (!o.return_deadline) return false;
        return new Date(o.return_deadline) < now;
      });

      const totalOrders = confirmedOrders.length;
      const totalRevenue = confirmedOrders.reduce((sum, o) => sum + Number(o.total), 0);
      const pendingOrders = allOrders.filter((o) => o.status === "pending").length;
      const returnRequests = allOrders.filter((o) => o.return_status === "requested").length;

      return { totalOrders, totalRevenue, pendingOrders, returnRequests, allOrdersCount: allOrders.length };
    },
  });

  const statCards = [
    {
      title: "Total Products",
      value: totalProducts || 0,
      icon: Package,
      color: "text-blue-600 bg-blue-100",
      onClick: () => navigate("/admin/products"),
    },
    {
      title: "Confirmed Orders",
      value: ordersStats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "text-green-600 bg-green-100",
      onClick: () => navigate("/admin/orders"),
      subtitle: `${ordersStats?.allOrdersCount || 0} total placed`,
    },
    {
      title: "Revenue",
      value: `₹${ordersStats?.totalRevenue?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: "text-primary bg-primary/10",
      onClick: () => navigate("/admin/orders"),
      subtitle: "After return period",
    },
    {
      title: "Pending Orders",
      value: ordersStats?.pendingOrders || 0,
      icon: Clock,
      color: "text-yellow-600 bg-yellow-100",
      onClick: () => navigate("/admin/orders"),
    },
    {
      title: "Return Requests",
      value: ordersStats?.returnRequests || 0,
      icon: RotateCcw,
      color: "text-red-600 bg-red-100",
      onClick: () => navigate("/admin/returns"),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your admin panel</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter:</span>
          <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <button
            key={stat.title}
            onClick={stat.onClick}
            className="bg-card rounded-xl p-6 shadow-soft text-left hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                {"subtitle" in stat && stat.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                )}
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
