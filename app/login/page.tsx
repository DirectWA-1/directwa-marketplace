'use client';

import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function LoginPage() {
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Email + Password Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Phone + OTP Login
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Forgot Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // ==================== EMAIL LOGIN ====================
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged in successfully!');
      window.location.href = '/listings';
    }
    setLoading(false);
  };

  // ==================== PHONE + OTP ====================
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return toast.error('Please enter your phone number');

    setPhoneLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      phone: phone,
    });

    if (error) {
      toast.error(error.message);
    } else {
      setOtpSent(true);
      toast.success('OTP sent to your phone!');
    }
    setPhoneLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: otp,
      type: 'sms',
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged in successfully!');
      window.location.href = '/listings';
    }
    setPhoneLoading(false);
  };

  // ==================== FORGOT PASSWORD ====================
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password reset link sent to your email!');
      setShowForgotPassword(false);
    }
    setForgotLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#1E3A5F]">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your DirectWA account</p>
        </div>

        {/* Mode Toggle (only show when not in forgot password) */}
        {!showForgotPassword && (
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setMode('email')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'email' ? 'bg-white shadow text-[#1E3A5F]' : 'text-gray-600'}`}
            >
              Email
            </button>
            <button
              onClick={() => setMode('phone')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'phone' ? 'bg-white shadow text-[#1E3A5F]' : 'text-gray-600'}`}
            >
              Phone (WhatsApp)
            </button>
          </div>
        )}

        <div className="bg-white border rounded-2xl p-8 shadow-sm">
          {/* ==================== FORGOT PASSWORD ==================== */}
          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full bg-[#2E8B57] hover:bg-[#246B46] text-white font-semibold py-3.5 rounded-2xl"
              >
                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-sm text-gray-600 hover:text-gray-800"
              >
                Back to Login
              </button>
            </form>
          ) : (
            <>
              {/* ==================== EMAIL LOGIN ==================== */}
              {mode === 'email' && (
                <form onSubmit={handleEmailLogin} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#2E8B57] hover:bg-[#246B46] disabled:bg-gray-400 text-white font-semibold py-3.5 rounded-2xl text-lg"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-[#2E8B57] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </form>
              )}

              {/* ==================== PHONE + OTP LOGIN ==================== */}
              {mode === 'phone' && (
                <div className="space-y-6">
                  {!otpSent ? (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Phone Number (WhatsApp)</label>
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
                        disabled={phoneLoading}
                        className="w-full bg-[#2E8B57] hover:bg-[#246B46] disabled:bg-gray-400 text-white font-semibold py-3.5 rounded-2xl text-lg"
                      >
                        {phoneLoading ? 'Sending OTP...' : 'Send OTP'}
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
                        disabled={phoneLoading}
                        className="w-full bg-[#2E8B57] hover:bg-[#246B46] disabled:bg-gray-400 text-white font-semibold py-3.5 rounded-2xl text-lg"
                      >
                        {phoneLoading ? 'Verifying...' : 'Verify & Login'}
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
            </>
          )}

          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#2E8B57] hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}