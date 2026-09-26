"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { openJobSheet } from "@/app/admin/utils/jobsheet";
import ManageVisitsModal from "./ManageVisitsModal";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

const FILTERS = [
  "ALL",
  "NEEDS_ASSIGNMENT",
  "PENDING",
  "CONFIRMED",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "RESCHEDULED",
  "USER_CANCELLED",
  "ADMIN_CANCELLED",
];

const STATUS_ACTIONS = [
  "PENDING",
  "CONFIRMED",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "RESCHEDULED",
  "CANCELLED",
];

export default function AdminBookingsPage() {
  const { token } = useAuth();

  const [bookings, setBookings] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [noteModal, setNoteModal] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const [visitModal, setVisitModal] = useState<string | null>(null);

  const [cancellationModal, setCancellationModal] =
    useState<string | null>(null);

  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const limit = 15;
  const totalPages = Math.ceil(total / limit);

  const fetchBookings = async () => {
    if (!token) return;

    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (status === "USER_CANCELLED") {
        params.set("status", "CANCELLED");
        params.set("cancelledBy", "CUSTOMER");
      } else if (status === "ADMIN_CANCELLED") {
        params.set("status", "CANCELLED");
        params.set("cancelledBy", "ADMIN");
      } else if (status !== "ALL") {
        params.set("status", status);
      }

      const response = await fetch(
        `${API}/admin/bookings?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to fetch bookings"
        );
      }

      setBookings(Array.isArray(data.data) ? data.data : []);
      setTotal(Number(data.total) || 0);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setBookings([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API}/admin/technicians`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (Array.isArray(data)) {
        setTechnicians(data);
      } else {
        console.error("Expected technician array:", data);
      }
    } catch (error) {
      console.error("Failed to fetch technicians:", error);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchBookings();
  }, [token, page, status]);

  useEffect(() => {
    if (!token) return;

    fetchTechnicians();
  }, [token]);

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
     * Cancellation needs a reason.
     * Open the admin cancellation modal.
     */
    if (newStatus === "CANCELLED") {
      setCancellationModal(id);
      setCancellationReason("");
      return;
    }

    setUpdatingId(id);

    try {
      const response = await fetch(
        `${API}/admin/bookings/${id}/status`,
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to update booking"
        );
      }

      await fetchBookings();
    } catch (error) {
      console.error("Failed to update booking:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update booking"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAdminCancellation = async () => {
    if (!token || !cancellationModal) return;

    const reason = cancellationReason.trim();

    if (!reason) {
      alert("Please enter a cancellation reason.");
      return;
    }

    if (reason.length > 500) {
      alert(
        "Cancellation reason cannot exceed 500 characters."
      );
      return;
    }

    setCancelling(true);
    setUpdatingId(cancellationModal);

    try {
      const response = await fetch(
        `${API}/admin/bookings/${cancellationModal}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "CANCELLED",
            reason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to cancel booking"
        );
      }

      setCancellationModal(null);
      setCancellationReason("");

      await fetchBookings();
    } catch (error) {
      console.error("Failed to cancel booking:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to cancel booking"
      );
    } finally {
      setCancelling(false);
      setUpdatingId(null);
    }
  };

  const handleAssignTechnician = async (
    id: string,
    technicianId: string
  ) => {
    if (!token) return;

    setUpdatingId(id);

    try {
      const response = await fetch(
        `${API}/admin/bookings/${id}/assign`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            technicianId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to assign technician"
        );
      }

      await fetchBookings();
    } catch (error) {
      console.error(
        "Failed to assign technician:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to assign technician"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddNote = async () => {
    if (!token || !noteModal) return;

    const note = noteText.trim();

    if (!note) return;

    try {
      const response = await fetch(
        `${API}/admin/bookings/${noteModal}/notes`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            note,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to add note"
        );
      }

      setNoteModal(null);
      setNoteText("");

      await fetchBookings();
    } catch (error) {
      console.error("Failed to add note:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to add note"
      );
    }
  };

  const exportCsv = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${API}/admin/bookings/export`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to export bookings");
      }

      const blob = await response.blob();

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = "bookings-export.csv";

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export bookings:", error);
      alert("Failed to export bookings.");
    }
  };

  const getFilterLabel = (value: string) => {
    switch (value) {
      case "NEEDS_ASSIGNMENT":
        return "Needs Assignment";

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: -0.5,
            }}
          >
            Service Bookings
          </h2>

          <p
            style={{
              fontSize: 13,
              color: "var(--admin-text-dim)",
              marginTop: 4,
            }}
          >
            {total} total bookings
          </p>
        </div>

        <button
          type="button"
          className="admin-btn admin-btn-secondary admin-btn-sm"
          onClick={exportCsv}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 16 }}
          >
            download
          </span>
          Export CSV
        </button>
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
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            className={`admin-btn admin-btn-sm ${
              status === filter
                ? "admin-btn-primary"
                : "admin-btn-secondary"
            }`}
            onClick={() => handleFilterChange(filter)}
            style={
              filter === "NEEDS_ASSIGNMENT" &&
              status !== filter
                ? {
                    borderColor:
                      "var(--admin-warning)",
                    color: "var(--admin-warning)",
                  }
                : undefined
            }
          >
            {getFilterLabel(filter)}
          </button>
        ))}
      </div>

      {/* Needs Assignment Notice */}
      {status === "NEEDS_ASSIGNMENT" && (
        <div
          className="admin-card"
          style={{
            marginBottom: 16,
            padding: "12px 16px",
            borderColor: "var(--admin-warning)",
            background:
              "var(--admin-warning-soft)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              color: "var(--admin-warning)",
            }}
          >
            priority_high
          </span>

          <p
            style={{
              fontSize: 13,
              margin: 0,
            }}
          >
            These jobs stayed unclaimed for 10+
            minutes. Assign a technician below.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Technician</th>
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
                    style={{
                      margin: "0 auto",
                    }}
                  />
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color:
                      "var(--admin-text-muted)",
                  }}
                >
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking._id}>
                  {/* Booking ID */}
                  <td
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                    }}
                  >
                    {booking._id?.slice(-8)}
                  </td>

                  {/* Customer */}
                  <td>
                    {booking.userId?.fullName ||
                      booking.userId?.phone ||
                      "—"}
                  </td>

                  {/* Service */}
                  <td>
                    {booking.serviceId?.name ||
                      "—"}
                  </td>

                  {/* Technician */}
                  <td>
                    <select
                      className="admin-input admin-select"
                      style={{
                        height: 28,
                        fontSize: 11,
                        width: 110,
                        padding:
                          "0 20px 0 8px",
                      }}
                      value={
                        booking.technicianId?._id ||
                        booking.technicianId ||
                        ""
                      }
                      onChange={(event) =>
                        handleAssignTechnician(
                          booking._id,
                          event.target.value
                        )
                      }
                      disabled={
                        updatingId ===
                          booking._id ||
                        booking.status ===
                          "CANCELLED"
                      }
                    >
                      <option value="">
                        Unassigned
                      </option>

                      {technicians.map(
                        (technician) => (
                          <option
                            key={technician._id}
                            value={technician._id}
                          >
                            {technician.name}
                          </option>
                        )
                      )}
                    </select>
                  </td>

                  {/* Status */}
                  <td>
                    <div
                      style={{
                        display: "flex",
                        flexDirection:
                          "column",
                        gap: 4,
                      }}
                    >
                      <span
                        className={`admin-badge admin-badge-${booking.status?.toLowerCase()}`}
                      >
                        {getStatusLabel(
                          booking.status
                        )}
                      </span>

                      {booking.dispatchStatus ===
                        "NEEDS_ADMIN" && (
                        <span
                          className="admin-badge"
                          style={{
                            background:
                              "var(--admin-warning-soft)",
                            color:
                              "var(--admin-warning)",
                            fontSize: 10,
                          }}
                        >
                          Needs admin
                        </span>
                      )}

                      {/* Cancellation details */}
                      {booking.status ===
                        "CANCELLED" && (
                        <div
                          style={{
                            marginTop: 6,
                            padding:
                              "8px 10px",
                            borderRadius: 6,
                            background:
                              "rgba(239, 68, 68, 0.06)",
                            border:
                              "1px solid rgba(239, 68, 68, 0.15)",
                            minWidth: 180,
                            maxWidth: 280,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color:
                                "var(--admin-text-dim)",
                              marginBottom: 5,
                              textTransform:
                                "uppercase",
                              letterSpacing:
                                "0.04em",
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
                            {booking.cancelledBy ===
                            "ADMIN"
                              ? "Admin"
                              : booking.cancelledBy ===
                                  "CUSTOMER"
                                ? "User"
                                : "Unknown"}
                          </div>

                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color:
                                "var(--admin-text-dim)",
                              marginBottom: 3,
                              textTransform:
                                "uppercase",
                              letterSpacing:
                                "0.04em",
                            }}
                          >
                            Cancellation Reason
                          </div>

                          <div
                            style={{
                              fontSize: 11,
                              lineHeight: 1.4,
                              color:
                                "var(--admin-text)",
                              wordBreak:
                                "break-word",
                            }}
                          >
                            {booking.cancellationReason ||
                              "No reason provided"}
                          </div>

                          {booking.cancelledAt && (
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
                                booking.cancelledAt
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Date */}
                  <td>
                    {booking.createdAt
                      ? new Date(
                          booking.createdAt
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "—"}
                  </td>

                  {/* Actions */}
                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      {/* Details */}
                      <Link
                        href={`/admin/bookings/${booking._id}`}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        style={{
                          padding:
                            "6px 10px",
                        }}
                        title="Details"
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: 16,
                          }}
                        >
                          visibility
                        </span>
                      </Link>

                      {/* Status */}
                      <select
                        className="admin-input admin-select"
                        style={{
                          height: 30,
                          fontSize: 11,
                          width: 125,
                          padding:
                            "0 22px 0 8px",
                        }}
                        value={booking.status}
                        onChange={(event) =>
                          handleStatusChange(
                            booking._id,
                            event.target.value
                          )
                        }
                        disabled={
                          updatingId ===
                            booking._id ||
                          booking.status ===
                            "CANCELLED"
                        }
                      >
                        {STATUS_ACTIONS.map(
                          (action) => (
                            <option
                              key={action}
                              value={action}
                            >
                              {getStatusLabel(
                                action
                              )}
                            </option>
                          )
                        )}
                      </select>

                      {/* Add Note */}
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        style={{
                          padding: 6,
                        }}
                        onClick={() => {
                          setNoteModal(
                            booking._id
                          );
                          setNoteText("");
                        }}
                        title="Add Admin Note"
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: 16,
                          }}
                        >
                          sticky_note_2
                        </span>
                      </button>

                      {/* Manage Visits */}
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        style={{
                          padding: 6,
                        }}
                        onClick={() =>
                          setVisitModal(
                            booking._id
                          )
                        }
                        title="Manage Visits & Parts"
                        disabled={
                          booking.status ===
                          "CANCELLED"
                        }
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: 16,
                          }}
                        >
                          build
                        </span>
                      </button>

                      {/* Job Sheet */}
                      <button
                        type="button"
                        className="admin-btn admin-btn-primary admin-btn-sm"
                        style={{
                          padding:
                            "6px 10px",
                        }}
                        title="Print Job Sheet"
                        onClick={async () => {
                          try {
                            const response =
                              await fetch(
                                `${API}/admin/bookings/${booking._id}`,
                                {
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                  },
                                }
                              );

                            const data =
                              await response.json();

                            if (
                              !response.ok
                            ) {
                              throw new Error(
                                data?.message ||
                                  "Failed to load booking"
                              );
                            }

                            openJobSheet(data);
                          } catch (error) {
                            console.error(
                              "Failed to print job sheet:",
                              error
                            );

                            alert(
                              error instanceof Error
                                ? error.message
                                : "Failed to print job sheet"
                            );
                          }
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: 16,
                          }}
                        >
                          print
                        </span>
                      </button>
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
                onClick={() =>
                  setPage(page - 1)
                }
              >
                ‹
              </button>

              {Array.from(
                {
                  length: Math.min(
                    totalPages,
                    5
                  ),
                },
                (_, index) => index + 1
              ).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={`admin-pagination-btn ${
                    page === pageNumber
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setPage(pageNumber)
                  }
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                className="admin-pagination-btn"
                disabled={
                  page >= totalPages
                }
                onClick={() =>
                  setPage(page + 1)
                }
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Note Modal */}
      {noteModal && (
        <div
          className="admin-modal-overlay"
          onClick={() => {
            setNoteModal(null);
            setNoteText("");
          }}
        >
          <div
            className="admin-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-modal-header">
              <h2>Add Admin Note</h2>

              <button
                type="button"
                className="admin-btn admin-btn-ghost admin-btn-sm"
                onClick={() => {
                  setNoteModal(null);
                  setNoteText("");
                }}
              >
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>
            </div>

            <div className="admin-modal-body">
              <textarea
                className="admin-input admin-textarea"
                placeholder="Enter your note..."
                value={noteText}
                onChange={(event) =>
                  setNoteText(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => {
                  setNoteModal(null);
                  setNoteText("");
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={!noteText.trim()}
                onClick={handleAddNote}
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

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
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-modal-header">
              <h2>Cancel Booking</h2>

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
                  color:
                    "var(--admin-text-dim)",
                  lineHeight: 1.5,
                }}
              >
                You are cancelling this booking
                as an admin. Please provide the
                cancellation reason.
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
                  onChange={(event) =>
                    setCancellationReason(
                      event.target.value
                    )
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
                    color:
                      "var(--admin-text-muted)",
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
                Keep Booking
              </button>

              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={
                  cancelling ||
                  !cancellationReason.trim()
                }
                onClick={
                  handleAdminCancellation
                }
              >
                {cancelling
                  ? "Cancelling..."
                  : "Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Visits Modal */}
      {visitModal && (
        <ManageVisitsModal
          bookingId={visitModal}
          token={token || ""}
          onClose={() =>
            setVisitModal(null)
          }
        />
      )}
    </div>
  );
}