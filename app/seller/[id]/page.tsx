'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function SellerSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    location: '',
  });

  // Check if user is logged in and load existing profile
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Load existing profile data if available
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, bio, location')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFormData({
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          bio: profile.bio || '',
          location: profile.location || '',
        });
      }

      setChecking(false);
    };

    loadProfile();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name.trim()) {
      toast.error('Full name is required');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in again');
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
        location: formData.location.trim(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success('Profile updated successfully!');
      router.push('/seller/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2E8B57]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#1E3A5F]">Complete Your Seller Profile</h1>
        <p className="text-gray-600 mt-2">This information will be visible to buyers</p>
      </div>

      <div className="bg-white border rounded-3xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold mb-2">Full Name *</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:outline-none focus:border-[#2E8B57]"
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold mb-2">WhatsApp Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+27 71 234 5678"
              className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:outline-none focus:border-[#2E8B57]"
            />
            <p className="text-xs text-gray-500 mt-1">Buyers will use this to contact you</p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Johannesburg"
              className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:outline-none focus:border-[#2E8B57]"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold mb-2">About You / Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Tell buyers a little about yourself and what you sell..."
              className="w-full border border-gray-300 rounded-3xl px-5 py-3 focus:outline-none focus:border-[#2E8B57] resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2E8B57] hover:bg-[#246B46] disabled:bg-gray-400 text-white font-semibold py-4 rounded-2xl text-lg mt-4"
          >
            {loading ? 'Saving...' : 'Save Profile & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}