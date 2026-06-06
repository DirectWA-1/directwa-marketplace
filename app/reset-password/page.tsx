'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => window.location.href = '/login', 2000);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center text-[#1E3A5F] mb-8">Set New Password</h1>

      <div className="bg-white p-8 rounded-2xl border">
        <form onSubmit={handleUpdate} className="space-y-5">
          <input type="password" placeholder="New password (min 6 characters)" className="w-full border rounded-xl px-4 py-3" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          <button type="submit" disabled={loading} className="w-full bg-[#1E3A5F] text-white py-3.5 rounded-xl font-semibold disabled:opacity-70">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm text-[#2E8B57]">{message}</p>}
      </div>
    </div>
  );
}