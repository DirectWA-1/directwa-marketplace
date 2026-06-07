'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [signupMethod, setSignupMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Email + Password Signup
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      router.push('/login?message=Check your email to confirm your account');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  // Send OTP for Phone Signup
  const handlePhoneSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.trim(),
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) throw error;
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and complete signup
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
          <h1 className="text-2xl font-semibold mt-6 mb-2">Create your account</h1>
          <p className="text-gray-600">Join DirectWA and start buying & selling</p>
        </div>

        <div className="bg-white p-8 rounded-2xl border">
          {/* Method Toggle */}
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => { setSignupMethod('email'); setStep('form'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${signupMethod === 'email' ? 'bg-white shadow' : 'text-gray-600'}`}
            >
              Email
            </button>
            <button
              onClick={() => { setSignupMethod('phone'); setStep('form'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${signupMethod === 'phone' ? 'bg-white shadow' : 'text-gray-600'}`}
            >
              Phone
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Email Signup */}
          {signupMethod === 'email' && (
            <form onSubmit={handleEmailSignup} className="space-y-5">
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

              <div>
                <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Phone Signup */}
          {signupMethod === 'phone' && step === 'form' && (
            <form onSubmit={handlePhoneSignup} className="space-y-5">
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

          {/* OTP Verification for Phone */}
          {signupMethod === 'phone' && step === 'otp' && (
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
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('form'); setOtp(''); setError(''); }}
                className="w-full text-sm text-gray-600 hover:text-gray-800"
              >
                Use a different number
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-[#2E8B57] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}