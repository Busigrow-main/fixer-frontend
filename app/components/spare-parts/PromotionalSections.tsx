"use client";

import React from 'react';
import { 
  Truck, 
  ShieldCheck, 
  Clock, 
  Users, 
  Building2, 
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/app/lib/utils';

export const ServicePromiseGrid = () => {
  const promises = [
    {
      icon: <Truck className="w-6 h-6 text-primary" />,
      title: "Same Day Delivery",
      desc: "Fast delivery across Patna & Bihar for urgent repairs."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-primary" />,
      title: "100% Genuine",
      desc: "Sourced directly from OEM manufacturers with warranty."
    },
    {
      icon: <Clock className="w-6 h-6 text-primary" />,
      title: "24/7 Support",
      desc: "Technical guidance to find the right part for your model."
    },
    {
      icon: <Zap className="w-6 h-6 text-primary" />,
      title: "Expert Fitting",
      desc: "Option to book a verified technician for installation."
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {promises.map((p, i) => (
        <div key={i} className="p-6 bg-white border border-zinc-100 rounded-3xl hover:shadow-xl transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            {p.icon}
          </div>
          <h3 className="text-sm font-black text-zinc-900 mb-2 uppercase tracking-tight">{p.title}</h3>
          <p className="text-xs text-zinc-500 font-medium leading-relaxed">{p.desc}</p>
        </div>
      ))}
    </div>
  );
};

export const UniversalPartsTeaser = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-zinc-900 p-8 md:p-12 text-white">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-primary mb-6">
            <Sparkles className="w-3 h-3" />
            Technician Choice
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-4">Universal Compatibility Parts</h2>
          <p className="text-zinc-400 font-medium text-sm md:text-base leading-relaxed">
            Looking for a reliable alternative? Our universal range fits multiple brands like Samsung, LG, and Whirlpool, offering the same performance at a better price.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
               <span className="w-2 h-2 rounded-full bg-green-500" />
               <span className="text-xs font-bold">100+ Brands Compatible</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
               <span className="w-2 h-2 rounded-full bg-blue-500" />
               <span className="text-xs font-bold">Easy Installation</span>
            </div>
          </div>
        </div>
        
        <Link 
          href="/spare-parts?universal=true" 
          className="h-16 px-10 bg-primary text-white rounded-2xl flex items-center justify-center font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/40 hover:scale-105 transition-all"
        >
          Explore Universal Range
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
      </div>
    </div>
  );
};

export const BulkBusinessInquiry = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       <div className="p-8 md:p-12 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center mb-8">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-zinc-900 mb-4 tracking-tight">For Businesses & Retailers</h3>
            <p className="text-zinc-600 font-medium text-sm leading-relaxed mb-8">
              Are you a repair shop owner or a local retailer in Bihar? Get exclusive trade pricing, credit facilities, and prioritized logistics for bulk orders.
            </p>
          </div>
          <Link href="/contact?type=business" className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-widest hover:translate-x-2 transition-transform">
             Apply for Business Account
             <ArrowRight className="w-4 h-4" />
          </Link>
       </div>

       <div className="p-8 md:p-12 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 flex flex-col justify-between text-white">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-black mb-4 tracking-tight">Join as a Technician</h3>
            <p className="text-zinc-400 font-medium text-sm leading-relaxed mb-8">
              Verified technicians get special discounts on every spare part purchase and access to our technical training workshops.
            </p>
          </div>
          <Link href="/technician-signup" className="flex items-center gap-3 text-white font-black uppercase text-xs tracking-widest hover:translate-x-2 transition-transform">
             Become a Partner
             <ArrowRight className="w-4 h-4 text-primary" />
          </Link>
       </div>
    </div>
  );
};
