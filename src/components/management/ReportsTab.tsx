import React, { useState, useMemo } from "react";
import {
  Printer,
  Calendar,
  TrendingUp,
  AlertTriangle,
  ShoppingBag,
  DollarSign,
  Package,
  CheckCircle2,
} from "lucide-react";
import type { Order, Product } from "../../types";
import { PrintableReport, type ReportMetrics } from "./reports/PrintableReport";

interface ReportsTabProps {
  orders: Order[];
  products: Product[];
  currentUser: {
    name: string;
    email: string;
    role?: string;
    roles?: string[];
  } | null;
}

type TimeframeType = "weekly" | "monthly" | "month_picker";

export const ReportsTab: React.FC<ReportsTabProps> = ({
  orders,
  products,
  currentUser,
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeType>("weekly");
  const [selectedMonthOffset, setSelectedMonthOffset] = useState<number>(0); // 0 = current month, 1 = last month, etc.
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  // Compute Date Boundaries based on selected timeframe
  const { startDate, endDate, dateRangeLabel, timeframeLabel } = useMemo(() => {
    const now = new Date();

    if (timeframe === "weekly") {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);

      const f = (d: Date) =>
        d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

      return {
        startDate: start,
        endDate: end,
        dateRangeLabel: `${f(start)} â€” ${f(end)}`,
        timeframeLabel: "Weekly (Last 7 Days)",
      };
    }

    if (timeframe === "monthly") {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);

      const f = (d: Date) =>
        d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

      return {
        startDate: start,
        endDate: end,
        dateRangeLabel: `${f(start)} â€” ${f(end)}`,
        timeframeLabel: "Monthly (Last 30 Days)",
      };
    }

    // Specific Calendar Month
    const targetMonth = new Date(now.getFullYear(), now.getMonth() - selectedMonthOffset, 1);
    const start = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1, 0, 0, 0);
    const end = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59);

    const monthName = start.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    return {
      startDate: start,
      endDate: end,
      dateRangeLabel: `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} â€” ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      timeframeLabel: `Month of ${monthName}`,
    };
  }, [timeframe, selectedMonthOffset]);

  // Filter Orders falling within the active period
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const rawDate = o.createdAt || o.date;
      if (!rawDate) return false;
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return false;
      return d >= startDate && d <= endDate;
    });
  }, [orders, startDate, endDate]);

  // Compute Core Metrics from Filtered Orders & Live Products
  const metrics: ReportMetrics = useMemo(() => {
    // 1. Revenue & Orders
    let totalRevenue = 0;
    let netRevenue = 0;
    let settledRevenue = 0;
    let pendingRevenue = 0;
    let refundedRevenue = 0;
    let totalUnitsSold = 0;

    const validOrders = filteredOrders.filter((o) => {
      const status = (o.status || "").toLowerCase();
      return status !== "cancelled" && status !== "refunded";
    });

    filteredOrders.forEach((o) => {
      const amt = Number(o.total) || 0;
      totalRevenue += amt;
      const status = (o.status || "").toLowerCase();

      if (status === "cancelled" || status === "refunded") {
        refundedRevenue += amt;
      } else if (status === "delivered" || status === "completed" || status === "confirmed") {
        settledRevenue += amt;
        netRevenue += amt;
      } else {
        pendingRevenue += amt;
        netRevenue += amt;
      }

      // Count units
      if (Array.isArray(o.items)) {
        o.items.forEach((item) => {
          totalUnitsSold += Number(item.quantity) || 1;
        });
      }
    });

    const totalOrders = validOrders.length;
    const averageOrderValue = totalOrders > 0 ? netRevenue / totalOrders : 0;

    // 2. Top Selling Products
    const productSalesMap = new Map<
      string,
      {
        id: string;
        name: string;
        brand: string;
        price: number;
        unitsSold: number;
        revenue: number;
        image?: string;
      }
    >();

    validOrders.forEach((order) => {
      if (Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const key = item.productId || item.name;
          const qty = Number(item.quantity) || 1;
          const price = Number(item.price) || 0;
          const rev = qty * price;

          const existing = productSalesMap.get(key);
          if (existing) {
            existing.unitsSold += qty;
            existing.revenue += rev;
          } else {
            productSalesMap.set(key, {
              id: key,
              name: item.name || "Haute Creation",
              brand: item.brand || "Aurevilux",
              price: price,
              unitsSold: qty,
              revenue: rev,
              image: item.image,
            });
          }
        });
      }
    });

    const topSellers = Array.from(productSalesMap.values())
      .sort((a, b) => b.unitsSold - a.unitsSold || b.revenue - a.revenue)
      .slice(0, 10)
      .map((item) => ({
        ...item,
        sharePercent: netRevenue > 0 ? (item.revenue / netRevenue) * 100 : 0,
      }));

    // 3. Newly Added Products vs. Their Sales
    // Check products created within the last 60 days
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const newProducts = products.filter((p) => {
      if (!p.createdAt) return false;
      const d = new Date(p.createdAt);
      return !isNaN(d.getTime()) && d >= sixtyDaysAgo;
    });

    const newProductsPerformance = newProducts.map((p) => {
      const pid = p.id || (p as any)._id;
      const salesRecord = productSalesMap.get(pid) || productSalesMap.get(p.name);
      const unitsSold = salesRecord ? salesRecord.unitsSold : 0;
      const revenue = salesRecord ? salesRecord.revenue : 0;
      const currentStock = typeof p.stockCount === "number" ? p.stockCount : 0;

      let velocityStatus = "JUST LAUNCHED";
      if (unitsSold >= 5) {
        velocityStatus = "HIGH DEMAND";
      } else if (unitsSold >= 1) {
        velocityStatus = "STEADY";
      } else if (currentStock > 10) {
        velocityStatus = "SLOW MOVING";
      }

      const fDate = p.createdAt
        ? new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "Recent";

      return {
        id: pid,
        name: p.name,
        brand: p.brand || "Aurevilux",
        price: p.price,
        createdAtFormatted: fDate,
        unitsSold,
        revenue,
        currentStock,
        velocityStatus,
      };
    }).slice(0, 8);

    // 4. Low Stock Products (Need to restock)
    const lowStockItems = products
      .filter((p) => {
        if (p.isDeleted) return false;
        const stock = typeof p.stockCount === "number" ? p.stockCount : 99;
        const hasDepletedSize = Array.isArray(p.sizeStock) && p.sizeStock.some((s) => s.quantity <= 1);
        return stock <= 5 || hasDepletedSize;
      })
      .map((p) => {
        const stock = typeof p.stockCount === "number" ? p.stockCount : 0;
        let urgency: "OUT OF STOCK" | "CRITICAL" | "LOW STOCK" = "LOW STOCK";
        if (stock === 0) urgency = "OUT OF STOCK";
        else if (stock <= 2) urgency = "CRITICAL";

        return {
          id: p.id || (p as any)._id,
          name: p.name,
          brand: p.brand || "Aurevilux",
          categoryLabel: p.categoryLabel || "Couture",
          stockCount: stock,
          urgency,
          recommendedRestock: Math.max(10, 20 - stock),
        };
      })
      .sort((a, b) => a.stockCount - b.stockCount);

    const nowStr = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const genBy = currentUser?.name
      ? `${currentUser.name} (${currentUser.roles?.[0] || currentUser.role || "Executive"})`
      : "Executive Director";

    return {
      timeframeLabel,
      dateRangeLabel,
      generatedAt: nowStr,
      generatedBy: genBy,
      totalRevenue,
      netRevenue,
      totalOrders,
      averageOrderValue,
      totalUnitsSold,
      settledRevenue,
      pendingRevenue,
      refundedRevenue,
      topSellers,
      newProductsPerformance,
      lowStockItems,
    };
  }, [filteredOrders, products, timeframeLabel, dateRangeLabel, currentUser]);

  // Handle PDF Export / Print Flow
  const handlePrint = () => {
    setIsPrinting(true);
    const originalTitle = document.title;
    const cleanDate = new Date().toISOString().slice(0, 10);
    const modeName = timeframe === "weekly" ? "Weekly" : timeframe === "monthly" ? "Monthly" : "Month";
    document.title = `Aurevilux_Executive_Report_${modeName}_${cleanDate}`;

    // Allow browser to render print styles then invoke print dialog
    setTimeout(() => {
      window.print();
      document.title = originalTitle;
      setIsPrinting(false);
    }, 250);
  };

  return (
    <div className="w-full">
      {/* ====================================================================
          SCREEN UI (Hidden during window.print())
          ==================================================================== */}
      <div className="print:hidden space-y-8">
        {/* Header Strip with Period Toggles & Action Button */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-zinc-900 pb-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] tracking-[0.3em] text-brand-gold uppercase font-bold px-2 py-0.5 bg-brand-gold/10 border border-brand-gold/20 rounded">
                EXECUTIVE INTELLIGENCE
              </span>
              <span className="text-xs text-zinc-500 font-mono">LIVE DATABASE EXTRACT</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl tracking-wider text-white uppercase font-bold">
              Atelier Performance & Operations Reports
            </h1>
            <p className="text-xs text-zinc-400">
              Generate audited revenue statements, product sales velocity, and inventory restocking ledgers.
            </p>
          </div>

          {/* Controls: Timeframe Selector & Print Button */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Weekly / Monthly Toggles */}
            <div className="flex items-center bg-brand-dark border border-zinc-800 rounded p-1">
              <button
                onClick={() => setTimeframe("weekly")}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-all tracking-wider uppercase ${
                  timeframe === "weekly"
                    ? "bg-brand-burgundy text-white shadow-sm shadow-brand-burgundy/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                WEEKLY (7D)
              </button>
              <button
                onClick={() => setTimeframe("monthly")}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-all tracking-wider uppercase ${
                  timeframe === "monthly"
                    ? "bg-brand-burgundy text-white shadow-sm shadow-brand-burgundy/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                MONTHLY (30D)
              </button>
              <button
                onClick={() => setTimeframe("month_picker")}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-all tracking-wider uppercase ${
                  timeframe === "month_picker"
                    ? "bg-brand-burgundy text-white shadow-sm shadow-brand-burgundy/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                SELECT MONTH
              </button>
            </div>

            {/* Calendar Month Dropdown (when month_picker is active) */}
            {timeframe === "month_picker" && (
              <select
                value={selectedMonthOffset}
                onChange={(e) => setSelectedMonthOffset(Number(e.target.value))}
                className="bg-brand-dark border border-zinc-800 text-xs text-white rounded px-3 py-2 outline-none focus:border-brand-gold"
              >
                {[0, 1, 2, 3, 4, 5].map((offset) => {
                  const d = new Date();
                  d.setMonth(d.getMonth() - offset);
                  const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
                  return (
                    <option key={offset} value={offset} className="bg-zinc-900 text-white">
                      {label}
                    </option>
                  );
                })}
              </select>
            )}

            {/* Print / Download PDF Button */}
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-brand-burgundy to-brand-burgundyHover hover:from-brand-burgundyHover hover:to-brand-burgundy text-white px-5 py-2 rounded text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-lg shadow-brand-burgundy/30 border border-brand-gold/30 disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-brand-gold" />
              <span>{isPrinting ? "PREPARING..." : "DOWNLOAD PDF REPORT"}</span>
            </button>
          </div>
        </div>

        {/* Reporting Period Indicator Strip */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-3.5 flex flex-wrap justify-between items-center gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <Calendar className="w-4 h-4 text-brand-gold" />
            <span className="text-zinc-400 uppercase tracking-wider font-medium">Active Window:</span>
            <span className="text-white font-mono font-bold tracking-wide">{metrics.dateRangeLabel}</span>
            <span className="text-[10px] text-zinc-500 font-mono">({metrics.timeframeLabel})</span>
          </div>

          <div className="flex items-center space-x-4 text-zinc-400 text-xs">
            <span>Orders Analyzed: <strong className="text-white font-mono">{filteredOrders.length}</strong></span>
            <span>Catalog Items Audited: <strong className="text-white font-mono">{products.length}</strong></span>
          </div>
        </div>

        {/* 1. Primary Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Net Revenue */}
          <div className="bg-brand-dark/60 border border-zinc-800/80 rounded-lg p-5 space-y-2 relative overflow-hidden group hover:border-brand-gold/40 transition-colors">
            <div className="flex justify-between items-start">
              <span className="text-[10px] tracking-widest text-zinc-400 uppercase font-bold">
                Net Recognized Revenue
              </span>
              <DollarSign className="w-4 h-4 text-brand-gold" />
            </div>
            <p className="font-serif text-3xl font-bold text-white tracking-wider">
              ${metrics.netRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono">
              Settled: ${metrics.settledRevenue.toLocaleString()} â€¢ Pending: ${metrics.pendingRevenue.toLocaleString()}
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-gold/40 via-brand-gold to-transparent opacity-60" />
          </div>

          {/* Orders Volume */}
          <div className="bg-brand-dark/60 border border-zinc-800/80 rounded-lg p-5 space-y-2 relative overflow-hidden group hover:border-brand-gold/40 transition-colors">
            <div className="flex justify-between items-start">
              <span className="text-[10px] tracking-widest text-zinc-400 uppercase font-bold">
                Total Orders Placed
              </span>
              <ShoppingBag className="w-4 h-4 text-brand-gold" />
            </div>
            <p className="font-serif text-3xl font-bold text-white tracking-wider">
              {metrics.totalOrders}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono">
              In current selected {timeframe === "weekly" ? "7-day" : "monthly"} cycle
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-burgundy via-brand-burgundyHover to-transparent opacity-60" />
          </div>

          {/* Average Order Value (AOV) */}
          <div className="bg-brand-dark/60 border border-zinc-800/80 rounded-lg p-5 space-y-2 relative overflow-hidden group hover:border-brand-gold/40 transition-colors">
            <div className="flex justify-between items-start">
              <span className="text-[10px] tracking-widest text-zinc-400 uppercase font-bold">
                Average Order Value
              </span>
              <TrendingUp className="w-4 h-4 text-brand-gold" />
            </div>
            <p className="font-serif text-3xl font-bold text-white tracking-wider">
              ${metrics.averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono">
              Basket size across successful transactions
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-gold/40 via-brand-gold to-transparent opacity-60" />
          </div>

          {/* Units Dispatched */}
          <div className="bg-brand-dark/60 border border-zinc-800/80 rounded-lg p-5 space-y-2 relative overflow-hidden group hover:border-brand-gold/40 transition-colors">
            <div className="flex justify-between items-start">
              <span className="text-[10px] tracking-widest text-zinc-400 uppercase font-bold">
                Couture Pieces Sold
              </span>
              <Package className="w-4 h-4 text-brand-gold" />
            </div>
            <p className="font-serif text-3xl font-bold text-white tracking-wider">
              {metrics.totalUnitsSold}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono">
              Total physical luxury units consigned
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-burgundy via-brand-burgundyHover to-transparent opacity-60" />
          </div>
        </div>

        {/* 2. Top Selling Products Table */}
        <div className="border border-zinc-900 bg-brand-dark/30 rounded-lg overflow-hidden space-y-4 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-serif text-lg text-white uppercase tracking-wider font-semibold">
                Top Selling Creations
              </h2>
              <p className="text-xs text-zinc-400">
                Ranked by volume consigned and gross revenue contribution in this cycle.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {metrics.topSellers.length} covetable pieces
            </span>
          </div>

          {metrics.topSellers.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-zinc-800 rounded">
              <p className="text-xs font-serif text-zinc-500 uppercase tracking-widest">
                No product acquisition transactions recorded for this specific period.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] bg-zinc-950/60">
                    <th className="py-3 px-4 w-12 text-center">Rank</th>
                    <th className="py-3 px-4">Creation</th>
                    <th className="py-3 px-4">Maison / Brand</th>
                    <th className="py-3 px-4 text-center">Units Sold</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Gross Volume</th>
                    <th className="py-3 px-4 text-right">Revenue Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 font-mono">
                  {metrics.topSellers.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 px-4 text-center font-bold text-brand-gold">
                        #{idx + 1}
                      </td>
                      <td className="py-3 px-4 font-sans font-medium text-white flex items-center space-x-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-8 h-8 rounded object-cover border border-zinc-800"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/placeholder.webp";
                            }}
                          />
                        )}
                        <span>{item.name}</span>
                      </td>
                      <td className="py-3 px-4 text-zinc-400 uppercase font-sans text-[11px]">
                        {item.brand}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-white">
                        {item.unitsSold}
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-300">
                        ${item.price.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white">
                        ${item.revenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-brand-gold font-semibold">
                        {item.sharePercent.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 3. Newly Added Products vs. Sales Velocity */}
        <div className="border border-zinc-900 bg-brand-dark/30 rounded-lg overflow-hidden space-y-4 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-serif text-lg text-white uppercase tracking-wider font-semibold">
                Newly Added Creations vs. Sales Traction
              </h2>
              <p className="text-xs text-zinc-400">
                Evaluation of recent atelier catalog additions (last 60 days): units consigned vs remaining vault inventory.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {metrics.newProductsPerformance.length} recent additions
            </span>
          </div>

          {metrics.newProductsPerformance.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-zinc-800 rounded">
              <p className="text-xs font-serif text-zinc-500 uppercase tracking-widest">
                No new atelier catalog additions introduced in this cycle.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] bg-zinc-950/60">
                    <th className="py-3 px-4">Piece Name</th>
                    <th className="py-3 px-4">Date Introduced</th>
                    <th className="py-3 px-4 text-center">Units Dispatched</th>
                    <th className="py-3 px-4 text-center">Vault Balance</th>
                    <th className="py-3 px-4 text-right">Gross Sales</th>
                    <th className="py-3 px-4 text-center">Adoption Velocity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 font-mono">
                  {metrics.newProductsPerformance.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 px-4 font-sans font-medium text-white">
                        {item.name}
                        <span className="block text-[10px] text-zinc-500 uppercase font-mono">{item.brand}</span>
                      </td>
                      <td className="py-3 px-4 text-zinc-400 font-sans text-[11px]">
                        {item.createdAtFormatted}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-white">
                        {item.unitsSold}
                      </td>
                      <td className="py-3 px-4 text-center text-zinc-300">
                        {item.currentStock} pcs
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white">
                        ${item.revenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${
                          item.velocityStatus === "HIGH DEMAND"
                            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                            : item.velocityStatus === "STEADY"
                            ? "bg-blue-950/80 text-blue-400 border border-blue-800"
                            : "bg-zinc-800 text-zinc-400"
                        }`}>
                          {item.velocityStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 4. Low Stock Products Restock Alert Ledger */}
        <div className="border border-zinc-900 bg-brand-dark/30 rounded-lg overflow-hidden space-y-4 p-6">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h2 className="font-serif text-lg text-white uppercase tracking-wider font-semibold">
                  Low Stock Inventory & Restock Advisory
                </h2>
              </div>
              <p className="text-xs text-zinc-400">
                Atelier pieces at or below critical safety thresholds (â‰¤ 5 units remaining in vault).
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {metrics.lowStockItems.length} items flagged
            </span>
          </div>

          {metrics.lowStockItems.length === 0 ? (
            <div className="py-8 text-center border border-zinc-900 bg-zinc-950/40 rounded flex items-center justify-center space-x-2 text-emerald-400 text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>All atelier vault inventory balances are currently healthy.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] bg-zinc-950/60">
                    <th className="py-3 px-4">Creation Details</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4 text-center">Remaining Units</th>
                    <th className="py-3 px-4 text-center">Urgency</th>
                    <th className="py-3 px-4 text-right">Replenishment Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 font-mono">
                  {metrics.lowStockItems.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 px-4 font-sans font-medium text-white">
                        {item.name}
                        <span className="block text-[10px] text-zinc-500 uppercase font-mono">{item.brand}</span>
                      </td>
                      <td className="py-3 px-4 text-zinc-400 font-sans uppercase text-[10px]">
                        {item.categoryLabel}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-white">
                        {item.stockCount} units
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${
                          item.urgency === "OUT OF STOCK"
                            ? "bg-rose-950/80 text-rose-400 border border-rose-800"
                            : item.urgency === "CRITICAL"
                            ? "bg-amber-950/80 text-amber-400 border border-amber-800"
                            : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                        }`}>
                          {item.urgency}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-brand-gold font-bold">
                        +{item.recommendedRestock} units
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================================
          PRINT LAYER (Rendered exclusively during window.print())
          ==================================================================== */}
      <PrintableReport metrics={metrics} />
    </div>
  );
};
