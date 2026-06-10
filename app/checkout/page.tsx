'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

function CheckoutForm({ total }: { total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout`,
      },
      redirect: 'always',
    });

    if (error) {
      toast.error(error.message || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full mt-6 bg-[#2E8B57] hover:bg-[#246B46] text-white py-4 rounded-2xl font-semibold text-lg disabled:bg-gray-400"
      >
        {loading ? 'Processing Payment...' : `Pay R${total.toLocaleString()}`}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Handle return from Stripe
  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');

    if (paymentIntent && redirectStatus === 'succeeded') {
      // Payment was successful
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
      router.push('/order-confirmation');
      return;
    }

    if (paymentIntent && redirectStatus === 'failed') {
      toast.error('Payment failed. Please try again.');
    }
  }, [searchParams, router]);

  // Load cart and create Payment Intent
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);

    if (savedCart.length === 0 && !searchParams.get('payment_intent')) {
      router.push('/cart');
      return;
    }

    const createPaymentIntent = async () => {
      try {
        const res = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total }),
        });

        const data = await res.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          toast.error('Failed to initialize payment');
        }
      } catch (error) {
        toast.error('Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    if (total > 0) {
      createPaymentIntent();
    } else {
      setLoading(false);
    }
  }, [total, router, searchParams]);

  if (loading || !clientSecret) {
    return <div className="p-8 text-center">Preparing secure checkout...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#1E3A5F] mb-8">Checkout</h1>

      <div className="bg-white border rounded-2xl p-8">
        <h2 className="text-xl font-semibold mb-6">Complete Your Payment</h2>

        <Elements 
          stripe={stripePromise} 
          options={{ 
            clientSecret,
            appearance: { theme: 'stripe' }
          }}
        >
          <CheckoutForm total={total} />
        </Elements>
      </div>
    </div>
  );
}