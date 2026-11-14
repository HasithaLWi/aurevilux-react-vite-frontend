import {
  TrendingUp,
  ShoppingBag,
  Users,
  Percent,
  ClipboardList,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { Product } from "../../data/data";

interface DashboardPanelProps {
  products: Product[];
  orders: any[];
  setActiveTab: (tab: string) => void;
  setSelectedOrderId: (id: string | null) => void;
  analyticsData?: {
    totalRevenue?: number;
    ordersCount?: number;
    customersCount?: number;
    pendingOrdersCount?: number;
    lowStockCount?: number;
  };
}

const revenueChartData = [
  { name: "May 29", value: 14000 },
  { name: "May 30", value: 23000 },
  { name: "May 31", value: 32000 },
  { name: "Jun 1", value: 30000 },
  { name: "Jun 2", value: 50000 },
  { name: "Jun 3", value: 37000 },
  { name: "Jun 4", value: 29000 },
  { name: "Jun 5", value: 36000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#220B11] border border-brand-burgundy/40 px-3 py-2 rounded text-[10px] text-left flex flex-col shadow-lg select-none">
        <span className="font-bold text-white text-xs">
          {Number(payload[0].value).toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 2,
          })}
        </span>
        <span className="text-[9px] text-[#A38D92] mt-0.5 font-medium">
          {label}, 2026
        </span>
      </div>
    );
  }
  return null;
};

const ordersChartData = [
  { name: "May 29", value: 32 },
  { name: "May 30", value: 45 },
  { name: "May 31", value: 78 },
  { name: "Jun 1", value: 30 },
  { name: "Jun 2", value: 52 },
  { name: "Jun 3", value: 92 },
  { name: "Jun 4", value: 60 },
  { name: "Jun 5", value: 85 },
];

const OrdersTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0F0F11] border border-zinc-800 px-3 py-1.5 rounded text-[10px] text-left flex flex-col shadow-lg select-none">
        <span className="font-bold text-white text-xs">
          {payload[0].value} Orders
        </span>
        <span className="text-[9px] text-zinc-500 mt-0.5">{label}, 2026</span>
      </div>
    );
  }
  return null;
};

const categoriesChartData = [
  { name: "Women's Apparel", value: 42, color: "#6D1A2A" },
  { name: "Men's Apparel", value: 24, color: "#C5A880" },
  { name: "Accessories", value: 18, color: "#8B5CF6" },
  { name: "Footwear", value: 10, color: "#3B82F6" },
  { name: "Others", value: 6, color: "#06B6D4" },
];

const topSellingProducts = [
  {
    rank: 1,
    name: "Gucci Ophidia Shoulder Bag",
    brand: "Gucci",
    revenue: 8320.0,
    salesCount: 52,
    image: "/images/products/SEPENTINE SADDLE BAG.jpeg",
  },
  {
    rank: 2,
    name: "Nike Air Jordan 1 Retro High",
    brand: "Nike",
    revenue: 6560.0,
    salesCount: 41,
    image: "/images/backgrounds/background_1.jpeg",
  },
  {
    rank: 3,
    name: "Zara Oversized Wool Coat",
    brand: "Zara",
    revenue: 4940.0,
    salesCount: 38,
    image: "/images/products/VELVET LUNA DRESS.jpeg",
  },
  {
    rank: 4,
    name: "Calvin Klein Leather Jacket",
    brand: "Calvin Klein",
    revenue: 4650.0,
    salesCount: 31,
    image: "/images/products/VELVET LUNA DRESS.jpeg",
  },
  {
    rank: 5,
    name: "Tommy Hilfiger Puffer Jacket",
    brand: "Tommy Hilfiger",
    revenue: 3920.0,
    salesCount: 28,
    image: "/images/products/VELVET LUNA DRESS.jpeg",
  },
];

