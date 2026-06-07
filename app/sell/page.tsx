'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Upload, X, CheckCircle } from 'lucide-react';

interface FormData {
  title: string;
  price: string;
  location: string;
  category: string;
  condition: string;
  description: string;
}

export default function SellPage() {
  const router = useRouter();
  const [checkingProfile, setCheckingProfile] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    title: '', price: '', location: '', category: 'Electronics', condition: 'Good', description: ''
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ✅ Check if user has completed their seller profile
  useEffect(() => {
    const checkProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (!profile || !profile.full_name) {
        // Redirect to profile setup if name is missing
        router.push('/seller/setup');
        return;
      }

      setCheckingProfile(false);
    };

    checkProfile();
  }, [router]);

  if (checkingProfile) {
    return <div className="p-8 text-center">Checking your seller profile...</div>;
  }

  // ... (rest of your existing form logic stays the same)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 5 - images.length);
      setImages(prev => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in');
        setLoading(false);
        return;
      }

      // Upload images (your existing compression + upload logic)
      let imageUrls: string[] = [];
      for (const file of images) {
        // You can keep your existing compressImage + upload logic here
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(fileName, file);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('listing-images')
            .getPublicUrl(fileName);
          imageUrls.push(publicUrl);
        }
      }

      const { error } = await supabase.from('listings').insert({
        user_id: user.id,
        title: formData.title.trim(),
        price: parseFloat(formData.price),
        location: formData.location.trim(),
        category: formData.category,
        condition: formData.condition,
        description: formData.description.trim() || null,
        images: imageUrls,
        status: 'active'
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => router.push('/listings'), 1800);

    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <CheckCircle className="w-16 h-16 text-[#2E8B57] mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-[#1E3A5F] mb-3">Listing Published!</h1>
        <p className="text-gray-600">Redirecting you to browse listings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#1E3A5F]">Sell an Item</h1>
        <p className="text-gray-600 mt-2">List your item in under 2 minutes</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border space-y-6">
        {/* Form fields remain the same */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Item Title *</label>
          <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full border rounded-xl px-4 py-3" placeholder="e.g. iPhone 14 Pro Max" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Price (R) *</label>
            <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full border rounded-xl px-4 py-3" placeholder="2500" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Location *</label>
            <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full border rounded-xl px-4 py-3" placeholder="Johannesburg" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Category</label>
            <select name="category" value={formData.category} onChange={handleInputChange} className="w-full border rounded-xl px-4 py-3">
              <option>Electronics</option>
              <option>Fashion & Clothing</option>
              <option>Home & Garden</option>
              <option>Vehicles & Parts</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Condition</label>
            <select name="condition" value={formData.condition} onChange={handleInputChange} className="w-full border rounded-xl px-4 py-3">
              <option>New</option>
              <option>Like New</option>
              <option>Good</option>
              <option>Fair</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full border rounded-2xl px-4 py-3" placeholder="Describe your item..." />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Photos (Max 5)</label>
          <div className="border-2 border-dashed rounded-2xl p-6 text-center hover:border-[#2E8B57] transition-colors">
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="images" disabled={images.length >= 5} />
            <label htmlFor="images" className={`cursor-pointer flex flex-col items-center ${images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">{images.length >= 5 ? 'Maximum 5 images reached' : 'Click to upload photos'}</span>
            </label>
          </div>

          {images.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {images.map((file, index) => (
                <div key={index} className="relative w-20 h-20 border rounded-xl overflow-hidden group">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-white/90 rounded-full p-1">
                    <X className="w-3.5 h-3.5 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="w-full bg-[#2E8B57] hover:bg-[#246B46] disabled:bg-gray-400 text-white font-semibold py-4 rounded-xl text-lg">
          {loading ? 'Publishing...' : 'Publish Listing'}
        </button>
      </form>
    </div>
  );
}