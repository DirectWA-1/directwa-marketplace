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

  // Load cart from localStorage
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
  };

  // ✅ Remove from Cart with Undo
  const removeFromCart = (id: string) => {
    const itemToRemove = cart.find(item => item.id === id);
    if (!itemToRemove) return;

    const updatedCart = cart.filter(item => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    toast.success('Item removed from cart', {
      action: {
        label: 'Undo',
        onClick: () => {
          // Restore the item
          const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
          currentCart.push(itemToRemove);
          localStorage.setItem('cart', JSON.stringify(currentCart));
          setCart(currentCart);

          toast.success('Item restored to cart');
        },
      },
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ==================== SKELETON LOADER ====================
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="h-9 w-48 bg-gray-200 rounded mb-8 animate-pulse" />

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border rounded-2xl p-5 flex gap-5 animate-pulse">
              <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-9 w-32 bg-gray-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-[#1E3A5F] mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/listings" className="bg-[#2E8B57] hover:bg-[#246B46] text-white px-8 py-3 rounded-xl font-semibold">
          Browse Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#1E3A5F] mb-8">Your Cart ({cart.length} items)</h1>

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
                  <div className="flex items-center border rounded-xl">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 text-xl">-</button>
                    <span className="px-4">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 text-xl">+</button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id)} 
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
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

          <button className="w-full bg-[#2E8B57] hover:bg-[#246B46] text-white py-4 rounded-2xl font-semibold text-lg mb-3">
            Proceed to Checkout
          </button>

          <Link href="/listings" className="block text-center text-[#2E8B57] hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}