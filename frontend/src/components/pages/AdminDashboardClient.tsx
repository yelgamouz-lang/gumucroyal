"use client";

import { useCallback, useEffect, useState } from "react";
import {
  adminLogin,
  clearAdminToken,
  fetchAdminMetrics,
  fetchAdminOrder,
  fetchAdminOrders,
  getAdminToken,
} from "@/lib/analytics";
import { PriceDisplay } from "@/components/shared/UI";
import { cn } from "@/lib/cn";

type Metrics = {
  visits: number;
  clicks: number;
  orders: number;
  orders_created?: number;
  conversion_rate_pct: number;
  average_order_value_mad: number;
  total_revenue_mad: number;
  orders_by_status: Record<string, number>;
  units_by_product: Record<string, number>;
  revenue_by_product?: Record<string, number>;
  orders_by_offer_quantity: Record<string, number>;
};

type OrderItem = {
  product_name: string;
  sku: string | null;
  offer_tier: string | null;
  quantity: number;
  unit_price_mad: number;
  total_price_mad: number;
  is_upsell: boolean;
  line_type: string;
};

type OrderRow = {
  order_number: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  customer_city?: string;
  products_summary: string;
  total_mad: number;
  created_at: string;
  confirmed_at: string | null;
  payment_method: string;
  sheet_synced?: boolean;
  capi_synced?: boolean;
  items: OrderItem[];
};

const STATUS_LABELS: Record<string, string> = {
  completed: "Confirmée",
  upsell_offered: "Non finalisée",
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
};

const OFFER_LABELS: Record<string, string> = {
  "1_piece": "1 pièce",
  "2_piece": "2 pièces (Duo)",
  "3_piece": "3 pièces (Pack)",
  "2e_piece_69": "2ᵉ pièce (+69 Dhs)",
};

function defaultRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-MA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function offerTierLabel(key: string) {
  return OFFER_LABELS[key] ?? key.replace("_", " ");
}

function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABELS[status] ?? status;
  const tone =
    status === "completed" || status === "confirmed"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : status === "upsell_offered"
        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
        : "bg-brand-white/10 text-brand-white/70 border-brand-gray/40";
  return (
    <span className={cn("inline-block text-xs px-2 py-0.5 border rounded-full", tone)}>{label}</span>
  );
}

function KpiCard({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="admin-kpi-card border border-brand-gold/20 p-4 bg-brand-charcoal rounded-lg">
      <p className="text-xs text-brand-white/50 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-semibold text-brand-gold mt-1 font-price-figures">{value}</p>
      {hint && <p className="text-xs text-brand-white/40 mt-1">{hint}</p>}
    </div>
  );
}

