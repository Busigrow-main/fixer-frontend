"use client";

import { useEffect, useState } from "react";
import ShopNavbar from "@/app/components/shop/ShopNavbar";
import { useAuth } from "@/app/context/AuthContext";
import { API_URL } from "@/app/config";

type PartHelpRequest = {
  _id: string;
  applianceType?: string;
  applianceBrand?: string;
  partDescription?: string;
  status?: string;
  adminResponse?: string;
  quotedPrice?: number;
  isAvailable?: boolean;
  createdAt?: string;
};

export default function ShopRequestsPage() {
  const { token, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<PartHelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setLoading(false);
      setError("Sign in to view your Fixxer Shop part requests.");
      return;
    }

    const controller = new AbortController();
    fetch(`${API_URL}/user/part-help`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await response.json().catch(() => []);
        if (!response.ok) throw new Error(body.message || "Could not load requests.");
        setRequests(Array.isArray(body) ? body : []);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not load requests.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [authLoading, token]);

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <ShopNavbar />
      <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6 sm:pt-9">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Fixxer Shop</p>
        <h1 className="mt-1 text-2xl font-extrabold text-zinc-950 sm:text-3xl">Part help requests</h1>
        <p className="mt-1 text-sm text-zinc-600">Track requests for help identifying a compatible spare part.</p>

        {error && <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</p>}
        {loading ? <div className="mt-5 h-32 animate-pulse rounded-2xl bg-white" /> : !error && requests.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-600">You have no part help requests yet.</div>
        ) : (
          <div className="mt-5 space-y-3">
            {requests.map((request) => (
              <article key={request._id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-bold text-zinc-900">{[request.applianceBrand, request.applianceType].filter(Boolean).join(" · ") || "Part identification request"}</h2>
                    <p className="mt-1 text-xs text-zinc-500">Request #{request._id.slice(-6).toUpperCase()}{request.createdAt ? ` · ${new Date(request.createdAt).toLocaleDateString("en-IN")}` : ""}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{request.status || "Received"}</span>
                </div>
                {request.partDescription && <p className="mt-3 text-sm text-zinc-700">{request.partDescription}</p>}
                {request.adminResponse && <div className="mt-3 rounded-xl bg-zinc-50 p-3"><p className="text-xs font-bold text-zinc-700">Fixxer Shop response</p><p className="mt-1 text-sm text-zinc-700">{request.adminResponse}</p>{request.quotedPrice != null && <p className="mt-2 font-extrabold text-primary">₹{request.quotedPrice.toLocaleString("en-IN")} · {request.isAvailable ? "Available" : "Unavailable"}</p>}</div>}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
