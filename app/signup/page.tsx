'use client';

import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function SignupPage() {
  const [mode, setMode] = useState<'phone' | 'email'>('phone');

  // Phone OTP State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Email Signup State (fallback)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // Send OTP to phone
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !fullName) {
      return toast.error('Please enter your full name and phone number');
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      phone: phone,
    });

    if (error) {
      toast.error(error.message);
    } else {
      setOtpSent(true);
      toast.success('OTP sent to your phone!');
    }
    setLoading(false);
  };

  // Verify OTP and create account
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: otp,
      type: 'sms',
    });

    if (error) {
      toast.error(error.message);
    } else if (data.user) {
      // Save full name to profile
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        phone: phone,
      });

      toast.success('Account created successfully!');
      window.location.href = '/listings';
    }
    setLoading(false);
  };

  // Email Signup (fallback)
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      await supabase.from('profiles').upsert({
        id: data.user!.id,
        full_name: fullName,
      });

      toast.success('Account created! Please check your email to confirm.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
    setEmailLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#1E3A5F]">Create an Account</h1>
          <p className="text-gray-600 mt-2">Join DirectWA using your WhatsApp number</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setMode('phone')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'phone' ? 'bg-white shadow' : 'text-gray-600'}`}
          >
            Phone (WhatsApp)
          </button>
          <button
            onClick={() => setMode('email')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'email' ? 'bg-white shadow' : 'text-gray-600'}`}
          >
            Email
          </button>
        </div>

        <div className="bg-white border rounded-2xl p-8 shadow-sm">
          {/* Phone + OTP Signup */}
          {mode === 'phone' && (
            <div className="space-y-6">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Phone Number (WhatsApp) *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+27 71 234 5678"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#2E8B57] hover:bg-[#246B46] disabled:bg-gray-400 text-white font-semibold py-3.5 rounded-2xl text-lg"
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Enter OTP sent to {phone}</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-2xl tracking-[6px]"
                      maxLength={6}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#2E8B57] hover:bg-[#246B46] disabled:bg-gray-400 text-white font-semibold py-3.5 rounded-2xl text-lg"
                  >
                    {loading ? 'Creating Account...' : 'Verify & Create Account'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                    }}
                    className="w-full text-sm text-gray-600 hover:text-gray-800"
                  >
                    Use a different number
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Email Signup (Fallback) */}
          {mode === 'email' && (
            <form onSubmit={handleEmailSignup} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Email Address *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Password *</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3" required minLength={6} />
              </div>

              <button type="submit" disabled={emailLoading} className="w-full bg-[#2E8B57] hover:bg-[#246B46] disabled:bg-gray-400 text-white font-semibold py-3.5 rounded-2xl text-lg">
                {emailLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#2E8B57] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}