'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Upload, X } from 'lucide-react';
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

function CreateListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  const [loading, setLoading] = useState(false);
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
  const [objectUrls, setObjectUrls] = useState<string[]>([]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [objectUrls]);

  // Load existing data if editing
  useEffect(() => {
    if (editId) {
      loadExistingListing();
    }
  }, [editId]);

  const loadExistingListing = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', editId)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      toast.error('Could not load listing');
      router.push('/my-listings');
      return;
    }

    setFormData({
      title: data.title || '',
      price: data.price?.toString() || '',
      location: data.location || '',
      category: data.category || 'Electronics',
      condition: data.condition || 'Good',
      description: data.description || '',
    });
    setExistingImages(data.images || []);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - (existingImages.length + newImages.length);
    if (remaining <= 0) return toast.warning('Maximum 5 images allowed');

    const allowed = files.slice(0, remaining);
    const newUrls = allowed.map(file => URL.createObjectURL(file));

    setObjectUrls(prev => [...prev, ...newUrls]);
    setNewImages(prev => [...prev, ...allowed]);
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(objectUrls[index]);
    setObjectUrls(prev => prev.filter((_, i) => i !== index));
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const priceNum = parseFloat(formData.price);
    if (!formData.title.trim() || isNaN(priceNum) || priceNum <= 0 || !formData.location.trim()) {
      return toast.error('Please fill Title, valid Price, and Location');
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in');

      // Upload new images
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
        toast.success('Listing updated successfully!');
      } else {
        const { error } = await supabase.from('listings').insert({ ...payload, user_id: user.id, status: 'active' });
        if (error) throw error;
        toast.success('Listing created successfully!');
      }

      router.push('/my-listings');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-8">
        {isEditing ? 'Edit Listing' : 'Create New Listing'}
      </h1>

      <div className="bg-white border rounded-3xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">Item Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full border rounded-2xl px-5 py-3.5 text-lg"
              placeholder="iPhone 14 Pro Max"
              required
            />
          </div>

          {/* Price & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Price (R) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full border rounded-2xl px-5 py-3.5 text-lg"
                placeholder="12500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full border rounded-2xl px-5 py-3.5 text-lg"
                placeholder="Johannesburg, Gauteng"
                required
              />
            </div>
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange} className="w-full border rounded-2xl px-5 py-3.5">
                <option>Electronics</option>
                <option>Fashion & Clothing</option>
                <option>Home & Garden</option>
                <option>Vehicles & Parts</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Condition</label>
              <select name="condition" value={formData.condition} onChange={handleInputChange} className="w-full border rounded-2xl px-5 py-3.5">
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
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={5}
              className="w-full border rounded-3xl px-5 py-4"
              placeholder="Describe your item in detail..."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold mb-3">Photos (Max 5)</label>
            <div className="border-2 border-dashed rounded-3xl p-8 text-center">
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="images" disabled={existingImages.length + newImages.length >= 5} />
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
                    <button type="button" onClick={() => removeExistingImage(index)} className="absolute top-2 right-2 bg-white p-1.5 rounded-full opacity-0 group-hover:opacity-100">
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
                {newImages.map((file, index) => (
                  <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border">
                    <img src={objectUrls[index]} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeNewImage(index)} className="absolute top-2 right-2 bg-white p-1.5 rounded-full opacity-0 group-hover:opacity-100">
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2E8B57] hover:bg-[#246B46] disabled:bg-gray-400 text-white font-semibold py-4 rounded-2xl text-lg"
          >
            {loading ? (isEditing ? 'Updating...' : 'Creating...') : isEditing ? 'Update Listing' : 'Create Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CreateListingPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[70vh]">Loading...</div>}>
      <CreateListingContent />
    </Suspense>
  );
}