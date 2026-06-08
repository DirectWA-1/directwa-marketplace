'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SellerSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    location: '',
  });

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, bio, location')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFormData({
          full_name: profile.full_name || '',
          bio: profile.bio || '',
          location: profile.location || '',
        });
      }
      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be logged in');
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name.trim(),
        bio: formData.bio.trim(),
        location: formData.location.trim(),
      })
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to save profile');
    } else {
      toast.success('Profile updated successfully!');
      router.push('/listings');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white border rounded-2xl p-8 animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-8" />
          <div className="space-y-6">
            <div className="h-12 bg-gray-200 rounded-xl" />
            <div className="h-12 bg-gray-200 rounded-xl" />
            <div className="h-32 bg-gray-200 rounded-2xl" />
            <div className="h-12 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1E3A5F]">Complete Your Seller Profile</h1>
        <p className="text-gray-600 mt-2">This information will be visible to buyers.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">Full Name *</label>
          <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full border rounded-xl px-4 py-3" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Location</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full border rounded-xl px-4 py-3" placeholder="e.g. Johannesburg, Gauteng" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Bio / About You</label>
          <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} className="w-full border rounded-2xl px-4 py-3" placeholder="Tell buyers a bit about yourself..." />
        </div>

        <button type="submit" disabled={saving} className="w-full bg-[#2E8B57] hover:bg-[#246B46] disabled:bg-gray-400 text-white py-4 rounded-2xl font-semibold text-lg">
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}