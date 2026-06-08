'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

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
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [checkingProfile, setCheckingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: '', price: '', location: '', category: 'Electronics', condition: 'Good', description: ''
  });

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  // Load profile + existing listing (if editing)
  useEffect(() => {
    const loadData = async () => {
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
        router.push('/seller/setup');
        return;
      }

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

      setCheckingProfile(false);
    };

    loadData();
  }, [editId, router]);

  if (checkingProfile) return <div className="p-8 text-center">Loading...</div>;

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

  // Remove new image
  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  // Remove existing image
  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Move image left/right (reorder)
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

      // Upload new images
      let uploadedUrls: string[] = [];
      for (const file of newImages) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(fileName, file);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('listing-images')
            .getPublicUrl(fileName);
          uploadedUrls.push(publicUrl);
        }
      }

      const finalImages = [...existingImages, ...uploadedUrls];

      if (isEditing && editId) {
        // Update existing listing
        const { error } = await supabase
          .from('listings')
          .update({
            title: formData.title.trim(),
            price: parseFloat(formData.price),
            location: formData.location.trim(),
            category: formData.category,
            condition: formData.condition,
            description: formData.description.trim() || null,
            images: finalImages,
          })
          .eq('id', editId)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success('Listing updated successfully!');
      } else {
        // Create new listing
        const { error } = await supabase.from('listings').insert({
          user_id: user.id,
          title: formData.title.trim(),
          price: parseFloat(formData.price),
          location: formData.location.trim(),
          category: formData.category,
          condition: formData.condition,
          description: formData.description.trim() || null,
          images: finalImages,
          status: 'active'
        });

        if (error) throw error;
        toast.success('Listing published successfully!');
      }

      setTimeout(() => router.push('/my-listings'), 1500);

    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#1E3A5F]">
          {isEditing ? 'Edit Listing' : 'Sell an Item'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditing ? 'Update your listing details below' : 'List your item in under 2 minutes'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border space-y-6">
        {/* Form Fields */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Item Title *</label>
          <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full border rounded-xl px-4 py-3" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Price (R) *</label>
            <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full border rounded-xl px-4 py-3" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Location *</label>
            <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full border rounded-xl px-4 py-3" required />
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
          <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full border rounded-2xl px-4 py-3" />
        </div>

        {/* Image Section with Reordering */}
        <div>
          <label className="block text-sm font-medium mb-2">Photos (Max 5)</label>

          <div className="border-2 border-dashed rounded-2xl p-6 text-center hover:border-[#2E8B57]">
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="images" disabled={existingImages.length + newImages.length >= 5} />
            <label htmlFor="images" className="cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <span className="text-sm text-gray-600">Click to upload photos</span>
            </label>
          </div>

          {(existingImages.length > 0 || newImages.length > 0) && (
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-3">
              {existingImages.map((url, index) => (
                <div key={`existing-${index}`} className="relative group">
                  <img src={url} alt="" className="w-full h-24 object-cover rounded-xl border" />
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button type="button" onClick={() => moveImage(index, 'left')} className="bg-white p-1 rounded-full shadow">
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                    <button type="button" onClick={() => moveImage(index, 'right')} className="bg-white p-1 rounded-full shadow">
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button type="button" onClick={() => removeExistingImage(index)} className="bg-white p-1 rounded-full shadow">
                      <X className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                  <div className="text-[10px] text-center mt-1 text-gray-500">Image {index + 1}</div>
                </div>
              ))}

              {newImages.map((file, index) => (
                <div key={`new-${index}`} className="relative group">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-24 object-cover rounded-xl border" />
                  <button type="button" onClick={() => removeNewImage(index)} className="absolute top-1 right-1 bg-white p-1 rounded-full shadow opacity-0 group-hover:opacity-100">
                    <X className="w-3 h-3 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="w-full bg-[#2E8B57] hover:bg-[#246B46] disabled:bg-gray-400 text-white font-semibold py-4 rounded-xl text-lg">
          {loading ? (isEditing ? 'Updating...' : 'Publishing...') : (isEditing ? 'Update Listing' : 'Publish Listing')}
        </button>
      </form>
    </div>
  );
}