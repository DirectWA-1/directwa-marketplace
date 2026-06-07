'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }, []);

  const removeFromCart = (id: string) => {
    const confirmed = window.confirm('Remove this item from your cart?');
    if (!confirmed) return;

    const updated = cart.filter(item => item.id !== id);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const clearCart = () => {
    const confirmed = window.confirm('Are you sure you want to clear your entire cart?');
    if (!confirmed) return;

    setCart([]);
    localStorage.removeItem('cart');
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h1 className="text-3xl font-bold text-[#1E3A5F] mb-3">Your cart is empty</h1>
        <p className="text-gray-600 mb-8">Looks like you haven't added anything yet.</p>
        <Link 
          href="/listings" 
          className="inline-block bg-[#2E8B57] hover:bg-[#246B46] text-white px-8 py-3 rounded-xl font-semibold"
        >
          Browse Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#1E3A5F]">Your Cart</h1>
        <button 
          onClick={clearCart}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white border rounded-2xl p-4">
              <div className="w-24 h-24 flex-shrink-0">
                <img 
                  src={item.image || 'https://picsum.photos/id/20/120/120'} 
                  alt={item.title}
                  className="w-full h-full object-cover rounded-xl border" 
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg line-clamp-2">{item.title}</h3>
                <p className="text-2xl font-bold text-[#1E3A5F] mt-2">
                  R{item.price.toLocaleString()}
                </p>
              </div>

              <div className="flex flex-col justify-between items-end">
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-2xl p-6 sticky top-20">
            <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
            
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Items ({cart.length})</span>
                <span>R{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-3 border-t">
                <span>Total</span>
                <span>R{total.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={() => alert('Checkout flow coming soon!')}
              className="w-full bg-[#2E8B57] hover:bg-[#246B46] text-white font-semibold py-3.5 rounded-xl mb-3"
            >
              Proceed to Checkout
            </button>

            <Link 
              href="/listings" 
              className="block text-center text-sm text-[#2E8B57] hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}