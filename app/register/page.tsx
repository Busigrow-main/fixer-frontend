"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(formData);
      router.push("/spare-parts");
    } catch (err: any) {
      setError(err.message || "Registration failed. Phone Number may already exist.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-20 bg-surface min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white border border-outline rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-black/5">
          <div className="text-center mb-10">
            <h1 className="font-headline text-4xl md:text-5xl text-on-surface">Create Account</h1>
            <p className="text-on-surface-variant text-sm mt-3 font-medium">
              Join Fixxer for seamless repairs & genuine parts
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-error/10 border border-error/20 flex items-center gap-3 text-error text-sm font-bold">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-black tracking-widest text-on-surface-variant ml-1">
                Full Name
              </label>
              <input
                name="fullName"
                type="text"
                required
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full h-14 px-6 rounded-2xl bg-surface-container-low border-2 border-outline outline-none focus:border-primary transition-all text-on-surface font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-black tracking-widest text-on-surface-variant ml-1">
                Phone Number
              </label>
              <input
                name="phone"
                type="tel"
                required
                placeholder="+91 00000 00000"
                value={formData.phone}
                onChange={handleChange}
                className="w-full h-14 px-6 rounded-2xl bg-surface-container-low border-2 border-outline outline-none focus:border-primary transition-all text-on-surface font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-black tracking-widest text-on-surface-variant ml-1">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full h-14 px-6 rounded-2xl bg-surface-container-low border-2 border-outline outline-none focus:border-primary transition-all text-on-surface font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-black tracking-widest text-on-surface-variant ml-1">
                Create Password
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full h-14 px-6 rounded-2xl bg-surface-container-low border-2 border-outline outline-none focus:border-primary transition-all text-on-surface font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary text-on-primary rounded-2xl font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Create My Account"
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-outline text-center">
            <p className="text-sm text-on-surface-variant">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-black hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
