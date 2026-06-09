'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, MessageCircle } from 'lucide-react';

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');

  useEffect(() => {
    setIsClient(true);
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Generate a clean, professional WhatsApp message
  const generateWhatsAppMessage = () => {
    if (cart.length === 0) return '';

    let message = `Hi! I'd like to purchase the following item(s) from DirectWA:\n\n`;

    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.title}*\n`;
      message += `   Quantity: ${item.quantity}\n`;
      message += `   Price: R${(item.price * item.quantity).toLocaleString()}\n\n`;
    });

    message += `────────────────────\n`;
    message += `*Total Amount: R${total.toLocaleString()}*\n\n`;

    if (buyerName) message += `My name: ${buyerName}\n`;
    if (buyerPhone) message += `My WhatsApp: ${buyerPhone}\n`;

    message += `\nPlease let me know the next steps (payment, collection/delivery, etc.). Thank you!`;

    return encodeURIComponent(message);
  };

  const handleContactSeller = () => {
    const message = generateWhatsAppMessage();
    // TODO: Later make this dynamic based on seller phone number
    const whatsappNumber = "27712345678";
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  if (!isClient) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-8 w-48 bg-gray-200 rounded mb-8 animate-pulse" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white border rounded-2xl p-5 h-24 animate-pulse" />
            ))}
          </div>
          <div className="h-80 bg-white border rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-[#1E3A5F] mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Add items to your cart before checking out.</p>
        <Link href="/listings" className="bg-[#2E8B57] hover:bg-[#246B46] text-white px-8 py-3 rounded-xl font-semibold">
          Browse Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/cart" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold text-[#1E3A5F]">Checkout</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white border rounded-2xl p-5 flex gap-5">
                <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded-xl" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Quantity: {item.quantity}</p>
                  <p className="font-semibold mt-2 text-lg">R{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Seller Section */}
        <div className="bg-white border rounded-3xl p-6 h-fit sticky top-6">
          <h2 className="text-xl font-semibold mb-6">Complete Your Order</h2>

          {/* Optional Buyer Info */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1.5">Your Name (Optional)</label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Your WhatsApp Number (Optional)</label>
              <input
                type="tel"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5"
                placeholder="+27 71 234 5678"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between text-xl font-bold mb-6">
              <span>Total</span>
              <span>R{total.toLocaleString()}</span>
            </div>

            <button
              onClick={handleContactSeller}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 mb-4 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Contact Seller on WhatsApp
            </button>

            <p className="text-xs text-gray-500 text-center leading-relaxed">
              You will be redirected to WhatsApp with your order details pre-filled. 
              The seller will respond to confirm availability, payment, and delivery/collection.
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link href="/cart" className="text-sm text-[#2E8B57] hover:underline">
              ← Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}