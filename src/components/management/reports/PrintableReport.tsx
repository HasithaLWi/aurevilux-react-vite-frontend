import React from "react";

export interface ReportMetrics {
  timeframeLabel: string;
  dateRangeLabel: string;
  generatedAt: string;
  generatedBy: string;
  totalRevenue: number;
  netRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalUnitsSold: number;
  settledRevenue: number;
  pendingRevenue: number;
  refundedRevenue: number;
  topSellers: Array<{
    id: string;
    name: string;
    brand: string;
    price: number;
    unitsSold: number;
    revenue: number;
    sharePercent: number;
    image?: string;
  }>;
  newProductsPerformance: Array<{
    id: string;
    name: string;
    brand: string;
    price: number;
    createdAtFormatted: string;
    unitsSold: number;
    revenue: number;
    currentStock: number;
    velocityStatus: string;
  }>;
  lowStockItems: Array<{
    id: string;
    name: string;
    brand: string;
    categoryLabel: string;
    stockCount: number;
    urgency: "OUT OF STOCK" | "CRITICAL" | "LOW STOCK";
    recommendedRestock: number;
  }>;
}

interface PrintableReportProps {
  metrics: ReportMetrics;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ metrics }) => {
  // Budgeted slices to ensure each page fits cleanly on its single A4 sheet without overflow
  const topSellersPrint = metrics.topSellers.slice(0, 6);
  const newProductsPrint = metrics.newProductsPerformance.slice(0, 5);
  const lowStockPrint = metrics.lowStockItems.slice(0, 6);

  return (
    <div className="hidden print:block w-full bg-white text-slate-900 font-sans">
      {/* ====================================================================
          PAGE 1: COVER & EXECUTIVE REVENUE OVERVIEW (Single A4 Sheet)
          ==================================================================== */}
      <section className="print-page print-page-break py-2">
        {/* Header & Crest */}
        <div className="border-b-2 border-slate-900 pb-3 mb-5 flex justify-between items-end">
          <div>
            <span className="text-[9px] tracking-[0.35em] text-slate-500 font-bold uppercase block">
              ATELIER EXECUTIVE INTELLIGENCE
            </span>
            <h1 className="font-serif text-3xl tracking-[0.2em] font-bold text-slate-950 uppercase mt-0.5">
              A U R E V I L U X
            </h1>
            <p className="text-[11px] text-slate-600 tracking-wider uppercase mt-0.5">
              {metrics.timeframeLabel} Financial & Operations Audit
            </p>
          </div>
          <div className="text-right space-y-0.5">
            <span className="inline-block px-2 py-0.5 bg-slate-900 text-white text-[9px] tracking-widest font-mono font-bold uppercase rounded">
              OFFICIAL REPORT
            </span>
            <p className="text-[9px] text-slate-500 font-mono">
              CYCLE: {metrics.dateRangeLabel}
            </p>
            <p className="text-[9px] text-slate-500 font-mono">
              GENERATED: {metrics.generatedAt}
            </p>
          </div>
        </div>

        {/* Report Metadata Strip */}
        <div className="bg-slate-50 border border-slate-200 rounded p-3 mb-5 grid grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-[8px] uppercase tracking-wider text-slate-500 font-semibold block">
              Reporting Cycle
            </span>
            <span className="font-bold text-slate-900 tracking-wide text-xs mt-0.5 block">
              {metrics.timeframeLabel}
            </span>
            <span className="text-[9px] text-slate-600 font-mono">
              {metrics.dateRangeLabel}
            </span>
          </div>
          <div>
            <span className="text-[8px] uppercase tracking-wider text-slate-500 font-semibold block">
              Audited Authority
            </span>
            <span className="font-bold text-slate-900 text-xs mt-0.5 block truncate">
              {metrics.generatedBy}
            </span>
            <span className="text-[9px] text-slate-600">
              Aurevilux Atelier Directorate
            </span>
          </div>
          <div>
            <span className="text-[8px] uppercase tracking-wider text-slate-500 font-semibold block">
              Verification Ledger
            </span>
            <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block">
              AUR-REP-{(Date.now() % 1000000).toString().padStart(6, "0")}
            </span>
            <span className="text-[9px] text-emerald-700 font-medium">
              â—  Direct DB Extract Verified
            </span>
          </div>
        </div>

        {/* Section 1 Header */}
        <div className="mb-3">
          <h2 className="font-serif text-base tracking-widest font-bold uppercase text-slate-950">
            1. Executive Performance Scorecard
          </h2>
          <p className="text-[10px] text-slate-500">
            High-level monetary velocity, order completions, and basket metrics.
          </p>
        </div>

        {/* 4 Primary KPI Cards */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          <div className="border border-slate-300 rounded p-3 bg-slate-50/50 break-inside-avoid">
            <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold block">
              Net Recognized Revenue
            </span>
            <span className="text-xl font-serif font-bold text-slate-950 mt-1 block">
              ${metrics.netRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[8px] text-slate-500 mt-0.5 block">
              Settled & active orders
            </span>
          </div>

          <div className="border border-slate-300 rounded p-3 bg-slate-50/50 break-inside-avoid">
            <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold block">
              Total Orders Dispatched
            </span>
            <span className="text-xl font-serif font-bold text-slate-950 mt-1 block">
              {metrics.totalOrders}
            </span>
            <span className="text-[8px] text-slate-500 mt-0.5 block">
              In current cycle window
            </span>
          </div>

          <div className="border border-slate-300 rounded p-3 bg-slate-50/50 break-inside-avoid">
            <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold block">
              Average Order Value
            </span>
            <span className="text-xl font-serif font-bold text-slate-950 mt-1 block">
              ${metrics.averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[8px] text-slate-500 mt-0.5 block">
              Per successful acquisition
            </span>
          </div>

          <div className="border border-slate-300 rounded p-3 bg-slate-50/50 break-inside-avoid">
            <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold block">
              Atelier Units Sold
            </span>
            <span className="text-xl font-serif font-bold text-slate-950 mt-1 block">
              {metrics.totalUnitsSold}
            </span>
            <span className="text-[8px] text-slate-500 mt-0.5 block">
              Couture pieces delivered
            </span>
          </div>
        </div>

        {/* Revenue Breakdown Ledger */}
        <div className="mb-6 break-inside-avoid">
          <h3 className="font-serif text-xs tracking-wider font-bold uppercase text-slate-900 mb-1.5">
            Financial Settlement Status Ledger
          </h3>
          <table className="w-full text-xs border border-slate-200">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                <th className="p-2 text-left font-semibold uppercase tracking-wider text-[9px]">Settlement Category</th>
                <th className="p-2 text-center font-semibold uppercase tracking-wider text-[9px] w-24">Status</th>
                <th className="p-2 text-right font-semibold uppercase tracking-wider text-[9px] w-32">Gross Volume</th>
                <th className="p-2 text-right font-semibold uppercase tracking-wider text-[9px] w-24">Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[11px]">
              <tr>
                <td className="p-2 font-medium text-slate-900">Settled & Completed Acquisitions</td>
                <td className="p-2 text-center">
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[8px]">SETTLED</span>
                </td>
                <td className="p-2 text-right font-mono font-semibold text-slate-900">
                  ${metrics.settledRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="p-2 text-right font-mono text-slate-600">
                  {metrics.totalRevenue > 0 ? ((metrics.settledRevenue / metrics.totalRevenue) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr>
                <td className="p-2 font-medium text-slate-900">Pending Authorization / In Transit</td>
                <td className="p-2 text-center">
                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold text-[8px]">PENDING</span>
                </td>
                <td className="p-2 text-right font-mono font-semibold text-slate-900">
                  ${metrics.pendingRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="p-2 text-right font-mono text-slate-600">
                  {metrics.totalRevenue > 0 ? ((metrics.pendingRevenue / metrics.totalRevenue) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr>
                <td className="p-2 font-medium text-slate-900">Cancelled / Reimbursed Allocations</td>
                <td className="p-2 text-center">
                  <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold text-[8px]">REIMBURSED</span>
                </td>
                <td className="p-2 text-right font-mono font-semibold text-slate-900">
                  ${metrics.refundedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="p-2 text-right font-mono text-slate-600">
                  {metrics.totalRevenue > 0 ? ((metrics.refundedRevenue / metrics.totalRevenue) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr className="bg-slate-50 font-bold">
                <td className="p-2 uppercase tracking-wider text-slate-900 text-[10px]">Total Net Recognized Ledger</td>
                <td className="p-2 text-center text-slate-400">â€”</td>
                <td className="p-2 text-right font-mono text-slate-950 text-xs">
                  ${metrics.netRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="p-2 text-right font-mono text-slate-950">100.0%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Page 1 Footer */}
        <div className="pt-3 mt-4 border-t border-slate-200 flex justify-between text-[8px] text-slate-400 font-mono">
          <span>Aurevilux Atelier Management System â€¢ Executive Confidential Ledger</span>
          <span>Page 1 of 3</span>
        </div>
      </section>

      {/* ====================================================================
          PAGE 2: TOP SELLING PIECES & NEW RELEASES VELOCITY (Single A4 Sheet)
          ==================================================================== */}
      <section className="print-page print-page-break py-2">
        {/* Page 2 Mini Header */}
        <div className="border-b border-slate-200 pb-2 mb-4 flex justify-between items-center">
          <div>
            <span className="font-serif font-bold text-slate-900 tracking-widest uppercase text-xs">
              A U R E V I L U X â€” COMMERCIAL VELOCITY REPORT
            </span>
            <p className="text-[8px] text-slate-500 uppercase tracking-wider">
              Cycle: {metrics.dateRangeLabel}
            </p>
          </div>
          <span className="font-mono text-[8px] text-slate-400">Section 2 & 3</span>
        </div>

        {/* Section 2: Top Selling Products */}
        <div className="mb-5 break-inside-avoid">
          <h2 className="font-serif text-sm tracking-widest font-bold uppercase text-slate-950 mb-0.5">
            2. Top Coveted Acquisitions (Best Sellers)
          </h2>
          <p className="text-[10px] text-slate-500 mb-2">
            Ranked by unit volume dispatched and gross revenue contribution in this cycle.
          </p>

          {topSellersPrint.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded p-4 text-center text-slate-400 text-xs">
              No product acquisition transactions recorded for this specific period.
            </div>
          ) : (
            <table className="w-full text-xs border border-slate-200">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                  <th className="p-2 text-center font-semibold uppercase tracking-wider text-[9px] w-10">Rank</th>
                  <th className="p-2 text-left font-semibold uppercase tracking-wider text-[9px]">Atelier Piece</th>
                  <th className="p-2 text-left font-semibold uppercase tracking-wider text-[9px]">Maison</th>
                  <th className="p-2 text-center font-semibold uppercase tracking-wider text-[9px] w-20">Units Sold</th>
                  <th className="p-2 text-right font-semibold uppercase tracking-wider text-[9px] w-24">Piece Price</th>
                  <th className="p-2 text-right font-semibold uppercase tracking-wider text-[9px] w-24">Gross Volume</th>
                  <th className="p-2 text-right font-semibold uppercase tracking-wider text-[9px] w-16">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {topSellersPrint.map((item, idx) => (
                  <tr key={item.id || idx} className={idx % 2 === 1 ? "bg-slate-50/50" : ""}>
                    <td className="p-2 text-center font-mono font-bold text-slate-600">
                      #{idx + 1}
                    </td>
                    <td className="p-2 font-medium text-slate-900 truncate max-w-[180px]">
                      {item.name}
                    </td>
                    <td className="p-2 text-slate-600 uppercase text-[9px] font-semibold">
                      {item.brand}
                    </td>
                    <td className="p-2 text-center font-mono font-bold text-slate-900">
                      {item.unitsSold}
                    </td>
                    <td className="p-2 text-right font-mono text-slate-700">
                      ${item.price.toLocaleString()}
                    </td>
                    <td className="p-2 text-right font-mono font-semibold text-slate-900">
                      ${item.revenue.toLocaleString()}
                    </td>
                    <td className="p-2 text-right font-mono text-slate-500">
                      {item.sharePercent.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Section 3: Newly Added Products vs Selling */}
        <div className="mb-4 break-inside-avoid">
          <h2 className="font-serif text-sm tracking-widest font-bold uppercase text-slate-950 mb-0.5">
            3. Newly Added Creations vs. Commercial Traction
          </h2>
          <p className="text-[10px] text-slate-500 mb-2">
            Performance of recent catalog additions: units consigned vs. remaining vault inventory.
          </p>

          {newProductsPrint.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded p-4 text-center text-slate-400 text-xs">
              No new atelier catalog additions were introduced during this evaluation cycle.
            </div>
          ) : (
            <table className="w-full text-xs border border-slate-200">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                  <th className="p-2 text-left font-semibold uppercase tracking-wider text-[9px]">Piece Name</th>
                  <th className="p-2 text-left font-semibold uppercase tracking-wider text-[9px]">Introduced</th>
                  <th className="p-2 text-center font-semibold uppercase tracking-wider text-[9px] w-24">Units Dispatched</th>
                  <th className="p-2 text-center font-semibold uppercase tracking-wider text-[9px] w-24">Vault Balance</th>
                  <th className="p-2 text-right font-semibold uppercase tracking-wider text-[9px] w-24">Gross Sales</th>
                  <th className="p-2 text-center font-semibold uppercase tracking-wider text-[9px] w-28">Velocity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {newProductsPrint.map((item, idx) => (
                  <tr key={item.id || idx} className={idx % 2 === 1 ? "bg-slate-50/50" : ""}>
                    <td className="p-2 font-medium text-slate-900 truncate max-w-[180px]">
                      {item.name}
                      <span className="block text-[8px] text-slate-500 uppercase font-mono">{item.brand}</span>
                    </td>
                    <td className="p-2 text-slate-600 font-mono text-[9px]">
                      {item.createdAtFormatted}
                    </td>
                    <td className="p-2 text-center font-mono font-bold text-slate-900">
                      {item.unitsSold}
                    </td>
                    <td className="p-2 text-center font-mono text-slate-700">
                      {item.currentStock} pcs
                    </td>
                    <td className="p-2 text-right font-mono font-semibold text-slate-900">
                      ${item.revenue.toLocaleString()}
                    </td>
                    <td className="p-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase ${
                        item.velocityStatus === "HIGH DEMAND"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.velocityStatus === "STEADY"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {item.velocityStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Page 2 Footer */}
        <div className="pt-3 mt-4 border-t border-slate-200 flex justify-between text-[8px] text-slate-400 font-mono">
          <span>Aurevilux Atelier Management System â€¢ Commercial Auditing</span>
          <span>Page 2 of 3</span>
        </div>
      </section>

      {/* ====================================================================
          PAGE 3: INVENTORY RESTOCK ADVISORY & AUDIT SIGN-OFF (Single A4 Sheet)
          ==================================================================== */}
      <section className="print-page py-2">
        {/* Page 3 Mini Header */}
        <div className="border-b border-slate-200 pb-2 mb-4 flex justify-between items-center">
          <div>
            <span className="font-serif font-bold text-slate-900 tracking-widest uppercase text-xs">
              A U R E V I L U X â€” INVENTORY & VAULT HEALTH
            </span>
            <p className="text-[8px] text-slate-500 uppercase tracking-wider">
              Cycle: {metrics.dateRangeLabel}
            </p>
          </div>
          <span className="font-mono text-[8px] text-slate-400">Section 4 & Endorsement</span>
        </div>

        {/* Section 4: Low Stock Products */}
        <div className="mb-5 break-inside-avoid">
          <h2 className="font-serif text-sm tracking-widest font-bold uppercase text-slate-950 mb-0.5">
            4. Low Stock Inventory & Restock Advisory Ledger
          </h2>
          <p className="text-[10px] text-slate-500 mb-2">
            Pieces below minimum safety threshold (â‰¤ 5 units or depleted size variants).
          </p>

          {lowStockPrint.length === 0 ? (
            <div className="border border-emerald-200 bg-emerald-50/40 rounded p-4 text-center text-emerald-800 text-xs">
              âœ“ All atelier vault inventory levels are currently healthy. No items require immediate replenishment.
            </div>
          ) : (
            <table className="w-full text-xs border border-slate-200">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                  <th className="p-2 text-left font-semibold uppercase tracking-wider text-[9px]">Piece Details</th>
                  <th className="p-2 text-left font-semibold uppercase tracking-wider text-[9px]">Department</th>
                  <th className="p-2 text-center font-semibold uppercase tracking-wider text-[9px] w-24">Vault Balance</th>
                  <th className="p-2 text-center font-semibold uppercase tracking-wider text-[9px] w-28">Urgency</th>
                  <th className="p-2 text-right font-semibold uppercase tracking-wider text-[9px] w-28">Restock Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {lowStockPrint.map((item, idx) => (
                  <tr key={item.id || idx} className={idx % 2 === 1 ? "bg-slate-50/50" : ""}>
                    <td className="p-2 font-medium text-slate-900 truncate max-w-[200px]">
                      {item.name}
                      <span className="block text-[8px] text-slate-500 uppercase font-mono">{item.brand}</span>
                    </td>
                    <td className="p-2 text-slate-600 text-[9px] uppercase font-semibold">
                      {item.categoryLabel || "HAUTE COUTURE"}
                    </td>
                    <td className="p-2 text-center font-mono font-bold text-slate-900">
                      {item.stockCount} units
                    </td>
                    <td className="p-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase ${
                        item.urgency === "OUT OF STOCK"
                          ? "bg-rose-100 text-rose-800"
                          : item.urgency === "CRITICAL"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-800"
                      }`}>
                        {item.urgency}
                      </span>
                    </td>
                    <td className="p-2 text-right font-mono font-semibold text-slate-900">
                      +{item.recommendedRestock} units
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Section 5: Formal Atelier Endorsement & Verification Block */}
        <div className="border border-slate-300 rounded p-4 bg-slate-50/50 mt-4 break-inside-avoid">
          <h3 className="font-serif text-xs tracking-widest font-bold uppercase text-slate-900 mb-1">
            Atelier Verification & Executive Sign-off
          </h3>
          <p className="text-[9px] text-slate-500 leading-relaxed mb-4">
            This executive audit report has been compiled in accordance with Aurevilux Atelier internal governance standards. All figures correspond strictly to authenticated MongoDB transactional records.
          </p>

          <div className="grid grid-cols-2 gap-6 pt-3 border-t border-slate-200">
            <div>
              <span className="text-[8px] uppercase tracking-wider text-slate-500 block">
                Executive Audited By
              </span>
              <span className="font-bold text-slate-900 text-xs block mt-0.5">
                {metrics.generatedBy}
              </span>
              <span className="text-[8px] text-slate-500 block">
                Aurevilux Atelier Directorate
              </span>
              <div className="mt-5 border-b border-slate-400 w-44" />
              <span className="text-[7px] text-slate-400 font-mono block mt-0.5">
                SIGNATURE & DATE
              </span>
            </div>

            <div className="text-right">
              <span className="text-[8px] uppercase tracking-wider text-slate-500 block">
                Atelier Security Stamp
              </span>
              <div className="mt-1.5 inline-block border-2 border-slate-800 px-3 py-1.5 rounded text-center">
                <span className="font-serif font-bold text-[11px] tracking-widest text-slate-900 block uppercase">
                  A U R E V I L U X
                </span>
                <span className="font-mono text-[7px] text-slate-600 block">
                  VERIFIED & SEALED
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page 3 Footer */}
        <div className="pt-3 mt-4 border-t border-slate-200 flex justify-between text-[8px] text-slate-400 font-mono">
          <span>Aurevilux Atelier Management System â€¢ Official Audit Ledger</span>
          <span>Page 3 of 3 (End of Report)</span>
        </div>
      </section>
    </div>
  );
};
