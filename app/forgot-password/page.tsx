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
      setMessage('Password reset link sent! Please check your email.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center text-[#1E3A5F] mb-2">Forgot Password?</h1>
      <p className="text-center text-gray-600 mb-8">Enter your email and we’ll send you a reset link.</p>

      <div className="bg-white p-8 rounded-2xl border">
        <form onSubmit={handleReset} className="space-y-5">
          <input type="email" placeholder="Your email address" className="w-full border rounded-xl px-4 py-3" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit" disabled={loading} className="w-full bg-[#1E3A5F] text-white py-3.5 rounded-xl font-semibold disabled:opacity-70">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm text-[#2E8B57]">{message}</p>}
        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-gray-600 hover:text-[#1E3A5F]">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}