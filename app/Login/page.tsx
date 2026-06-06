'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let formatted = phone.replace(/\s/g, '');
    if (!formatted.startsWith('+')) formatted = '+27' + formatted.replace(/^0/, '');
    const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
    if (error) setMessage(error.message);
    else { setStep('otp'); setMessage('Code sent!'); }
    setLoading(false);
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let formatted = phone.replace(/\s/g, '');
    if (!formatted.startsWith('+')) formatted = '+27' + formatted.replace(/^0/, '');
    const { error } = await supabase.auth.verifyOtp({ phone: formatted, token: otp, type: 'sms' });
    if (error) setMessage(error.message);
    else window.location.href = '/';
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center text-[#1E3A5F] mb-8">Welcome to DirectWA</h1>
      <div className="bg-white p-8 rounded-2xl border">
        {step === 'phone' ? (
          <form onSubmit={sendOtp} className="space-y-5">
            <input type="tel" placeholder="071 234 5678" className="w-full border rounded-xl px-4 py-3 text-lg" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <button disabled={loading} className="w-full bg-[#1E3A5F] text-white py-3.5 rounded-xl font-semibold disabled:opacity-70">
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-5">
            <input type="text" maxLength={6} placeholder="123456" className="w-full border rounded-xl px-4 py-3 text-center text-2xl tracking-[6px]" value={otp} onChange={(e) => setOtp(e.target.value)} required />
            <button disabled={loading} className="w-full bg-[#1E3A5F] text-white py-3.5 rounded-xl font-semibold disabled:opacity-70">
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
          </form>
        )}
        {message && <p className="mt-4 text-center text-sm text-[#2E8B57]">{message}</p>}
      </div>
    </div>
  );
}