"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import BrandMark from "@/components/brand/BrandMark";
import { loginAdmin, type LoginFormState } from "../actions";

const initialState: LoginFormState = {
  error: "",
};

export default function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(loginAdmin, initialState);

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 relative">
      {/* Glow backgrounds */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full bg-brand-rose/5 blur-3xl" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-brand-plum/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass p-6 sm:p-8 rounded-3xl border border-brand-rose/25 shadow-2xl relative overflow-hidden bg-brand-card"
      >
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="flex justify-center">
            <BrandMark className="h-9 w-auto" decorative />
          </div>
          <h2 className="text-xl font-bold font-heading text-brand-fg">Staff Portal</h2>
          <p className="text-xs text-gray-400">Sign in to manage project inquiries and newsroom posts.</p>
        </div>

        <form action={formAction} className="space-y-5">
          {state.error && (
            <div className="p-3.5 bg-brand-rose/10 border border-brand-rose/30 text-brand-rose-text text-xs rounded-xl flex items-start gap-2 font-medium">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="admin-email" className="text-xs font-semibold text-gray-300">
              Email Address
            </label>
            <div className="relative">
              <input
                id="admin-email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                autoComplete="username"
                className="w-full bg-brand-bg border border-brand-rose/15 focus:border-brand-rose focus:outline-none rounded-xl py-3 pl-10 pr-4 text-xs text-brand-fg placeholder:text-gray-500 transition-colors"
                required
              />
              <Mail className="absolute left-3.5 top-3.5 text-gray-400" size={14} />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="admin-password" className="text-xs font-semibold text-gray-300">
              Security Key
            </label>
            <div className="relative">
              <input
                id="admin-password"
                name="password"
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                className="w-full bg-brand-bg border border-brand-rose/15 focus:border-brand-rose focus:outline-none rounded-xl py-3 pl-10 pr-4 text-xs text-brand-fg placeholder:text-gray-500 transition-colors"
                required
              />
              <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={14} />
            </div>
          </div>

          {/* Actions */}
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full py-3.5 disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-1.5"
          >
            {isPending ? "Signing In" : "Sign In"} <ArrowRight size={14} />
          </button>

          {/* Hint */}
          <div className="pt-2 text-center">
            <Link href="/" className="text-xs text-gray-400 hover:text-brand-rose-text transition-colors py-1 inline-block">
              &larr; Return to homepage
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
