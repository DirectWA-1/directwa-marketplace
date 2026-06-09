'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
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

export default function CreateListingPage() {
  const router = useRouter();

  const [editId, setEditId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showProfileForm, setShowProfileForm] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    price: '',
    location: '',
    category: 'Electronics',
    condition: 'Good',
    description: '',
  });

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  // Profile form state
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    location: '',
  });

  // Read editId from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('edit');
    if (id) {
      setEditId(id);
      setIsEditing(true);
    }
  }, []);

  // Check authentication + profile completeness
  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        // Check if profile is complete
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone, bio, location')
          .eq('id', user.id)
          .single();

        if (!profile || !profile.full_name) {
          // Profile incomplete → show profile form first
          setShowProfileForm(true);
          if (profile) {
            setProfileData({
              full_name: profile.full_name || '',
              phone: profile.phone || '',
              bio: profile.bio || '',
              location: profile.location || '',
            });
          }
        } else {
          // Profile complete → load listing data if editing
          if (editId) {
            setIsEditing(true);
            const { data: listing } = await supabase
              .from('listings')
              .select('*')
              .eq('id', editId)
              .eq('user_id', user.id)
              .single();

            if (listing) {
              setFormData({
                title: listing.title || '',
                price: listing.price?.toString() || '',
                location: listing.location || '',
                category: listing.category || 'Electronics',
                condition: listing.condition || 'Good',
                description: listing.description || '',
              });
              setExistingImages(listing.images || []);
            }
          }
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setChecking(false);
      }
    };

    initialize();
  }, [editId, router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2E8B57] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ==================== SELLER PROFILE FORM ====================
  if (showProfileForm) {
    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!profileData.full_name.trim()) {
        toast.error('Full name is required');
        return;
      }

      setLoading(true);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('profiles').upsert({
          id: user.id,
          full_name: profileData.full_name.trim(),
          phone: profileData.phone.trim(),
          bio: profileData.bio.trim(),
          location: profileData.location.trim(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;

        toast.success('Profile saved! You can now create your listing.');
        setShowProfileForm(false); // Show create listing form
      } catch (err: any) {
        toast.error(err.message || 'Failed to save profile');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1E3A5F]">Complete Your Seller Profile</h1>
          <p className="text-gray-600 mt-2">This information will be visible to buyers</p>
        </div>

        <div className="bg-white border rounded-3xl p-8">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Full Name *</label>
              <input type="text" name="full_name" value={profileData.full_name} onChange={handleProfileChange} className="w-full border rounded-2xl px-5 py-3" required />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">WhatsApp Number</label>
              <input type="tel" name="phone" value={profileData.phone} onChange={handleProfileChange} className="w-full border rounded-2xl px-5 py-3" placeholder="+27 71 234 5678" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Location</label>
              <input type="text" name="location" value={profileData.location} onChange={handleProfileChange} className="w-full border rounded-2xl px-5 py-3" placeholder="Johannesburg" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">About You / Bio</label>
              <textarea name="bio" value={profileData.bio} onChange={handleProfileChange} rows={4} className="w-full border rounded-3xl px-5 py-3" placeholder="Tell buyers about yourself..." />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#2E8B57] hover:bg-[#246B46] text-white font-semibold py-4 rounded-2xl text-lg">
              {loading ? 'Saving...' : 'Save Profile & Continue to Sell'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==================== CREATE / EDIT LISTING FORM ====================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImages(prev => [...prev, ...files].slice(0, 5 - existingImages.length));
    }
  };

  const removeNewImage = (index: number) => setNewImages(prev => prev.filter((_, i) => i !== index));
  const removeExistingImage = (index: number) => setExistingImages(prev => prev.filter((_, i) => i !== index));

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= existingImages.length) return;
    const updated = [...existingImages];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setExistingImages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in');
        setLoading(false);
        return;
      }

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

      if (isEditing && editId) {
        const { error } = await supabase.from('listings').update({
          title: formData.title.trim(),
          price: parseFloat(formData.price),
          location: formData.location.trim(),
          category: formData.category,
          condition: formData.condition,
          description: formData.description.trim() || null,
          images: finalImages,
        }).eq('id', editId).eq('user_id', user.id);

        if (error) throw error;
        toast.success('Listing updated successfully!');
      } else {
        const { error } = await supabase.from('listings').insert({
          user_id: user.id,
          title: formData.title.trim(),
          price: parseFloat(formData.price),
          location: formData.location.trim(),
          category: formData.category,
          condition: formData.condition,
          description: formData.description.trim() || null,
          images: finalImages,
          status: 'active',
        });

        if (error) throw error;
        toast.success('Listing created successfully!');
      }

      setTimeout(() => router.push('/my-listings'), 1200);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-[#1E3A5F]">
          {isEditing ? 'Edit Listing' : 'Create New Listing'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditing ? 'Update your item details below' : 'Fill in the details to list your item'}
        </p>
      </div>

      <div className="bg-white border rounded-3xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">Item Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full border rounded-2xl px-5 py-3.5 text-lg" required />
          </div>

          {/* Price & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Price (R) *</label>
              <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full border rounded-2xl px-5 py-3.5 text-lg" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Location *</label>
              <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full border rounded-2xl px-5 py-3.5 text-lg" required />
            </div>
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange} className="w-full border rounded-2xl px-5 py-3.5 text-lg">
                <option>Electronics</option>
                <option>Fashion & Clothing</option>
                <option>Home & Garden</option>
                <option>Vehicles & Parts</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Condition</label>
              <select name="condition" value={formData.condition} onChange={handleInputChange} className="w-full border rounded-2xl px-5 py-3.5 text-lg">
                <option>New</option>
                <option>Like New</option>
                <option>Good</option>
                <option>Fair</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={5} className="w-full border rounded-3xl px-5 py-4" />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Photos <span className="text-gray-400 font-normal">(Max 5)</span>
            </label>

            <div className="border-2 border-dashed border-gray-300 rounded-3xl p-8 text-center hover:border-[#2E8B57] transition-colors">
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="images" disabled={existingImages.length + newImages.length >= 5} />
              <label htmlFor="images" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-7 h-7 text-gray-500" />
                  </div>
                  <p className="font-medium text-gray-700">Click to upload photos</p>
                  <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                </div>
              </label>
            </div>

            {(existingImages.length > 0 || newImages.length > 0) && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {existingImages.map((url, index) => (
                  <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button type="button" onClick={() => moveImage(index, 'left')} className="bg-white p-1.5 rounded-full"><ArrowLeft className="w-4 h-4" /></button>
                      <button type="button" onClick={() => moveImage(index, 'right')} className="bg-white p-1.5 rounded-full"><ArrowRight className="w-4 h-4" /></button>
                      <button type="button" onClick={() => removeExistingImage(index)} className="bg-white p-1.5 rounded-full text-red-600"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}

                {newImages.map((file, index) => (
                  <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeNewImage(index)} className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow opacity-0 group-hover:opacity-100"><X className="w-4 h-4 text-red-600" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#2E8B57] hover:bg-[#246B46] disabled:bg-gray-400 text-white font-semibold py-4 rounded-2xl text-lg flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditing ? 'Update Listing' : 'Create Listing'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}