'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => window.location.href = '/login', 2000);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#1E3A5F]">Set New Password</h1>
        <p className="text-gray-600 mt-2">Enter your new password below.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border">
        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2E8B57] hover:bg-[#246B46] text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-70"
          >
            {loading ? 'Updating password...' : 'Update Password'}
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
      </div>
    </div>
  );
}