'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Email + Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      router.push('/listings');
      router.refresh();

    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Send OTP to Phone
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.trim(),
      });

      if (error) throw error;
      setStep('otp');

    } catch (err: any) {
      setError(err.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone.trim(),
        token: otp,
        type: 'sms',
      });

      if (error) throw error;
      router.push('/listings');
      router.refresh();

    } catch (err: any) {
      setError(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-[#1E3A5F]">
            DirectWA
          </Link>
          <h1 className="text-2xl font-semibold mt-6 mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <div className="bg-white p-8 rounded-2xl border">
          {/* Method Toggle */}
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => { setLoginMethod('email'); setStep('credentials'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${loginMethod === 'email' ? 'bg-white shadow' : 'text-gray-600'}`}
            >
              Email
            </button>
            <button
              onClick={() => { setLoginMethod('phone'); setStep('credentials'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${loginMethod === 'phone' ? 'bg-white shadow' : 'text-gray-600'}`}
            >
              Phone
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Email Login */}
          {loginMethod === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-5">
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

              <div>
                <label className="block text-sm font-medium mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2E8B57] hover:bg-[#246B46] disabled:bg-gray-400 text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Phone Login */}
          {loginMethod === 'phone' && step === 'credentials' && (
            <form onSubmit={handlePhoneLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3"
                  placeholder="+27 71 234 5678"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Include country code (e.g. +27)</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2E8B57] hover:bg-[#246B46] disabled:bg-gray-400 text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                {loading ? 'Sending code...' : 'Send Verification Code'}
              </button>
            </form>
          )}

          {/* OTP Verification */}
          {loginMethod === 'phone' && step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Enter the 6-digit code sent to {phone}</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-center tracking-[8px] text-lg"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2E8B57] hover:bg-[#246B46] disabled:bg-gray-400 text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('credentials'); setOtp(''); setError(''); }}
                className="w-full text-sm text-gray-600 hover:text-gray-800"
              >
                Use a different number
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <Link href="/forgot-password" className="text-[#2E8B57] hover:underline">
              Forgot your password?
            </Link>
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#2E8B57] font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}