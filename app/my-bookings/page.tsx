"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { API_URL } from "@/app/config";
import { openJobSheet, openPartBill, openRetailInvoice } from "@/app/admin/utils/jobsheet";

type TabType = "repairs" | "parts";

export default function MyBookingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <MyBookingsContent />
    </Suspense>
  );
}

function MyBookingsContent() {
  const { user, token, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get("success") === "true";
  
  const [activeTab, setActiveTab] = useState<TabType>("repairs");
  const [orders, setOrders] = useState<any[]>([]); // Spare Parts
  const [bookings, setBookings] = useState<any[]>([]); // Services
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      fetchAllHistory();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [token, authLoading]);

  const fetchAllHistory = async () => {
    setLoading(true);
    try {
      const [ordersRes, bookingsRes] = await Promise.all([
        fetch(`${API_URL}/user/part-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/user/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
      
    } catch (err) {
      setError("Network error. Could not load history.");
    } finally {
      setLoading(false);
    }
  };

  const handleClaimWarranty = async (bookingId: string) => {
    if (!token || !confirm("Are you sure you want to claim warranty for this service? We will dispatch a master technician for a warranty check.")) return;
    
    try {
      const res = await fetch(`${API_URL}/user/bookings/${bookingId}/claim-warranty`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("Warranty claim received! A new check-up booking has been created.");
        fetchAllHistory();
      } else {
        const data = await res.json();
        alert(data.message || "Could not claim warranty.");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  const getWarrantyStatus = (booking: any) => {
    if (booking.status !== 'COMPLETED' || !booking.warrantyExpiry) return null;
    
    const expiry = new Date(booking.warrantyExpiry);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { label: "Expired", isActive: false };
    return { label: `Active (${diffDays} Days Left)`, isActive: true };
  };

  const activeCount = activeTab === "repairs" ? bookings.length : orders.length;

  return (
    <>
      <Navbar />
      <main className="pt-14 md:pt-20 pb-14 bg-surface min-h-screen">
        <section className="container mx-auto px-6 md:px-10 max-w-7xl pt-8 md:pt-14">
          {showSuccess && (
            <div className="mb-8 p-6 rounded-3xl bg-primary/10 border border-primary/20 flex items-center gap-4 text-primary animate-in fade-in slide-in-from-top-4 duration-500">
              <span className="material-symbols-outlined text-3xl">check_circle</span>
              <div>
                <h3 className="font-bold text-lg">Request Successful!</h3>
                <p className="text-sm opacity-90">Your request has been received. You can track its live status below.</p>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h1 className="font-headline text-4xl md:text-6xl text-on-surface">
                My Bookings
              </h1>
              <p className="mt-3 text-sm md:text-base text-on-surface-variant max-w-xl leading-relaxed">
                Track your active master service repairs and genuine spare part orders in one place.
              </p>
            </div>

            {/* TAB SWITCHER */}
            <div className="flex bg-surface-container-low p-1.5 rounded-2xl border border-outline w-fit self-start md:self-auto">
               <button
                 onClick={() => setActiveTab("repairs")}
                 className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${activeTab === "repairs" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
               >
                 <span className="material-symbols-outlined text-lg">home_repair_service</span>
                 Repairs
                 {bookings.length > 0 && <span className="w-5 h-5 rounded-full bg-primary/10 text-[10px] flex items-center justify-center">{bookings.length}</span>}
               </button>
               <button
                 onClick={() => setActiveTab("parts")}
                 className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${activeTab === "parts" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
               >
                 <span className="material-symbols-outlined text-lg">package_2</span>
                 Spare Parts
                 {orders.length > 0 && <span className="w-5 h-5 rounded-full bg-primary/10 text-[10px] flex items-center justify-center">{orders.length}</span>}
               </button>
            </div>
          </div>

          {!token && !authLoading ? (
            <div className="rounded-3xl border border-outline bg-white p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">lock</span>
              <p className="mt-4 text-on-surface text-lg font-bold">Authentication Required</p>
              <p className="mt-2 text-sm text-on-surface-variant max-w-md mx-auto">Please login to view your order history and tracking details.</p>
              <a href="/login" className="mt-8 inline-flex h-12 px-8 bg-primary text-on-primary rounded-xl items-center font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-95 transition-transform">
                Login Now
              </a>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-20">
               <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
               <p className="mt-4 text-on-surface-variant font-medium">Syncing records...</p>
            </div>
          ) : activeCount === 0 ? (
            <div className="rounded-3xl border border-outline bg-white p-14 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-4 block">
                {activeTab === "repairs" ? "construction" : "shopping_basket"}
              </span>
              <p className="text-on-surface text-xl font-headline">No {activeTab === "repairs" ? "repairs" : "orders"} found</p>
              <p className="mt-2 text-sm text-on-surface-variant max-w-xs mx-auto">
                {activeTab === "repairs" 
                  ? "You haven't booked any master technician visits yet. Schedule one from the services page." 
                  : "Your spare part enquiries will appear here once you place them."}
              </p>
              <a 
                href={activeTab === "repairs" ? "/services" : "/spare-parts"} 
                className="mt-8 inline-flex text-xs font-black text-primary uppercase tracking-widest hover:underline"
              >
                Browse {activeTab === "repairs" ? "Services" : "Catalogue"}
              </a>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {activeTab === "repairs" ? (
                 bookings.map((booking) => (
                    <article key={booking._id} className="rounded-3xl border border-outline bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="bg-surface-container-low px-6 py-4 flex flex-col md:flex-row md:items-center justify-between border-b border-outline gap-3">
                        <div className="flex items-center gap-4">
                           <div className="px-3 py-1 rounded-lg bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest">
                              Repair #{booking._id.slice(-6).toUpperCase()}
                           </div>
                           <p className="text-xs text-on-surface-variant font-medium">
                              Ref: {booking.serviceId?.name || "Appliance Repair"}
                           </p>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className={`h-2.5 w-2.5 rounded-full ${booking.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></span>
                           <span className="text-[10px] font-black uppercase tracking-widest text-on-surface">
                              {booking.status}
                           </span>
                        </div>
                      </div>
                      
                      <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                         <div className="md:col-span-2 space-y-8">
                            <div className="flex items-start gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary flex-shrink-0">
                                  <span className="material-symbols-outlined text-2xl icon-filled">{booking.serviceId?.icon || 'settings'}</span>
                               </div>
                               <div>
                                  <h3 className="font-headline text-2xl text-on-surface">{booking.serviceId?.name} Service</h3>
                                  <p className="text-sm text-on-surface-variant mt-1 leading-relaxed max-w-lg">
                                     {booking.description || "Detailed inspection and repair of your appliance by a certified master technician."}
                                  </p>
                               </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-outline-variant/40">
                               <div>
                                  <p className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant mb-2">Technician Status</p>
                                  {booking.status === 'PENDING' ? (
                                    <p className="text-sm font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 inline-block">Awaiting Dispatch</p>
                                  ) : (
                                    <p className="text-sm font-medium text-primary">Assigned to Master Tech</p>
                                  )}
                               </div>
                               <div>
                                  <p className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant mb-2">Visit Address</p>
                                  <p className="text-sm font-medium text-on-surface">{booking.addressData?.text}, {booking.addressData?.zip}</p>
                               </div>
                            </div>
                         </div>
                         
                         <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline flex flex-col justify-center text-center">
                            <p className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant mb-2">Service Charges</p>
                            <p className="text-3xl font-headline font-bold text-on-surface">Verified</p>
                            <p className="text-xs text-on-surface-variant mt-2">Final pricing shared after inspection. No upfront payment.</p>
                            <div className="flex flex-col items-center justify-center gap-2 my-4">
                               {getWarrantyStatus(booking) ? (
                                 <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2 ${getWarrantyStatus(booking)?.isActive ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                                    <span className="material-symbols-outlined text-sm">{getWarrantyStatus(booking)?.isActive ? 'verified_user' : 'history'}</span>
                                    Warranty {getWarrantyStatus(booking)?.label}
                                 </div>
                               ) : (
                                 <div className="flex items-center justify-center gap-2 text-primary font-bold text-xs">
                                   <span className="material-symbols-outlined text-sm">shield_with_heart</span>
                                   {booking.jobDetails?.warrantyPeriod || '60 Days'} Warranty Included
                                 </div>
                               )}
                            </div>

                            {booking.status === 'COMPLETED' && getWarrantyStatus(booking)?.isActive && (
                              <button 
                                onClick={() => handleClaimWarranty(booking._id)}
                                className="mb-3 w-full h-11 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors border border-primary/20"
                              >
                                <span className="material-symbols-outlined text-lg">medical_services</span>
                                Claim Warranty
                              </button>
                            )}

                            {booking.isBilled && (
                              <button 
                                onClick={() => openRetailInvoice(booking)}
                                className="mt-4 w-full h-11 rounded-xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-colors"
                              >
                                <span className="material-symbols-outlined text-lg">description</span>
                                Download Service Bill
                              </button>
                            )}
                         </div>
                      </div>
                    </article>
                 ))
               ) : (
                 orders.map((order) => (
                    <article key={order._id} className="rounded-3xl border border-outline bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="bg-surface-container-low px-6 py-4 flex flex-col md:flex-row md:items-center justify-between border-b border-outline gap-3">
                         <div className="flex items-center gap-4">
                            <div className="px-3 py-1 rounded-lg bg-white border border-outline text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                               Order #{order._id.slice(-8).toUpperCase()}
                            </div>
                            <p className="text-xs text-on-surface-variant font-medium">
                               Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${order.status === 'PENDING' ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface">
                               {order.status}
                            </span>
                         </div>
                      </div>

                      <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div>
                              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant mb-4 flex items-center gap-2">
                                 <span className="material-symbols-outlined text-lg">local_shipping</span>
                                 Shipping To
                              </p>
                              <h3 className="font-bold text-on-surface">{order.contactData.name}</h3>
                              <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                                 {order.contactData.address}<br />
                                 Phone: {order.contactData.phone}
                              </p>
                           </div>

                           <div>
                              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant mb-4 flex items-center gap-2">
                                 <span className="material-symbols-outlined text-lg">inventory_2</span>
                                 Items Summary
                              </p>
                              <div className="space-y-3">
                                 {order.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                       <div className="flex items-center gap-3">
                                          <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center font-bold text-xs">
                                             {item.quantity}x
                                          </span>
                                          <span className="text-on-surface font-medium">
                                             {item.partId?.name || "Genuine Component"}
                                          </span>
                                       </div>
                                       <span className="font-bold text-primary">{item.partId?.price || "TBD"}</span>
                                    </div>
                                 ))}
                              </div>
                              
                              {order.courierTracking && (
                                <div className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-primary">Live Tracking</p>
                                   <p className="text-sm mt-1 font-bold">{order.courierTracking.courierName}: {order.courierTracking.trackingNumber}</p>
                                </div>
                              )}

                              {order.status === 'DELIVERED' && (
                                <button 
                                  onClick={() => openPartBill(order)}
                                  className="mt-6 w-full h-11 rounded-xl bg-primary text-on-primary text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                                >
                                  <span className="material-symbols-outlined text-lg">receipt_long</span>
                                  Download Parts Invoice
                                </button>
                              )}
                           </div>
                        </div>
                      </div>
                    </article>
                 ))
               )}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
