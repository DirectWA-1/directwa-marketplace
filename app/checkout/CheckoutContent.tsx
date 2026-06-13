'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  seller_id?: string;
}

export default function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const supabase: SupabaseClient = useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [shipping, setShipping] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [saveToProfile, setSaveToProfile] = useState(true);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Please login to continue to checkout');
        router.push('/login?redirect=/checkout');
        return;
      }

      setUser(user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('shipping_address')
        .eq('id', user.id)
        .single();

      if (profile?.shipping_address) {
        setShipping(profile.shipping_address);
      }

      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(savedCart);

      if (savedCart.length === 0 && !searchParams.get('payment_intent')) {
        router.push('/cart');
      }

      setLoading(false);
    };

    loadData();
  }, [router, searchParams, supabase]);

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const saveShippingToProfile = async () => {
    if (!user || !saveToProfile) return;

    try {
      await supabase
        .from('profiles')
        .update({ shipping_address: shipping })
        .eq('id', user.id);
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  };

  const handlePayFastPayment = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!shipping.fullName || !shipping.address) {
      toast.error('Please fill in your shipping address');
      return;
    }

    setProcessing(true);
    await saveShippingToProfile();

    try {
      const response = await fetch('/api/payfast/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          cart_items: cart,
          buyer_email: user.email,
          buyer_name: shipping.fullName,
          buyer_phone: shipping.phone,
        }),
      });

      const data = await response.json();

      if (data.success && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        toast.error(data.error || 'Failed to start PayFast payment');
      }
    } catch (error) {
      toast.error('Something went wrong with PayFast');
    } finally {
      setProcessing(false);
    }
  };

  const handleCashOnDelivery = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!shipping.fullName || !shipping.address) {
      toast.error('Please fill in your shipping address');
      return;
    }

    setProcessing(true);
    await saveShippingToProfile();

    try {
      const bySeller: any = {};
      cart.forEach(item => {
        const sid = item.seller_id || 'unknown';
        if (!bySeller[sid]) bySeller[sid] = [];
        bySeller[sid].push(item);
      });

      for (const sellerId of Object.keys(bySeller)) {
        const items = bySeller[sellerId];
        const sellerTotal = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);

        await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buyer_id: user.id,
            seller_id: sellerId,
            listing_id: items[0].id,
            amount: sellerTotal,
            payment_reference: `COD-${Date.now()}`,
            delivery_method: 'cod',
          }),
        });
      }

      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
      router.push('/order-confirmation?method=cod');
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Preparing checkout...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#1E3A5F] mb-8">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Shipping Address */}
        <div className="bg-white border rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6">Shipping Address</h2>

          <div className="space-y-4">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={shipping.fullName}
              onChange={handleShippingChange}
              className="w-full border rounded-xl px-4 py-3"
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={shipping.phone}
              onChange={handleShippingChange}
              className="w-full border rounded-xl px-4 py-3"
            />
            <input
              type="text"
              name="address"
              placeholder="Street Address"
              value={shipping.address}
              onChange={handleShippingChange}
              className="w-full border rounded-xl px-4 py-3"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="city"
                placeholder="City"
                value={shipping.city}
                onChange={handleShippingChange}
                className="w-full border rounded-xl px-4 py-3"
                required
              />
              <input
                type="text"
                name="postalCode"
                placeholder="Postal Code"
                value={shipping.postalCode}
                onChange={handleShippingChange}
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <label className="flex items-center gap-2 text-sm mt-2">
              <input
                type="checkbox"
                checked={saveToProfile}
                onChange={(e) => setSaveToProfile(e.target.checked)}
                className="accent-[#2E8B57]"
              />
              Save this address to my profile
            </label>
          </div>
        </div>

        {/* Order Summary + Payment */}
        <div className="bg-white border rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

          {cart.map((item) => (
            <div key={item.id} className="flex justify-between py-3 border-b">
              <span>{item.title} × {item.quantity}</span>
              <span>R{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}

          <div className="flex justify-between text-xl font-bold mt-6 pt-4 border-t">
            <span>Total</span>
            <span>R{total.toLocaleString()}</span>
          </div>

          <div className="mt-8 space-y-4">
            <button
              onClick={handlePayFastPayment}
              disabled={processing}
              className="w-full bg-[#2E8B57] hover:bg-[#246B46] text-white py-4 rounded-2xl font-semibold text-lg disabled:bg-gray-400"
            >
              {processing ? 'Processing...' : `Pay with PayFast • R${total.toLocaleString()}`}
            </button>

            <button
              onClick={handleCashOnDelivery}
              disabled={processing}
              className="w-full border border-[#2E8B57] text-[#2E8B57] hover:bg-gray-50 py-4 rounded-2xl font-semibold text-lg disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Cash on Delivery'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}