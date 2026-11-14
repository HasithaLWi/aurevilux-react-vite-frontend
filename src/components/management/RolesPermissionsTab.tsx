import React from "react";
import { Check, X } from "lucide-react";

export const RolesPermissionsTab: React.FC = () => {
  const permissions = [
    {
      module: "Products Management",
      desc: "Add, edit, soft-delete pieces & toggle live store visibility",
      superadmin: true,
      admin: true,
      staff: true,
      customer: false,
    },
    {
      module: "Supabase Imagery Upload",
      desc: "Store and purge up to 5 high-res assets per luxury piece",
      superadmin: true,
      admin: true,
      staff: true,
      customer: false,
    },
    {
      module: "Categories & Taxonomy",
      desc: "Manage two-tier department & subcategory connections",
      superadmin: true,
      admin: true,
      staff: false,
      customer: false,
    },
    {
      module: "Brand Houses & Applications",
      desc: "Register maisons and approve/reject designer submissions",
      superadmin: true,
      admin: true,
      staff: false,
      customer: false,
    },
    {
      module: "Orders & Dispatch Logistics",
      desc: "Update workflow status, assign tracking & white-glove couriers",
      superadmin: true,
      admin: true,
      staff: true,
      customer: false,
    },
    {
      module: "Customer Order Cancellation",
      desc: "Patron can cancel placed order strictly prior to processing",
      superadmin: true,
      admin: true,
      staff: false,
      customer: true,
    },
    {
      module: "Testimonials Moderation",
      desc: "Feature client boutique reviews onto homepage showcase",
      superadmin: true,
      admin: true,
      staff: false,
      customer: false,
    },
    {
      module: "Newsletter Broadcast",
      desc: "Compose and dispatch mass email campaigns via Nodemailer SMTP",
      superadmin: true,
      admin: true,
      staff: false,
      customer: false,
    },
    {
      module: "Staff Management (Admins)",
      desc: "Invite, suspend, and remove Atelier Administrators",
      superadmin: true,
      admin: false,
      staff: false,
      customer: false,
    },
    {
      module: "Staff Management (Personnel)",
      desc: "Invite and manage catalog fulfillment team members",
      superadmin: true,
      admin: true,
      staff: false,
      customer: false,
    },
    {
      module: "Boutique Settings & Policies",
      desc: "Configure luxury parameters, currency, thresholds and gateways",
      superadmin: true,
      admin: false,
      staff: false,
      customer: false,
    },
  ];

  return (
    <div className="space-y-6 w-full text-left">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-5">
        <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold">
          GOVERNANCE MATRIX
        </span>
        <h1 className="font-serif text-2xl md:text-3xl uppercase text-white tracking-wider mt-1">
          Roles & Atelier Permissions (RBAC)
        </h1>
      </div>

      {/* Role Hierarchy Visual */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "SUPERADMIN",
            subtitle: "Default Root Authority",
            desc: "Unrestricted sovereignty. Sole authority to manage Admins and system configurations.",
            color: "text-brand-gold border-brand-gold/30 bg-brand-gold/5",
          },
          {
            title: "ADMIN",
            subtitle: "Executive Directorate",
            desc: "Full backoffice management. Manages catalog, orders, brands, and staff personnel.",
            color: "text-brand-burgundy border-brand-burgundy/40 bg-brand-burgundy/10",
          },
          {
            title: "STAFF",
            subtitle: "Fulfillment & Catalog",
            desc: "Manages catalog inventory, pieces, orders, and courier dispatch assignments.",
            color: "text-zinc-300 border-zinc-800 bg-zinc-900/60",
          },
          {
            title: "CUSTOMER",
            subtitle: "Private Patrons",
            desc: "Shopping bag, bespoke orders, address book, reviews, and pre-processing cancel.",
            color: "text-blue-400 border-blue-500/30 bg-blue-500/5",
          },
        ].map((r, i) => (
          <div key={i} className={`p-4 rounded-lg border ${r.color} space-y-2`}>
            <span className="font-serif font-bold uppercase text-sm block tracking-wider">
              {r.title}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 block">
              {r.subtitle}
            </span>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-[#101014] border border-zinc-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-900/60 text-zinc-500 uppercase text-[9px] tracking-widest font-semibold border-b border-zinc-900">
              <tr>
                <th className="py-3 px-4">Atelier Capability</th>
                <th className="py-3 px-4 text-center">SuperAdmin</th>
                <th className="py-3 px-4 text-center">Admin</th>
                <th className="py-3 px-4 text-center">Staff</th>
                <th className="py-3 px-4 text-center">Customer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 font-light">
              {permissions.map((p, idx) => (
                <tr key={idx} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-white uppercase text-xs">{p.module}</p>
                    <span className="text-[10px] text-zinc-500 block">{p.desc}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {p.superadmin ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-zinc-700 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {p.admin ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-zinc-700 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {p.staff ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-zinc-700 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {p.customer ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-zinc-700 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
