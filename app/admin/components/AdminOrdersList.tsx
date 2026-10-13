"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

const STATUSES = [
  "ALL",
  "PENDING",
  "PROCESSING",
  "DISPATCHED",
  "DELIVERED",
  "USER_CANCELLED",
  "ADMIN_CANCELLED",
  "RETURNED",
];

type OrderType = "part" | "appliance";

export function AdminOrdersList({
  orderType,
  title,
  subtitle,
  detailBasePath,
}: {
  orderType: OrderType;
  title: string;
  subtitle: string;
  detailBasePath: string;
}) {
  const { token } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const [trackingModal, setTrackingModal] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState({
    courierName: "",
    trackingNumber: "",
  });

  const [cancellationModal, setCancellationModal] = useState<string | null>(
    null
  );
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const limit = 15;
  const totalPages = Math.ceil(total / limit);

  const fetchOrders = () => {
    if (!token) return;

    setLoading(true);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      orderType,
    });

    /*
     * Cancellation filters use:
     *
     * USER_CANCELLED  -> status=CANCELLED&cancelledBy=CUSTOMER
     * ADMIN_CANCELLED -> status=CANCELLED&cancelledBy=ADMIN
     */
    if (status === "USER_CANCELLED") {
      params.set("status", "CANCELLED");
      params.set("cancelledBy", "CUSTOMER");
    } else if (status === "ADMIN_CANCELLED") {
      params.set("status", "CANCELLED");
      params.set("cancelledBy", "ADMIN");
    } else if (status !== "ALL") {
      params.set("status", status);
    }

    fetch(`${API}/admin/part-orders?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (r) => {
        if (!r.ok) {
          throw new Error(`Failed to fetch orders: ${r.status}`);
        }

        return r.json();
      })
      .then((res) => {
        setOrders(Array.isArray(res.data) ? res.data : []);
        setTotal(Number(res.total) || 0);
      })
      .catch((err) => {
        console.error("Failed to fetch admin orders:", err);
        setOrders([]);
        setTotal(0);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [token, page, status, orderType]);

  const handleFilterChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleStatusChange = async (
    id: string,
    newStatus: string
  ) => {
    if (!token) return;

    /*
     * Admin cancellation requires a reason.
     * Open the modal instead of immediately sending the request.
     */
    if (newStatus === "CANCELLED") {
      setCancellationModal(id);
      setCancellationReason("");
      return;
    }

    try {
      const response = await fetch(
        `${API}/admin/part-orders/${id}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || `Failed to update order: ${response.status}`
        );
      }

      fetchOrders();
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to update order status"
      );
    }
  };

  const handleAdminCancellation = async () => {
    if (!token || !cancellationModal) return;

    const trimmedReason = cancellationReason.trim();

    if (!trimmedReason) {
      alert("Please enter a cancellation reason.");
      return;
    }

    if (trimmedReason.length > 500) {
      alert("Cancellation reason cannot exceed 500 characters.");
      return;
    }

    setCancelling(true);

    try {
      const response = await fetch(
        `${API}/admin/part-orders/${cancellationModal}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "CANCELLED",
            reason: trimmedReason,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || `Failed to cancel order: ${response.status}`
        );
      }

      setCancellationModal(null);
      setCancellationReason("");

      fetchOrders();
    } catch (err) {
      console.error("Failed to cancel order:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Failed to cancel order"
      );
    } finally {
      setCancelling(false);
    }
  };

  const handleTrackingSubmit = async () => {
    if (!token || !trackingModal) return;

    const courierName = trackingData.courierName.trim();
    const trackingNumber = trackingData.trackingNumber.trim();

    if (!courierName || !trackingNumber) {
      alert("Please enter courier name and tracking number.");
      return;
    }

    try {
      const response = await fetch(
        `${API}/admin/part-orders/${trackingModal}/tracking`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courierName,
            trackingNumber,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to update tracking: ${response.status}`
        );
      }

      setTrackingModal(null);
      setTrackingData({
        courierName: "",
        trackingNumber: "",
      });

      fetchOrders();
    } catch (err) {
      console.error("Failed to update tracking:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Failed to update tracking"
      );
    }
  };

  const getFilterLabel = (value: string) => {
    switch (value) {
      case "USER_CANCELLED":
        return "User Cancelled";

      case "ADMIN_CANCELLED":
        return "Admin Cancelled";

      default:
        return value.replace(/_/g, " ");
    }
  };

  const getStatusLabel = (value: string) => {
    return value?.replace(/_/g, " ") || "—";
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: -0.5,
          }}
        >
          {title}
        </h2>

        <p
          style={{
            fontSize: 13,
            color: "var(--admin-text-dim)",
            marginTop: 4,
          }}
        >
          {subtitle} · {total} total
        </p>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className={`admin-btn admin-btn-sm ${
              status === s
                ? "admin-btn-primary"
                : "admin-btn-secondary"
            }`}
            onClick={() => handleFilterChange(s)}
          >
            {getFilterLabel(s)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Summary</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    padding: 40,
                  }}
                >
                  <div
                    className="admin-spinner"
                    style={{ margin: "0 auto" }}
                  />
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "var(--admin-text-muted)",
                  }}
                >
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o._id}>
                  {/* Order ID */}
                  <td
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                    }}
                  >
                    {o._id?.slice(-8)}
                  </td>

                  {/* Customer */}
                  <td>
                    {o.userId?.fullName ||
                      o.contactData?.name ||
                      "—"}
                  </td>

                  {/* Summary */}
                  <td
                    style={{
                      fontSize: 12,
                      maxWidth: 200,
                    }}
                  >
                    {orderType === "appliance"
                      ? o.applianceItem?.name || "—"
                      : `${o.items?.length || 0} part(s)`}
                  </td>

                  {/* Payment */}
                  <td>
                    <span
                      className={`admin-badge ${
                        o.paymentStatus === "PAID"
                          ? "admin-badge-delivered"
                          : "admin-badge-pending"
                      }`}
                    >
                      {o.paymentStatus === "PAID"
                        ? "Paid"
                        : "Unpaid"}
                    </span>

                    {o.isBilled && (
                      <span
                        style={{
                          display: "block",
                          fontSize: 10,
                          marginTop: 4,
                          color: "var(--admin-text-dim)",
                        }}
                      >
                        Bill sent
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td>
                    <span
                      className={`admin-badge admin-badge-${o.status?.toLowerCase()}`}
                    >
                      {getStatusLabel(o.status)}
                    </span>

                    {o.status === "CANCELLED" && (
                      <div
                        style={{
                          marginTop: 6,
                          padding: "8px 10px",
                          borderRadius: 6,
                          background:
                            "rgba(239, 68, 68, 0.06)",
                          border:
                            "1px solid rgba(239, 68, 68, 0.15)",
                          minWidth: 180,
                          maxWidth: 280,
                        }}
                      >
                        {/* Cancellation source */}
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "var(--admin-text-dim)",
                            marginBottom: 5,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Cancelled by
                        </div>

                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            marginBottom: 7,
                          }}
                        >
                          {o.cancelledBy === "ADMIN"
                            ? "Admin"
                            : o.cancelledBy === "CUSTOMER"
                              ? "User"
                              : "Unknown"}
                        </div>

                        {/* Cancellation reason */}
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "var(--admin-text-dim)",
                            marginBottom: 3,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Cancellation Reason
                        </div>

                        <div
                          style={{
                            fontSize: 11,
                            lineHeight: 1.4,
                            color: "var(--admin-text)",
                            wordBreak: "break-word",
                          }}
                        >
                          {o.cancellationReason ||
                            "No reason provided"}
                        </div>

                        {/* Cancellation timestamp */}
                        {o.cancelledAt ? (
                          <div
                            style={{
                              marginTop: 5,
                              fontSize: 10,
                              color:
                                "var(--admin-text-muted)",
                            }}
                          >
                            Cancelled:{" "}
                            {new Date(
                              o.cancelledAt
                            ).toLocaleString("en-IN")}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </td>

                  {/* Date */}
                  <td>
                    {o.createdAt
                      ? new Date(
                          o.createdAt
                        ).toLocaleDateString("en-IN")
                      : "—"}
                  </td>

                  {/* Actions */}
                  <td>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        minWidth: 140,
                      }}
                    >
                      {/* Details */}
                      <Link
                        href={`${detailBasePath}/${o._id}`}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        style={{
                          justifyContent: "center",
                        }}
                      >
                        View details
                      </Link>

                      {/* Status action */}
                      <select
                        className="admin-input admin-select"
                        style={{
                          height: 32,
                          fontSize: 11,
                          padding: "0 28px 0 8px",
                        }}
                        value={o.status}
                        disabled={o.status === "CANCELLED"}
                        onChange={(e) =>
                          handleStatusChange(
                            o._id,
                            e.target.value
                          )
                        }
                      >
                        {[
                          "PENDING",
                          "PROCESSING",
                          "DISPATCHED",
                          "DELIVERED",
                          "CANCELLED",
                          "RETURNED",
                        ].map((s) => (
                          <option key={s} value={s}>
                            {getStatusLabel(s)}
                          </option>
                        ))}
                      </select>

                      {/* Tracking */}
                      {orderType === "part" &&
                        !o.courierTracking &&
                        o.status !== "CANCELLED" && (
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                            onClick={() =>
                              setTrackingModal(o._id)
                            }
                          >
                            Add tracking
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-pagination">
            <span>
              Page {page} of {totalPages}
            </span>

            <div className="admin-pagination-btns">
              <button
                type="button"
                className="admin-pagination-btn"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                ‹
              </button>

              {Array.from(
                {
                  length: Math.min(totalPages, 5),
                },
                (_, i) => i + 1
              ).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`admin-pagination-btn ${
                    page === p ? "active" : ""
                  }`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                className="admin-pagination-btn"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admin Cancellation Modal */}
      {cancellationModal && (
        <div
          className="admin-modal-overlay"
          onClick={() => {
            if (!cancelling) {
              setCancellationModal(null);
              setCancellationReason("");
            }
          }}
        >
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h2>Cancel Order</h2>

              <button
                type="button"
                className="admin-btn admin-btn-ghost admin-btn-sm"
                disabled={cancelling}
                onClick={() => {
                  setCancellationModal(null);
                  setCancellationReason("");
                }}
              >
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>
            </div>

            <div
              className="admin-modal-body"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "var(--admin-text-dim)",
                  lineHeight: 1.5,
                }}
              >
                You are cancelling this order as an admin.
                Please provide the cancellation reason.
              </p>

              <div>
                <label className="admin-label">
                  Cancellation Reason
                </label>

                <textarea
                  className="admin-input admin-textarea"
                  placeholder="Enter cancellation reason..."
                  maxLength={500}
                  value={cancellationReason}
                  disabled={cancelling}
                  onChange={(e) =>
                    setCancellationReason(e.target.value)
                  }
                  style={{
                    minHeight: 110,
                    resize: "vertical",
                  }}
                />

                <div
                  style={{
                    marginTop: 5,
                    textAlign: "right",
                    fontSize: 11,
                    color: "var(--admin-text-muted)",
                  }}
                >
                  {cancellationReason.length}/500
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                disabled={cancelling}
                onClick={() => {
                  setCancellationModal(null);
                  setCancellationReason("");
                }}
              >
                Keep Order
              </button>

              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={
                  cancelling ||
                  !cancellationReason.trim()
                }
                onClick={handleAdminCancellation}
              >
                {cancelling
                  ? "Cancelling..."
                  : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {trackingModal && (
        <div
          className="admin-modal-overlay"
          onClick={() => setTrackingModal(null)}
        >
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h2>Add Tracking Info</h2>

              <button
                type="button"
                className="admin-btn admin-btn-ghost admin-btn-sm"
                onClick={() => setTrackingModal(null)}
              >
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>
            </div>

            <div
              className="admin-modal-body"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div>
                <label className="admin-label">
                  Courier Name
                </label>

                <input
                  className="admin-input"
                  placeholder="e.g. BlueDart, DTDC"
                  value={trackingData.courierName}
                  onChange={(e) =>
                    setTrackingData({
                      ...trackingData,
                      courierName: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="admin-label">
                  Tracking Number
                </label>

                <input
                  className="admin-input"
                  placeholder="Enter tracking number"
                  value={trackingData.trackingNumber}
                  onChange={(e) =>
                    setTrackingData({
                      ...trackingData,
                      trackingNumber: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setTrackingModal(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleTrackingSubmit}
              >
                Save & Mark Dispatched
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}