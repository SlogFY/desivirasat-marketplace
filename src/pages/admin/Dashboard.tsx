import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [productsRes, ordersRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id, total, status", { count: "exact" }),
      ]);

      const totalProducts = productsRes.count || 0;
      const orders = ordersRes.data || [];
      const totalOrders = ordersRes.count || 0;
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
      const pendingOrders = orders.filter((o) => o.status === "pending").length;

      return { totalProducts, totalOrders, totalRevenue, pendingOrders };
    },
  });

  const statCards = [
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "text-green-600 bg-green-100",
    },
    {
      title: "Revenue",
      value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: "text-primary bg-primary/10",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders || 0,
      icon: Users,
      color: "text-yellow-600 bg-yellow-100",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your admin panel</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-card rounded-xl p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
