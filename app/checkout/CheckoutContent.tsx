'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  seller_id?: string;
}

interface PayFastInitiateResponse {
  success?: boolean;
  error?: string;
  payment_url?: string;
  payment_data?: Record<string, string>;
  reference?: string;
}

export default function CheckoutContent() {
  const router = useRouter();

  const supabase = useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

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
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        toast.error('Please log in to checkout');
        router.push('/login?redirect=/checkout');
        return;
      }

      setUser(currentUser);

      const { data: profile } = await supabase
        .from('profiles')
        .select('shipping_address')
        .eq('id', currentUser.id)
        .single();

      if (profile?.shipping_address) {
        setShipping(profile.shipping_address);
      }

      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(savedCart);

      if (savedCart.length === 0) {
        router.push('/cart');
        return;
      }

      setLoading(false);
    };

    void loadData();
  }, [router, supabase]);

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShipping((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const saveShippingToProfile = async () => {
    if (!user || !saveToProfile) return;

    try {
      await supabase
        .from('profiles')
        .update({ shipping_address: shipping })
        .eq('id', user.id);
    } catch (err) {
      console.error('Failed to save shipping address:', err);
    }
  };

  const submitPayFastForm = (
    paymentUrl: string,
    paymentData: Record<string, string>
  ) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentUrl;

    Object.entries(paymentData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const handlePayFastPayment = async () => {
    if (
      cart.length === 0 ||
      !shipping.fullName.trim() ||
      !shipping.address.trim() ||
      !shipping.city.trim()
    ) {
      toast.error('Please complete shipping information');
      return;
    }

    if (!user?.email) {
      toast.error('Missing user email address');
      return;
    }

    setProcessing(true);
    await saveShippingToProfile();

    try {
      const res = await fetch('/api/payfast/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          cart_items: cart,
          buyer_email: user.email,
          buyer_name: shipping.fullName,
          buyer_phone: shipping.phone,
          user_id: user.id,
        }),
      });

      const data: PayFastInitiateResponse = await res.json();

      if (!res.ok || !data.success || !data.payment_url || !data.payment_data) {
        toast.error(data.error || 'Payment initiation failed');
        return;
      }

      submitPayFastForm(data.payment_url, data.payment_data);
    } catch (error) {
      console.error('PayFast initiation failed:', error);
      toast.error('Failed to connect to payment gateway');
    } finally {
      setProcessing(false);
    }
  };

  const handleCashOnDelivery = async () => {
    if (
      cart.length === 0 ||
      !shipping.fullName.trim() ||
      !shipping.address.trim() ||
      !shipping.city.trim()
    ) {
      toast.error('Please complete shipping information');
      return;
    }

    setProcessing(true);
    await saveShippingToProfile();

    try {
      const bySeller: Record<string, CartItem[]> = {};

      cart.forEach((item) => {
        const sid = item.seller_id || 'unknown';
        if (!bySeller[sid]) bySeller[sid] = [];
        bySeller[sid].push(item);
      });

      for (const [sellerId, items] of Object.entries(bySeller)) {
        const sellerTotal = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buyer_id: user.id,
            seller_id: sellerId,
            items,
            total: sellerTotal,
            payment_method: 'cod',
            shipping_address: shipping,
          }),
        });
      }

      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));

      toast.success(
        'Order placed successfully! You will be contacted by the seller.'
      );
      router.push('/order-confirmation?method=cod');
    } catch (error) {
      console.error('COD order failed:', error);
      toast.error('Failed to place COD order');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        Loading checkout...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-[#1E3A5F] mb-10 text-center">
        Checkout
      </h1>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3 bg-white border rounded-3xl p-8">
          <h2 className="text-2xl font-semibold mb-6">Shipping Details</h2>

          <div className="space-y-5">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name *"
              value={shipping.fullName}
              onChange={handleShippingChange}
              className="w-full border rounded-2xl px-5 py-3"
              required
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={shipping.phone}
              onChange={handleShippingChange}
              className="w-full border rounded-2xl px-5 py-3"
            />

            <input
              type="text"
              name="address"
              placeholder="Street Address *"
              value={shipping.address}
              onChange={handleShippingChange}
              className="w-full border rounded-2xl px-5 py-3"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="city"
                placeholder="City *"
                value={shipping.city}
                onChange={handleShippingChange}
                className="border rounded-2xl px-5 py-3"
                required
              />

              <input
                type="text"
                name="postalCode"
                placeholder="Postal Code"
                value={shipping.postalCode}
                onChange={handleShippingChange}
                className="border rounded-2xl px-5 py-3"
              />
            </div>

            <label className="flex items-center gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={saveToProfile}
                onChange={(e) => setSaveToProfile(e.target.checked)}
                className="accent-[#2E8B57] w-5 h-5"
              />
              Save address to my profile for future orders
            </label>
          </div>
        </div>

        <div className="md:col-span-2 bg-white border rounded-3xl p-8 h-fit sticky top-8">
          <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>

          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between py-3 border-b last:border-none"
            >
              <span className="line-clamp-1 pr-4">
                {item.title} × {item.quantity}
              </span>
              <span className="font-medium">
                R{(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}

          <div className="flex justify-between text-2xl font-bold mt-8 pt-6 border-t">
            <span>Total</span>
            <span>R{total.toLocaleString()}</span>
          </div>

          <div className="mt-8 space-y-4">
            <button
              onClick={handlePayFastPayment}
              disabled={processing || total === 0}
              className="w-full bg-[#2E8B57] hover:bg-[#246B46] disabled:bg-gray-400 text-white py-4 rounded-2xl font-semibold text-lg transition"
            >
              {processing ? 'Processing...' : 'Pay Securely with PayFast'}
            </button>

            <button
              onClick={handleCashOnDelivery}
              disabled={processing || total === 0}
              className="w-full border-2 border-[#2E8B57] text-[#2E8B57] hover:bg-gray-50 py-4 rounded-2xl font-semibold text-lg transition"
            >
              {processing ? 'Processing...' : 'Cash on Delivery'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
