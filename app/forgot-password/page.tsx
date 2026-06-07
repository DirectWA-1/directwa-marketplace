'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-[#2E8B57] mx-auto mb-6" />
          <h1 className="text-2xl font-semibold text-[#1E3A5F] mb-3">Check your email</h1>
          <p className="text-gray-600 mb-6">
            If an account exists with <strong>{email}</strong>, we&apos;ve sent a password reset link.
          </p>
          <Link 
            href="/login" 
            className="inline-block bg-[#2E8B57] hover:bg-[#246B46] text-white px-6 py-3 rounded-xl font-medium"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-[#1E3A5F]">
            DirectWA
          </Link>
          <h1 className="text-2xl font-semibold mt-6 mb-2">Forgot your password?</h1>
          <p className="text-gray-600">Enter your email and we&apos;ll send you a reset link</p>
        </div>

        <div className="bg-white p-8 rounded-2xl border">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-xl px-4 py-3"
                placeholder="you@example.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2E8B57] hover:bg-[#246B46] disabled:bg-gray-400 text-white font-semibold py-3.5 rounded-xl transition-colors"
            >
              {loading ? 'Sending reset link...' : 'Send Reset Link'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-gray-600">
          Remember your password?{' '}
          <Link href="/login" className="text-[#2E8B57] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}