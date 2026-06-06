'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, X } from 'lucide-react';

export default function SellPage() {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    category: 'Electronics',
    condition: 'Good',
    description: ''
  });

  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const remainingSlots = 5 - images.length;
      const filesToAdd = selectedFiles.slice(0, remainingSlots);
      setImages(prev => [...prev, ...filesToAdd]);
    }
  };

  // Remove selected image
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Upload images to Supabase Storage
  const uploadImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('listing-images')
        .upload(fileName, file);

      if (error) {
        console.error('Image upload failed:', error);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('listing-images')
        .getPublicUrl(fileName);

      urls.push(publicUrl);
    }

    return urls;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage('Please log in to create a listing.');
        setLoading(false);
        return;
      }

      // Upload images first
      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await uploadImages(images);
      }

      // Save listing to database
      const { error } = await supabase.from('listings').insert({
        user_id: user.id,
        title: formData.title,
        price: parseFloat(formData.price),
        location: formData.location,
        category: formData.category,
        condition: formData.condition,
        description: formData.description || null,
        images: imageUrls,
        status: 'active'
      });

      if (error) throw error;

      setMessage('✅ Listing published successfully! Redirecting...');

      setTimeout(() => {
        window.location.href = '/listings';
      }, 1200);

    } catch (err: any) {
      console.error(err);
      setMessage('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#1E3A5F]">Sell an Item</h1>
        <p className="text-gray-600 mt-2">List your item in under 2 minutes</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Item Title *</label>
          <input
            type="text"
            required
            className="w-full border rounded-xl px-4 py-3"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        {/* Price & Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Price (R) *</label>
            <input
              type="number"
              required
              className="w-full border rounded-xl px-4 py-3"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Location *</label>
            <input
              type="text"
              required
              className="w-full border rounded-xl px-4 py-3"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
        </div>

        {/* Category & Condition */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Category</label>
            <select
              className="w-full border rounded-xl px-4 py-3"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option>Electronics</option>
              <option>Fashion & Clothing</option>
              <option>Home & Garden</option>
              <option>Vehicles & Parts</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Condition</label>
            <select
              className="w-full border rounded-xl px-4 py-3"
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
            >
              <option>New</option>
              <option>Like New</option>
              <option>Good</option>
              <option>Fair</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea
            rows={4}
            className="w-full border rounded-2xl px-4 py-3"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Photos (Max 5)</label>
          <div className="border-2 border-dashed rounded-2xl p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="images"
            />
            <label htmlFor="images" className="cursor-pointer flex flex-col items-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Click to upload photos</span>
            </label>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {images.map((file, index) => (
                <div key={index} className="relative w-20 h-20 border rounded-xl overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2E8B57] hover:bg-[#246B46] text-white font-semibold py-4 rounded-xl text-lg disabled:opacity-70"
        >
          {loading ? 'Publishing...' : 'Publish Listing'}
        </button>

        {/* Message */}
        {message && (
          <p className="text-center text-[#2E8B57] mt-4">{message}</p>
        )}
      </form>
    </div>
  );
}