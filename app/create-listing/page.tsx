'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Upload, X, ArrowLeft, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export const dynamic = 'force-dynamic';

interface FormData {
  title: string;
  price: string;
  location: string;
  category: string;
  condition: string;
  description: string;
}

interface ProfileData {
  full_name: string;
  phone: string;
  bio: string;
  location: string;
}

function CreateListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: '', price: '', location: '', category: 'Electronics', condition: 'Good', description: '',
  });

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [objectUrls, setObjectUrls] = useState<string[]>([]);

  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '', phone: '', bio: '', location: '',
  });

  // Cleanup object URLs
  useEffect(() => {
    return () => objectUrls.forEach(url => URL.revokeObjectURL(url));
  }, [objectUrls]);

  const fetchListingData = useCallback(async (id: string, userId: string) => {
    const { data: listing, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !listing) {
      toast.error('Could not load listing');
      router.push('/my-listings');
      return false;
    }

    setFormData({
      title: listing.title || '',
      price: listing.price?.toString() || '',
      location: listing.location || '',
      category: listing.category || 'Electronics',
      condition: listing.condition || 'Good',
      description: listing.description || '',
    });
    setExistingImages(listing.images || []);
    return true;
  }, [router]);

  useEffect(() => {
    const initialize = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, bio, location')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile || !profile.full_name) {
        setShowProfileForm(true);
        if (profile) setProfileData(profile);
      } else {
        if (editId) await fetchListingData(editId, user.id);
      }
      setChecking(false);
    };
    initialize();
  }, [editId, router, fetchListingData]);

  // ==================== IMAGE COMPRESSION ====================
  const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = Math.min(1, maxWidth / img.width);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          }, 'image/jpeg', quality);
        };
      };
    });
  };

  // ==================== HANDLERS ====================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - (existingImages.length + newImages.length);
    if (remaining <= 0) return toast.warning('Maximum 5 images allowed');

    const allowed = files.slice(0, remaining);
    setUploadingImages(true);

    try {
      const compressedFiles = await Promise.all(allowed.map(file => compressImage(file)));
      const newUrls = compressedFiles.map(f => URL.createObjectURL(f));
      
      setObjectUrls(prev => [...prev, ...newUrls]);
      setNewImages(prev => [...prev, ...compressedFiles]);
    } catch (err) {
      toast.error('Failed to process images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(objectUrls[index]);
    setObjectUrls(prev => prev.filter((_, i) => i !== index));
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= existingImages.length) return;
    const updated = [...existingImages];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setExistingImages(updated);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.full_name.trim()) return toast.error('Full name is required');

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        ...profileData,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      if (error) throw error;

      toast.success('Profile saved!');
      setShowProfileForm(false);

      if (editId) {
        await fetchListingData(editId, user.id);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const priceNum = parseFloat(formData.price);
    if (!formData.title.trim() || isNaN(priceNum) || priceNum <= 0 || !formData.location.trim()) {
      return toast.error('Please fill in title, valid price, and location');
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in');

      let uploadedUrls: string[] = [];

      for (const file of newImages) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('listing-images').upload(fileName, file);
        
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(fileName);
          uploadedUrls.push(publicUrl);
        }
      }

      const finalImages = [...existingImages, ...uploadedUrls];
      const payload = {
        title: formData.title.trim(),
        price: priceNum,
        location: formData.location.trim(),
        category: formData.category,
        condition: formData.condition,
        description: formData.description.trim() || null,
        images: finalImages,
      };

      if (isEditing && editId) {
        const { error } = await supabase.from('listings').update(payload).eq('id', editId).eq('user_id', user.id);
        if (error) throw error;
        toast.success('Listing updated!');
      } else {
        const { error } = await supabase.from('listings').insert({ ...payload, user_id: user.id, status: 'active' });
        if (error) throw error;
        toast.success('Listing created!');
      }

      router.push('/my-listings');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return <div className="flex justify-center items-center min-h-[70vh]"><div className="animate-spin h-10 w-10 border-b-2 border-[#2E8B57] rounded-full"></div></div>;
  }

  if (showProfileForm) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-center mb-8">Complete Your Seller Profile</h1>
        <form onSubmit={handleProfileSubmit} className="bg-white border rounded-3xl p-8 space-y-6">
          <input type="text" name="full_name" placeholder="Full Name *" value={profileData.full_name} onChange={handleProfileChange} className="w-full border rounded-2xl px-5 py-3" required />
          <input type="tel" name="phone" placeholder="WhatsApp Number" value={profileData.phone} onChange={handleProfileChange} className="w-full border rounded-2xl px-5 py-3" />
          <input type="text" name="location" placeholder="Location" value={profileData.location} onChange={handleProfileChange} className="w-full border rounded-2xl px-5 py-3" />
          <textarea name="bio" placeholder="Short bio about you" value={profileData.bio} onChange={handleProfileChange} rows={4} className="w-full border rounded-3xl px-5 py-3" />
          <button type="submit" disabled={loading} className="w-full bg-[#2E8B57] text-white py-4 rounded-2xl font-semibold">
            {loading ? 'Saving...' : 'Save Profile & Continue'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-8">{isEditing ? 'Edit Listing' : 'Create New Listing'}</h1>

      <div className="bg-white border rounded-3xl p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Form fields (title, price, location, category, condition, description) - same as before */}

          {/* Image Upload Section with Compression */}
          <div>
            <label className="block text-sm font-semibold mb-3">Photos (Max 5)</label>
            <div className="border-2 border-dashed rounded-3xl p-8 text-center">
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="images" disabled={existingImages.length + newImages.length >= 5 || uploadingImages} />
              <label htmlFor="images" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                <p className="font-medium">Click to upload photos (images will be compressed)</p>
              </label>
            </div>

            {(existingImages.length > 0 || newImages.length > 0) && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {existingImages.map((url, index) => (
                  <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border">
                    <img src={url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2">
                      <button type="button" onClick={() => moveImage(index, 'left')}><ArrowLeft className="w-4 h-4 bg-white p-1 rounded" /></button>
                      <button type="button" onClick={() => moveImage(index, 'right')}><ArrowRight className="w-4 h-4 bg-white p-1 rounded" /></button>
                      <button type="button" onClick={() => removeExistingImage(index)}><X className="w-4 h-4 bg-white p-1 rounded text-red-600" /></button>
                    </div>
                  </div>
                ))}
                {newImages.map((file, index) => (
                  <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border">
                    <img src={objectUrls[index]} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeNewImage(index)} className="absolute top-2 right-2 bg-white p-1.5 rounded-full"><X className="w-4 h-4 text-red-600" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading || uploadingImages} className="w-full bg-[#2E8B57] text-white py-4 rounded-2xl font-semibold text-lg flex justify-center items-center gap-2">
            {(loading || uploadingImages) && <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div>}
            {loading || uploadingImages ? 'Processing...' : isEditing ? 'Update Listing' : 'Create Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CreateListingPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[70vh]"><div className="animate-spin h-10 w-10 border-b-2 border-[#2E8B57] rounded-full"></div></div>}>
      <CreateListingContent />
    </Suspense>
  );
}