function BreakdownTable({
  title,
  rows,
  valueLabel,
}: {
  title: string;
  rows: [string, string | number][];
  valueLabel?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="border border-brand-gold/20 p-4 rounded-lg">
        <p className="text-brand-gold mb-2">{title}</p>
        <p className="text-sm text-brand-white/40">Aucune donnée sur la période.</p>
      </div>
    );
  }
  return (
    <div className="border border-brand-gold/20 p-4 rounded-lg">
      <p className="text-brand-gold mb-3 font-display tracking-wide">{title}</p>
      <ul className="text-sm space-y-2">
        {rows.map(([k, v]) => (
          <li key={k} className="flex justify-between gap-3 border-b border-brand-gray/15 pb-2 last:border-0">
            <span className="text-brand-white/80 truncate">{k}</span>
            <span className="shrink-0 text-brand-gold font-price-figures">
              {v}
              {valueLabel ? ` ${valueLabel}` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdminDashboardClient() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "orders">("overview");
  const [range, setRange] = useState(defaultRange);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [selected, setSelected] = useState<OrderRow | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setToken(getAdminToken());
  }, []);

  const loadData = useCallback(async () => {
    if (!getAdminToken()) return;
    setLoading(true);
    setError("");
    try {
      const startIso = `${range.start}T00:00:00Z`;
      const endIso = `${range.end}T23:59:59Z`;
      const [m, o] = await Promise.all([
        fetchAdminMetrics(startIso, endIso),
        fetchAdminOrders(startIso, endIso),
      ]);
      setMetrics(m);
      setOrders(o.orders || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      clearAdminToken();
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    if (token) loadData();
  }, [token, loadData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const t = await adminLogin(username, password);
      setToken(t);
    } catch {
      setError("Identifiants invalides ou admin non configuré côté serveur.");
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    setToken(null);
    setMetrics(null);
    setOrders([]);
    setSelected(null);
  };

  const openOrder = async (orderNumber: string) => {
    try {
      const detail = await fetchAdminOrder(orderNumber);
      setSelected(detail);
    } catch {
      setError("Commande introuvable");
    }
  };

  if (!token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4" dir="ltr">
        <form onSubmit={handleLogin} className="admin-login-panel w-full max-w-sm border border-brand-gold/30 p-8 bg-brand-charcoal space-y-4 rounded-lg">
          <h1 className="font-display text-2xl text-brand-gold text-center">Admin GUMÜÇ ROYAL</h1>
          <p className="text-xs text-brand-white/50 text-center">Accès réservé — identifiants définis dans le backend.</p>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Utilisateur"
            className="luxury-input w-full bg-brand-black border border-brand-gray/50 p-3 rounded"
            autoComplete="username"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="luxury-input w-full bg-brand-black border border-brand-gray/50 p-3 rounded"
            autoComplete="current-password"
            required
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" className="gold-brilliant-btn w-full py-3 text-brand-black font-semibold rounded">
            Connexion
          </button>
        </form>
      </div>
    );
  }

  const productRows = Object.entries(metrics?.units_by_product ?? {}).sort((a, b) => b[1] - a[1]);
  const revenueRows = Object.entries(metrics?.revenue_by_product ?? {})
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => [k, `${Math.round(v)} Dhs`] as [string, string]);
  const offerRows = Object.entries(metrics?.orders_by_offer_quantity ?? {})
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => [offerTierLabel(k), v] as [string, number]);
  const statusRows = Object.entries(metrics?.orders_by_status ?? {}).map(([k, v]) => [
    STATUS_LABELS[k] ?? k,
    v,
  ] as [string, number]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10" dir="ltr">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl text-brand-gold">Dashboard GUMÜÇ ROYAL</h1>
          <p className="text-sm text-brand-white/50 mt-1">Commandes COD · trafic Maroc uniquement</p>
        </div>
        <button type="button" onClick={handleLogout} className="text-sm text-brand-white/60 hover:text-brand-gold underline">
          Déconnexion
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6 items-end p-4 bg-brand-charcoal/50 border border-brand-gray/20 rounded-lg">
        <label className="text-sm">
          Du
          <input
            type="date"
            value={range.start}
            onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))}
            className="block mt-1 bg-brand-black border border-brand-gray/50 p-2 rounded"
          />
        </label>
        <label className="text-sm">
          Au
          <input
            type="date"
            value={range.end}
            onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))}
            className="block mt-1 bg-brand-black border border-brand-gray/50 p-2 rounded"
          />
        </label>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="gold-brilliant-btn px-5 py-2.5 text-brand-black text-sm font-semibold rounded"
        >
          {loading ? "Chargement…" : "Actualiser"}
        </button>
      </div>

      <div className="flex gap-2 mb-8 border-b border-brand-gray/30">
        {(["overview", "orders"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm uppercase tracking-wider transition-colors",
              tab === t ? "text-brand-gold border-b-2 border-brand-gold" : "text-brand-white/60 hover:text-brand-white"
            )}
          >
            {t === "overview" ? "Vue d'ensemble" : `Commandes (${orders.length})`}
          </button>
        ))}
      </div>

      {error && <p className="text-red-400 mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded">{error}</p>}

      {tab === "overview" && metrics && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <KpiCard label="Visites (MA)" value={metrics.visits} hint="IP marocaines validées" />
            <KpiCard label="Clics (MA)" value={metrics.clicks} hint="CTA panier / checkout" />
            <KpiCard label="Commandes confirmées" value={metrics.orders} />
            <KpiCard label="Taux conversion" value={`${metrics.conversion_rate_pct} %`} hint="Confirmées / visites MA" />
            <KpiCard
              label="Chiffre d'affaires"
              value={<PriceDisplay amount={metrics.total_revenue_mad} compact />}
            />
            <KpiCard
              label="Panier moyen"
              value={<PriceDisplay amount={metrics.average_order_value_mad} compact />}
            />
          </div>

          {metrics.orders_created != null && metrics.orders_created !== metrics.orders && (
            <p className="text-sm text-brand-white/50">
              {metrics.orders_created} commande(s) créée(s) sur la période dont {metrics.orders} confirmée(s).
            </p>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <BreakdownTable title="Répartition par statut" rows={statusRows} />
            <BreakdownTable title="Répartition par offre" rows={offerRows} valueLabel="ligne(s)" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <BreakdownTable
              title="Unités vendues par produit"
              rows={productRows}
              valueLabel="unité(s)"
            />
            <BreakdownTable title="CA par produit" rows={revenueRows} />
          </div>

          <p className="text-xs text-brand-white/40 border-t border-brand-gray/20 pt-4">
            Visites et clics : comptés uniquement pour les IP géolocalisées au Maroc (MA). Point d&apos;extension VPN
            prévu côté backend (<code className="text-brand-white/60">set_vpn_detector()</code>).
          </p>
        </div>
      )}

      {tab === "orders" && (
        <div className="grid xl:grid-cols-5 gap-6">
          <div className="xl:col-span-3 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-brand-white/50 border-b border-brand-gray/30">
                  <th className="py-3 pe-3 font-normal">Date</th>
                  <th className="py-3 pe-3 font-normal">Client</th>
                  <th className="py-3 pe-3 font-normal">Téléphone</th>
                  <th className="py-3 pe-3 font-normal hidden md:table-cell">Produit(s)</th>
                  <th className="py-3 pe-3 font-normal">Total</th>
                  <th className="py-3 font-normal">Statut</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.order_number}
                    onClick={() => openOrder(o.order_number)}
                    className={cn(
                      "border-b border-brand-gray/20 cursor-pointer hover:bg-brand-gold/5 transition-colors",
                      selected?.order_number === o.order_number && "bg-brand-gold/10"
                    )}
                  >
                    <td className="py-3 pe-3 whitespace-nowrap text-brand-white/70">{formatDate(o.created_at)}</td>
                    <td className="py-3 pe-3">{o.customer_name}</td>
                    <td className="py-3 pe-3 whitespace-nowrap" dir="ltr">
                      {o.customer_phone}
                    </td>
                    <td className="py-3 pe-3 hidden md:table-cell max-w-[12rem] truncate text-brand-white/70">
                      {o.products_summary || "—"}
                    </td>
                    <td className="py-3 pe-3 whitespace-nowrap">
                      <PriceDisplay amount={o.total_mad} compact />
                    </td>
                    <td className="py-3">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <p className="text-brand-white/50 py-12 text-center">Aucune commande sur la période sélectionnée.</p>
            )}
          </div>

          {selected ? (
            <div className="xl:col-span-2 border border-brand-gold/30 p-6 bg-brand-charcoal rounded-lg h-fit sticky top-4">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs text-brand-white/50 uppercase tracking-wider">Commande</p>
                  <h2 className="font-mono text-lg text-brand-gold">{selected.order_number}</h2>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-6">
                <div>
                  <dt className="text-brand-white/50 text-xs">Date</dt>
                  <dd>{formatDate(selected.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-brand-white/50 text-xs">Confirmée</dt>
                  <dd>{formatDate(selected.confirmed_at)}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-brand-white/50 text-xs">Client</dt>
                  <dd className="font-medium">{selected.customer_name}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-brand-white/50 text-xs">Téléphone</dt>
                  <dd dir="ltr" className="font-mono">
                    {selected.customer_phone}
                  </dd>
                </div>
                {selected.customer_city ? (
                  <div className="col-span-2">
                    <dt className="text-brand-white/50 text-xs">Ville</dt>
                    <dd>{selected.customer_city}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-brand-white/50 text-xs">Paiement</dt>
                  <dd>{selected.payment_method === "cod" ? "COD (à la livraison)" : selected.payment_method}</dd>
                </div>
                <div>
                  <dt className="text-brand-white/50 text-xs">Sync</dt>
                  <dd className="text-xs">
                    Sheet {selected.sheet_synced ? "✓" : "—"} · CAPI {selected.capi_synced ? "✓" : "—"}
                  </dd>
                </div>
              </dl>

              <h3 className="text-brand-gold text-xs uppercase tracking-wider mb-3">Articles</h3>
              <ul className="space-y-3 text-sm mb-6">
                {selected.items.map((item, i) => (
                  <li key={i} className="flex justify-between gap-3 border-b border-brand-gray/20 pb-3 last:border-0">
                    <div className="min-w-0">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-xs text-brand-white/50 mt-0.5">
                        {item.offer_tier ? offerTierLabel(item.offer_tier) : "Pièce"}
                        {item.sku ? ` · ${item.sku}` : ""}
                        {" · "}×{item.quantity}
                      </p>
                    </div>
                    <span dir="ltr" className="shrink-0 font-price-figures">
                      <PriceDisplay amount={item.total_price_mad} compact />
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between items-center pt-4 border-t border-brand-gold/20 text-lg font-semibold">
                <span>Total</span>
                <PriceDisplay amount={selected.total_mad} className="text-lg" />
              </div>
            </div>
          ) : (
            <div className="xl:col-span-2 border border-brand-gray/30 border-dashed p-8 rounded-lg flex items-center justify-center text-brand-white/40 text-sm text-center">
              Sélectionnez une commande pour voir le détail.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
