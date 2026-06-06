'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset link has been sent to your email.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#1E3A5F]">Forgot your password?</h1>
        <p className="text-gray-600 mt-2">No worries, we’ll send you a reset link.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border">
        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2E8B57] hover:bg-[#246B46] text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-70"
          >
            {loading ? 'Sending reset link...' : 'Send Reset Link'}
          </button>
        </form>

        {message && (
          <div className="mt-5 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-[#2E8B57] hover:underline">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}