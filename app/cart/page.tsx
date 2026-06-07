'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    // Ensure all items have quantity
    const normalized = savedCart.map((item: any) => ({
      ...item,
      quantity: item.quantity || 1,
    }));
    setCart(normalized);
  }, []);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updated = cart.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeFromCart = (id: string) => {
    const confirmed = window.confirm('Remove this item from your cart?');
    if (!confirmed) return;

    const updated = cart.filter(item => item.id !== id);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const clearCart = () => {
    const confirmed = window.confirm('Clear your entire cart?');
    if (!confirmed) return;

    setCart([]);
    localStorage.removeItem('cart');
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h1 className="text-3xl font-bold text-[#1E3A5F] mb-3">Your cart is empty</h1>
        <Link href="/listings" className="inline-block bg-[#2E8B57] hover:bg-[#246B46] text-white px-8 py-3 rounded-xl font-semibold">
          Browse Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#1E3A5F]">Your Cart</h1>
        <button onClick={clearCart} className="text-sm text-red-600 hover:text-red-700">
          Clear Cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white border rounded-2xl p-4">
              <img 
                src={item.image || 'https://picsum.photos/id/20/120/120'} 
                alt={item.title}
                className="w-24 h-24 object-cover rounded-xl border flex-shrink-0" 
              />
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg line-clamp-2">{item.title}</h3>
                <p className="text-xl font-bold text-[#1E3A5F] mt-1">
                  R{item.price.toLocaleString()}
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 mt-3">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 border rounded-lg hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 border rounded-lg hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col justify-between items-end">
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
                <p className="font-semibold">
                  R{(item.price * item.quantity).toLocaleString()}
                </p>
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
                <span className="text-gray-600">Subtotal</span>
                <span>R{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-3 border-t">
                <span>Total</span>
                <span>R{total.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={() => alert('Checkout coming soon!')}
              className="w-full bg-[#2E8B57] hover:bg-[#246B46] text-white font-semibold py-3.5 rounded-xl mb-3"
            >
              Proceed to Checkout
            </button>

            <Link href="/listings" className="block text-center text-sm text-[#2E8B57] hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}