'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

function StripePaymentForm({ total, onSuccess }: { total: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
      },
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message || 'Payment failed');
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-[#2E8B57] hover:bg-[#246B46] text-white py-4 rounded-2xl font-semibold text-lg disabled:bg-gray-400"
      >
        {loading ? 'Processing Payment...' : `Pay R${total.toLocaleString()}`}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    deliveryMethod: 'delivery',
    paymentMethod: 'card', // card | cod | eft | whatsapp
    notes: '',
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Load cart
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
    setLoading(false);

    if (savedCart.length === 0) {
      router.push('/cart');
    }
  }, [router]);

  // Create Stripe Payment Intent when user selects "card"
  useEffect(() => {
    if (formData.paymentMethod !== 'card' || total === 0) return;

    const createPaymentIntent = async () => {
      try {
        const res = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total }),
        });
        const data = await res.json();
        if (data.clientSecret) setClientSecret(data.clientSecret);
      } catch (error) {
        toast.error('Failed to initialize card payment');
      }
    };

    createPaymentIntent();
  }, [formData.paymentMethod, total]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNonCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone) {
      toast.error('Please enter your name and phone number');
      return;
    }

    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartUpdated'));

    router.push('/order-confirmation');
  };

  const handleCardSuccess = () => {
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartUpdated'));
    router.push('/order-confirmation');
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#1E3A5F] mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-3">
          <form onSubmit={formData.paymentMethod === 'card' ? (e) => e.preventDefault() : handleNonCardSubmit} className="space-y-6">
            
            {/* Payment Method Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full border rounded-2xl px-5 py-3"
              >
                <option value="card">Credit/Debit Card (Stripe)</option>
                <option value="cod">Cash on Delivery / Collection</option>
                <option value="eft">EFT / Bank Transfer</option>
                <option value="whatsapp">Pay via WhatsApp</option>
              </select>
            </div>

            {/* Common Fields */}
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full border rounded-2xl px-5 py-3" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border rounded-2xl px-5 py-3" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Delivery Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full border rounded-2xl px-5 py-3" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full border rounded-2xl px-5 py-3" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Delivery Method</label>
                <select name="deliveryMethod" value={formData.deliveryMethod} onChange={handleChange} className="w-full border rounded-2xl px-5 py-3">
                  <option value="delivery">Delivery</option>
                  <option value="pickup">Pickup</option>
                </select>
              </div>
            </div>

            {/* Stripe Payment Form */}
            {formData.paymentMethod === 'card' && clientSecret && (
              <div className="pt-4">
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                  <StripePaymentForm total={total} onSuccess={handleCardSuccess} />
                </Elements>
              </div>
            )}

            {/* Non-Card Payment */}
            {formData.paymentMethod !== 'card' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Additional Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full border rounded-2xl px-5 py-3" />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#2E8B57] hover:bg-[#246B46] text-white py-4 rounded-2xl font-semibold text-lg disabled:bg-gray-400"
                >
                  {submitting ? 'Processing Order...' : `Complete Order • R${total.toLocaleString()}`}
                </button>
              </>
            )}
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2 bg-white border rounded-2xl p-6 h-fit sticky top-6">
          <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between text-sm mb-2">
              <span>{item.title} × {item.quantity}</span>
              <span>R{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t mt-4 pt-4 flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>R{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}