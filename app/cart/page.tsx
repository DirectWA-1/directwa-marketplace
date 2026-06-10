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

  if (loading) {
    return <div className="p-8">Loading cart...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#1E3A5F] mb-8">Your Cart</h1>

      {cart.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center">
          <p className="text-2xl text-gray-600 mb-4">Your cart is empty</p>
          <Link 
            href="/listings" 
            className="inline-block bg-[#2E8B57] text-white px-8 py-3 rounded-2xl font-semibold hover:bg-[#246B46]"
          >
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white border rounded-2xl p-5 flex flex-col md:flex-row gap-5">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full md:w-28 h-28 object-cover rounded-xl" 
                />
                
                <div className="flex-1">
                  <Link href={`/listings/${item.id}`} className="font-semibold text-lg hover:text-[#2E8B57]">
                    {item.title}
                  </Link>
                  <p className="text-2xl font-bold text-[#1E3A5F] mt-1">
                    R{item.price.toLocaleString()}
                  </p>

                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center border rounded-lg">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                        className="px-3 py-1 text-xl hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="px-4 font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                        className="px-3 py-1 text-xl hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.id)} 
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="text-right md:text-left">
                  <p className="text-xl font-semibold">
                    R{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-2xl p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.title} × {item.quantity}
                    </span>
                    <span>R{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-xl font-semibold">
                  <span>Total</span>
                  <span>R{total.toLocaleString()}</span>
                </div>
              </div>

              <Link 
                href="/checkout" 
                className="block w-full bg-[#2E8B57] hover:bg-[#246B46] text-white text-center py-4 rounded-2xl font-semibold text-lg mb-3 transition"
              >
                Proceed to Checkout
              </Link>

              <Link 
                href="/listings" 
                className="block text-center text-[#2E8B57] hover:underline font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}