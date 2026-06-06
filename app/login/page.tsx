'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  
  // Email + Password states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Phone states
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneStep, setPhoneStep] = useState<'phone' | 'otp'>('phone');

  // Email Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      window.location.href = '/';
    }
    setLoading(false);
  };

  // Email Signup (for new users)
  const handleEmailSignUp = async () => {
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Account created! You can now log in.');
    }
    setLoading(false);
  };

  // Phone OTP - Send code
  const sendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let formatted = phone.replace(/\s/g, '');
    if (!formatted.startsWith('+')) formatted = '+27' + formatted.replace(/^0/, '');

    const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
    if (error) setMessage(error.message);
    else { setPhoneStep('otp'); setMessage('Code sent!'); }
    setLoading(false);
  };

  // Phone OTP - Verify
  const verifyPhoneOtp = async (e: React.FormEvent) => {
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

      {/* Tabs */}
      <div className="flex mb-6 border-b">
        <button 
          onClick={() => setActiveTab('email')}
          className={`flex-1 py-3 font-medium ${activeTab === 'email' ? 'border-b-2 border-[#1E3A5F] text-[#1E3A5F]' : 'text-gray-500'}`}
        >
          Email
        </button>
        <button 
          onClick={() => setActiveTab('phone')}
          className={`flex-1 py-3 font-medium ${activeTab === 'phone' ? 'border-b-2 border-[#1E3A5F] text-[#1E3A5F]' : 'text-gray-500'}`}
        >
          Phone
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl border">
        {/* Email Tab */}
        {activeTab === 'email' && (
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <input type="email" placeholder="Email address" className="w-full border rounded-xl px-4 py-3" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" className="w-full border rounded-xl px-4 py-3" value={password} onChange={(e) => setPassword(e.target.value)} required />
            
            <button type="submit" disabled={loading} className="w-full bg-[#1E3A5F] text-white py-3.5 rounded-xl font-semibold disabled:opacity-70">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <button type="button" onClick={handleEmailSignUp} disabled={loading} className="w-full text-sm text-gray-600 hover:text-[#1E3A5F]">
              Create new account
            </button>
          </form>
        )}

        {/* Phone Tab */}
        {activeTab === 'phone' && (
          <>
            {phoneStep === 'phone' ? (
              <form onSubmit={sendPhoneOtp} className="space-y-5">
                <input type="tel" placeholder="071 234 5678" className="w-full border rounded-xl px-4 py-3 text-lg" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                <button disabled={loading} className="w-full bg-[#1E3A5F] text-white py-3.5 rounded-xl font-semibold disabled:opacity-70">
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={verifyPhoneOtp} className="space-y-5">
                <input type="text" maxLength={6} placeholder="123456" className="w-full border rounded-xl px-4 py-3 text-center text-2xl tracking-[6px]" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                <button disabled={loading} className="w-full bg-[#1E3A5F] text-white py-3.5 rounded-xl font-semibold disabled:opacity-70">
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
              </form>
            )}
          </>
        )}

        {message && <p className="mt-4 text-center text-sm text-[#2E8B57]">{message}</p>}
      </div>
    </div>
  );
}