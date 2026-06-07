'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, X, CheckCircle } from 'lucide-react';

interface FormData {
  title: string;
  price: string;
  location: string;
  category: string;
  condition: string;
  description: string;
}

interface FormErrors {
  title?: string;
  price?: string;
  location?: string;
}

export default function SellPage() {
  const [formData, setFormData] = useState<FormData>({
    title: '', price: '', location: '', category: 'Electronics', condition: 'Good', description: ''
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [success, setSuccess] = useState(false);

  // Validation
  const validateField = (name: string, value: string): string | undefined => {
    if (name === 'title' && !value.trim()) return 'Title is required';
    if (name === 'price' && (!value || parseFloat(value) <= 0)) return 'Please enter a valid price';
    if (name === 'location' && !value.trim()) return 'Location is required';
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Please enter a valid price';
    if (!formData.location.trim()) newErrors.location = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
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

  const isFormValid = () => {
    return formData.title.trim() && 
           formData.price && parseFloat(formData.price) > 0 && 
           formData.location.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in to create a listing');
        setLoading(false);
        return;
      }

      // Upload images
      let imageUrls: string[] = [];
      if (images.length > 0) {
        for (const file of images) {
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
      }

      // Create listing
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
      
      // Redirect after success
      setTimeout(() => {
        window.location.href = '/listings';
      }, 1800);

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
        <p className="text-gray-600">Your item is now live. Redirecting you to browse listings...</p>
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
        
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Item Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`w-full border rounded-xl px-4 py-3 ${errors.title && touched.title ? 'border-red-500' : ''}`}
            placeholder="e.g. iPhone 14 Pro Max"
          />
          {errors.title && touched.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Price (R) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full border rounded-xl px-4 py-3 ${errors.price && touched.price ? 'border-red-500' : ''}`}
              placeholder="2500"
            />
            {errors.price && touched.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full border rounded-xl px-4 py-3 ${errors.location && touched.location ? 'border-red-500' : ''}`}
              placeholder="Johannesburg"
            />
            {errors.location && touched.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
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
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full border rounded-2xl px-4 py-3"
            placeholder="Describe your item (condition, features, why you're selling...)"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Photos (Max 5)</label>
          <div className="border-2 border-dashed rounded-2xl p-6 text-center hover:border-[#2E8B57] transition-colors">
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="images" />
            <label htmlFor="images" className="cursor-pointer flex flex-col items-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Click to upload photos</span>
              <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5 images</span>
            </label>
          </div>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {images.map((file, index) => (
                <div key={index} className="relative w-20 h-20 border rounded-xl overflow-hidden group">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow opacity-80 group-hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !isFormValid()}
          className="w-full bg-[#2E8B57] hover:bg-[#246B46] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl text-lg transition-colors"
        >
          {loading ? 'Publishing...' : 'Publish Listing'}
        </button>

        {!isFormValid() && (
          <p className="text-center text-sm text-gray-500">Please fill in all required fields (*)</p>
        )}
      </form>
    </div>
  );
}