const mockLowStockItems = [
  {
    name: "Gucci Marmont Bag",
    sku: "GU-001",
    leftCount: 3,
    image: "/images/products/SEPENTINE SADDLE BAG.jpeg",
  },
  {
    name: "Nike Air Max 270",
    sku: "NK-270",
    leftCount: 4,
    image: "/images/backgrounds/background_1.jpeg",
  },
  {
    name: "Zara Knitted Sweater",
    sku: "ZR-KN-001",
    leftCount: 2,
    image: "/images/products/VELVET LUNA DRESS.jpeg",
  },
  {
    name: "Calvin Klein Belt",
    sku: "CK-BT-002",
    leftCount: 1,
    image: "/images/products/VELVET LUNA DRESS.jpeg",
  },
  {
    name: "Tommy Hilfiger Watch",
    sku: "TH-WT-001",
    leftCount: 2,
    image: "/images/products/VELVET LUNA DRESS.jpeg",
  },
];

export default function DashboardPanel({
  products: _products,
  orders,
  setActiveTab,
  setSelectedOrderId,
  analyticsData,
}: DashboardPanelProps) {
  const totalRevenue = analyticsData?.totalRevenue ?? 48695.2;
  const totalOrders =
    analyticsData?.ordersCount ?? (orders.length > 0 ? orders.length : 320);
  const totalCustomers = analyticsData?.customersCount ?? 1245;
  const pendingOrders = analyticsData?.pendingOrdersCount ?? 24;
  const lowStock = analyticsData?.lowStockCount ?? 18;

  return (
    <div className="space-y-8">
      {/* Date selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            Performance Insights
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] tracking-wider text-zinc-300 bg-[#0f0f11] border border-zinc-800 px-3.5 py-2 rounded uppercase font-semibold w-fit self-end">
          <span>Real-time Atelier Analytics</span>
        </div>
      </div>

      {/* KPI METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-brand-dark/50 border border-zinc-900 p-4 rounded flex flex-col justify-between border-l-2 border-l-brand-gold">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[9px] tracking-widest font-bold uppercase">
              Total Revenue
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-4 text-left">
            <h3 className="font-serif text-lg text-white font-bold">
              $
              {totalRevenue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
            <p className="text-[9px] text-emerald-500 mt-1 font-semibold">
              ↗ 18.7%{" "}
              <span className="text-zinc-600 font-normal">vs last week</span>
            </p>
          </div>
        </div>

        <div className="bg-brand-dark/50 border border-zinc-900 p-4 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[9px] tracking-widest font-bold uppercase">
              Orders
            </span>
            <ShoppingBag className="w-4 h-4 text-brand-gold" />
          </div>
          <div className="mt-4 text-left">
            <h3 className="font-serif text-lg text-white font-bold">
              {totalOrders}
            </h3>
            <p className="text-[9px] text-emerald-500 mt-1 font-semibold">
              ↗ 16.3%{" "}
              <span className="text-zinc-600 font-normal">vs last week</span>
            </p>
          </div>
        </div>

        <div className="bg-brand-dark/50 border border-zinc-900 p-4 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[9px] tracking-widest font-bold uppercase">
              Customers
            </span>
            <Users className="w-4 h-4 text-brand-gold" />
          </div>
          <div className="mt-4 text-left">
            <h3 className="font-serif text-lg text-white font-bold">
              {totalCustomers}
            </h3>
            <p className="text-[9px] text-emerald-500 mt-1 font-semibold">
              ↗ 14.3%{" "}
              <span className="text-zinc-600 font-normal">vs last week</span>
            </p>
          </div>
        </div>

        <div className="bg-brand-dark/50 border border-zinc-900 p-4 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[9px] tracking-widest font-bold uppercase">
              AOV
            </span>
            <Percent className="w-4 h-4 text-brand-gold" />
          </div>
          <div className="mt-4 text-left">
            <h3 className="font-serif text-lg text-white font-bold">$152.17</h3>
            <p className="text-[9px] text-emerald-500 mt-1 font-semibold">
              ↗ 8.6%{" "}
              <span className="text-zinc-600 font-normal">vs last week</span>
            </p>
          </div>
        </div>

        <div className="bg-brand-dark/50 border border-zinc-900 p-4 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[9px] tracking-widest font-bold uppercase">
              Pending Orders
            </span>
            <ClipboardList className="w-4 h-4 text-brand-burgundy" />
          </div>
          <div className="mt-4 text-left">
            <h3 className="font-serif text-lg text-white font-bold">
              {pendingOrders}
            </h3>
            <p className="text-[9px] text-red-500 mt-1 font-semibold">
              ↘ 9.1%{" "}
              <span className="text-zinc-600 font-normal">vs last week</span>
            </p>
          </div>
        </div>

        <div className="bg-brand-dark/50 border border-zinc-900 p-4 rounded flex flex-col justify-between border-l-2 border-l-brand-burgundy">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[9px] tracking-widest font-bold uppercase">
              Low Stock Items
            </span>
            <AlertTriangle className="w-4 h-4 text-brand-burgundy" />
          </div>
          <div className="mt-4 text-left">
            <h3 className="font-serif text-lg text-white font-bold">
              {lowStock}
            </h3>
            <p className="text-[9px] text-red-500 mt-1 font-semibold">
              ↗ 12.2%{" "}
              <span className="text-zinc-600 font-normal">vs last week</span>
            </p>
          </div>
        </div>
      </div>

      {/* CHARTS OVERVIEW ROWS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Line Chart */}
        <div className="bg-brand-dark/50 border border-zinc-900 p-5 rounded lg:col-span-1 space-y-4 flex flex-col justify-between text-left">
          <div className="flex items-center justify-between border-b border-zinc-900/50 pb-3">
            <h4 className="text-sm font-semibold text-white tracking-wide">
              Revenue Overview
            </h4>
            <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-1 rounded">
              This Week
            </span>
          </div>

          <div className="h-[175px] w-full text-[9px] relative pr-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueChartData}
                margin={{ top: 10, right: 10, left: -22, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E11D48" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#E11D48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="rgba(255, 255, 255, 0.05)"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 10, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  domain={[0, 60000]}
                  ticks={[0, 15000, 30000, 45000, 60000]}
                  tickFormatter={(v) => (v === 0 ? "$0" : `$${v / 1000}K`)}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 10, fontWeight: 500 }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "rgba(225, 29, 72, 0.2)", strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#E11D48"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  dot={{
                    stroke: "#E11D48",
                    strokeWidth: 1,
                    r: 1.5,
                    fill: "#E11D48",
                  }}
                  activeDot={{
                    stroke: "#fff",
                    strokeWidth: 1.5,
                    r: 3.5,
                    fill: "#E11D48",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Bar Chart */}
        <div className="bg-brand-dark/50 border border-zinc-900 p-5 rounded space-y-4 flex flex-col justify-between text-left">
          <div className="flex items-center justify-between border-b border-zinc-900/50 pb-3">
            <h4 className="text-sm font-semibold text-white tracking-wide">
              Orders Overview
            </h4>
            <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-1 rounded">
              This Week
            </span>
          </div>

          <div className="h-[175px] w-full text-[9px] relative pr-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ordersChartData}
                margin={{ top: 10, right: 10, left: -22, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="rgba(255, 255, 255, 0.05)"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 10, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 10, fontWeight: 500 }}
                />
                <Tooltip
                  content={<OrdersTooltip />}
                  cursor={{ fill: "rgba(255, 255, 255, 0.02)" }}
                />
                <Bar
                  dataKey="value"
                  fill="#6D1A2A"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Categories Donut Chart */}
        <div className="bg-brand-dark/50 border border-zinc-900 p-5 rounded space-y-4 text-left flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-zinc-900/50 pb-3">
            <h4 className="text-sm font-semibold text-white tracking-wide">
              Top Categories by Sales
            </h4>
            <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-1 rounded">
              This Week
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
            <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoriesChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={44}
                    outerRadius={62}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoriesChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">
                  Total
                </span>
                <span className="text-xs font-serif font-bold text-white mt-0.5">
                  $
                  {totalRevenue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-[9px] font-semibold tracking-wider text-zinc-400 w-full sm:w-auto">
              {categoriesChartData.map((cat) => (
                <div key={cat.name} className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full block"
                    style={{ background: cat.color }}
                  />
                  <span className="text-white flex-grow">{cat.name}</span>
                  <span className="font-mono text-zinc-500 pl-3">
                    {cat.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab("products")}
            className="text-[9px] text-brand-gold hover:underline uppercase tracking-widest font-bold block pt-2 border-t border-zinc-900/50"
          >
            View full report →
          </button>
        </div>
      </div>

      {/* THIRD LAYER: TABLES & RANKINGS GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders table */}
        <div className="bg-brand-dark/50 border border-zinc-900 p-5 rounded space-y-4 flex flex-col justify-between text-left">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Recent Orders
            </h4>
            <button
              onClick={() => setActiveTab("orders")}
              className="text-[9px] bg-zinc-900 border border-zinc-800 hover:text-white px-2.5 py-1 rounded text-zinc-500 uppercase tracking-widest font-semibold"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-xs font-light text-left text-zinc-400 min-w-[500px]">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500 text-[9px] uppercase font-bold tracking-wider">
                  <th className="py-2.5">Order ID</th>
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((o) => (
                  <tr
                    key={o.id || o.orderNumber}
                    className="border-b border-zinc-900/60 hover:bg-[#18181C]/20 transition-colors"
                  >
                    <td
                      className="py-3 font-mono font-medium text-white cursor-pointer"
                      onClick={() => setSelectedOrderId(o.id || o.orderNumber)}
                    >
                      {o.id || o.orderNumber}
                    </td>
                    <td className="py-3">
                      <span className="font-semibold text-zinc-300 whitespace-nowrap">
                        {o.customer?.name || o.name || "Customer"}
                      </span>
                    </td>
                    <td className="py-3 text-[10px] text-zinc-500 font-semibold">
                      {o.date || "Recent"}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                          o.status === "Processing"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/25"
                            : o.status === "Paid" || o.status === "Delivered"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/25"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-serif text-brand-gold font-bold">
                      ${Number(o.total || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={() => setActiveTab("orders")}
            className="text-[9px] text-brand-gold hover:underline uppercase tracking-widest font-bold mt-2"
          >
            View all orders →
          </button>
        </div>

        {/* Top Selling Products List */}
        <div className="bg-brand-dark/50 border border-zinc-900 p-5 rounded space-y-4 text-left flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Top Selling Products
            </h4>
            <button
              onClick={() => setActiveTab("products")}
              className="text-[9px] bg-zinc-900 border border-zinc-800 hover:text-white px-2.5 py-1 rounded text-zinc-500 uppercase tracking-widest font-semibold"
            >
              View All
            </button>
          </div>

          <div className="space-y-3.5 my-2">
            {topSellingProducts.map((p) => (
              <div
                key={p.rank}
                className="flex items-center justify-between border-b border-zinc-900/60 pb-2 last:border-0 last:pb-0 text-xs"
              >
                <div className="flex items-center space-x-3.5">
                  <span className="text-[11px] font-bold text-zinc-500 w-3">
                    {p.rank}
                  </span>
                  <div className="w-8 h-10 bg-zinc-900 rounded overflow-hidden flex items-center justify-center border border-zinc-800 flex-shrink-0">
                    <img
                      src={p.image}
                      className="w-full h-full object-cover"
                      alt={p.name}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-white tracking-wide">
                      {p.name}
                    </p>
                    <span className="text-[9px] text-zinc-500 tracking-wider uppercase font-semibold">
                      {p.brand}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-serif text-white font-semibold">
                    $
                    {p.revenue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">
                    {p.salesCount} sold
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveTab("products")}
            className="text-[9px] text-brand-gold hover:underline uppercase tracking-widest font-bold mt-2"
          >
            View all products →
          </button>
        </div>

        {/* Low Stock Alerts */}
        <div className="space-y-6">
          <div className="bg-brand-dark/50 border border-zinc-900 p-5 rounded text-left space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Low Stock Alerts
              </h4>
              <button
                onClick={() => setActiveTab("products")}
                className="text-[9px] text-zinc-500 hover:text-white uppercase tracking-wider font-bold"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {mockLowStockItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs pb-2 border-b border-zinc-900 last:border-0 last:pb-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-10 bg-zinc-900 rounded overflow-hidden border border-zinc-800 flex-shrink-0">
                      <img
                        src={item.image}
                        className="w-full h-full object-cover"
                        alt={item.name}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-300">{item.name}</p>
                      <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase">
                        SKU: {item.sku}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-right">
                    <span className="text-[10px] text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded">
                      {item.leftCount} left
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
