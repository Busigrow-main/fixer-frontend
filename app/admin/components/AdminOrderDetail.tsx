"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { openOrderInvoice } from "@/app/admin/utils/order-invoice";
import {
  BillLineItem,
  buildDefaultBillLines,
  computeBillTotals,
  formatInr,
} from "@/app/lib/order-bill";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export function AdminOrderDetail({
  backHref,
  backLabel,
}: {
  backHref: string;
  backLabel: string;
}) {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lineItems, setLineItems] = useState<BillLineItem[]>([]);
  const [taxPercent, setTaxPercent] = useState(0);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  const loadOrder = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/part-orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load order");
      const data = await res.json();
      setOrder(data);
      if (data.invoiceData?.lineItems?.length) {
        setLineItems(data.invoiceData.lineItems);
        setTaxPercent(data.invoiceData.taxPercent ?? 0);
        setNotes(data.invoiceData.notes ?? "");
      } else {
        setLineItems(buildDefaultBillLines(data));
        setTaxPercent(0);
        setNotes("");
      }
    } catch {
      setMessage("Could not load order.");
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const totals = useMemo(
    () => computeBillTotals(lineItems, taxPercent),
    [lineItems, taxPercent],
  );

  const updateLine = (index: number, patch: Partial<BillLineItem>) => {
    setLineItems((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  };

  const addLine = () => {
    setLineItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeLine = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const saveBill = async () => {
    if (!token || !id) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`${API}/admin/part-orders/${id}/bill`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lineItems, taxPercent, notes }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save bill");
      }
      const data = await res.json();
      setOrder(data);
      setLineItems(data.invoiceData?.lineItems ?? lineItems);
      setMessage("Bill saved.");
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Failed to save bill");
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async () => {
    if (!token || !id) return;
    if (
      !confirm(
        "Mark payment as complete? The customer will be able to download the invoice in My Bookings.",
      )
    )
      return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`${API}/admin/part-orders/${id}/mark-paid`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to mark paid");
      }
      const data = await res.json();
      setOrder(data);
      setLineItems(data.invoiceData?.lineItems ?? lineItems);
      setTaxPercent(data.invoiceData?.taxPercent ?? 0);
      setMessage("Payment marked complete. Invoice is now available to the customer.");
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Failed to mark paid");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: "center" }}>
        <div className="admin-spinner" style={{ margin: "0 auto" }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <p>{message || "Order not found."}</p>
        <Link href={backHref} className="admin-btn admin-btn-secondary" style={{ marginTop: 16 }}>
          {backLabel}
        </Link>
      </div>
    );
  }

  const isAppliance = order.orderType === "appliance";

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => router.push(backHref)}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
          {backLabel}
        </button>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
            {isAppliance ? "Appliance Enquiry" : "Spare Parts Order"} #{order._id?.slice(-8).toUpperCase()}
          </h2>
          <p style={{ fontSize: 13, color: "var(--admin-text-dim)", marginTop: 4 }}>
            Placed {order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : "—"}
          </p>
        </div>
        <span className={`admin-badge admin-badge-${order.status?.toLowerCase()}`} style={{ marginLeft: "auto" }}>
          {order.status}
        </span>
        <span
          className={`admin-badge ${order.paymentStatus === "PAID" ? "admin-badge-delivered" : "admin-badge-pending"}`}
        >
          {order.paymentStatus === "PAID" ? "Paid" : "Unpaid"}
        </span>
      </div>

      {message && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 8,
            background: "var(--admin-accent-soft)",
            fontSize: 13,
          }}
        >
          {message}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <section className="admin-card" style={{ padding: 20 }}>
          <h3 className="admin-label" style={{ marginBottom: 12 }}>
            Customer
          </h3>
          <p style={{ margin: 0, fontWeight: 600 }}>{order.contactData?.name}</p>
          <p style={{ margin: "4px 0", fontSize: 13 }}>{order.contactData?.phone}</p>
          {order.contactData?.email && (
            <p style={{ margin: "4px 0", fontSize: 13 }}>{order.contactData.email}</p>
          )}
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--admin-text-dim)" }}>
            {order.contactData?.address}
          </p>
          {order.contactData?.preferredDate && (
            <p style={{ marginTop: 8, fontSize: 12 }}>
              Preferred: {order.contactData.preferredDate}
              {order.contactData.preferredTime ? ` at ${order.contactData.preferredTime}` : ""}
            </p>
          )}
          {order.contactData?.notes && (
            <p style={{ marginTop: 8, fontSize: 12 }}>
              <strong>Notes:</strong> {order.contactData.notes}
            </p>
          )}
          {order.userId?.fullName && (
            <p style={{ marginTop: 12, fontSize: 11, color: "var(--admin-text-muted)" }}>
              Account: {order.userId.fullName} ({order.userId.phone || order.userId.email})
            </p>
          )}
        </section>

        <section className="admin-card" style={{ padding: 20 }}>
          <h3 className="admin-label" style={{ marginBottom: 12 }}>
            {isAppliance ? "Product" : "Ordered parts"}
          </h3>
          {isAppliance && order.applianceItem ? (
            <div>
              <p style={{ margin: 0, fontWeight: 600 }}>{order.applianceItem.name}</p>
              <p style={{ fontSize: 13, margin: "4px 0" }}>
                {order.applianceItem.brand}
                {order.applianceItem.modelNumber ? ` · ${order.applianceItem.modelNumber}` : ""}
              </p>
              <p style={{ fontSize: 13 }}>Qty: {order.applianceItem.quantity}</p>
              {order.applianceItem.price != null && (
                <p style={{ fontSize: 13, color: "var(--admin-accent)" }}>
                  Listed: {formatInr(order.applianceItem.price)}
                </p>
              )}
            </div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
              {(order.items ?? []).map((item: any, idx: number) => (
                <li key={idx} style={{ marginBottom: 6 }}>
                  {item.quantity}× {item.partId?.name || "Part"}
                  {item.partId?.price != null && (
                    <span style={{ color: "var(--admin-text-dim)" }}>
                      {" "}
                      — {formatInr(item.partId.price / 100)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {order.courierTracking && (
            <p style={{ marginTop: 12, fontSize: 12 }}>
              Tracking: {order.courierTracking.courierName} — {order.courierTracking.trackingNumber}
            </p>
          )}
        </section>
      </div>

      <section className="admin-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Bill / Invoice</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => openOrderInvoice(order)}>
              Preview / Print
            </button>
            {order.isBilled && (
              <span className="admin-badge admin-badge-delivered">Sent to customer</span>
            )}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="admin-table" style={{ marginBottom: 12 }}>
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ width: 80 }}>Qty</th>
                <th style={{ width: 120 }}>Rate (₹)</th>
                <th style={{ width: 100 }}>Amount</th>
                <th style={{ width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {lineItems.map((row, index) => (
                <tr key={index}>
                  <td>
                    <input
                      className="admin-input"
                      value={row.description}
                      onChange={(e) => updateLine(index, { description: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      className="admin-input"
                      value={row.quantity}
                      onChange={(e) =>
                        updateLine(index, { quantity: Math.max(1, Number(e.target.value) || 1) })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className="admin-input"
                      value={row.unitPrice}
                      onChange={(e) =>
                        updateLine(index, { unitPrice: Math.max(0, Number(e.target.value) || 0) })
                      }
                    />
                  </td>
                  <td style={{ fontWeight: 600, verticalAlign: "middle" }}>
                    {formatInr(row.quantity * row.unitPrice)}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="admin-btn admin-btn-ghost admin-btn-sm"
                      onClick={() => removeLine(index)}
                      disabled={lineItems.length <= 1}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={addLine} style={{ marginBottom: 16 }}>
          + Add line
        </button>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", marginBottom: 16 }}>
          <div>
            <label className="admin-label">GST %</label>
            <input
              type="number"
              min={0}
              max={100}
              className="admin-input"
              style={{ width: 100 }}
              value={taxPercent}
              onChange={(e) => setTaxPercent(Number(e.target.value) || 0)}
            />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="admin-label">Invoice notes</label>
            <input
              className="admin-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional note on invoice"
            />
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right", fontSize: 14 }}>
            <p style={{ margin: "4px 0" }}>Subtotal: {formatInr(totals.subtotal)}</p>
            {totals.taxAmount > 0 && <p style={{ margin: "4px 0" }}>Tax: {formatInr(totals.taxAmount)}</p>}
            <p style={{ margin: "8px 0 0", fontWeight: 800, fontSize: 18 }}>
              Total: {formatInr(totals.totalAmount)}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <button type="button" className="admin-btn admin-btn-secondary" disabled={saving} onClick={saveBill}>
            Save bill draft
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            disabled={saving || order.paymentStatus === "PAID"}
            onClick={markPaid}
          >
            Mark payment complete & send to customer
          </button>
        </div>
        <p style={{ fontSize: 11, color: "var(--admin-text-muted)", marginTop: 12 }}>
          Saving the draft stores line items. Marking payment complete publishes the invoice to the customer&apos;s My
          Bookings page.
        </p>
      </section>
    </div>
  );
}
