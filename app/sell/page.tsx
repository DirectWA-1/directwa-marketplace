'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload } from 'lucide-react';

export default function SellPage() {
  const [formData, setFormData] = useState({
    title: '', price: '', location: '', category: 'Electronics', condition: 'Good', description: ''
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImages(Array.from(e.target.files).slice(0, 5));
  };

  const uploadImages = async () => {
    const urls: string[] = [];
    for (const image of images) {
      const fileName = `${Date.now()}-${image.name}`;
      const { data } = await supabase.storage.from('listing-images').upload(fileName, image);
      if (data) {
        const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(fileName);
        urls.push(publicUrl);
      }
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setMessage('Please log in first'); setLoading(false); return; }

      const imageUrls = await uploadImages();

      const { error } = await supabase.from('listings').insert({
        user_id: user.id, ...formData, price: parseFloat(formData.price), images: imageUrls, status: 'active'
      });

      if (error) throw error;
      setMessage('✅ Listing published successfully!');
      setTimeout(() => window.location.href = '/listings', 1200);
    } catch (err: any) {
      setMessage('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-[#1E3A5F] mb-8">Sell an Item</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">Item Title *</label>
          <input type="text" required className="w-full border rounded-xl px-4 py-3" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Price (R) *</label>
            <input type="number" required className="w-full border rounded-xl px-4 py-3" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Location *</label>
            <input type="text" required className="w-full border rounded-xl px-4 py-3" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Photos (Max 5)</label>
          <div className="border-2 border-dashed rounded-2xl p-8 text-center">
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="img" />
            <label htmlFor="img" className="cursor-pointer"><Upload className="mx-auto w-8 h-8 text-gray-400" /></label>
            {images.length > 0 && <p className="text-sm mt-2 text-green-600">{images.length} photos selected</p>}
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-[#2E8B57] text-white py-4 rounded-xl font-semibold disabled:opacity-70">
          {loading ? 'Publishing...' : 'Publish Listing'}
        </button>
        {message && <p className="text-center text-[#2E8B57] mt-4">{message}</p>}
      </form>
    </div>
  );
}