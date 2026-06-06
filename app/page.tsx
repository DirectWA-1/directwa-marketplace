import Link from 'next/link';
import { ArrowRight, Shield, MessageCircle, Award, Users } from 'lucide-react';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-[#0F1C2E] text-white">
        <div className="max-w-5xl mx-auto px-4 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E8B57] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2E8B57]"></span>
            </span>
            Now live in Gauteng &amp; Western Cape
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Direct deals.<br />WhatsApp simple.<br />Marketplace safe.
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            South Africa’s hybrid marketplace. Browse on the web.<br /> 
            Negotiate and complete deals directly on WhatsApp — with optional platform protection.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/listings" 
              className="bg-[#2E8B57] hover:bg-[#246B46] text-white font-semibold py-4 px-8 rounded-2xl text-lg inline-flex items-center justify-center gap-2 transition-all"
            >
              Browse Listings <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/sell" 
              className="px-8 py-4 text-lg font-semibold border-2 border-white/70 hover:bg-white/10 rounded-2xl transition-colors inline-flex items-center justify-center"
            >
              Start Selling Free
            </Link>
          </div>

          <div className="mt-8 text-sm text-gray-400">
            No monthly store fees • Only pay when you sell • R69/month for full access
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="border-b bg-white py-5">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm text-gray-600">
          <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-[#2E8B57]" /> Phone verified sellers</div>
          <div className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-[#2E8B57]" /> Chat directly on WhatsApp</div>
          <div className="flex items-center gap-2"><Award className="w-4 h-4 text-[#2E8B57]" /> Two-way ratings after every sale</div>
          <div className="flex items-center gap-2"><Users className="w-4 h-4 text-[#2E8B57]" /> 2,400+ successful deals</div>
        </div>
      </div>

      {/* How it Works */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1E3A5F]">How DirectWA Works</h2>
          <p className="text-gray-600 mt-2">Simple. Fast. Safe.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Browse or Search", desc: "Find great deals from verified sellers. Use filters for location, price, and category." },
            { step: "02", title: "Chat on WhatsApp", desc: "Click 'Chat on WhatsApp'. Negotiate directly with the seller in a natural conversation." },
            { step: "03", title: "Complete the Deal", desc: "Pay directly or use our optional secure escrow for higher value items." }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto w-14 h-14 bg-[#2E8B57] text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-5">
                {item.step}
              </div>
              <h3 className="font-semibold text-xl mb-3 text-[#1E3A5F]">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-4xl mx-auto px-4 py-20 text-center border-t">
        <h2 className="text-4xl font-bold text-[#1E3A5F] mb-4">Ready to start selling?</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          List your items in minutes. Chat with buyers on WhatsApp. Keep more of what you earn.
        </p>
        <Link 
          href="/sell" 
          className="bg-[#2E8B57] hover:bg-[#246B46] text-white font-semibold py-4 px-10 rounded-2xl text-lg inline-block"
        >
          Create Your First Listing — Free
        </Link>
        <p className="text-sm text-gray-500 mt-4">No store fees. Pay only when you sell.</p>
      </div>
    </div>
  );
} 