'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
    setLoading(false);
  }, []);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedCart = cart.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );

    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeFromCart = (id: string) => {
    const updatedCart = cart.filter(item => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success('Item removed from cart');
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#1E3A5F] mb-8">Your Cart</h1>

      {cart.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center">
          <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
          <Link href="/listings" className="text-[#2E8B57] hover:underline">
            Browse listings →
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white border rounded-2xl p-5 flex gap-5">
                <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded-xl" />
                
                <div className="flex-1">
                  <Link href={`/listings/${item.id}`} className="font-semibold hover:text-[#2E8B57]">
                    {item.title}
                  </Link>
                  <p className="text-xl font-bold text-[#1E3A5F] mt-1">R{item.price.toLocaleString()}</p>

                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center border rounded-lg">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1">-</button>
                      <span className="px-4">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1">+</button>
                    </div>

                    <button onClick={() => removeFromCart(item.id)} className="text-red-600 text-sm hover:underline">
                      Remove
                    </button>
                  </div>
                </div>

                <div className="text-right font-semibold text-lg">
                  R{(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white border rounded-2xl p-6 h-fit sticky top-6">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

            <div className="flex justify-between text-lg font-semibold mb-6">
              <span>Total</span>
              <span>R{total.toLocaleString()}</span>
            </div>

            <Link 
              href="/checkout" 
              className="block w-full bg-[#2E8B57] hover:bg-[#246B46] text-white text-center py-4 rounded-2xl font-semibold text-lg mb-3"
            >
              Proceed to Checkout
            </Link>

            <Link href="/listings" className="block text-center text-[#2E8B57] hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}