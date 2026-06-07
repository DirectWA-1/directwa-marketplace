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
    const updated = cart.filter(item => item.id !== id);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-[#1E3A5F] mb-4">Your Cart is Empty</h1>
        <Link href="/listings" className="text-[#2E8B57] hover:underline">Browse listings →</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#1E3A5F] mb-8">Your Cart</h1>

      <div className="space-y-4">
        {cart.map((item) => (
          <div key={item.id} className="flex gap-4 bg-white border rounded-2xl p-4">
            <img src={item.image || 'https://picsum.photos/id/20/120/120'} alt="" className="w-24 h-24 object-cover rounded-xl" />
            <div className="flex-1">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-xl font-bold text-[#1E3A5F] mt-1">R{item.price}</p>
            </div>
            <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center border-t pt-6">
        <div>
          <p className="text-gray-600">Total</p>
          <p className="text-3xl font-bold">R{total}</p>
        </div>
        <button className="bg-[#2E8B57] hover:bg-[#246B46] text-white px-8 py-3 rounded-xl font-semibold">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}