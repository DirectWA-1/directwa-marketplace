'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    deliveryMethod: 'delivery',
    paymentMethod: 'cod',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // Load cart from localStorage (client-side only)
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
    setLoading(false);
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone) {
      toast.error('Please fill in your name and phone number');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setSubmitting(true);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Clear cart after successful order
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartUpdated'));

    // Redirect to confirmation
    router.push('/order-confirmation');
  };

  if (loading) {
    return <div className="p-8">Loading checkout...</div>;
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-xl mb-4">Your cart is empty.</p>
        <a href="/listings" className="text-[#2E8B57] hover:underline">Browse listings →</a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#1E3A5F] mb-8">Checkout</h1>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Checkout Form */}
        <div className="md:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full border rounded-2xl px-5 py-3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border rounded-2xl px-5 py-3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Delivery Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border rounded-2xl px-5 py-3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border rounded-2xl px-5 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Delivery Method</label>
                <select
                  name="deliveryMethod"
                  value={formData.deliveryMethod}
                  onChange={handleChange}
                  className="w-full border rounded-2xl px-5 py-3"
                >
                  <option value="delivery">Delivery</option>
                  <option value="pickup">Pickup</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full border rounded-2xl px-5 py-3"
              >
                <option value="cod">Cash on Delivery / Collection</option>
                <option value="eft">EFT / Bank Transfer</option>
                <option value="whatsapp">Pay via WhatsApp</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full border rounded-2xl px-5 py-3"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#2E8B57] hover:bg-[#246B46] text-white py-4 rounded-2xl font-semibold text-lg disabled:bg-gray-400"
            >
              {submitting ? 'Processing Order...' : `Complete Order • R${total.toLocaleString()}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-2 bg-white border rounded-2xl p-6 h-fit sticky top-6">
          <h2 className="font-semibold mb-4">Order Summary</h2>

          {cart.map((item) => (
            <div key={item.id} className="flex justify-between text-sm mb-2">
              <span>{item.title} × {item.quantity}</span>
              <span>R{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}

          <div className="border-t mt-4 pt-4 flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>R{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}